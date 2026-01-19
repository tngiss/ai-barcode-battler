import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Swords, ArrowLeft, Trophy, Heart, Zap } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Character } from "../utils/types";
import { Button } from "./ui/button";

interface BattleScreenProps {
  playerCharacter: Character;
  opponentCharacter: Character;
  onNavigate: (screen: string) => void;
}

type BattlePhase = "ready" | "playerTurn" | "opponentTurn" | "finished";
type ActionType = "attack" | "heal";

function effectiveMultiplier(c: Character) {
  return c.collaboration?.multiplier && c.collaboration.multiplier > 0
    ? c.collaboration.multiplier
    : 1;
}

function effectiveStats(c: Character) {
  const m = effectiveMultiplier(c);
  // multiply the big-impact stats; keep chances as-is
  return {
    hp: Math.round(c.stats.hp * m),
    attack: Math.round(c.stats.attack * m),
    defense: Math.round(c.stats.defense * m),
    missChance: c.stats.missChance,
    critChance: c.stats.critChance,
    heal: c.stats.heal,
  };
}

function roll(pct: number) {
  return Math.random() * 100 < pct;
}

function computeDamage(
  attacker: ReturnType<typeof effectiveStats>,
  defender: ReturnType<typeof effectiveStats>
) {
  // miss
  if (roll(attacker.missChance)) {
    return { damage: 0, missed: true, crit: false };
  }

  const crit = roll(attacker.critChance);
  const critMult = crit ? 1.75 : 1;

  // defense scaling: defender.defense is small (30~50), make it meaningful
  const mitigation = 100 / (100 + defender.defense * 10); // e.g. def 40 => 100/500 = 0.2
  const raw = attacker.attack * critMult;
  const dmg = Math.max(50, Math.round(raw * mitigation));

  return { damage: dmg, missed: false, crit };
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  playerCharacter,
  opponentCharacter,
  onNavigate,
}) => {
  const { t } = useLanguage();

  const p = effectiveStats(playerCharacter);
  const o = effectiveStats(opponentCharacter);

  const [battlePhase, setBattlePhase] = useState<BattlePhase>("ready");
  const [winner, setWinner] = useState<"player" | "opponent" | null>(null);

  const [playerHP, setPlayerHP] = useState(p.hp);
  const [opponentHP, setOpponentHP] = useState(o.hp);

  const [showPlayerEffect, setShowPlayerEffect] = useState(false);
  const [showOpponentEffect, setShowOpponentEffect] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [turnCount, setTurnCount] = useState(0);

  const playerHPRef = useRef(playerHP);
  const opponentHPRef = useRef(opponentHP);
  const battlePhaseRef = useRef(battlePhase);
  const winnerRef = useRef(winner);

  useEffect(() => void (playerHPRef.current = playerHP), [playerHP]);
  useEffect(() => void (opponentHPRef.current = opponentHP), [opponentHP]);
  useEffect(() => void (battlePhaseRef.current = battlePhase), [battlePhase]);
  useEffect(() => void (winnerRef.current = winner), [winner]);

  const addLog = (message: string) => {
    setBattleLog((prev) => [...prev, message].slice(-4));
  };

  const startBattle = () => {
    setBattlePhase("playerTurn");
    addLog("Battle Start!");
  };

  const endIfDead = (nextPlayerHP: number, nextOpponentHP: number) => {
    if (nextOpponentHP <= 0) {
      setTimeout(() => {
        setWinner("player");
        setBattlePhase("finished");
        addLog("Victory!");
      }, 600);
      return true;
    }
    if (nextPlayerHP <= 0) {
      setTimeout(() => {
        setWinner("opponent");
        setBattlePhase("finished");
        addLog("Defeat...");
      }, 600);
      return true;
    }
    return false;
  };

  const executePlayerAction = (action: ActionType) => {
    if (battlePhase !== "playerTurn" || winnerRef.current) return;

    setBattlePhase("opponentTurn");
    setTurnCount((x) => x + 1);

    if (action === "attack") {
      const { damage, missed, crit } = computeDamage(p, o);

      setShowOpponentEffect(true);
      setTimeout(() => setShowOpponentEffect(false), 220);

      setOpponentHP((prev) => {
        const next = Math.max(0, prev - damage);

        if (missed) addLog("You missed!");
        else if (crit) addLog(`CRIT! You dealt ${damage} damage!`);
        else addLog(`You dealt ${damage} damage!`);

        if (!endIfDead(playerHPRef.current, next)) {
          setTimeout(() => executeOpponentTurn(), 1000);
        }
        return next;
      });
    } else {
      setShowPlayerEffect(true);
      setTimeout(() => setShowPlayerEffect(false), 220);

      setPlayerHP((prev) => {
        const healAmount = Math.max(1, Math.round((p.hp * p.heal) / 100));
        const actualHeal = Math.min(healAmount, p.hp - prev);
        const next = Math.min(p.hp, prev + healAmount);
        addLog(`You healed ${actualHeal} HP!`);

        if (!endIfDead(next, opponentHPRef.current)) {
          setTimeout(() => executeOpponentTurn(), 1000);
        }
        return next;
      });
    }
  };

  const executeOpponentTurn = () => {
    if (winnerRef.current) return;

    setBattlePhase("opponentTurn");

    setTimeout(() => {
      if (winnerRef.current) return;

      const hpPct = (opponentHPRef.current / o.hp) * 100;
      const shouldHeal =
        hpPct < 40 ? Math.random() < 0.55 : Math.random() < 0.2;

      if (shouldHeal) {
        setShowOpponentEffect(true);
        setTimeout(() => setShowOpponentEffect(false), 220);

        setOpponentHP((prev) => {
          const healAmount = Math.max(1, Math.round((o.hp * o.heal) / 100));
          const actualHeal = Math.min(healAmount, o.hp - prev);
          const next = Math.min(o.hp, prev + healAmount);
          addLog(`Opponent healed ${actualHeal} HP!`);
          return next;
        });
      } else {
        const { damage, missed, crit } = computeDamage(o, p);

        setShowPlayerEffect(true);
        setTimeout(() => setShowPlayerEffect(false), 220);

        setPlayerHP((prev) => {
          const next = Math.max(0, prev - damage);

          if (missed) addLog("Opponent missed!");
          else if (crit) addLog(`Opponent CRIT! ${damage} damage!`);
          else addLog(`Opponent dealt ${damage} damage!`);

          endIfDead(next, opponentHPRef.current);
          return next;
        });
      }

      setTimeout(() => {
        if (
          !winnerRef.current &&
          playerHPRef.current > 0 &&
          opponentHPRef.current > 0
        ) {
          setBattlePhase("playerTurn");
        }
      }, 900);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Retro effects */}
      <div className="absolute inset-0 pointer-events-none z-50">
        <div className="h-full w-full bg-[repeating-linear-gradient(0deg,rgba(0,255,255,0.05),rgba(0,255,255,0.05)_1px,transparent_1px,transparent_2px)]" />
      </div>
      <div className="absolute inset-0 pointer-events-none z-50 bg-[radial-gradient(circle,transparent_60%,rgba(0,0,0,0.3)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 min-h-screen p-6 flex flex-col">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("collection")}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
          >
            <ArrowLeft className="size-6" />
          </Button>
          <h1
            className="text-xl font-black text-cyan-400 tracking-wider uppercase"
            style={{ textShadow: "0 0 10px rgba(0,255,255,0.8)" }}
          >
            {t("battleTitle")}
          </h1>
          <div className="w-10" />
        </motion.div>

        <div className="text-center mb-4">
          <div className="text-cyan-400 text-sm">Turn: {turnCount}</div>
        </div>

        <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full">
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <BattleCharacter
              character={opponentCharacter}
              hp={opponentHP}
              maxHP={o.hp}
              showEffect={showOpponentEffect}
              isActive={battlePhase === "opponentTurn"}
            />
          </motion.div>

          {/* Log + actions */}
          <div className="py-6">
            <div className="bg-slate-900/80 border-2 border-cyan-400/50 rounded-lg p-4 backdrop-blur-sm min-h-[140px]">
              <AnimatePresence mode="wait">
                {battlePhase === "ready" && (
                  <motion.div
                    key="ready"
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Button
                      onClick={startBattle}
                      className="px-12 py-6 text-2xl font-black bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg shadow-red-500/50"
                      style={{ textShadow: "0 0 10px rgba(255,0,0,0.8)" }}
                    >
                      <Swords className="w-8 h-8 mr-3" />
                      {t("fight")}
                    </Button>
                  </motion.div>
                )}

                {battlePhase === "playerTurn" && (
                  <motion.div
                    key="playerTurn"
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-cyan-400 text-center font-bold mb-3">
                      {t("yourTurn")}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => executePlayerAction("attack")}
                        className="h-16 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg"
                      >
                        <Swords className="w-5 h-5 mr-2" />
                        <div className="text-left">
                          <div className="text-sm font-bold">Attack</div>
                          <div className="text-xs opacity-80">
                            Miss {p.missChance}% • Crit {p.critChance}%
                          </div>
                        </div>
                      </Button>

                      <Button
                        onClick={() => executePlayerAction("heal")}
                        className="h-16 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
                      >
                        <Heart className="w-5 h-5 mr-2" />
                        <div className="text-left">
                          <div className="text-sm font-bold">Heal</div>
                          <div className="text-xs opacity-80">
                            +{p.heal}% max HP
                          </div>
                        </div>
                      </Button>
                    </div>
                  </motion.div>
                )}

                {battlePhase === "opponentTurn" && (
                  <motion.div
                    key="opponentTurn"
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-red-400 font-bold mb-4">
                      {t("opponentTurn")}
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Zap className="w-12 h-12 mx-auto text-yellow-400" />
                    </motion.div>
                  </motion.div>
                )}

                {battlePhase === "finished" && winner && (
                  <motion.div
                    key="finished"
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <motion.div
                      className={`text-4xl font-black mb-6 ${
                        winner === "player" ? "text-yellow-400" : "text-red-400"
                      }`}
                      style={{
                        textShadow: `0 0 20px ${
                          winner === "player"
                            ? "rgba(255,255,0,0.8)"
                            : "rgba(255,0,0,0.8)"
                        }`,
                      }}
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {winner === "player" ? (
                        <>
                          <Trophy className="w-16 h-16 mx-auto mb-2" />
                          {t("victory")}
                        </>
                      ) : (
                        t("defeat")
                      )}
                    </motion.div>

                    <Button
                      onClick={() => onNavigate("collection")}
                      variant="outline"
                      className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                    >
                      {t("battleAgain")}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 space-y-1">
                {battleLog.map((log, index) => (
                  <motion.div
                    key={index}
                    className="text-slate-300 text-sm"
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {log}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BattleCharacter
              character={playerCharacter}
              hp={playerHP}
              maxHP={p.hp}
              showEffect={showPlayerEffect}
              isActive={battlePhase === "playerTurn"}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const BattleCharacter: React.FC<{
  character: Character;
  hp: number;
  maxHP: number;
  showEffect: boolean;
  isActive: boolean;
}> = ({ character, hp, maxHP, showEffect, isActive }) => {
  const hpPercentage = (hp / maxHP) * 100;

  return (
    <div className="relative">
      <AnimatePresence>
        {showEffect && (
          <motion.div
            className="absolute inset-0 bg-red-500 rounded-lg z-10"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          />
        )}
      </AnimatePresence>

      {isActive && (
        <motion.div
          className="absolute -inset-1 bg-cyan-400/30 rounded-lg blur-md"
          animate={{ opacity: [0.25, 0.6, 0.25] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      <div className="relative bg-slate-900/80 border-2 border-cyan-400/50 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <motion.div
              className="w-20 h-20 rounded-lg overflow-hidden border-2 border-cyan-400"
              animate={showEffect ? { x: 4 } : {}}
              transition={{ duration: 0.08 }}
            >
              <img
                src={character.imageUrl}
                alt={character.name}
                className="w-full h-full object-cover object-top"
              />
            </motion.div>
            {character.collaboration && (
              <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] font-bold rounded-full px-2 py-1">
                C
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="text-cyan-400 font-bold mb-1 text-sm">
              {character.name}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>HP</span>
                <span className="font-bold">
                  {Math.round(hp)} / {maxHP}
                </span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-cyan-400/30">
                <motion.div
                  className={`h-full ${
                    hpPercentage > 50
                      ? "bg-green-500"
                      : hpPercentage > 25
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  initial={{ width: "100%" }}
                  animate={{ width: `${hpPercentage}%` }}
                  transition={{ duration: 0.25 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
