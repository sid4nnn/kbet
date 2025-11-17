import { useState } from "react";

export type User = {
  id: number | string;
  email: string;
  displayName: string;
  role: string;
  walletBalance: number;
}

type AuthPageProps = {
  onLogin: (user: User) => void
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");

  const API = "http://localhost:3000";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const url = `${API}/auth/${mode}`;
    const body =
      mode === "register"
        ? { email, password, displayName }
        : { email, password };

    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if(!res.ok) {
      setMessage(data.msg || "Something went wrong");
      return;
    }

  if (mode === "register") {
    setMessage("Registered successfully, you can log in now.");
    setMode("login");
    return;
  }
  const meRes = await fetch(`${API}/users/me`, {
  credentials: "include",
  });

  const meData = await meRes.json();
  console.log("meData from /users/me:", meData);

  if (!meRes.ok) {
    setMessage(meData.msg || "Failed to load profile");
    return;
  }

  const user: User = {
    id: meData.id,
    email: meData.email,
    displayName: meData.displayName,
    role: meData.role,
    walletBalance: meData.walletBalance,
  };

  onLogin(user);
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center text-white">
      <form
        onSubmit={submit}
        className="bg-gray-800 p-8 rounded-2xl shadow-lg flex flex-col gap-4 w-96"
      >
        <h2 className="text-2xl font-inherit text-center">
          {mode === "login" ? "Login" : "Register"}
        </h2>

        {mode === "register" && (
          <input
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-sky-200 p-2 rounded text-black"
          />
        )}

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-sky-200 p-2 rounded text-black"
          type="email"
        />

        <input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-sky-200 p-2 rounded text-black"
          type="password"
        />

        <button
          type="submit"
          className="bg-yellow-500 text-white py-2 rounded font-bold hover:bg-yellow-400"
        >
          {mode === "login" ? "Login" : "Register"}
        </button>

        <p
          className="text-sm text-center cursor-pointer text-white"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "Create an account"
            : "Already have an account? Login"}
        </p>

        {message && (
          <p className="text-sm bg-black/40 p-2 rounded mt-4 text-yellow-200">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
