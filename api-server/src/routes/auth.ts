import { Router } from "express";
import { db } from "@workspace/db";
import { staffTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "smilecare_salt").digest("hex");
}

function generateToken(staffId: number): string {
  return Buffer.from(`${staffId}:${Date.now()}:smilecare`).toString("base64");
}

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

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  const [staff] = await db.select().from(staffTable).where(eq(staffTable.email, email)).limit(1);
  if (!staff || staff.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  if (!staff.isActive) {
    res.status(403).json({ error: "Account is deactivated" });
    return;
  }
  const token = generateToken(staff.id);
  res.json({ user: formatStaff(staff), token });
});

router.post("/logout", (_req, res) => {
  res.json({ message: "Logged out" });
});

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = Buffer.from(token, "base64").toString();
    const staffId = parseInt(decoded.split(":")[0]);
    const [staff] = await db.select().from(staffTable).where(eq(staffTable.id, staffId)).limit(1);
    if (!staff) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    res.json(formatStaff(staff));
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export { hashPassword };
export default router;
