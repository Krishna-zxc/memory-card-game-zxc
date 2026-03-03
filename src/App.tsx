import { useEffect, useMemo, useState } from "react";

const themes = {
  cosmic: {
    name: "Cosmic",
    background: "from-slate-950 via-indigo-950 to-slate-900",
    cardFront: "bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500",
    cardBack: "bg-gradient-to-br from-slate-800 to-slate-900",
    accent: "text-indigo-200",
    icons: ["🚀", "🪐", "🌌", "✨", "👩‍🚀", "🌟", "🛰️", "☄️"],
  },
  forest: {
    name: "Forest",
    background: "from-emerald-950 via-green-900 to-lime-900",
    cardFront: "bg-gradient-to-br from-emerald-400 via-green-400 to-lime-300",
    cardBack: "bg-gradient-to-br from-emerald-800 to-emerald-950",
    accent: "text-emerald-100",
    icons: ["🦉", "🍄", "🌿", "🪵", "🌲", "🍃", "🦌", "🐿️"],
  },
  ocean: {
    name: "Ocean",
    background: "from-sky-950 via-blue-900 to-cyan-900",
    cardFront: "bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400",
    cardBack: "bg-gradient-to-br from-blue-900 to-slate-900",
    accent: "text-cyan-100",
    icons: ["🐳", "🪸", "🐠", "🐙", "🌊", "🐬", "🦀", "🫧"],
  },
} as const;

type ThemeKey = keyof typeof themes;

type CardData = {
  id: number;
  value: string;
  isMatched: boolean;
};

const createDeck = (icons: readonly string[]) => {
  const pairs = icons.flatMap((icon, index) => [
    { id: index * 2, value: icon, isMatched: false },
    { id: index * 2 + 1, value: icon, isMatched: false },
  ]);
  return pairs
    .map((card) => ({ sort: Math.random(), card }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ card }) => card);
};

export function App() {
  const [themeKey, setThemeKey] = useState<ThemeKey>("cosmic");
  const theme = themes[themeKey];
  const [cards, setCards] = useState<CardData[]>(() => createDeck(theme.icons));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const matchedCount = useMemo(
    () => cards.filter((card) => card.isMatched).length,
    [cards]
  );
  const isGameComplete = matchedCount === cards.length && cards.length > 0;

  useEffect(() => {
    if (!isRunning || isGameComplete) return;
    const timer = window.setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning, isGameComplete]);

  useEffect(() => {
    setCards(createDeck(theme.icons));
    setFlipped([]);
    setMoves(0);
    setTime(0);
    setIsRunning(true);
  }, [themeKey]);

  const handleRestart = () => {
    setCards(createDeck(theme.icons));
    setFlipped([]);
    setMoves(0);
    setTime(0);
    setIsRunning(true);
  };

  const handleCardClick = (index: number) => {
    if (isChecking || cards[index].isMatched) return;
    if (flipped.includes(index)) return;
    if (flipped.length >= 2) return;

    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      setIsChecking(true);
      const [firstIndex, secondIndex] = nextFlipped;
      const isMatch = cards[firstIndex].value === cards[secondIndex].value;

      window.setTimeout(() => {
        if (isMatch) {
          setCards((prev) =>
            prev.map((card, cardIndex) =>
              cardIndex === firstIndex || cardIndex === secondIndex
                ? { ...card, isMatched: true }
                : card
            )
          );
        }
        setFlipped([]);
        setIsChecking(false);
      }, 700);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.background} text-white transition-colors duration-500`}
    >
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10">
        <header className="flex flex-col gap-6 rounded-3xl bg-white/10 p-6 backdrop-blur-md md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${theme.accent}`}>
              Memory Match Quest
            </p>
            <h1 className="text-3xl font-semibold">Flip, match, and master the deck</h1>
            <p className="text-white/70">
              Pair every card with its twin while keeping your moves and time low.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="rounded-2xl bg-black/30 px-4 py-3">
              <p className="text-xs uppercase text-white/60">Moves</p>
              <p className="text-2xl font-semibold">{moves}</p>
            </div>
            <div className="rounded-2xl bg-black/30 px-4 py-3">
              <p className="text-xs uppercase text-white/60">Time</p>
              <p className="text-2xl font-semibold">{formatTime(time)}</p>
            </div>
            <div className="rounded-2xl bg-black/30 px-4 py-3">
              <p className="text-xs uppercase text-white/60">Matches</p>
              <p className="text-2xl font-semibold">{matchedCount / 2} / {cards.length / 2}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-6 rounded-3xl bg-white/10 p-6 backdrop-blur-md">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Theme</h2>
              <div className="flex flex-col gap-3">
                {Object.entries(themes).map(([key, themeData]) => (
                  <button
                    key={key}
                    onClick={() => setThemeKey(key as ThemeKey)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 hover:bg-white/10 ${
                      themeKey === key
                        ? "border-white/70 bg-white/15"
                        : "border-white/10"
                    }`}
                  >
                    <span className="font-medium">{themeData.name}</span>
                    <span className="text-xl">{themeData.icons[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Controls</h2>
              <button
                onClick={handleRestart}
                className="w-full rounded-2xl bg-white/20 px-4 py-3 font-medium text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-white/30"
              >
                New Game
              </button>
              <button
                onClick={() => setIsRunning((prev) => !prev)}
                className="w-full rounded-2xl border border-white/30 px-4 py-3 font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                {isRunning ? "Pause Timer" : "Resume Timer"}
              </button>
            </div>

            {isGameComplete && (
              <div className="rounded-2xl border border-white/30 bg-white/10 p-4 text-center">
                <p className="text-sm uppercase text-white/60">Victory</p>
                <p className="text-xl font-semibold">You matched all pairs!</p>
                <p className="text-sm text-white/70">Moves: {moves} · Time: {formatTime(time)}</p>
              </div>
            )}
          </aside>

          <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-md">
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
              {cards.map((card, index) => {
                const isFlipped = flipped.includes(index) || card.isMatched;
                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(index)}
                    className={`card relative aspect-square w-full rounded-2xl shadow-lg shadow-black/30 transition hover:-translate-y-1 ${
                      isFlipped ? "flipped" : ""
                    } ${card.isMatched ? "opacity-80" : ""}`}
                    aria-label="Memory card"
                  >
                    <div className="card-inner">
                      <div
                        className={`card-face ${theme.cardBack} flex flex-col items-center justify-center gap-2 text-2xl font-semibold text-white/80`}
                      >
                        <span className="text-3xl">?</span>
                        <span className="text-xs uppercase tracking-[0.2em]">Flip</span>
                      </div>
                      <div
                        className={`card-face card-back ${theme.cardFront} text-4xl text-white shadow-inner`}
                      >
                        {card.value}
                      </div>
                    </div>
                    <span className="sr-only">{card.value}</span>
                    {isFlipped && (
                      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-white/40" />
                    )}
                    {card.isMatched && (
                      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-white/60" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
