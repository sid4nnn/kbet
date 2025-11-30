import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth.js";
console.log("wallet router file loaded");
const r = Router();
const prisma = new PrismaClient();
async function ensureWallet(userId) {
    return prisma.wallet.upsert({
        where: { userId },
        update: {},
        create: { userId, balanceCents: 0 },
    });
}
r.get("/test", (_req, res) => {
    console.log("/wallet/test hit");
    res.json({ ok: true, route: "wallet" });
});
r.post("/bet", requireAuth, async (req, res) => {
    const { amountCents } = req.body ?? {};
    const amount = Number(amountCents);
    if (!Number.isInteger(amount) || amount <= 0) {
        return res.status(400).json({ msg: "Invalid bet amount" });
    }
    const userId = req.user.id;
    try {
        const result = await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { userId } });
            if (!wallet) {
                // Should be ensured, but just in case
                throw new Error("Wallet not found");
            }
            if (wallet.balanceCents < amount) {
                throw new Error("Insufficient funds");
            }
            // 1. Deduct balance
            const updatedWallet = await tx.wallet.update({
                where: { userId },
                data: { balanceCents: { decrement: amount } },
            });
            // 2. Add XP (1 cent = 1 XP)
            await tx.user.update({
                where: { id: userId },
                data: { xp: { increment: amount } },
            });
            // 3. Create Transaction Record
            await tx.gameTransaction.create({
                data: {
                    userId,
                    type: "BET",
                    amountCents: -amount,
                },
            });
            return updatedWallet;
        });
        return res.json({ balanceCents: result.balanceCents });
    }
    catch (err) {
        console.error("POST /wallet/bet error:", err);
        if (err.message === "Insufficient funds") {
            return res.status(400).json({ msg: "Insufficient funds" });
        }
        return res.status(500).json({ msg: "Server error" });
    }
});
r.post("/admin-deposit", requireAuth, async (req, res) => {
    const { amountCents } = req.body ?? {};
    const amount = Number(amountCents);
    if (!Number.isInteger(amount) || amount <= 0) {
        return res.status(400).json({ msg: "Invalid deposit amount" });
    }
    const userId = req.user.id;
    // Check if user is admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "admin") {
        return res.status(403).json({ msg: "Unauthorized" });
    }
    try {
        const result = await prisma.$transaction(async (tx) => {
            const updatedWallet = await tx.wallet.upsert({
                where: { userId },
                update: {
                    balanceCents: { increment: amount },
                },
                create: {
                    userId,
                    balanceCents: amount,
                },
            });
            await tx.gameTransaction.create({
                data: {
                    userId,
                    type: "ADMINDEPOSIT",
                    amountCents: amount,
                },
            });
            return updatedWallet;
        });
        return res.json({ balanceCents: result.balanceCents });
    }
    catch (err) {
        console.error("POST /wallet/admin-deposit error:", err);
        return res.status(500).json({ msg: "Server error" });
    }
});
r.post("/credit", requireAuth, async (req, res) => {
    const { amountCents } = req.body ?? {};
    const amount = Number(amountCents);
    if (!Number.isInteger(amount) || amount <= 0) {
        return res.status(400).json({ msg: "Invalid credit amount" });
    }
    const userId = req.user.id;
    try {
        // We can also wrap this in a transaction if we want to be strict, 
        // but for credit (win), it's less critical than bet unless we want to ensure the log exists.
        // Let's use transaction for consistency.
        const result = await prisma.$transaction(async (tx) => {
            const updatedWallet = await tx.wallet.upsert({
                where: { userId },
                update: {
                    balanceCents: { increment: amount },
                },
                create: {
                    userId,
                    balanceCents: amount,
                },
            });
            await tx.gameTransaction.create({
                data: {
                    userId,
                    type: "WIN",
                    amountCents: amount,
                    game: "Blackjack",
                },
            });
            return updatedWallet;
        });
        return res.json({ balanceCents: result.balanceCents });
    }
    catch (err) {
        console.error("POST /wallet/credit error:", err);
        return res.status(500).json({ msg: "Server error" });
    }
});
r.get("/latest-wins", async (_req, res) => {
    try {
        const wins = await prisma.gameTransaction.findMany({
            where: {
                type: "WIN",
                amountCents: { gt: 0 }, // Ensure positive wins
            },
            take: 10,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        displayName: true,
                    },
                },
            },
        });
        // Format for frontend
        const formattedWins = wins.map((w) => ({
            id: w.id,
            displayName: w.user.displayName,
            amountCents: w.amountCents,
            game: w.game,
            createdAt: w.createdAt,
        }));
        res.json(formattedWins);
    }
    catch (err) {
        console.error("GET /wallet/latest-wins error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});
export default r;
//# sourceMappingURL=wallet.js.map