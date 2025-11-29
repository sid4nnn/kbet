import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import type { User } from "./pages/AuthPage";
import Layout from "./components/Layout/Layout";
import Home from "./components/Home/Home";
import BlackjackPage from "./pages/BlackjackPage";

import type { Notification } from "./components/Topbar/NotificationDropdown";

const API = "http://localhost:3000";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  function handleLogin(u: User) {
    setUser(u);
  }

  async function handleLogout() {
    try {
      await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
      setUser(null);
      setNotifications([]);
      window.location.reload();
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  function addNotification(message: string, type: 'win' | 'loss' | 'info' = 'info') {
    const newNote: Notification = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      type
    };
    setNotifications(prev => [newNote, ...prev]);
  }

  async function refreshUser(balanceDiff?: number) {
    try {
      const res = await fetch(`${API}/users/me`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);

        if (balanceDiff !== undefined && balanceDiff !== 0) {
          const isWin = balanceDiff > 0;
          const msg = isWin
            ? `+${balanceDiff.toFixed(2)} coins to your wallet`
            : `${balanceDiff.toFixed(2)} coins from your wallet`;
          addNotification(msg, isWin ? 'win' : 'loss');
        }
      }
    } catch (err) {
      console.error("Failed to refresh user", err);
    } finally {
      setCheckingAuth(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1923] text-white">
        <div className="animate-pulse text-emerald-500 font-bold text-xl">Loading KBET...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Layout user={user} onLogout={handleLogout} notifications={notifications} />
          ) : (
            <AuthPage onLogin={handleLogin} />
          )
        }
      >
        <Route index element={<Home />} />
        <Route path="blackjack" element={<BlackjackPage user={user!} onBalanceChange={refreshUser} />} />
        {/* Add more routes here */}
        <Route path="*" element={<div className="p-10 text-center text-gray-500">Page not found</div>} />
      </Route>
    </Routes>
  );
}
