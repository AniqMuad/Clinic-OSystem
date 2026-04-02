import { Router } from "express";
import { db } from "@workspace/db";
import { inventoryTable } from "@workspace/db/schema";
import { eq, lte, sql } from "drizzle-orm";

const router = Router();

function formatItem(i: typeof inventoryTable.$inferSelect) {
  return {
    id: i.id, name: i.name, category: i.category, unit: i.unit,
    currentStock: i.currentStock, minStockLevel: i.minStockLevel,
    reorderQuantity: i.reorderQuantity, unitCost: i.unitCost ? Number(i.unitCost) : null,
    supplier: i.supplier, lastRestocked: i.lastRestocked?.toISOString() ?? null,
    isLowStock: i.currentStock <= i.minStockLevel,
  };
}

router.get("/low-stock", async (_req, res) => {
  const items = await db.select().from(inventoryTable)
    .where(sql`${inventoryTable.currentStock} <= ${inventoryTable.minStockLevel}`)
    .orderBy(inventoryTable.name);
  res.json(items.map(formatItem));
});

router.get("/", async (_req, res) => {
  const items = await db.select().from(inventoryTable).orderBy(inventoryTable.category, inventoryTable.name);
  res.json(items.map(formatItem));
});

router.post("/", async (req, res) => {
  const { name, category, unit, currentStock, minStockLevel, reorderQuantity, unitCost, supplier } = req.body;
  if (!name || !category || !unit) {
    res.status(400).json({ error: "name, category, unit required" }); return;
  }
  const [item] = await db.insert(inventoryTable).values({
    name, category, unit,
    currentStock: currentStock ?? 0,
    minStockLevel: minStockLevel ?? 10,
    reorderQuantity, unitCost: unitCost ? String(unitCost) : null, supplier,
  }).returning();
  res.status(201).json(formatItem(item));
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, category, unit, minStockLevel, reorderQuantity, unitCost, supplier } = req.body;
  const [item] = await db.update(inventoryTable).set({
    ...(name && { name }), ...(category && { category }), ...(unit && { unit }),
    ...(minStockLevel !== undefined && { minStockLevel }),
    ...(reorderQuantity !== undefined && { reorderQuantity }),
    ...(unitCost !== undefined && { unitCost: String(unitCost) }),
    ...(supplier !== undefined && { supplier }),
  }).where(eq(inventoryTable.id, id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatItem(item));
});

router.delete("/:id", async (req, res) => {
  await db.delete(inventoryTable).where(eq(inventoryTable.id, parseInt(req.params.id)));
  res.status(204).send();
});

router.post("/:id/adjust", async (req, res) => {
  const id = parseInt(req.params.id);
  const { adjustment } = req.body;
  const [item] = await db.select().from(inventoryTable).where(eq(inventoryTable.id, id)).limit(1);
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  const newStock = Math.max(0, item.currentStock + adjustment);
  const updates: Record<string, unknown> = { currentStock: newStock };
  if (adjustment > 0) updates.lastRestocked = new Date();
  const [updated] = await db.update(inventoryTable).set(updates).where(eq(inventoryTable.id, id)).returning();
  res.json(formatItem(updated));
});

export default router;
