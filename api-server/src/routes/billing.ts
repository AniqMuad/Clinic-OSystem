import { Router } from "express";
import { db } from "@workspace/db";
import { billsTable, patientsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

function formatBill(b: typeof billsTable.$inferSelect, patientName = "") {
  const items = b.items as { treatmentId?: number; treatmentName: string; quantity: number; unitPrice: number; total: number }[];
  return {
    id: b.id, appointmentId: b.appointmentId, patientId: b.patientId,
    patientName, items, subtotal: Number(b.subtotal), discount: Number(b.discount),
    total: Number(b.total), paymentMethod: b.paymentMethod, status: b.status,
    receiptNumber: b.receiptNumber, createdAt: b.createdAt?.toISOString(),
    paidAt: b.paidAt?.toISOString() ?? null,
  };
}

async function enrichBill(b: typeof billsTable.$inferSelect) {
  const [p] = await db.select({ name: patientsTable.name }).from(patientsTable).where(eq(patientsTable.id, b.patientId)).limit(1);
  return formatBill(b, p?.name ?? "");
}

router.get("/", async (req, res) => {
  const { patientId, status } = req.query as Record<string, string>;
  let query = db.select().from(billsTable).$dynamic();
  const conds = [];
  if (patientId) conds.push(eq(billsTable.patientId, parseInt(patientId)));
  if (status) conds.push(eq(billsTable.status, status));
  if (conds.length) query = query.where(and(...conds));
  const bills = await query.orderBy(billsTable.createdAt);
  const enriched = await Promise.all(bills.map(enrichBill));
  res.json(enriched);
});

router.post("/", async (req, res) => {
  const { appointmentId, patientId, items, discount } = req.body;
  if (!patientId || !items) { res.status(400).json({ error: "patientId, items required" }); return; }
  const subtotal = items.reduce((s: number, i: { total: number }) => s + i.total, 0);
  const disc = discount ?? 0;
  const total = subtotal - disc;
  const receiptNumber = `RC${Date.now().toString().slice(-8)}`;
  const [bill] = await db.insert(billsTable).values({
    appointmentId, patientId, items,
    subtotal: String(subtotal), discount: String(disc), total: String(total),
    paymentMethod: "unpaid", status: "pending", receiptNumber,
  }).returning();
  res.status(201).json(await enrichBill(bill));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [bill] = await db.select().from(billsTable).where(eq(billsTable.id, id)).limit(1);
  if (!bill) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichBill(bill));
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { items, discount, paymentMethod } = req.body;
  const [existing] = await db.select().from(billsTable).where(eq(billsTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  const newItems = items ?? (existing.items as { total: number }[]);
  const newDiscount = discount ?? Number(existing.discount);
  const newSubtotal = newItems.reduce((s: number, i: { total: number }) => s + i.total, 0);
  const newTotal = newSubtotal - newDiscount;
  const [bill] = await db.update(billsTable).set({
    ...(items && { items }),
    subtotal: String(newSubtotal), discount: String(newDiscount), total: String(newTotal),
    ...(paymentMethod && { paymentMethod }),
  }).where(eq(billsTable.id, id)).returning();
  res.json(await enrichBill(bill));
});

router.post("/:id/pay", async (req, res) => {
  const id = parseInt(req.params.id);
  const { paymentMethod } = req.body;
  const [bill] = await db.update(billsTable).set({
    paymentMethod, status: "paid", paidAt: new Date(),
  }).where(eq(billsTable.id, id)).returning();
  if (!bill) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichBill(bill));
});

export default router;
