import type { User } from "./AuthPage";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

type HomePageProps = {
  user: User;
};

export default function HomePage({ user }: HomePageProps) {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("HomePage user:", user);
  }, [user]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-lg w-[420px] flex flex-col gap-6">
        <h1 className="text-2xl font-bold">
          Welcome,{" "}
          <span className="text-yellow-300 font-normal">
            {user.displayName}
          </span>
        </h1>

        <p className="text-sm text-slate-200">
          You are logged in with{" "}
          <span className="font-mono">{user.email}</span>
        </p>

        <div className="text-lg bg-black/20 p-4 rounded-xl flex justify-between">
          <span>Wallet Balance</span>
          <span className="font-bold text-green-300">
            ${user.walletBalance}
          </span>
        </div>

        <button
          onClick={() => {
            console.log("Play Blackjack clicked");
            navigate("/blackjack");
          }}
          className="mt-2 bg-yellow-500 text-black py-2 rounded font-bold hover:bg-yellow-400"
        >
          Play Blackjack
        </button>
      </div>
    </div>
  );
}
