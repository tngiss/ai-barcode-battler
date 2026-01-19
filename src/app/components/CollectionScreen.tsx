import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Star, Swords, Users } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Character } from "../utils/types";
import { Button } from "./ui/button";

interface CollectionScreenProps {
  characters: Character[];
  onNavigate: (screen: string) => void;
  onSelectCharacter?: (character: Character) => void;
  onBattle?: (player: Character, opponent: Character) => void;
  selectMode?: boolean;
  excludeCharacter?: Character;
}

const rarityColors: Record<Character["rarity"], string> = {
  common: "border-slate-500",
  rare: "border-blue-500",
  epic: "border-purple-500",
  legendary: "border-yellow-500",
};

const rarityGlow: Record<Character["rarity"], string> = {
  common: "shadow-slate-500/30",
  rare: "shadow-blue-500/30",
  epic: "shadow-purple-500/30",
  legendary: "shadow-yellow-500/30",
};

export function CollectionScreen({
  characters,
  onNavigate,
  onSelectCharacter,
  onBattle,
  selectMode = false,
  excludeCharacter,
}: CollectionScreenProps) {
  const { t } = useLanguage();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );

  const filteredCharacters = excludeCharacter
    ? characters.filter((c) => c.id !== excludeCharacter.id)
    : characters;

  const handleCharacterClick = (character: Character) => {
    if (selectMode && onSelectCharacter) onSelectCharacter(character);
    else setSelectedCharacter(character);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate("home")}
              className="mr-4"
            >
              <ArrowLeft className="size-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-black text-white">
                {selectMode ? t("selectOpponent") : t("collectionTitle")}
              </h1>
              <p className="text-slate-400 text-sm">
                {t("total")}: {filteredCharacters.length}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Empty */}
        {filteredCharacters.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Star className="w-20 h-20 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">{t("emptyCollection")}</p>
            <Button
              onClick={() => onNavigate("scanner")}
              className="mt-6 bg-cyan-500 hover:bg-cyan-600"
            >
              {t("scanButton")}
            </Button>
          </motion.div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {filteredCharacters.map((character, index) => (
            <motion.div
              key={character.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={() => handleCharacterClick(character)}
                className={`w-full bg-slate-800/50 rounded-xl overflow-hidden border-2 ${
                  rarityColors[character.rarity]
                } hover:shadow-lg ${
                  rarityGlow[character.rarity]
                } transition-all`}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={character.imageUrl}
                    alt={character.name}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                  {character.collaboration && (
                    <div className="absolute top-2 right-2 bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                      <Users className="size-3" /> COLLAB
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 flex gap-0.5">
                    {Array.from({
                      length:
                        character.rarity === "legendary"
                          ? 4
                          : character.rarity === "epic"
                          ? 3
                          : character.rarity === "rare"
                          ? 2
                          : 1,
                    }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          character.rarity === "legendary"
                            ? "text-yellow-400"
                            : character.rarity === "epic"
                            ? "text-purple-400"
                            : character.rarity === "rare"
                            ? "text-blue-400"
                            : "text-slate-400"
                        } fill-current`}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="text-white font-bold text-sm truncate">
                    {character.name}
                  </h3>
                  <p className="text-slate-400 text-xs truncate">
                    {character.productName}
                  </p>

                  <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                    <div className="text-center">
                      <div className="text-red-400 font-bold">
                        {character.stats.hp}
                      </div>
                      <div className="text-slate-500">HP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-orange-400 font-bold">
                        {character.stats.attack}
                      </div>
                      <div className="text-slate-500">ATK</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-bold">
                        {character.stats.defense}
                      </div>
                      <div className="text-slate-500">DEF</div>
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Detail modal */}
        {selectedCharacter && !selectMode && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedCharacter(null)}
          >
            <motion.div
              className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700"
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <img
                  src={selectedCharacter.imageUrl}
                  alt={selectedCharacter.name}
                  className="w-24 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-1">
                    {selectedCharacter.name}
                  </h2>
                  <p className="text-slate-400 text-sm mb-3">
                    {selectedCharacter.productName}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">HP</span>
                      <span className="text-red-400 font-bold">
                        {selectedCharacter.stats.hp}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ATK</span>
                      <span className="text-orange-400 font-bold">
                        {selectedCharacter.stats.attack}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">DEF</span>
                      <span className="text-blue-400 font-bold">
                        {selectedCharacter.stats.defense}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">MISS%</span>
                      <span className="text-slate-200 font-bold">
                        {selectedCharacter.stats.missChance}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">CRIT%</span>
                      <span className="text-slate-200 font-bold">
                        {selectedCharacter.stats.critChance}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">HEAL%</span>
                      <span className="text-slate-200 font-bold">
                        {selectedCharacter.stats.heal}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {onBattle && characters.length >= 2 && (
                <Button
                  onClick={() => {
                    const opponents = characters.filter(
                      (c) => c.id !== selectedCharacter.id
                    );
                    if (opponents.length > 0) {
                      const randomOpponent =
                        opponents[Math.floor(Math.random() * opponents.length)];
                      onBattle(selectedCharacter, randomOpponent);
                    }
                  }}
                  className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Swords className="w-4 h-4 mr-2" />
                  {t("startBattle")}
                </Button>
              )}

              <Button
                onClick={() => setSelectedCharacter(null)}
                variant="outline"
                className="w-full mt-2 border-slate-700 hover:bg-slate-800 text-white"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
