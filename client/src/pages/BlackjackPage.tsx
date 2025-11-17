import { useState } from "react";
import { motion } from "framer-motion";
import type { User } from "./AuthPage";

export interface BlackjackPageProps {
  user: User;
  onBack?: () => void;
}

const API = "http://localhost:3000"; // NEW - same base URL as auth

// === Types ===
type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface Card {
  rank: Rank;
  suit: Suit;
}

type RoundStatus = "idle" | "playerTurn" | "dealerTurn" | "roundOver";

// === Deck helpers (unchanged game logic) ===
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

// === Card views (same as before, plus animation) ===
interface CardFaceProps {
  card: Card;
}

function CardFace({ card }: CardFaceProps) {
  const isRed = card.suit === "♥" || card.suit === "♦";
  return (
    <div className="w-full h-full bg-linear-to-br from-white to-gray-100 rounded-xl border border-gray-300 shadow-xl flex flex-col justify-between px-2 py-2 text-xs">
      <span className={isRed ? "text-red-600 font-bold" : "text-black font-bold"}>
        {card.rank}
      </span>
      <span
        className={`text-center text-xl ${
          isRed ? "text-red-600" : "text-black"
        }`}
      >
        {card.suit}
      </span>
      <span
        className={
          isRed
            ? "text-red-600 font-bold self-end"
            : "text-black font-bold self-end"
        }
      >
        {card.rank}
      </span>
    </div>
  );
}

interface CardViewProps {
  card: Card;
  index: number;
  owner: "player" | "dealer";
}

