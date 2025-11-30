import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth.js";
const r = Router();
const prisma = new PrismaClient();
r.get("/me", requireAuth, async (req, res) => {
    const u = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { Wallet: true },
    });
    if (!u)
        return res.status(404).json({ msg: "User not found" });
    const walletBalance = u.Wallet?.balanceCents ?? 0;
    console.log("USERS /me user:", u);
    console.log("Wallet:", u?.Wallet);
    console.log("balanceCents:", u?.Wallet?.balanceCents);
    res.json({
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        role: u.role,
        createdAt: u.createdAt,
        walletBalance,
        xp: u.xp,
    });
});
export default r;
//# sourceMappingURL=users.js.map