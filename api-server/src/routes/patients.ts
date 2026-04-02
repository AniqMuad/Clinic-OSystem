import { Router } from "express";
import { db } from "@workspace/db";
import { patientsTable, treatmentLogsTable, appointmentsTable, billsTable, staffTable, treatmentsTable } from "@workspace/db/schema";
import { eq, ilike, or, sql, desc } from "drizzle-orm";

const router = Router();

function formatPatient(p: typeof patientsTable.$inferSelect) {
  return {
    id: p.id, name: p.name, phone: p.phone, email: p.email,
    icNumber: p.icNumber, dateOfBirth: p.dateOfBirth, gender: p.gender,
    address: p.address, allergies: p.allergies, medicalHistory: p.medicalHistory,
    lastVisit: p.lastVisit?.toISOString() ?? null,
    status: p.status, createdAt: p.createdAt?.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const { search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  let query = db.select().from(patientsTable).$dynamic();
  if (search) {
    query = query.where(or(
      ilike(patientsTable.name, `%${search}%`),
      ilike(patientsTable.phone, `%${search}%`),
    ));
  }
  const [patients, countResult] = await Promise.all([
    query.orderBy(desc(patientsTable.createdAt)).limit(parseInt(limit)).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(patientsTable),
  ]);
  res.json({
    patients: patients.map(formatPatient),
    total: Number(countResult[0]?.count ?? 0),
    page: parseInt(page),
    limit: parseInt(limit),
  });
});

router.post("/", async (req, res) => {
  const { name, phone, email, icNumber, dateOfBirth, gender, address, allergies, medicalHistory } = req.body;
  if (!name || !phone) { res.status(400).json({ error: "name and phone required" }); return; }
  const [patient] = await db.insert(patientsTable).values({
    name, phone, email, icNumber, dateOfBirth, gender, address, allergies, medicalHistory, status: "new",
  }).returning();
  res.status(201).json(formatPatient(patient));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, id)).limit(1);
  if (!patient) { res.status(404).json({ error: "Not found" }); return; }

  const [logs, appts, bills] = await Promise.all([
    db.select().from(treatmentLogsTable).where(eq(treatmentLogsTable.patientId, id)).orderBy(desc(treatmentLogsTable.createdAt)).limit(10),
    db.select().from(appointmentsTable).where(eq(appointmentsTable.patientId, id)).orderBy(desc(appointmentsTable.createdAt)).limit(10),
    db.select().from(billsTable).where(eq(billsTable.patientId, id)).orderBy(desc(billsTable.createdAt)).limit(10),
  ]);

  const staffIds = [...new Set(logs.map(l => l.dentistId))];
  const treatmentIds = [...new Set(logs.map(l => l.treatmentId))];
  const [staffMembers, treatments] = await Promise.all([
    staffIds.length ? db.select().from(staffTable).where(sql`id = ANY(${staffIds})`) : Promise.resolve([]),
    treatmentIds.length ? db.select().from(treatmentsTable).where(sql`id = ANY(${treatmentIds})`) : Promise.resolve([]),
  ]);
  const staffMap = Object.fromEntries(staffMembers.map(s => [s.id, s.name]));
  const treatMap = Object.fromEntries(treatments.map(t => [t.id, t.name]));

  const apptDentistIds = [...new Set(appts.map(a => a.dentistId))];
  const apptTreatIds = [...new Set(appts.filter(a => a.treatmentId).map(a => a.treatmentId!))];
  const [apptStaff, apptTreats] = await Promise.all([
    apptDentistIds.length ? db.select().from(staffTable).where(sql`id = ANY(${apptDentistIds})`) : Promise.resolve([]),
    apptTreatIds.length ? db.select().from(treatmentsTable).where(sql`id = ANY(${apptTreatIds})`) : Promise.resolve([]),
  ]);
  const aStaffMap = Object.fromEntries(apptStaff.map(s => [s.id, s.name]));
  const aTreatMap = Object.fromEntries(apptTreats.map(t => [t.id, t.name]));

  const patientNames = await db.select({ id: patientsTable.id, name: patientsTable.name }).from(patientsTable).where(eq(patientsTable.id, id));
  const pName = patientNames[0]?.name ?? "";

  res.json({
    ...formatPatient(patient),
    treatmentLogs: logs.map(l => ({
      id: l.id, patientId: l.patientId, dentistId: l.dentistId,
      dentistName: staffMap[l.dentistId] ?? "", treatmentId: l.treatmentId,
      treatmentName: treatMap[l.treatmentId] ?? "", notes: l.notes,
      imageUrls: l.imageUrls as string[], date: l.date, status: l.status,
    })),
    appointments: appts.map(a => ({
      id: a.id, patientId: a.patientId, patientName: pName,
      patientPhone: patient.phone, dentistId: a.dentistId,
      dentistName: aStaffMap[a.dentistId] ?? "", treatmentId: a.treatmentId,
      treatmentName: a.treatmentId ? aTreatMap[a.treatmentId] ?? "" : "",
      date: a.date, startTime: a.startTime, endTime: a.endTime,
      chairNumber: a.chairNumber, status: a.status, notes: a.notes,
      isWalkIn: a.isWalkIn, createdAt: a.createdAt?.toISOString(),
    })),
    bills: bills.map(b => ({
      id: b.id, appointmentId: b.appointmentId, patientId: b.patientId,
      patientName: pName, items: b.items, subtotal: Number(b.subtotal),
      discount: Number(b.discount), total: Number(b.total),
      paymentMethod: b.paymentMethod, status: b.status,
      receiptNumber: b.receiptNumber, createdAt: b.createdAt?.toISOString(),
      paidAt: b.paidAt?.toISOString() ?? null,
    })),
  });
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  const [patient] = await db.update(patientsTable).set(updates).where(eq(patientsTable.id, id)).returning();
  if (!patient) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatPatient(patient));
});

