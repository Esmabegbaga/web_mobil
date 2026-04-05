import { Router, type IRouter } from "express";
import { db, announcementsTable, clubsTable, usersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { CreateAnnouncementBody } from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

async function formatAnnouncement(a: typeof announcementsTable.$inferSelect) {
  const [author] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, a.authorId));
  let clubName: string | null = null;
  if (a.clubId) {
    const [club] = await db.select({ name: clubsTable.name }).from(clubsTable).where(eq(clubsTable.id, a.clubId));
    clubName = club?.name ?? null;
  }
  return {
    id: a.id,
    title: a.title,
    content: a.content,
    clubId: a.clubId,
    clubName,
    isGlobal: a.isGlobal,
    authorId: a.authorId,
    authorName: author?.name ?? null,
    createdAt: a.createdAt.toISOString(),
  };
}

router.get("/announcements", async (req, res): Promise<void> => {
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const limit = parseInt(String(req.query.limit ?? "20"), 10);
  const clubId = req.query.clubId ? parseInt(String(req.query.clubId), 10) : undefined;
  const offset = (page - 1) * limit;

  const where = clubId ? eq(announcementsTable.clubId, clubId) : undefined;
  const [announcements, countResult] = await Promise.all([
    db.select().from(announcementsTable).where(where).limit(limit).offset(offset).orderBy(announcementsTable.createdAt),
    db.select({ count: sql<number>`count(*)::int` }).from(announcementsTable).where(where),
  ]);

  const formatted = await Promise.all(announcements.map(formatAnnouncement));
  res.json({ announcements: formatted, total: countResult[0]?.count ?? 0, page, limit });
});

router.post("/announcements", requireAuth, requireRole("club_official", "admin"), async (req, res): Promise<void> => {
  const parsed = CreateAnnouncementBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const isGlobal = req.user!.role === "admin" ? (parsed.data.isGlobal ?? false) : false;
  const clubId = req.user!.role === "club_official" ? req.user!.clubId : undefined;
  const [announcement] = await db.insert(announcementsTable).values({
    title: parsed.data.title,
    content: parsed.data.content,
    isGlobal,
    clubId: clubId ?? undefined,
    authorId: req.user!.id,
  }).returning();
  const formatted = await formatAnnouncement(announcement);
  res.status(201).json(formatted);
});

router.get("/announcements/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [announcement] = await db.select().from(announcementsTable).where(eq(announcementsTable.id, id));
  if (!announcement) {
    res.status(404).json({ error: "Announcement not found" });
    return;
  }
  const formatted = await formatAnnouncement(announcement);
  res.json(formatted);
});

router.delete("/announcements/:id", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [existing] = await db.select().from(announcementsTable).where(eq(announcementsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Announcement not found" });
    return;
  }
  await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
  res.json({ message: "Announcement deleted" });
});

export default router;
