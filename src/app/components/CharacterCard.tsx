import React from "react";
import { motion } from "motion/react";
import {
  Flame,
  Droplet,
  Leaf,
  Zap,
  Star,
  Shield,
  Heart,
  Swords,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Character } from "../utils/mockData";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface CharacterCardProps {
  character: Character;
  onSave?: () => void;
  onBattle?: () => void;
  onBack?: () => void;
  showActions?: boolean;
}

const elementIcons = {
  fire: Flame,
  water: Droplet,
  earth: Leaf,
  electric: Zap,
  wind: Star,
};

const elementColors = {
  fire: "from-orange-500 to-red-500",
  water: "from-blue-500 to-cyan-500",
  earth: "from-green-500 to-emerald-500",
  electric: "from-yellow-500 to-amber-500",
  wind: "from-purple-500 to-pink-500",
};

const rarityColors = {
  common: "text-slate-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-yellow-400",
};

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onSave,
  onBattle,
  onBack,
  showActions = true,
}) => {
  const { t } = useLanguage();
  const ElementIcon = elementIcons[character.element];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-md mx-auto">
        {/* Character Card */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          {/* Card Container */}
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl">
            {/* Campaign Badge */}
            {character.isCampaign && (
              <motion.div
                className="absolute top-4 right-4 z-10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <Badge className="bg-yellow-500 text-black font-bold px-3 py-1">
                  ★ {t("campaignBoost")}
                </Badge>
              </motion.div>
            )}

            {/* Element Badge */}
            <motion.div
              className="absolute top-4 left-4 z-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <div
                className={`bg-gradient-to-br ${
                  elementColors[character.element]
                } p-3 rounded-xl shadow-lg`}
              >
                <ElementIcon className="size-6 text-white" />
              </div>
            </motion.div>

            {/* Character Image */}
            <div className="relative h-80 overflow-hidden">
              <motion.img
                src={character.imageUrl}
                alt={character.name}
                className="w-full h-full object-cover object-top"
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

              {/* Rarity Stars */}
              <motion.div
                className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex gap-1">
                  {[
                    ...Array(
                      character.rarity === "legendary"
                        ? 4
                        : character.rarity === "epic"
                        ? 3
                        : character.rarity === "rare"
                        ? 2
                        : 1
                    ),
                  ].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.9 + i * 0.1, type: "spring" }}
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rarityColors[character.rarity]
                        } fill-current`}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Character Info */}
            <div className="p-6 space-y-4">
              {/* Name and Rarity */}
              <div>
                <motion.h2
                  className="text-3xl font-black text-white mb-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {character.name}
                </motion.h2>
                <motion.p
                  className="text-slate-400 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {character.productName}
                </motion.p>
                <motion.div
                  className={`text-sm font-bold ${
                    rarityColors[character.rarity]
                  } uppercase mt-1`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {t(character.rarity)} • {t(character.element)}
                </motion.div>
              </div>

              {/* Description */}
              <motion.p
                className="text-slate-300 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {character.description}
              </motion.p>

              {/* Stats Grid */}
              <motion.div
                className="grid grid-cols-2 gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <StatBar
                  icon={Heart}
                  label={t("hp")}
                  value={character.stats.hp}
                  color="text-red-400"
                  bgColor="bg-red-500/20"
                />
                <StatBar
                  icon={Swords}
                  label={t("attack")}
                  value={character.stats.attack}
                  color="text-orange-400"
                  bgColor="bg-orange-500/20"
                />
                <StatBar
                  icon={Shield}
                  label={t("defense")}
                  value={character.stats.defense}
                  color="text-blue-400"
                  bgColor="bg-blue-500/20"
                />
                <StatBar
                  icon={Zap}
                  label={t("speed")}
                  value={character.stats.speed}
                  color="text-yellow-400"
                  bgColor="bg-yellow-500/20"
                />
              </motion.div>

              {/* Multiplier Info */}
              {character.multiplier > 1 && (
                <motion.div
                  className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-center gap-2 text-yellow-400 text-sm font-semibold">
                    <Star className="w-4 h-4" />
                    {character.multiplier}x {t("sponsorBonus")}
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              {showActions && (
                <motion.div
                  className="flex gap-3 pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  {onSave && (
                    <Button
                      onClick={onSave}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    >
                      {t("saveToCollection")}
                    </Button>
                  )}
                  {onBattle && (
                    <Button
                      onClick={onBattle}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {t("startBattle")}
                    </Button>
                  )}
                </motion.div>
              )}

              {onBack && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <Button
                    onClick={onBack}
                    variant="outline"
                    className="w-full border-slate-700 hover:bg-slate-800 text-white"
                  >
                    Back
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

interface StatBarProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

const StatBar: React.FC<StatBarProps> = ({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}) => {
  return (
    <div className={`${bgColor} rounded-lg p-3`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-slate-400 uppercase">{label}</span>
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="mt-2 h-1.5 bg-slate-900 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color.replace("text-", "bg-")}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((value / 150) * 100, 100)}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
    </div>
  );
};
