import { Router } from "express";
import { db } from "@workspace/db";
import { tasksTable, staffTable, patientsTable, appointmentsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

async function formatTask(t: typeof tasksTable.$inferSelect) {
  const [staff] = t.assignedTo
    ? await db.select({ name: staffTable.name }).from(staffTable).where(eq(staffTable.id, t.assignedTo)).limit(1)
    : [{ name: "" }];

  let patientName = "";
  if (t.appointmentId) {
    const [appt] = await db.select({ patientId: appointmentsTable.patientId }).from(appointmentsTable).where(eq(appointmentsTable.id, t.appointmentId)).limit(1);
    if (appt) {
      const [patient] = await db.select({ name: patientsTable.name }).from(patientsTable).where(eq(patientsTable.id, appt.patientId)).limit(1);
      patientName = patient?.name ?? "";
    }
  }

  return {
    id: t.id, appointmentId: t.appointmentId, patientName, title: t.title,
    description: t.description, assignedTo: t.assignedTo,
    assignedToName: staff?.name ?? "", priority: t.priority,
    status: t.status, dueTime: t.dueTime?.toISOString() ?? null,
    completedAt: t.completedAt?.toISOString() ?? null,
    createdAt: t.createdAt?.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const { appointmentId, assignedTo, status } = req.query as Record<string, string>;
  let query = db.select().from(tasksTable).$dynamic();
  const conds = [];
  if (appointmentId) conds.push(eq(tasksTable.appointmentId, parseInt(appointmentId)));
  if (assignedTo) conds.push(eq(tasksTable.assignedTo, parseInt(assignedTo)));
  if (status) conds.push(eq(tasksTable.status, status));
  if (conds.length) query = query.where(and(...conds));
  const tasks = await query.orderBy(tasksTable.createdAt);
  res.json(await Promise.all(tasks.map(formatTask)));
});

router.post("/", async (req, res) => {
  const { appointmentId, title, description, assignedTo, priority, dueTime } = req.body;
  const [task] = await db.insert(tasksTable).values({
    appointmentId, title, description, assignedTo,
    priority: priority ?? "medium", status: "pending",
    dueTime: dueTime ? new Date(dueTime) : null,
  }).returning();
  res.status(201).json(await formatTask(task));
});

router.put("/:id/complete", async (req, res) => {
  const id = parseInt(req.params.id);
  const [task] = await db.update(tasksTable).set({
    status: "completed", completedAt: new Date(),
  }).where(eq(tasksTable.id, id)).returning();
  if (!task) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await formatTask(task));
});

export default router;
