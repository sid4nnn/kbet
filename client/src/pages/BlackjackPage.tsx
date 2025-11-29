import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "../pages/AuthPage";

import cardBack from "../assets/blackjack/card-back.png";

export interface BlackjackPageProps {
  user: User;
  onBalanceChange?: (diff?: number) => void;
}

const API = "http://localhost:3000";

// === Types ===
type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface Card {
  rank: Rank;
  suit: Suit;
}

type RoundStatus = "idle" | "playerTurn" | "dealerTurn" | "roundOver";

// === Deck helpers ===
function createDeck(): Card[] {
  const suits: Suit[] = ["♠", "♥", "♦", "♣"];
  const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const deck: Card[] = [];
  for (const s of suits) {
    for (const r of ranks) {
      deck.push({ rank: r, suit: s });
    }
  }
  return deck;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cardValue(rank: Rank): number {
  if (rank === "A") return 11;
  if (["K", "Q", "J"].includes(rank)) return 10;
  return parseInt(rank, 10);
}

function handValue(hand: Card[]) {
  let total = 0;
  let aces = 0;

  for (const c of hand) {
    total += cardValue(c.rank);
    if (c.rank === "A") aces++;
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  const isBust = total > 21;
  const isBlackjack = hand.length === 2 && total === 21;

  return { total, isBust, isBlackjack };
}

function cardKey(c: Card, idx: number) {
  return `${c.rank}${c.suit}-${idx}`;
}

// === Card Components ===
interface CardFaceProps {
  card: Card;
}

function CardFace({ card }: CardFaceProps) {
  const isRed = card.suit === "♥" || card.suit === "♦";

  return (
    <div className="w-full h-full bg-white rounded-md md:rounded-lg shadow-2xl flex flex-col justify-between p-1 select-none relative overflow-hidden">
      {/* Subtle texture/gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-white via-gray-50 to-gray-200 opacity-50" />

      {/* Top Left */}
      <div className="flex flex-col items-center leading-none z-10">
        <span className={`text-sm md:text-base font-bold ${isRed ? "text-red-600" : "text-gray-900"}`}>
          {card.rank}
        </span>
        <span className={`text-sm md:text-base ${isRed ? "text-red-600" : "text-gray-900"}`}>
          {card.suit}
        </span>
      </div>

      {/* Center Big Suit */}
      <div className={`absolute inset-0 flex items-center justify-center text-3xl md:text-5xl opacity-20 ${isRed ? "text-red-600" : "text-gray-900"}`}>
        {card.suit}
      </div>

      {/* Bottom Right (Rotated) */}
      <div className="flex flex-col items-center leading-none rotate-180 z-10">
        <span className={`text-sm md:text-base font-bold ${isRed ? "text-red-600" : "text-gray-900"}`}>
          {card.rank}
        </span>
        <span className={`text-sm md:text-base ${isRed ? "text-red-600" : "text-gray-900"}`}>
          {card.suit}
        </span>
      </div>
    </div>
  );
}

function CardBack() {
  return (
    <div className="w-full h-full rounded-md md:rounded-lg overflow-hidden shadow-2xl border border-gray-800 bg-[#1a2c38]">
      <img src={cardBack} alt="Card Back" className="w-full h-full object-cover" />
    </div>
  );
}

interface FlippableCardProps {
  isFaceUp: boolean;
  card: Card;
  index: number;
  owner: "player" | "dealer";
}

function FlippableCard({ isFaceUp, card, index, owner }: FlippableCardProps) {
  // FASTER ANIMATIONS: extremely short delay
  const delay = index * 0.03;

  // Directional Animation:
  // Dealer: Comes from TOP (negative Y)
  // Player: Comes from BOTTOM (positive Y)
  const initialY = owner === "dealer" ? -200 : 200;

  // Only dealer's hole card (initially face down) should have rotation logic
  const isDealerHoleCard = owner === "dealer" && index === 1;

  const initialRotateY = isDealerHoleCard ? 180 : 0;
  const targetRotateY = isDealerHoleCard ? (isFaceUp ? 0 : 180) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: initialY, scale: 0.8, rotateY: initialRotateY }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateY: targetRotateY }}
      transition={{
        delay,
        duration: 0.2, // Extremely fast duration (was 0.3)
        type: "spring",
        stiffness: 500, // Very stiff for instant snap (was 400)
        damping: 30
      }}
      // EVEN SMALLER CARDS: w-16 h-24 mobile, w-20 h-28 desktop
      className="relative w-16 h-24 md:w-20 md:h-28 perspective-1000 mx-1 -ml-8 first:ml-0 hover:-translate-y-2 transition-transform duration-200"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Front (Face) */}
      <div
        className="absolute inset-0 backface-hidden"
        style={{ transform: "rotateY(0deg)" }} // Front is 0deg
      >
        <CardFace card={card} />
      </div>

      {/* Back */}
      <div
        className="absolute inset-0 backface-hidden"
        style={{ transform: "rotateY(180deg)" }} // Back is 180deg
      >
        <CardBack />
      </div>
    </motion.div>
  );
}

