import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Gamepad2 } from 'lucide-react';

interface Win {
    id: string;
    displayName: string;
    amountCents: number;
    game: string;
    createdAt: string;
}

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function LatestWins() {
    const [wins, setWins] = useState<Win[]>([]);

    useEffect(() => {
        const fetchWins = async () => {
            try {
                const res = await fetch(`${API}/wallet/latest-wins`);
                if (res.ok) {
                    const data = await res.json();
                    setWins(data);
                }
            } catch (error) {
                console.error("Failed to fetch latest wins", error);
            }
        };

        fetchWins();
        const interval = setInterval(fetchWins, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    if (wins.length === 0) return null; //#0f1923

    return (
        <div className="w-full bg-[#0f1923] border-b border-[#2c3e50] overflow-hidden py-2 relative">
            <div className="flex items-center gap-2 absolute z-10 bg-[linear-gradient(to_left,transparent_0%,#0f1923_75%,#0f1923_100%)] pr-100 h-full">
                <Trophy size={16} className="text-yellow-500 -translate-y-2 translate-x-2" />
                <span className="text-xs font-bold text-white uppercase tracking-wider -translate-y-2 translate-x-2">Latest Wins</span>
            </div>

            <div className="flex overflow-hidden">
                <motion.div
                    className="flex gap-8 items-center pl-32 whitespace-nowrap"
                    animate={{ x: [0, -1000] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 20
                    }}
                >
                    {[...wins, ...wins, ...wins].map((win, i) => (
                        <div key={`${win.id}-${i}`} className="flex items-center gap-2 text-sm text-gray-300">
                            <Gamepad2 size={14} className="text-emerald-500" />
                            <span className="font-bold text-white">{win.displayName}</span>
                            <span>won</span>
                            <span className="text-emerald-400 font-bold">${(win.amountCents).toFixed(2)}</span>
                            <span className="text-gray-500">on {win.game}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
