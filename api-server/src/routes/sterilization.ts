import { Router } from "express";
import { db } from "@workspace/db";
import { sterilizationLogsTable, staffTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

async function formatLog(l: typeof sterilizationLogsTable.$inferSelect) {
  const [staff] = l.performedBy
    ? await db.select({ name: staffTable.name }).from(staffTable).where(eq(staffTable.id, l.performedBy)).limit(1)
    : [{ name: "" }];
  return {
    id: l.id, instrumentName: l.instrumentName, cycleNumber: l.cycleNumber,
    status: l.status, startedAt: l.startedAt?.toISOString() ?? null,
    completedAt: l.completedAt?.toISOString() ?? null,
    performedBy: l.performedBy, performedByName: staff?.name ?? "",
    notes: l.notes, photoUrl: l.photoUrl, createdAt: l.createdAt?.toISOString(),
  };
}

router.get("/", async (_req, res) => {
  const logs = await db.select().from(sterilizationLogsTable).orderBy(desc(sterilizationLogsTable.createdAt));
  res.json(await Promise.all(logs.map(formatLog)));
});

router.post("/", async (req, res) => {
  const { instrumentName, cycleNumber, status, notes, photoUrl } = req.body;
  const [log] = await db.insert(sterilizationLogsTable).values({
    instrumentName, cycleNumber, status: status ?? "ready", notes, photoUrl,
    startedAt: status === "in_cycle" ? new Date() : null,
  }).returning();
  res.status(201).json(await formatLog(log));
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { status, completedAt, notes, photoUrl } = req.body;
  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (completedAt) updates.completedAt = new Date(completedAt);
  if (notes !== undefined) updates.notes = notes;
  if (photoUrl !== undefined) updates.photoUrl = photoUrl;
  if (status === "in_cycle") updates.startedAt = new Date();
  if (status === "completed") updates.completedAt = new Date();
  const [log] = await db.update(sterilizationLogsTable).set(updates).where(eq(sterilizationLogsTable.id, id)).returning();
  if (!log) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await formatLog(log));
});

export default router;
