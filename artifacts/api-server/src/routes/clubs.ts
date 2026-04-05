import { Router, type IRouter } from "express";
import { db, clubsTable, eventsTable, usersTable } from "@workspace/db";
import { eq, ilike, sql } from "drizzle-orm";
import { CreateClubBody, UpdateClubBody } from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

async function getClubWithCounts(clubId: number) {
  const [club] = await db.select().from(clubsTable).where(eq(clubsTable.id, clubId));
  if (!club) return null;
  const [memberResult] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.clubId, clubId));
  const [eventResult] = await db.select({ count: sql<number>`count(*)::int` }).from(eventsTable).where(eq(eventsTable.clubId, clubId));
  return {
    id: club.id,
    name: club.name,
    description: club.description,
    category: club.category,
    logoUrl: club.logoUrl,
    memberCount: memberResult?.count ?? 0,
    eventCount: eventResult?.count ?? 0,
    createdAt: club.createdAt.toISOString(),
  };
}

router.get("/clubs", async (req, res): Promise<void> => {
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const limit = parseInt(String(req.query.limit ?? "20"), 10);
  const search = String(req.query.search ?? "");
  const offset = (page - 1) * limit;

  const where = search ? ilike(clubsTable.name, `%${search}%`) : undefined;
  const [clubs, countResult] = await Promise.all([
    db.select().from(clubsTable).where(where).limit(limit).offset(offset).orderBy(clubsTable.name),
    db.select({ count: sql<number>`count(*)::int` }).from(clubsTable).where(where),
  ]);

  const clubsWithCounts = await Promise.all(clubs.map((c) => getClubWithCounts(c.id)));
  res.json({
    clubs: clubsWithCounts.filter(Boolean),
    total: countResult[0]?.count ?? 0,
    page,
    limit,
  });
});

router.post("/clubs", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const parsed = CreateClubBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [club] = await db.insert(clubsTable).values(parsed.data).returning();
  res.status(201).json({
    id: club.id,
    name: club.name,
    description: club.description,
    category: club.category,
    logoUrl: club.logoUrl,
    memberCount: 0,
    eventCount: 0,
    createdAt: club.createdAt.toISOString(),
  });
});

router.get("/clubs/featured", async (_req, res): Promise<void> => {
  const clubs = await db.select().from(clubsTable).limit(6).orderBy(clubsTable.createdAt);
  const clubsWithCounts = await Promise.all(clubs.map((c) => getClubWithCounts(c.id)));
  res.json(clubsWithCounts.filter(Boolean));
});

router.get("/clubs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const club = await getClubWithCounts(id);
  if (!club) {
    res.status(404).json({ error: "Club not found" });
    return;
  }
  res.json(club);
});

router.patch("/clubs/:id", requireAuth, requireRole("admin", "club_official"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (req.user!.role === "club_official" && req.user!.clubId !== id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const parsed = UpdateClubBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [club] = await db.update(clubsTable).set(parsed.data).where(eq(clubsTable.id, id)).returning();
  if (!club) {
    res.status(404).json({ error: "Club not found" });
    return;
  }
  const withCounts = await getClubWithCounts(id);
  res.json(withCounts);
});

export default router;
