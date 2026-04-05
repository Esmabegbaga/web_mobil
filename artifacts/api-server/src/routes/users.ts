import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";
import { UpdateUserBody } from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/users", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const limit = parseInt(String(req.query.limit ?? "20"), 10);
  const search = String(req.query.search ?? "");
  const role = req.query.role as string | undefined;
  const isActiveParam = req.query.isActive;

  const conditions = [];
  if (search) conditions.push(ilike(usersTable.name, `%${search}%`));
  if (role) conditions.push(eq(usersTable.role, role as "student" | "club_official" | "admin"));
  if (isActiveParam !== undefined) conditions.push(eq(usersTable.isActive, isActiveParam === "true"));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const [users, countResult] = await Promise.all([
    db.select().from(usersTable).where(where).limit(limit).offset(offset).orderBy(usersTable.createdAt),
    db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(where),
  ]);

  res.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      studentId: u.studentId,
      department: u.department,
      avatarUrl: u.avatarUrl,
      isActive: u.isActive,
      clubId: u.clubId,
      createdAt: u.createdAt.toISOString(),
    })),
    total: countResult[0]?.count ?? 0,
    page,
    limit,
  });
});

router.get("/users/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    department: user.department,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    clubId: user.clubId,
    createdAt: user.createdAt.toISOString(),
  });
});

router.patch("/users/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (req.user!.role !== "admin" && req.user!.id !== id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = {};
  if (parsed.data.name != null) updateData.name = parsed.data.name;
  if (parsed.data.department != null) updateData.department = parsed.data.department;
  if (parsed.data.avatarUrl != null) updateData.avatarUrl = parsed.data.avatarUrl;
  if (parsed.data.isActive != null && req.user!.role === "admin") updateData.isActive = parsed.data.isActive;

  const [user] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    department: user.department,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    clubId: user.clubId,
    createdAt: user.createdAt.toISOString(),
  });
});

router.post("/users/:id/toggle-active", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const [user] = await db.update(usersTable).set({ isActive: !existing.isActive }).where(eq(usersTable.id, id)).returning();
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    department: user.department,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    clubId: user.clubId,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
