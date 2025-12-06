import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

const r = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const COOKIE = "auth";

const Register = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(1),
});

const Login = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function setCookie(res: any, token: string) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    maxAge: 1000 * 60 * 60 * 8
  });
}

r.post("/register", async (req, res) => {
  const parsed = Register.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { email, password, displayName } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ msg: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);

  const u = await prisma.user.create({
    data: { email, passwordHash, displayName, role: "player", Wallet: { create: {} } }
  });

  const token = jwt.sign({ sub: u.id, role: u.role }, JWT_SECRET, { expiresIn: "8h" });
  setCookie(res, token);

  res.json({ id: u.id, email: u.email, displayName: u.displayName, role: u.role, xp: u.xp });
});

r.post("/login", async (req, res) => {
  const parsed = Login.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { email, password } = parsed.data;

  const u = await prisma.user.findUnique({ where: { email } });
  if (!u) return res.status(401).json({ msg: "Invalid credentials" });

  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return res.status(401).json({ msg: "Invalid credentials" });

  const token = jwt.sign({ sub: u.id, role: u.role }, JWT_SECRET, { expiresIn: "8h" });
  setCookie(res, token);
  res.json({ id: u.id, email: u.email, displayName: u.displayName, role: u.role, xp: u.xp });
});

r.post("/logout", (req, res) => {
  res.clearCookie(COOKIE, { path: "/", secure: true, sameSite: "none" });
  res.json({ ok: true });
});

r.get("/me", async (req, res) => {
  const token = req.cookies?.[COOKIE];
  if (!token) return res.json({ user: null });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; role: string };

    const u = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { Wallet: true },
    });

    console.log("AUTH /me user:", u);                 // 👈 log full user
    console.log("Wallet:", u?.Wallet);               // 👈 log wallet
    console.log("baLanceCents:", u?.Wallet?.balanceCents); // 👈 log balanceCents

    if (!u) return res.json({ user: null });

    const walletBalance = u.Wallet?.balanceCents ?? 0;

    res.json({
      user: {
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        role: u.role,
        walletBalance,
        xp: u.xp,
      },
    });
  } catch {
    res.json({ user: null });
  }
});

export default r;