function CardView({ card, index, owner }: CardViewProps) {
  const delay = index * 0.12;
  const initialY = owner === "dealer" ? -40 : 40;

  return (
    <motion.div
      initial={{ opacity: 0, y: initialY, scale: 0.9, rotate: owner === "dealer" ? -3 : 3 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={{
        delay,
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      className="w-16 h-24"
    >
      <CardFace card={card} />
    </motion.div>
  );
}

function CardBack() {
  return (
    <div className="w-full h-full rounded-xl bg-linear-to-br from-gray-700 to-gray-900 border border-gray-500 flex items-center justify-center text-sm text-gray-200 font-semibold">
      ?
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
  const delay = index * 0.12;
  const initialY = owner === "dealer" ? -40 : 40;

  return (
    <motion.div
      initial={{ opacity: 0, y: initialY, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 20 }}
      className="relative w-16 h-24"
    >
      <div
        className="w-full h-full transform-3d transition-transform duration-500"
        style={{ transform: isFaceUp ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <div className="absolute inset-0 backface-hidden">
          <CardBack />
        </div>
        <div className="absolute inset-0 backface-hidden transform-[rotateY(180deg)]">
          <CardFace card={card} />
        </div>
      </div>
    </motion.div>
  );
}

// NEW - for typing server responses
type WalletResponse = { balanceCents: number; msg?: string };

export default function BlackjackPage({ user, onBack }: BlackjackPageProps) {
  // NEW - wallet state synced with backend
  const [wallet, setWallet] = useState<number>(user.walletBalance); // starts from /users/me

  // NEW - bet management
  const [bet, setBet] = useState<number>(0);          // chosen bet for next round
  const [activeBet, setActiveBet] = useState<number>(0); // bet currently on the table

  // game state (same idea as before)
  const [deck, setDeck] = useState<Card[]>(() => shuffle(createDeck()));
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [status, setStatus] = useState<RoundStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [showDealerHole, setShowDealerHole] = useState(false);

  const playerInfo = handValue(playerHand);
  const dealerInfo = handValue(dealerHand);

  const roundInProgress = status === "playerTurn" || status === "dealerTurn"; // NEW

  function resetDeckIfNeeded(currentDeck: Card[]): Card[] {
    if (currentDeck.length < 15) {
      return shuffle(createDeck());
    }
    return currentDeck;
  }

  // === NEW: helpers that talk to /wallet on the backend ===

  // subtract from wallet when placing bet
  async function serverBet(amount: number): Promise<boolean> {
    try {
      const res = await fetch(`${API}/wallet/bet`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents: amount }),
      });
      const data: WalletResponse = await res.json();
      if (!res.ok) {
        setMessage(data.msg || "Bet failed");
        return false;
      }
      setWallet(data.balanceCents); // update from server
      return true;
    } catch (err) {
      console.error("serverBet error", err);
      setMessage("Network error placing bet.");
      return false;
    }
  }

  // add winnings / refund when round ends
  async function serverCredit(amount: number): Promise<void> {
    try {
      const res = await fetch(`${API}/wallet/credit`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents: amount }),
      });
      const data: WalletResponse = await res.json();
      if (!res.ok) {
        setMessage(data.msg || "Payout failed");
        return;
      }
      setWallet(data.balanceCents); // update from server
    } catch (err) {
      console.error("serverCredit error", err);
      setMessage("Network error updating wallet.");
    }
  }

  // === NEW: bet amount control helpers ===

  function changeBet(delta: number) {
    if (roundInProgress) return; // cannot change bet in the middle of a round
    setBet(prev => {
      let next = prev + delta;
      if (next < 0) next = 0;
      if (next > wallet) next = wallet; // cannot bet more than wallet
      return next;
    });
  }

  function setBetFromInput(value: string) {
    if (roundInProgress) return;
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) {
      setBet(0);
      return;
    }
    let next = n;
    if (next < 0) next = 0;
    if (next > wallet) next = wallet;
    setBet(next);
  }

  // === CHANGED: dealNewRound now validates bet + calls serverBet ===
  async function dealNewRound() {
    if (roundInProgress) return;

    if (bet <= 0) {
      setMessage("Place a bet first.");
      return;
    }
    if (bet > wallet) {
      setMessage("Not enough balance for that bet.");
      return;
    }

    // talk to backend to subtract bet from wallet
    const ok = await serverBet(bet);
    if (!ok) return;

    const roundBet = bet;
    setActiveBet(roundBet); // remember bet for payouts

    let freshDeck = resetDeckIfNeeded(deck);
    freshDeck = [...freshDeck];

    const p1 = freshDeck.shift()!;
    const d1 = freshDeck.shift()!;
    const p2 = freshDeck.shift()!;
    const d2 = freshDeck.shift()!;

    const newPlayer = [p1, p2];
    const newDealer = [d1, d2];

    setDeck(freshDeck);
    setPlayerHand(newPlayer);
    setDealerHand(newDealer);
    setStatus("playerTurn");
    setShowDealerHole(false);
    setMessage("");

    const pInfo = handValue(newPlayer);
    const dInfo = handValue(newDealer);

    // immediate blackjack handling plus payouts
    if (pInfo.isBlackjack || dInfo.isBlackjack) {
      setShowDealerHole(true);
      setStatus("roundOver");
      if (pInfo.isBlackjack && dInfo.isBlackjack) {
        setMessage("Both have blackjack - Push.");
        await serverCredit(roundBet);        // push, give back bet
      } else if (pInfo.isBlackjack) {
        setMessage("Blackjack! You win.");
        await serverCredit(roundBet * 2);    // bet + win
      } else {
        setMessage("Dealer blackjack - You lose.");
        // bet already taken
      }
    }
  }

  // game logic after hit is same as before, only async for symmetry
  async function handleHit() {
    if (status !== "playerTurn") return;

    let currentDeck = deck;
    if (currentDeck.length === 0) {
      currentDeck = shuffle(createDeck());
    }

    const newDeck = [...currentDeck];
    const card = newDeck.shift()!;
    const newPlayerHand = [...playerHand, card];

    const info = handValue(newPlayerHand);

    setDeck(newDeck);
    setPlayerHand(newPlayerHand);

    if (info.isBust) {
      setStatus("roundOver");
      setShowDealerHole(true);
      setMessage("Bust! Dealer wins.");
      // bet is already lost on server side
    }
  }

  // CHANGED: handleStand now calls serverCredit for win/push payouts
  async function handleStand() {
    if (status !== "playerTurn") return;

    setStatus("dealerTurn");
    setShowDealerHole(true);

    let newDeck = [...deck];
    const newDealerHand = [...dealerHand];

    let dInfo = handValue(newDealerHand);
    while (dInfo.total < 17) {
      if (newDeck.length === 0) {
        newDeck = shuffle(createDeck());
      }
      const card = newDeck.shift()!;
      newDealerHand.push(card);
      dInfo = handValue(newDealerHand);
    }

    setDeck(newDeck);
    setDealerHand(newDealerHand);

    const pInfo = handValue(playerHand);

    if (dInfo.isBust) {
      setStatus("roundOver");
      setMessage("Dealer busts - You win!");
      await serverCredit(activeBet * 2);
      return;
    }

    if (pInfo.total > dInfo.total) {
      setStatus("roundOver");
      setMessage("You win!");
      await serverCredit(activeBet * 2);
    } else if (pInfo.total < dInfo.total) {
      setStatus("roundOver");
      setMessage("Dealer wins.");
      // bet already lost
    } else {
      setStatus("roundOver");
      setMessage("Push.");
      await serverCredit(activeBet);
    }
  }

  // === JSX ===
  return (
    <div className="min-h-screen bg-green-900 text-white flex flex-col items-center justify-center px-4">
      <div className="bg-green-800 p-6 rounded-2xl shadow-xl w-full max-w-2xl flex flex-col gap-4 border border-green-700">
        {/* Header with wallet */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">Blackjack</h1>
            <p className="text-xs text-gray-200 mt-1">
              Logged in as <span className="font-semibold">{user.displayName}</span>
            </p>
          </div>

          {/* NEW - wallet UI that uses local wallet state */}
          <div className="flex items-center bg-black/20 px-3 py-2 rounded-xl text-lg -mt-4 mr-0.5">
            <span className="mr-6">Wallet</span>
            <span className="font-bold text-green-300">{wallet} 🍞</span>
          </div>

          {onBack && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onBack}
                className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-xs"
              >
                Back
              </button>
            </div>
          )}
        </div>

        {/* Dealer section (same, uses dealerInfo) */}
        <div className="mt-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold mb-2">Dealer</h2>
            <span className="text-xs text-gray-200">
              {showDealerHole || dealerHand.length === 0
                ? `Total: ${dealerInfo.total}`
                : "Total: ?"}
            </span>
          </div>
          <div className="flex gap-2">
            {dealerHand.length === 0 && (
              <div className="text-sm text-gray-200 italic">
                Press "Deal" to start a round.
              </div>
            )}
            {dealerHand.map((c, idx) => {
              if (idx === 1 && status === "playerTurn") {
                return (
                  <FlippableCard
                    key={`dealer-flip-${idx}`}
                    card={c}
                    index={idx}
                    owner="dealer"
                    isFaceUp={showDealerHole}
                  />
                );
              }
              return (
                <CardView
                  card={c}
                  index={idx}
                  owner="dealer"
                  key={cardKey(c, idx)}
                />
              );
            })}
          </div>
        </div>

        <div className="border-t border-green-700 my-3" />

        {/* Player section (same as before) */}
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold mb-2">You</h2>
            <span className="text-xs text-gray-200">
              {playerHand.length > 0 ? `Total: ${playerInfo.total}` : "Total: 0"}
            </span>
          </div>
          <div className="flex gap-2">
            {playerHand.length === 0 && (
              <div className="text-sm text-gray-200 italic">
                Waiting for a new round...
              </div>
            )}
            {playerHand.map((c, idx) => (
              <CardView
                card={c}
                index={idx}
                owner="player"
                key={cardKey(c, idx)}
              />
            ))}
          </div>
          {playerInfo.isBust && (
            <p className="text-xs text-red-300 mt-1">You busted.</p>
          )}
        </div>

        {/* NEW - betting controls + action buttons */}
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-200 mb-1">Bet for next round</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => changeBet(5)}
                disabled={roundInProgress}
                className="px-3 py-1 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold disabled:opacity-40"
              >
                +5
              </button>
              <button
                type="button"
                onClick={() => changeBet(10)}
                disabled={roundInProgress}
                className="px-3 py-1 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold disabled:opacity-40"
              >
                +10
              </button>
              <button
                type="button"
                onClick={() => changeBet(25)}
                disabled={roundInProgress}
                className="px-3 py-1 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold disabled:opacity-40"
              >
                +25
              </button>
              <button
                type="button"
                onClick={() => changeBet(-5)}
                disabled={roundInProgress}
                className="px-3 py-1 rounded-full bg-gray-600 hover:bg-gray-500 text-xs font-semibold disabled:opacity-40"
              >
                -5
              </button>

              <input
                type="number"
                min={0}
                max={wallet}
                value={bet}
                onChange={(e) => setBetFromInput(e.target.value)}
                disabled={roundInProgress}
                className="w-20 p-1 rounded bg-black/40 border border-green-700 text-xs"
              />

              <span className="text-xs text-gray-200 ml-2">
                Active bet: <span className="font-semibold">{activeBet}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { void dealNewRound(); }} // call async without awaiting
                className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-semibold"
              >
                {status === "idle" ? "Deal" : "Deal again"}
              </button>
              <button
                type="button"
                onClick={() => { void handleHit(); }}
                disabled={status !== "playerTurn"}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  status === "playerTurn"
                    ? "bg-blue-500 hover:bg-blue-400 text-white"
                    : "bg-blue-900/40 text-gray-400 cursor-not-allowed"
                }`}
              >
                Hit
              </button>
              <button
                type="button"
                onClick={() => { void handleStand(); }}
                disabled={status !== "playerTurn"}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  status === "playerTurn"
                    ? "bg-purple-500 hover:bg-purple-400 text-white"
                    : "bg-purple-900/40 text-gray-400 cursor-not-allowed"
                }`}
              >
                Stand
              </button>
            </div>

            <div className="text-xs text-right text-gray-200 min-h-6">
              {message && <span>{message}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
