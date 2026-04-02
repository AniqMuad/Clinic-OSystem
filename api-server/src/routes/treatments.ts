import { Router } from "express";
import { db } from "@workspace/db";
import { treatmentsTable, sopsTable } from "@workspace/db/schema";
import { eq, ilike, or, desc } from "drizzle-orm";

const router = Router();

function formatTreatment(t: typeof treatmentsTable.$inferSelect) {
  return {
    id: t.id, name: t.name, category: t.category, description: t.description,
    startingPrice: Number(t.startingPrice), duration: t.duration,
    faqs: t.faqs as { question: string; answer: string }[],
    isActive: t.isActive, imageUrl: t.imageUrl,
  };
}

router.get("/", async (_req, res) => {
  const treatments = await db.select().from(treatmentsTable).orderBy(treatmentsTable.category, treatmentsTable.name);
  res.json(treatments.map(formatTreatment));
});

router.post("/", async (req, res) => {
  const { name, category, description, startingPrice, duration, faqs, isActive, imageUrl } = req.body;
  if (!name || !category || !startingPrice) {
    res.status(400).json({ error: "name, category, startingPrice required" }); return;
  }
  const [t] = await db.insert(treatmentsTable).values({
    name, category, description,
    startingPrice: String(startingPrice), duration,
    faqs: faqs ?? [], isActive: isActive ?? true, imageUrl,
  }).returning();
  res.status(201).json(formatTreatment(t));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [t] = await db.select().from(treatmentsTable).where(eq(treatmentsTable.id, id)).limit(1);
  if (!t) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatTreatment(t));
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;
  const updates: Record<string, unknown> = {};
  if (body.name) updates.name = body.name;
  if (body.category) updates.category = body.category;
  if (body.description !== undefined) updates.description = body.description;
  if (body.startingPrice !== undefined) updates.startingPrice = String(body.startingPrice);
  if (body.duration !== undefined) updates.duration = body.duration;
  if (body.faqs !== undefined) updates.faqs = body.faqs;
  if (body.isActive !== undefined) updates.isActive = body.isActive;
  if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;
  const [t] = await db.update(treatmentsTable).set(updates).where(eq(treatmentsTable.id, id)).returning();
  if (!t) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatTreatment(t));
});

// SOPs
router.get("/sops/list", async (req, res) => {
  const { search, category } = req.query as Record<string, string>;
  let query = db.select().from(sopsTable).$dynamic();
  if (search) query = query.where(ilike(sopsTable.title, `%${search}%`));
  else if (category) query = query.where(ilike(sopsTable.category, `%${category}%`));
  const sops = await query.orderBy(sopsTable.category, sopsTable.title);
  res.json(sops.map(s => ({
    id: s.id, title: s.title, category: s.category, content: s.content,
    steps: s.steps as string[], mediaUrls: s.mediaUrls as string[],
    tags: s.tags as string[], updatedAt: s.updatedAt?.toISOString(),
  })));
});

router.get("/sops/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [s] = await db.select().from(sopsTable).where(eq(sopsTable.id, id)).limit(1);
  if (!s) { res.status(404).json({ error: "Not found" }); return; }
  res.json({
    id: s.id, title: s.title, category: s.category, content: s.content,
    steps: s.steps as string[], mediaUrls: s.mediaUrls as string[],
    tags: s.tags as string[], updatedAt: s.updatedAt?.toISOString(),
  });
});

export default router;