router.post("/:id/checkin", async (req, res) => {
  const id = parseInt(req.params.id);
  const [patient] = await db.update(patientsTable)
    .set({ status: "active", lastVisit: new Date() })
    .where(eq(patientsTable.id, id)).returning();
  if (!patient) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ message: "Patient checked in", patient: formatPatient(patient) });
});

router.get("/:id/treatment-logs", async (req, res) => {
  const id = parseInt(req.params.id);
  const logs = await db.select().from(treatmentLogsTable)
    .where(eq(treatmentLogsTable.patientId, id))
    .orderBy(desc(treatmentLogsTable.createdAt));
  const staffIds = [...new Set(logs.map(l => l.dentistId))];
  const treatmentIds = [...new Set(logs.map(l => l.treatmentId))];
  const [staffMembers, treatments] = await Promise.all([
    staffIds.length ? db.select().from(staffTable).where(sql`id = ANY(${staffIds})`) : Promise.resolve([]),
    treatmentIds.length ? db.select().from(treatmentsTable).where(sql`id = ANY(${treatmentIds})`) : Promise.resolve([]),
  ]);
  const staffMap = Object.fromEntries(staffMembers.map(s => [s.id, s.name]));
  const treatMap = Object.fromEntries(treatments.map(t => [t.id, t.name]));
  res.json(logs.map(l => ({
    id: l.id, patientId: l.patientId, dentistId: l.dentistId,
    dentistName: staffMap[l.dentistId] ?? "", treatmentId: l.treatmentId,
    treatmentName: treatMap[l.treatmentId] ?? "", notes: l.notes,
    imageUrls: l.imageUrls as string[], date: l.date, status: l.status,
  })));
});

router.post("/:id/treatment-logs", async (req, res) => {
  const patientId = parseInt(req.params.id);
  const { dentistId, treatmentId, notes, imageUrls, date, status } = req.body;
  const [log] = await db.insert(treatmentLogsTable).values({
    patientId, dentistId, treatmentId, notes,
    imageUrls: imageUrls ?? [],
    date: date ?? new Date().toISOString().split("T")[0],
    status: status ?? "completed",
  }).returning();
  await db.update(patientsTable).set({ lastVisit: new Date() }).where(eq(patientsTable.id, patientId));
  res.status(201).json({
    id: log.id, patientId: log.patientId, dentistId: log.dentistId,
    dentistName: "", treatmentId: log.treatmentId, treatmentName: "",
    notes: log.notes, imageUrls: log.imageUrls as string[],
    date: log.date, status: log.status,
  });
});

export default router;
