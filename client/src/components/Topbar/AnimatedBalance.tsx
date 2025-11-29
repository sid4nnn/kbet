import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet } from 'lucide-react';

interface AnimatedBalanceProps {
    value: number;
    onDeposit?: () => void;
}

const AnimatedBalance = ({ value, onDeposit }: AnimatedBalanceProps) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [diff, setDiff] = useState<number | null>(null);
    const prevValueRef = useRef(value);

    useEffect(() => {
        if (value !== prevValueRef.current) {
            const difference = value - prevValueRef.current;
            setDiff(difference);
            setDisplayValue(value);

            // Reset diff after animation
            const timer = setTimeout(() => {
                setDiff(null);
            }, 2000);

            prevValueRef.current = value;
            return () => clearTimeout(timer);
        }
    }, [value]);

    const isPositive = diff !== null && diff > 0;
    const isNegative = diff !== null && diff < 0;

    return (
        <div className="relative flex items-center bg-[#0f1923] rounded-lg p-1 border border-[#2c3e50] overflow-visible">
            <div className="px-3 py-1.5 flex items-center gap-2 relative z-10">
                <Wallet className={`w-4 h-4 transition-colors duration-300 ${isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-amber-400'}`} />
                <span className={`font-bold transition-colors duration-300 ${isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-white'}`}>
                    {displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>

            <AnimatePresence>
                {diff !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 0, x: -20 }}
                        animate={{ opacity: 1, y: -25, x: 0 }}
                        exit={{ opacity: 0, y: -35 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`absolute left-0 right-0 text-center font-bold text-sm pointer-events-none z-20 ${isPositive ? 'text-emerald-400' : 'text-red-500'
                            }`}
                    >
                        {isPositive ? '+' : ''}{diff.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={onDeposit}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-4 py-1.5 rounded-md transition-colors ml-2"
            >
                Deposit
            </button>
        </div>
    );
};

export default AnimatedBalance;
