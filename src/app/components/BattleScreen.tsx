import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Swords, ArrowLeft, Trophy, Heart, Zap } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Character } from "../utils/mockData";
import { Button } from "./ui/button";

interface BattleScreenProps {
  playerCharacter: Character;
  opponentCharacter: Character;
  onNavigate: (screen: string) => void;
}

type BattlePhase = "ready" | "playerTurn" | "opponentTurn" | "finished";
type ActionType = "battle" | "power";

export const BattleScreen: React.FC<BattleScreenProps> = ({
  playerCharacter,
  opponentCharacter,
  onNavigate,
}) => {
  const { t } = useLanguage();
  const [battlePhase, setBattlePhase] = useState<BattlePhase>("ready");
  const [winner, setWinner] = useState<"player" | "opponent" | null>(null);
  const [playerHP, setPlayerHP] = useState(playerCharacter.stats.hp);
  const [opponentHP, setOpponentHP] = useState(opponentCharacter.stats.hp);
  const [playerMaxHP] = useState(playerCharacter.stats.hp);
  const [opponentMaxHP] = useState(opponentCharacter.stats.hp);
  const [showPlayerEffect, setShowPlayerEffect] = useState(false);
  const [showOpponentEffect, setShowOpponentEffect] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [turnCount, setTurnCount] = useState(0);

  const startBattle = () => {
    setBattlePhase("playerTurn");
    addLog("Battle Start!");
  };

  const addLog = (message: string) => {
    setBattleLog((prev) => [...prev, message].slice(-3));
  };

  const executePlayerAction = (action: ActionType) => {
    if (battlePhase !== "playerTurn") return;

    if (action === "battle") {
      // Player attacks
      const damage = Math.max(
        5,
        playerCharacter.stats.attack - opponentCharacter.stats.defense * 0.3
      );
      const finalDamage = Math.round(damage);

      setShowOpponentEffect(true);
      setTimeout(() => setShowOpponentEffect(false), 300);

      setOpponentHP((prev) => {
        const newHP = Math.max(0, prev - finalDamage);
        addLog(`You dealt ${finalDamage} damage!`);

        if (newHP <= 0) {
          setTimeout(() => {
            setWinner("player");
            setBattlePhase("finished");
            addLog("Victory!");
          }, 800);
        } else {
          setTimeout(() => executeOpponentTurn(), 1500);
        }

        return newHP;
      });
    } else if (action === "power") {
      // Player heals
      const healAmount = Math.round(playerMaxHP * 0.3);
      const actualHeal = Math.min(healAmount, playerMaxHP - playerHP);

      setShowPlayerEffect(true);
      setTimeout(() => setShowPlayerEffect(false), 300);

      setPlayerHP((prev) => {
        const newHP = Math.min(playerMaxHP, prev + healAmount);
        addLog(`You healed ${actualHeal} HP!`);
        setTimeout(() => executeOpponentTurn(), 1500);
        return newHP;
      });
    }

    setBattlePhase("opponentTurn");
    setTurnCount((prev) => prev + 1);
  };

  const executeOpponentTurn = () => {
    setBattlePhase("opponentTurn");

    setTimeout(() => {
      // AI decides action (70% attack, 30% heal if HP < 50%)
      const hpPercent = (opponentHP / opponentMaxHP) * 100;
      const shouldHeal = hpPercent < 50 && Math.random() > 0.7;

      if (shouldHeal) {
        // Opponent heals
        const healAmount = Math.round(opponentMaxHP * 0.3);
        const actualHeal = Math.min(healAmount, opponentMaxHP - opponentHP);

        setShowOpponentEffect(true);
        setTimeout(() => setShowOpponentEffect(false), 300);

        setOpponentHP((prev) => {
          const newHP = Math.min(opponentMaxHP, prev + healAmount);
          addLog(`Opponent healed ${actualHeal} HP!`);
          return newHP;
        });
      } else {
        // Opponent attacks
        const damage = Math.max(
          5,
          opponentCharacter.stats.attack - playerCharacter.stats.defense * 0.3
        );
        const finalDamage = Math.round(damage);

        setShowPlayerEffect(true);
        setTimeout(() => setShowPlayerEffect(false), 300);

        setPlayerHP((prev) => {
          const newHP = Math.max(0, prev - finalDamage);
          addLog(`Opponent dealt ${finalDamage} damage!`);

          if (newHP <= 0) {
            setTimeout(() => {
              setWinner("opponent");
              setBattlePhase("finished");
              addLog("Defeat...");
            }, 800);
          }

          return newHP;
        });
      }

      setTimeout(() => {
        if (playerHP > 0 && opponentHP > 0) {
          setBattlePhase("playerTurn");
        }
      }, 1500);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Retro Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none z-50">
        <div className="h-full w-full bg-[repeating-linear-gradient(0deg,rgba(0,255,255,0.05),rgba(0,255,255,0.05)_1px,transparent_1px,transparent_2px)]" />
      </div>

      {/* CRT Screen Curve Effect */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-[radial-gradient(circle,transparent_60%,rgba(0,0,0,0.3)_100%)]" />

      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Glowing Grid Horizon */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-96"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(0,255,255,0.1) 50%, rgba(255,0,255,0.2) 100%)",
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />

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

        {/* Turn Counter */}
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-cyan-400 text-sm">Turn: {turnCount}</div>
        </motion.div>

        {/* Battle Arena */}
        <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full">
          {/* Opponent */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BattleCharacter
              character={opponentCharacter}
              hp={opponentHP}
              maxHP={opponentMaxHP}
              isPlayer={false}
              showEffect={showOpponentEffect}
              isActive={battlePhase === "opponentTurn"}
            />
          </motion.div>

          {/* Battle Log */}
          <div className="py-6">
            <div className="bg-slate-900/80 border-2 border-cyan-400/50 rounded-lg p-4 backdrop-blur-sm min-h-[120px]">
              <AnimatePresence mode="wait">
                {battlePhase === "ready" && (
                  <motion.div
                    key="ready"
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
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
                        onClick={() => executePlayerAction("battle")}
                        className="h-16 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg"
                      >
                        <Swords className="w-5 h-5 mr-2" />
                        <div className="text-left">
                          <div className="text-sm font-bold">
                            {t("battleAction")}
                          </div>
                          <div className="text-xs opacity-80">
                            {t("attackDesc")}
                          </div>
                        </div>
                      </Button>
                      <Button
                        onClick={() => executePlayerAction("power")}
                        className="h-16 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
                      >
                        <Heart className="w-5 h-5 mr-2" />
                        <div className="text-left">
                          <div className="text-sm font-bold">
                            {t("powerAction")}
                          </div>
                          <div className="text-xs opacity-80">
                            {t("healDesc")}
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
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.8, 1],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                      }}
                    >
                      <Zap className="w-12 h-12 mx-auto text-yellow-400" />
                    </motion.div>
                  </motion.div>
                )}

                {battlePhase === "finished" && winner && (
                  <motion.div
                    key="finished"
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.5 }}
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
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
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

              {/* Battle Log Messages */}
              <div className="mt-4 space-y-1">
                {battleLog.map((log, index) => (
                  <motion.div
                    key={index}
                    className="text-slate-300 text-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {log}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Player */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <BattleCharacter
              character={playerCharacter}
              hp={playerHP}
              maxHP={playerMaxHP}
              isPlayer={true}
              showEffect={showPlayerEffect}
              isActive={battlePhase === "playerTurn"}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

interface BattleCharacterProps {
  character: Character;
  hp: number;
  maxHP: number;
  isPlayer: boolean;
  showEffect: boolean;
  isActive: boolean;
}

const BattleCharacter: React.FC<BattleCharacterProps> = ({
  character,
  hp,
  maxHP,
  isPlayer,
  showEffect,
  isActive,
}) => {
  const hpPercentage = (hp / maxHP) * 100;

  return (
    <div className="relative">
      {/* Hit Effect */}
      <AnimatePresence>
        {showEffect && (
          <motion.div
            className="absolute inset-0 bg-red-500 rounded-lg z-10"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Active Glow */}
      {isActive && (
        <motion.div
          className="absolute -inset-1 bg-cyan-400/30 rounded-lg blur-md"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
      )}

      <div className="relative bg-slate-900/80 border-2 border-cyan-400/50 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {/* Character Image */}
          <div className="relative">
            <motion.div
              className="w-20 h-20 rounded-lg overflow-hidden border-2 border-cyan-400"
              animate={showEffect ? { x: isPlayer ? -5 : 5 } : {}}
              transition={{ duration: 0.1 }}
            >
              <img
                src={character.imageUrl}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            {character.isCampaign && (
              <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold rounded-full size-6 flex items-center justify-center">
                ★
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex-1">
            <div className="text-cyan-400 font-bold mb-1 text-sm">
              {character.name}
            </div>

            {/* HP Bar */}
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
                  transition={{ duration: 0.3 }}
                  style={{
                    boxShadow: `0 0 10px ${
                      hpPercentage > 50
                        ? "rgba(0,255,0,0.5)"
                        : hpPercentage > 25
                        ? "rgba(255,255,0,0.5)"
                        : "rgba(255,0,0,0.5)"
                    }`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
