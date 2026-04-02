import { Router } from "express";
import { db } from "@workspace/db";
import { sopsTable } from "@workspace/db/schema";
import { eq, ilike, and } from "drizzle-orm";

const router = Router();

function formatSop(s: typeof sopsTable.$inferSelect) {
  return {
    id: s.id, title: s.title, category: s.category, content: s.content,
    steps: s.steps as string[], mediaUrls: s.mediaUrls as string[],
    tags: s.tags as string[], updatedAt: s.updatedAt?.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const { search, category } = req.query as Record<string, string>;
  let query = db.select().from(sopsTable).$dynamic();
  if (search) query = query.where(ilike(sopsTable.title, `%${search}%`));
  else if (category) query = query.where(eq(sopsTable.category, category));
  const sops = await query.orderBy(sopsTable.category, sopsTable.title);
  res.json(sops.map(formatSop));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [sop] = await db.select().from(sopsTable).where(eq(sopsTable.id, id)).limit(1);
  if (!sop) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatSop(sop));
});

export default router;
