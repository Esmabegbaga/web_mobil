import { Router, type IRouter } from "express";
import { db, eventsTable, clubsTable, usersTable, announcementsTable } from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const now = new Date();

  const [totalEventsResult, upcomingEventsResult, totalClubsResult, totalStudentsResult, pendingResult, recentAnnouncementsResult, topCategoriesResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(eventsTable).where(eq(eventsTable.status, "approved")),
    db.select({ count: sql<number>`count(*)::int` }).from(eventsTable).where(and(eq(eventsTable.status, "approved"), gte(eventsTable.startDate, now))),
    db.select({ count: sql<number>`count(*)::int` }).from(clubsTable),
    db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.role, "student")),
    db.select({ count: sql<number>`count(*)::int` }).from(eventsTable).where(eq(eventsTable.status, "pending")),
    db.select({ count: sql<number>`count(*)::int` }).from(announcementsTable).where(gte(announcementsTable.createdAt, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))),
    db.select({ category: eventsTable.category, count: sql<number>`count(*)::int` }).from(eventsTable).where(and(eq(eventsTable.status, "approved"), sql`${eventsTable.category} IS NOT NULL`)).groupBy(eventsTable.category).orderBy(sql`count(*) desc`).limit(5),
  ]);

  res.json({
    totalEvents: totalEventsResult[0]?.count ?? 0,
    upcomingEvents: upcomingEventsResult[0]?.count ?? 0,
    totalClubs: totalClubsResult[0]?.count ?? 0,
    totalStudents: totalStudentsResult[0]?.count ?? 0,
    pendingApprovals: pendingResult[0]?.count ?? 0,
    recentAnnouncements: recentAnnouncementsResult[0]?.count ?? 0,
    topCategories: topCategoriesResult.map((r) => ({ category: r.category!, count: r.count })),
  });
});

export default router;
