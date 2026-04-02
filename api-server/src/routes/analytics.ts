import { Router } from "express";
import { db } from "@workspace/db";
import { appointmentsTable, billsTable, inventoryTable, tasksTable, treatmentsTable, treatmentLogsTable } from "@workspace/db/schema";
import { eq, sql, gte, lte, and, desc } from "drizzle-orm";

const router = Router();

router.get("/dashboard", async (_req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const [todayAppts, todayRevenue, lowStock, overdueTasks] = await Promise.all([
    db.select().from(appointmentsTable).where(eq(appointmentsTable.date, today)),
    db.select({ total: sql<number>`coalesce(sum(total), 0)` }).from(billsTable).where(
      and(eq(billsTable.status, "paid"), sql`date(paid_at) = ${today}`)
    ),
    db.select({ count: sql<number>`count(*)` }).from(inventoryTable)
      .where(sql`${inventoryTable.currentStock} <= ${inventoryTable.minStockLevel}`),
    db.select({ count: sql<number>`count(*)` }).from(tasksTable).where(eq(tasksTable.status, "overdue")),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const a of todayAppts) {
    statusCounts[a.status] = (statusCounts[a.status] ?? 0) + 1;
  }

  res.json({
    date: today,
    totalPatientsToday: todayAppts.length,
    revenueToday: Number(todayRevenue[0]?.total ?? 0),
    completedTreatments: todayAppts.filter(a => a.status === "completed").length,
    pendingAppointments: todayAppts.filter(a => ["scheduled", "waiting"].includes(a.status)).length,
    lowStockAlerts: Number(lowStock[0]?.count ?? 0),
    overdueTasks: Number(overdueTasks[0]?.count ?? 0),
    appointmentsByStatus: statusCounts,
  });
});

router.get("/revenue", async (req, res) => {
  const { period = "weekly" } = req.query as Record<string, string>;
  const data: { label: string; revenue: number; patients: number }[] = [];

  if (period === "daily") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-MY", { weekday: "short" });
      const [rev] = await db.select({ total: sql<number>`coalesce(sum(total), 0)`, cnt: sql<number>`count(*)` })
        .from(billsTable).where(and(eq(billsTable.status, "paid"), sql`date(paid_at) = ${dateStr}`));
      data.push({ label, revenue: Number(rev?.total ?? 0), patients: Number(rev?.cnt ?? 0) });
    }
  } else if (period === "monthly") {
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const label = d.toLocaleDateString("en-MY", { month: "short", year: "2-digit" });
      const [rev] = await db.select({ total: sql<number>`coalesce(sum(total), 0)`, cnt: sql<number>`count(*)` })
        .from(billsTable).where(and(eq(billsTable.status, "paid"), sql`to_char(paid_at, 'YYYY-MM') = ${y + "-" + m}`));
      data.push({ label, revenue: Number(rev?.total ?? 0), patients: Number(rev?.cnt ?? 0) });
    }
  } else {
    // weekly — last 7 weeks
    for (let i = 6; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - i * 7 - 6);
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const label = `W${7 - i}`;
      const [rev] = await db.select({ total: sql<number>`coalesce(sum(total), 0)`, cnt: sql<number>`count(*)` })
        .from(billsTable).where(and(
          eq(billsTable.status, "paid"),
          gte(billsTable.paidAt, start),
          lte(billsTable.paidAt, end),
        ));
      data.push({ label, revenue: Number(rev?.total ?? 0), patients: Number(rev?.cnt ?? 0) });
    }
  }

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  res.json({ period, totalRevenue, data });
});

router.get("/treatments", async (_req, res) => {
  const logs = await db.select({
    treatmentId: treatmentLogsTable.treatmentId,
    count: sql<number>`count(*)`,
  }).from(treatmentLogsTable).groupBy(treatmentLogsTable.treatmentId).orderBy(desc(sql`count(*)`)).limit(10);

  const treatIds = logs.map(l => l.treatmentId);
  const treatments = treatIds.length
    ? await db.select().from(treatmentsTable)
    : [];
  const treatMap = Object.fromEntries(treatments.map(t => [t.id, t.name]));

  const mostCommon = logs.map(l => ({
    name: treatMap[l.treatmentId] ?? "Unknown",
    count: Number(l.count), revenue: 0,
  }));

  // By category
  const cats = await db.select({
    category: treatmentsTable.category,
    count: sql<number>`count(*)`,
  }).from(treatmentLogsTable)
    .leftJoin(treatmentsTable, eq(treatmentLogsTable.treatmentId, treatmentsTable.id))
    .groupBy(treatmentsTable.category);

  const byCategory = cats.map(c => ({
    name: c.category ?? "Unknown",
    count: Number(c.count), revenue: 0,
  }));

  res.json({ mostCommon, byCategory });
});

export default router;
