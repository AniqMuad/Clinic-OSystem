import { Router } from "express";
import { db } from "@workspace/db";
import { chatMessagesTable, staffTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/messages", async (req, res) => {
  const { limit = "50" } = req.query as Record<string, string>;
  const messages = await db.select().from(chatMessagesTable)
    .orderBy(desc(chatMessagesTable.createdAt)).limit(parseInt(limit));

  const senderIds = [...new Set(messages.map(m => m.senderId))];
  const senders = senderIds.length
    ? await db.select({ id: staffTable.id, name: staffTable.name, role: staffTable.role }).from(staffTable).where(eq(staffTable.id, senderIds[0]))
    : [];

  // Get all senders
  const allSenders = senderIds.length
    ? await db.select({ id: staffTable.id, name: staffTable.name, role: staffTable.role }).from(staffTable)
    : [];
  const senderMap = Object.fromEntries(allSenders.map(s => [s.id, s]));

  res.json(messages.reverse().map(m => ({
    id: m.id, senderId: m.senderId,
    senderName: senderMap[m.senderId]?.name ?? "Unknown",
    senderRole: senderMap[m.senderId]?.role ?? "",
    message: m.message, isEmergency: m.isEmergency,
    createdAt: m.createdAt?.toISOString(),
  })));
});

router.post("/messages", async (req, res) => {
  const authHeader = req.headers.authorization;
  let senderId = 1;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const decoded = Buffer.from(token, "base64").toString();
      senderId = parseInt(decoded.split(":")[0]);
    } catch {}
  }
  const { message, isEmergency } = req.body;
  if (!message) { res.status(400).json({ error: "message required" }); return; }
  const [msg] = await db.insert(chatMessagesTable).values({
    senderId, message, isEmergency: isEmergency ?? false,
  }).returning();
  const [sender] = await db.select({ name: staffTable.name, role: staffTable.role }).from(staffTable).where(eq(staffTable.id, senderId)).limit(1);
  res.status(201).json({
    id: msg.id, senderId: msg.senderId,
    senderName: sender?.name ?? "Unknown", senderRole: sender?.role ?? "",
    message: msg.message, isEmergency: msg.isEmergency, createdAt: msg.createdAt?.toISOString(),
  });
});

export default router;