// NEW - for typing server responses
type WalletResponse = { balanceCents: number; msg?: string };

export default function BlackjackPage({ user, onBalanceChange }: BlackjackPageProps) {
  const [wallet, setWallet] = useState<number>(user.walletBalance);

  // Betting
  const [bet, setBet] = useState<number>(0);
  const [activeBet, setActiveBet] = useState<number>(0);

  // Game State
  const [deck, setDeck] = useState<Card[]>(() => shuffle(createDeck()));
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [status, setStatus] = useState<RoundStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [showDealerHole, setShowDealerHole] = useState(false);

  const playerInfo = handValue(playerHand);
  const dealerInfo = handValue(dealerHand);
  const roundInProgress = status === "playerTurn" || status === "dealerTurn";

  function resetDeckIfNeeded(currentDeck: Card[]): Card[] {
    if (currentDeck.length < 15) {
      return shuffle(createDeck());
    }
    return currentDeck;
  }

  async function serverBet(amount: number): Promise<boolean> {
    try {
      const res = await fetch(`${API}/wallet/bet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amountCents: amount }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.msg || "Bet failed");
        return false;
      }
      const data = (await res.json()) as WalletResponse;
      setWallet(data.balanceCents);
      onBalanceChange?.(-amount);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async function serverCredit(amount: number): Promise<void> {
    try {
      const res = await fetch(`${API}/wallet/credit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amountCents: amount }),
      });
      if (res.ok) {
        const data = (await res.json()) as WalletResponse;
        setWallet(data.balanceCents);
        onBalanceChange?.(amount);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function deal() {
    if (bet <= 0) {
      setMessage("Place a bet first!");
      return;
    }
    if (bet > wallet) {
      setMessage("Insufficient funds!");
      return;
    }

    const success = await serverBet(bet);
    if (!success) return;

    setActiveBet(bet);
    setMessage("");
    setStatus("playerTurn");
    setShowDealerHole(false);

    let d = resetDeckIfNeeded(deck);
    const pHand = [d.pop()!, d.pop()!];
    const dHand = [d.pop()!, d.pop()!];

    setPlayerHand(pHand);
    setDealerHand(dHand);
    setDeck(d);

    const pVal = handValue(pHand);
    if (pVal.isBlackjack) {
      // Instant win (unless dealer also has BJ, simplified here)
      setStatus("roundOver");
      setMessage("Blackjack! You win!");
      await serverCredit(bet * 2.5);
      setActiveBet(0);
    }
  }

  async function hit() {
    let d = [...deck];
    const card = d.pop()!;
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    setDeck(d);

    const val = handValue(newHand);
    if (val.isBust) {
      setStatus("roundOver");
      setMessage("Bust! You lose.");
      setActiveBet(0);
    }
  }

  async function stand() {
    setStatus("dealerTurn");
    setShowDealerHole(true);

    let d = [...deck];
    let dH = [...dealerHand];
    let dVal = handValue(dH);

    while (dVal.total < 17) {
      await new Promise(r => setTimeout(r, 200));
      const card = d.pop()!;
      dH.push(card);
      dVal = handValue(dH);
      setDealerHand([...dH]);
    }
    setDeck(d);


    const pVal = handValue(playerHand);
    let winMult = 0;
    let msg = "";

    if (dVal.isBust) {
      msg = "Dealer busts! You win!";
      winMult = 2;
    } else if (dVal.total > pVal.total) {
      msg = "Dealer wins.";
      winMult = 0;
    } else if (dVal.total < pVal.total) {
      msg = "You win!";
      winMult = 2;
    } else {
      msg = "Push.";
      winMult = 1;
    }

    setStatus("roundOver");
    setMessage(msg);
    if (winMult > 0) {
      await serverCredit(activeBet * winMult);
    }
    setActiveBet(0);
  }



  return (
    <div className="relative w-full min-h-full flex flex-col items-center justify-center font-sans text-white overflow-hidden">

      {/* Game Area - Compact */}
      <div className="relative z-10 w-full max-w-4xl px-4 py-2 flex flex-col items-center gap-2 md:gap-6 h-full justify-center">

        {/* Dealer Area */}
        <div className="flex flex-col items-center gap-1 md:gap-2 min-h-[100px] md:min-h-[140px]">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-black/50 px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-white/10 backdrop-blur-md">
              <span className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider font-bold">Dealer</span>
              {status !== "idle" && showDealerHole && (
                <span className="ml-2 text-emerald-400 font-mono text-xs md:text-sm">{dealerInfo.total}</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center pl-6 md:pl-8">
            <AnimatePresence>
              {dealerHand.map((c, i) => (
                <FlippableCard
                  key={cardKey(c, i)}
                  card={c}
                  index={i}
                  owner="dealer"
                  isFaceUp={i === 0 || showDealerHole || status === "roundOver"}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Center Info / Message */}
        <div className="h-8 md:h-12 flex items-center justify-center z-20">
          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.9 }}
                className="bg-black/70 backdrop-blur-md px-4 py-1 md:px-6 md:py-2 rounded-xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                <span className="text-sm md:text-lg font-bold text-emerald-400 tracking-wide whitespace-nowrap">{message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Player Area */}
        <div className="flex flex-col items-center gap-1 md:gap-2 min-h-[100px] md:min-h-[140px]">
          <div className="flex items-center justify-center pl-6 md:pl-8">
            <AnimatePresence>
              {playerHand.map((c, i) => (
                <FlippableCard
                  key={cardKey(c, i)}
                  card={c}
                  index={i}
                  owner="player"
                  isFaceUp={true}
                />
              ))}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="bg-black/50 px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-white/10 backdrop-blur-md">
              <span className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider font-bold">You</span>
              {status !== "idle" && (
                <span className="ml-2 text-emerald-400 font-mono text-xs md:text-sm">{playerInfo.total}</span>
              )}
            </div>
          </div>
        </div>

        {/* Controls - Compact */}
        <div className="w-full max-w-3xl bg-black/60 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/5 shadow-2xl mt-1 md:mt-2 min-h-[88px] flex flex-col justify-center">
          {!roundInProgress ? (
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 md:gap-3">
                {[
                  { val: 5, color: "from-yellow-600 to-yellow-800 border-yellow-400" },
                  { val: 10, color: "from-red-600 to-red-800 border-red-400" },
                  { val: 25, color: "from-green-600 to-green-800 border-green-400" },
                  { val: 50, color: "from-blue-600 to-blue-800 border-blue-400" },
                  { val: 100, color: "from-gray-900 to-black border-gray-500" },
                ].map((chip) => (
                  <button
                    key={chip.val}
                    onClick={() => setBet(prev => prev + chip.val)}
                    className={`group relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-linear-to-b ${chip.color} border-2 border-dashed shadow-lg hover:-translate-y-1 transition-transform active:scale-95 flex items-center justify-center`}
                  >
                    <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 blur-md`} />
                    <span className="font-bold text-xs md:text-sm text-white drop-shadow-md">{chip.val}</span>
                  </button>
                ))}
                <button
                  onClick={() => setBet(0)}
                  className="ml-2 text-[10px] md:text-xs text-gray-400 hover:text-red-400 underline decoration-red-400/50 hover:decoration-red-400 transition-colors"
                >
                  Clear
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-lg md:text-xl font-mono text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
                  Bet: <span className="text-white">${bet}</span>
                </div>
                <button
                  onClick={deal}
                  disabled={bet === 0}
                  className="px-6 py-2 md:px-8 md:py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold text-sm md:text-base rounded-lg md:rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.4)] hover:shadow-[0_0_25px_rgba(5,150,105,0.6)] transition-all active:scale-95 uppercase tracking-widest"
                >
                  Deal
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 md:gap-6 w-full">
              <button
                onClick={hit}
                className="px-6 py-2 md:px-8 md:py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold text-sm md:text-base rounded-lg md:rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-wider border-b-2 md:border-b-4 border-gray-900 active:border-b-0 active:translate-y-1"
              >
                Hit
              </button>
              <button
                onClick={stand}
                className="px-6 py-2 md:px-8 md:py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-sm md:text-base rounded-lg md:rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all active:scale-95 uppercase tracking-wider border-b-2 md:border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
              >
                Stand
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
