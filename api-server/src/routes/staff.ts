import { Router } from "express";
import { db } from "@workspace/db";
import { staffTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth.js";

const router = Router();

function formatStaff(s: typeof staffTable.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    email: s.email,
    role: s.role,
    phone: s.phone,
    qualification: s.qualification,
    bio: s.bio,
    avatarUrl: s.avatarUrl,
    isActive: s.isActive,
    createdAt: s.createdAt?.toISOString(),
  };
}

router.get("/", async (_req, res) => {
  const staff = await db.select().from(staffTable).orderBy(staffTable.name);
  res.json(staff.map(formatStaff));
});

router.post("/", async (req, res) => {
  const { name, email, password, role, phone, qualification, bio, avatarUrl } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email, password required" });
    return;
  }
  const [existing] = await db.select().from(staffTable).where(eq(staffTable.email, email)).limit(1);
  if (existing) {
    res.status(409).json({ error: "Email already exists" });
    return;
  }
  const [staff] = await db.insert(staffTable).values({
    name, email,
    passwordHash: hashPassword(password),
    role: role || "front_desk",
    phone, qualification, bio, avatarUrl,
    isActive: true,
  }).returning();
  res.status(201).json(formatStaff(staff));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [staff] = await db.select().from(staffTable).where(eq(staffTable.id, id)).limit(1);
  if (!staff) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatStaff(staff));
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, role, phone, qualification, bio, avatarUrl, isActive } = req.body;
  const [staff] = await db.update(staffTable).set({
    ...(name && { name }), ...(email && { email }), ...(role && { role }),
    ...(phone !== undefined && { phone }), ...(qualification !== undefined && { qualification }),
    ...(bio !== undefined && { bio }), ...(avatarUrl !== undefined && { avatarUrl }),
    ...(isActive !== undefined && { isActive }),
  }).where(eq(staffTable.id, id)).returning();
  if (!staff) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatStaff(staff));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(staffTable).where(eq(staffTable.id, id));
  res.status(204).send();
});

export default router;
