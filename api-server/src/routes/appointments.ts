import { Router } from "express";
import { db } from "@workspace/db";
import { appointmentsTable, patientsTable, staffTable, treatmentsTable, tasksTable } from "@workspace/db/schema";
import { eq, sql, and } from "drizzle-orm";

const router = Router();

async function enrichAppointment(a: typeof appointmentsTable.$inferSelect) {
  const [patientRes, dentistRes, treatmentRes] = await Promise.all([
    db.select({ name: patientsTable.name, phone: patientsTable.phone }).from(patientsTable).where(eq(patientsTable.id, a.patientId)).limit(1),
    db.select({ name: staffTable.name }).from(staffTable).where(eq(staffTable.id, a.dentistId)).limit(1),
    a.treatmentId ? db.select({ name: treatmentsTable.name }).from(treatmentsTable).where(eq(treatmentsTable.id, a.treatmentId)).limit(1) : Promise.resolve([]),
  ]);
  return {
    id: a.id, patientId: a.patientId,
    patientName: patientRes[0]?.name ?? "",
    patientPhone: patientRes[0]?.phone ?? "",
    dentistId: a.dentistId, dentistName: dentistRes[0]?.name ?? "",
    treatmentId: a.treatmentId, treatmentName: (treatmentRes as {name: string}[])[0]?.name ?? "",
    date: a.date, startTime: a.startTime, endTime: a.endTime,
    chairNumber: a.chairNumber, status: a.status, notes: a.notes,
    isWalkIn: a.isWalkIn, createdAt: a.createdAt?.toISOString(),
  };
}

router.get("/today", async (_req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const appts = await db.select().from(appointmentsTable)
    .where(eq(appointmentsTable.date, today));
  const enriched = await Promise.all(appts.map(enrichAppointment));

  const chairs: { chairNumber: number; appointments: typeof enriched }[] = [];
  const chairMap = new Map<number, typeof enriched>();
  for (const a of enriched) {
    const cn = a.chairNumber ?? 1;
    if (!chairMap.has(cn)) chairMap.set(cn, []);
    chairMap.get(cn)!.push(a);
  }
  for (const [cn, apts] of chairMap) chairs.push({ chairNumber: cn, appointments: apts });
  chairs.sort((a, b) => a.chairNumber - b.chairNumber);
  if (chairs.length === 0) {
    for (let i = 1; i <= 3; i++) chairs.push({ chairNumber: i, appointments: [] });
  }

  const stats = {
    totalPatients: enriched.length,
    waiting: enriched.filter(a => a.status === "waiting").length,
    inTreatment: enriched.filter(a => a.status === "in_treatment").length,
    completed: enriched.filter(a => a.status === "completed").length,
    noShow: enriched.filter(a => a.status === "no_show").length,
    revenue: 0,
  };
  res.json({ date: today, chairs, stats });
});

router.get("/", async (req, res) => {
  const { date, dentistId, status } = req.query as Record<string, string>;
  let query = db.select().from(appointmentsTable).$dynamic();
  const conditions = [];
  if (date) conditions.push(eq(appointmentsTable.date, date));
  if (dentistId) conditions.push(eq(appointmentsTable.dentistId, parseInt(dentistId)));
  if (status) conditions.push(eq(appointmentsTable.status, status));
  if (conditions.length) query = query.where(and(...conditions));
  const appts = await query.orderBy(appointmentsTable.startTime);
  const enriched = await Promise.all(appts.map(enrichAppointment));
  res.json(enriched);
});

router.post("/", async (req, res) => {
  const { patientId, dentistId, treatmentId, date, startTime, endTime, chairNumber, notes, isWalkIn } = req.body;
  if (!patientId || !dentistId || !date || !startTime) {
    res.status(400).json({ error: "patientId, dentistId, date, startTime required" }); return;
  }
  const [appt] = await db.insert(appointmentsTable).values({
    patientId, dentistId, treatmentId, date, startTime, endTime,
    chairNumber: chairNumber ?? 1, notes, isWalkIn: isWalkIn ?? false, status: "scheduled",
  }).returning();

  // Auto-generate tasks for assistant
  const taskTemplates = [
    { title: "Prepare instruments", priority: "high" },
    { title: "Setup patient tray", priority: "medium" },
    { title: "Sterilization check", priority: "high" },
  ];
  for (const t of taskTemplates) {
    await db.insert(tasksTable).values({
      appointmentId: appt.id, title: t.title,
      priority: t.priority as "high" | "medium", status: "pending",
    });
  }

  res.status(201).json(await enrichAppointment(appt));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [appt] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, id)).limit(1);
  if (!appt) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichAppointment(appt));
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  const [appt] = await db.update(appointmentsTable).set(updates).where(eq(appointmentsTable.id, id)).returning();
  if (!appt) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichAppointment(appt));
});

router.put("/:id/status", async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const [appt] = await db.update(appointmentsTable).set({ status }).where(eq(appointmentsTable.id, id)).returning();
  if (!appt) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichAppointment(appt));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(appointmentsTable).where(eq(appointmentsTable.id, id));
  res.status(204).send();
});

export default router;
