import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import type { User } from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import BlackjackPage from "./pages/BlackjackPage";

const API = "http://localhost:3000";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  function handleLogin(u: User) {
    setUser(u);
  }

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch(`${API}/users/me`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    }

    loadUser();
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-900 text-white">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <HomePage user={user} />
          ) : (
            <AuthPage onLogin={handleLogin} />
          )
        }
      />

      <Route
        path="/blackjack"
        element={
          user ? (
            <BlackjackPage user={user} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}
