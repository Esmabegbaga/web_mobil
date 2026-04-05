import { Router, type IRouter } from "express";
import { db, eventsTable, clubsTable, eventReactionsTable, usersTable } from "@workspace/db";
import { eq, ilike, and, sql, gte, lt } from "drizzle-orm";
import { CreateEventBody, UpdateEventBody } from "@workspace/api-zod";
import { requireAuth, requireRole, optionalAuth } from "../middlewares/auth";

const router: IRouter = Router();

async function formatEvent(event: typeof eventsTable.$inferSelect, userId?: number) {
  const [club] = await db.select({ name: clubsTable.name }).from(clubsTable).where(eq(clubsTable.id, event.clubId));
  const [attendeeCount] = await db.select({ count: sql<number>`count(*)::int` }).from(eventReactionsTable).where(and(eq(eventReactionsTable.eventId, event.id), eq(eventReactionsTable.type, "going")));
  const [interestedCount] = await db.select({ count: sql<number>`count(*)::int` }).from(eventReactionsTable).where(and(eq(eventReactionsTable.eventId, event.id), eq(eventReactionsTable.type, "interested")));
  let userReaction: string | null = null;
  if (userId) {
    const [reaction] = await db.select().from(eventReactionsTable).where(and(eq(eventReactionsTable.eventId, event.id), eq(eventReactionsTable.userId, userId)));
    userReaction = reaction?.type ?? null;
  }
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    category: event.category,
    location: event.location,
    imageUrl: event.imageUrl,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate?.toISOString() ?? null,
    status: event.status,
    clubId: event.clubId,
    clubName: club?.name ?? null,
    attendeeCount: attendeeCount?.count ?? 0,
    interestedCount: interestedCount?.count ?? 0,
    userReaction,
    createdAt: event.createdAt.toISOString(),
  };
}

router.get("/events", optionalAuth, async (req, res): Promise<void> => {
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const limit = parseInt(String(req.query.limit ?? "20"), 10);
  const search = String(req.query.search ?? "");
  const category = req.query.category as string | undefined;
  const clubId = req.query.clubId ? parseInt(String(req.query.clubId), 10) : undefined;
  const status = req.query.status as string | undefined;
  const upcoming = req.query.upcoming === "true";
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) conditions.push(ilike(eventsTable.title, `%${search}%`));
  if (category) conditions.push(eq(eventsTable.category, category));
  if (clubId) conditions.push(eq(eventsTable.clubId, clubId));
  if (status) conditions.push(eq(eventsTable.status, status as "pending" | "approved" | "rejected"));
  else if (!req.user || req.user.role === "student") conditions.push(eq(eventsTable.status, "approved"));
  if (upcoming) conditions.push(gte(eventsTable.startDate, new Date()));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [events, countResult] = await Promise.all([
    db.select().from(eventsTable).where(where).limit(limit).offset(offset).orderBy(eventsTable.startDate),
    db.select({ count: sql<number>`count(*)::int` }).from(eventsTable).where(where),
  ]);

  const formatted = await Promise.all(events.map((e) => formatEvent(e, req.user?.id)));
  res.json({ events: formatted, total: countResult[0]?.count ?? 0, page, limit });
});

router.post("/events", requireAuth, requireRole("club_official", "admin"), async (req, res): Promise<void> => {
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const clubId = req.user!.role === "admin" ? (req.body.clubId ?? 1) : req.user!.clubId!;
  const [event] = await db.insert(eventsTable).values({
    ...parsed.data,
    clubId,
    startDate: new Date(parsed.data.startDate),
    endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
  }).returning();
  const formatted = await formatEvent(event, req.user!.id);
  res.status(201).json(formatted);
});

