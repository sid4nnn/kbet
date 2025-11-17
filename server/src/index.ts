import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import auth from "./routes/auth.js";
import users from "./routes/users.js";
import wallet from "./routes/wallet.js"; 

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", auth); 
app.use("/users", users);
app.use("/wallet", wallet);

app.get("/wallet-test-root", (_req, res) => {
  console.log("✅ /wallet-test-root hit in index.ts");
  res.json({ ok: true, at: "index.ts" });
});

app.listen(3000, () => console.log("API on http://localhost:3000"));
