import { Router } from "express";
import { db } from "@workspace/db";
import { promotionsTable } from "@workspace/db/schema";
import { eq, lte, gte, and } from "drizzle-orm";

const router = Router();

function formatPromotion(p: typeof promotionsTable.$inferSelect) {
  return {
    id: p.id, title: p.title, description: p.description,
    discountType: p.discountType, discountValue: Number(p.discountValue),
    validFrom: p.validFrom, validUntil: p.validUntil, isActive: p.isActive,
    imageUrl: p.imageUrl, treatmentIds: p.treatmentIds as number[],
    createdAt: p.createdAt?.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const { activeOnly } = req.query as Record<string, string>;
  let query = db.select().from(promotionsTable).$dynamic();
  if (activeOnly === "true") {
    const today = new Date().toISOString().split("T")[0];
    query = query.where(and(
      eq(promotionsTable.isActive, true),
      lte(promotionsTable.validFrom, today),
      gte(promotionsTable.validUntil, today),
    ));
  }
  const promotions = await query.orderBy(promotionsTable.createdAt);
  res.json(promotions.map(formatPromotion));
});

router.post("/", async (req, res) => {
  const { title, description, discountType, discountValue, validFrom, validUntil, isActive, imageUrl, treatmentIds } = req.body;
  if (!title || !discountType || !discountValue || !validFrom || !validUntil) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }
  const [p] = await db.insert(promotionsTable).values({
    title, description, discountType,
    discountValue: String(discountValue),
    validFrom, validUntil, isActive: isActive ?? true,
    imageUrl, treatmentIds: treatmentIds ?? [],
  }).returning();
  res.status(201).json(formatPromotion(p));
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;
  const updates: Record<string, unknown> = {};
  if (body.title) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.discountType) updates.discountType = body.discountType;
  if (body.discountValue !== undefined) updates.discountValue = String(body.discountValue);
  if (body.validFrom) updates.validFrom = body.validFrom;
  if (body.validUntil) updates.validUntil = body.validUntil;
  if (body.isActive !== undefined) updates.isActive = body.isActive;
  if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;
  if (body.treatmentIds !== undefined) updates.treatmentIds = body.treatmentIds;
  const [p] = await db.update(promotionsTable).set(updates).where(eq(promotionsTable.id, id)).returning();
  if (!p) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatPromotion(p));
});

router.delete("/:id", async (req, res) => {
  await db.delete(promotionsTable).where(eq(promotionsTable.id, parseInt(req.params.id)));
  res.status(204).send();
});

export default router;