router.get("/events/upcoming", optionalAuth, async (req, res): Promise<void> => {
  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const events = await db.select().from(eventsTable)
    .where(and(eq(eventsTable.status, "approved"), gte(eventsTable.startDate, now), lt(eventsTable.startDate, weekLater)))
    .limit(10)
    .orderBy(eventsTable.startDate);
  const formatted = await Promise.all(events.map((e) => formatEvent(e, req.user?.id)));
  res.json(formatted);
});

router.get("/events/categories", async (_req, res): Promise<void> => {
  const results = await db.select({
    category: eventsTable.category,
    count: sql<number>`count(*)::int`,
  }).from(eventsTable).where(and(eq(eventsTable.status, "approved"), sql`${eventsTable.category} IS NOT NULL`)).groupBy(eventsTable.category).orderBy(sql`count(*) desc`);
  res.json(results.map((r) => ({ category: r.category!, count: r.count })));
});

router.get("/events/:id", optionalAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id));
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const formatted = await formatEvent(event, req.user?.id);
  res.json(formatted);
});

router.patch("/events/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [existing] = await db.select().from(eventsTable).where(eq(eventsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  if (req.user!.role === "club_official" && existing.clubId !== req.user!.clubId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const parsed = UpdateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.startDate) updateData.startDate = new Date(parsed.data.startDate);
  if (parsed.data.endDate) updateData.endDate = new Date(parsed.data.endDate);
  if (req.user!.role !== "admin") delete updateData.status;

  const [event] = await db.update(eventsTable).set(updateData).where(eq(eventsTable.id, id)).returning();
  const formatted = await formatEvent(event, req.user!.id);
  res.json(formatted);
});

router.delete("/events/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [existing] = await db.select().from(eventsTable).where(eq(eventsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  if (req.user!.role === "club_official" && existing.clubId !== req.user!.clubId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  await db.delete(eventReactionsTable).where(eq(eventReactionsTable.eventId, id));
  await db.delete(eventsTable).where(eq(eventsTable.id, id));
  res.json({ message: "Event deleted" });
});

router.post("/events/:id/approve", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [event] = await db.update(eventsTable).set({ status: "approved" }).where(eq(eventsTable.id, id)).returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const formatted = await formatEvent(event);
  res.json(formatted);
});

router.get("/events/:id/attendees", requireAuth, requireRole("admin", "club_official"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const reactions = await db.select().from(eventReactionsTable).where(eq(eventReactionsTable.eventId, id));
  const result = await Promise.all(reactions.map(async (r) => {
    const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, r.userId));
    return { id: r.id, userId: r.userId, eventId: r.eventId, type: r.type, userName: user?.name ?? null, createdAt: r.createdAt.toISOString() };
  }));
  res.json(result);
});

router.post("/events/:id/react", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const type = req.body.type as "going" | "interested";
  if (!["going", "interested"].includes(type)) {
    res.status(400).json({ error: "Invalid reaction type" });
    return;
  }
  const [existing] = await db.select().from(eventReactionsTable).where(and(eq(eventReactionsTable.eventId, id), eq(eventReactionsTable.userId, req.user!.id)));
  if (existing) {
    const [updated] = await db.update(eventReactionsTable).set({ type }).where(eq(eventReactionsTable.id, existing.id)).returning();
    const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, req.user!.id));
    res.json({ id: updated.id, userId: updated.userId, eventId: updated.eventId, type: updated.type, userName: user?.name ?? null, createdAt: updated.createdAt.toISOString() });
    return;
  }
  const [reaction] = await db.insert(eventReactionsTable).values({ userId: req.user!.id, eventId: id, type }).returning();
  const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, req.user!.id));
  res.json({ id: reaction.id, userId: reaction.userId, eventId: reaction.eventId, type: reaction.type, userName: user?.name ?? null, createdAt: reaction.createdAt.toISOString() });
});

router.delete("/events/:id/react", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(eventReactionsTable).where(and(eq(eventReactionsTable.eventId, id), eq(eventReactionsTable.userId, req.user!.id)));
  res.json({ message: "Reaction removed" });
});

export default router;
