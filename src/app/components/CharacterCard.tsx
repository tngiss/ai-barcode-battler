import React from "react";
import { motion } from "motion/react";
import {
  Star,
  Swords,
  Save,
  Heart,
  Shield,
  Target,
  HandHelping,
  Zap,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Character } from "../utils/types";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface CharacterCardProps {
  character: Character;
  onSave?: () => void;
  onBattle?: () => void;
  onBack?: () => void;
  showActions?: boolean;
}

const rarityLabel: Record<Character["rarity"], string> = {
  common: "COMMON",
  rare: "RARE",
  epic: "EPIC",
  legendary: "LEGENDARY",
};

const rarityStars: Record<Character["rarity"], number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

const rarityColors: Record<Character["rarity"], string> = {
  common: "text-slate-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-yellow-400",
};

function StatPill({
  icon: Icon,
  label,
  value,
  color = "text-slate-200",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <div className="text-[11px] text-slate-400 uppercase">{label}</div>
      </div>
      <div className="text-white text-lg font-black leading-none">{value}</div>
    </div>
  );
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onSave,
  onBattle,
  onBack,
  showActions = true,
}) => {
  const { t } = useLanguage();
  const mult = character.collaboration?.multiplier;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-md mx-auto">
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.9, rotateY: 180 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl">
            {/* Collaboration Badge */}
            {character.collaboration && (
              <motion.div
                className="absolute top-4 right-4 z-10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                <Badge className="bg-purple-500 text-white font-bold px-3 py-1">
                  Collaboration
                </Badge>
              </motion.div>
            )}

            {/* Image */}
            <div className="relative h-80 overflow-hidden">
              <motion.img
                src={character.imageUrl}
                alt={character.name}
                className="w-full h-full object-cover object-top"
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

              {/* Rarity Stars */}
              <motion.div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex gap-1">
                  {[...Array(rarityStars[character.rarity])].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.7 + i * 0.08, type: "spring" }}
                    >
                      <Star
                        className={`w-7 h-7 ${
                          rarityColors[character.rarity]
                        } fill-current`}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Info */}
            <div className="p-6 space-y-4">
              <div>
                <motion.h2
                  className="text-3xl font-black text-white mb-1"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {character.name}
                </motion.h2>
                <motion.p
                  className="text-slate-300 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {character.productName}
                </motion.p>

                <motion.div
                  className={`text-sm font-bold ${
                    rarityColors[character.rarity]
                  } mt-1`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  {rarityLabel[character.rarity]}
                </motion.div>

                {mult && mult > 1 && (
                  <div className="mt-2">
                    <Badge className="bg-yellow-500 text-black font-bold">
                      {mult}x Multiplier
                    </Badge>
                  </div>
                )}
              </div>

              <motion.p
                className="text-slate-300 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {character.description}
              </motion.p>

              {/* Collaboration details */}
              {character.collaboration && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <div className="text-purple-200 font-semibold mb-2">
                    Collaboration Details
                  </div>
                  <div className="text-sm text-slate-200 space-y-1">
                    {character.collaboration.products.map((p, idx) => (
                      <div key={idx} className="flex justify-between gap-3">
                        <span className="truncate">{p.productName}</span>
                        <span className="text-slate-400 text-xs">
                          {p.category}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 text-xs text-slate-300">
                      Synergy: {character.collaboration.synergyScore} • Grade:{" "}
                      {character.collaboration.grade}
                    </div>
                  </div>
                </div>
              )}

              {/* Stats with icons */}
              <motion.div
                className="grid grid-cols-2 gap-3"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <StatPill
                  icon={Heart}
                  label="HP"
                  value={character.stats.hp}
                  color="text-red-400"
                />
                <StatPill
                  icon={Swords}
                  label="ATK"
                  value={character.stats.attack}
                  color="text-orange-400"
                />
                <StatPill
                  icon={Shield}
                  label="DEF"
                  value={character.stats.defense}
                  color="text-blue-400"
                />
                <StatPill
                  icon={Target}
                  label="MISS%"
                  value={character.stats.missChance}
                  color="text-slate-200"
                />
                <StatPill
                  icon={Zap}
                  label="CRIT%"
                  value={character.stats.critChance}
                  color="text-yellow-300"
                />
                <StatPill
                  icon={HandHelping}
                  label="HEAL%"
                  value={character.stats.heal}
                  color="text-emerald-300"
                />
              </motion.div>

              {/* Actions */}
              {showActions && (
                <motion.div
                  className="flex gap-3 pt-2"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                >
                  {onSave && (
                    <Button
                      onClick={onSave}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    >
                      <Save className="size-4 mr-2" />
                      {t("saveToCollection")}
                    </Button>
                  )}
                  {onBattle && (
                    <Button
                      onClick={onBattle}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Swords className="size-4 mr-2" />
                      {t("startBattle")}
                    </Button>
                  )}
                </motion.div>
              )}

              {onBack && (
                <div>
                  <Button
                    onClick={onBack}
                    variant="outline"
                    className="w-full border-slate-700 hover:bg-slate-800 text-white"
                  >
                    Back
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
