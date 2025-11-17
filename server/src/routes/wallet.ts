import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";

console.log("✅ wallet router file loaded");

const r = Router();
const prisma = new PrismaClient();

async function ensureWallet(userId: string) {
  return prisma.wallet.upsert({
    where: { userId },
    update: {},
    create: { userId, balanceCents: 0 },
  });
}

r.get("/test", (_req, res) => {
  console.log("✅ /wallet/test hit");
  res.json({ ok: true, route: "wallet" });
});

r.post("/bet", requireAuth, async (req: AuthedRequest, res) => {
  const { amountCents } = req.body ?? {};
  const amount = Number(amountCents);

  if (!Number.isInteger(amount) || amount <= 0) {
    return res.status(400).json({ msg: "Invalid bet amount" });
  }

  const userId = req.user!.id;

  try {
    const wallet = await ensureWallet(userId);

    if (wallet.balanceCents < amount) {
      return res
        .status(400)
        .json({ msg: "Insufficient funds", balanceCents: wallet.balanceCents });
    }

    const updated = await prisma.wallet.update({
      where: { userId },
      data: { balanceCents: { decrement: amount } },
    });

    return res.json({ balanceCents: updated.balanceCents });
  } catch (err) {
    console.error("POST /wallet/bet error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

r.post("/credit", requireAuth, async (req: AuthedRequest, res) => {
  const { amountCents } = req.body ?? {};
  const amount = Number(amountCents);

  if (!Number.isInteger(amount) || amount <= 0) {
    return res.status(400).json({ msg: "Invalid credit amount" });
  }

  const userId = req.user!.id;

  try {
    const wallet = await prisma.wallet.upsert({
      where: { userId },
      update: {
        balanceCents: { increment: amount },
      },
      create: {
        userId,
        balanceCents: amount,
      },
    });

    return res.json({ balanceCents: wallet.balanceCents });
  } catch (err) {
    console.error("POST /wallet/credit error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

export default r;
