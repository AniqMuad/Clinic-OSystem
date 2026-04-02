import { Router } from "express";
import { db } from "@workspace/db";
import { appointmentsTable, patientsTable, staffTable, treatmentsTable, tasksTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/available-slots", async (req, res) => {
  const { dentistId, date } = req.query as Record<string, string>;
  if (!dentistId || !date) {
    res.status(400).json({ error: "dentistId and date required" }); return;
  }
  const existingAppts = await db.select({ startTime: appointmentsTable.startTime })
    .from(appointmentsTable)
    .where(and(
      eq(appointmentsTable.dentistId, parseInt(dentistId)),
      eq(appointmentsTable.date, date),
    ));
  const bookedTimes = new Set(existingAppts.map(a => a.startTime));

  const slots = [];
  for (let hour = 9; hour < 18; hour++) {
    for (const min of ["00", "30"]) {
      const time = `${String(hour).padStart(2, "0")}:${min}:00`;
      slots.push({ time: `${String(hour).padStart(2, "0")}:${min}`, available: !bookedTimes.has(time) });
    }
  }
  res.json(slots);
});

router.post("/", async (req, res) => {
  const { name, phone, email, dentistId, treatmentId, date, startTime, notes } = req.body;
  if (!name || !phone || !dentistId || !treatmentId || !date || !startTime) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }

  // Find or create patient
  let patient = null;
  const existingPatients = await db.select().from(patientsTable).where(eq(patientsTable.phone, phone)).limit(1);
  if (existingPatients.length) {
    patient = existingPatients[0];
  } else {
    const [p] = await db.insert(patientsTable).values({ name, phone, email, status: "new" }).returning();
    patient = p;
  }

  const startTimeFull = startTime.includes(":") ? startTime + ":00" : startTime;
  const [appt] = await db.insert(appointmentsTable).values({
    patientId: patient.id, dentistId, treatmentId, date,
    startTime: startTimeFull, chairNumber: 1, status: "scheduled",
    notes, isWalkIn: false,
  }).returning();

  // Auto-tasks
  const taskTemplates = [
    { title: "Prepare instruments", priority: "high" },
    { title: "Setup patient tray", priority: "medium" },
  ];
  for (const t of taskTemplates) {
    await db.insert(tasksTable).values({
      appointmentId: appt.id, title: t.title,
      priority: t.priority as "high" | "medium", status: "pending",
    });
  }

  const [dentist] = await db.select({ name: staffTable.name }).from(staffTable).where(eq(staffTable.id, dentistId)).limit(1);
  const [treatment] = await db.select({ name: treatmentsTable.name }).from(treatmentsTable).where(eq(treatmentsTable.id, treatmentId)).limit(1);

  res.status(201).json({
    appointmentId: appt.id,
    confirmationNumber: `SC${appt.id.toString().padStart(6, "0")}`,
    patientName: patient.name, dentistName: dentist?.name ?? "",
    treatmentName: treatment?.name ?? "", date: appt.date, startTime: appt.startTime,
    message: "Your appointment has been confirmed. We will contact you shortly.",
  });
});

export default router;
