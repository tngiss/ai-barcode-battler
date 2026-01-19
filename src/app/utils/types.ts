export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface CharacterStats {
  hp: number;
  attack: number;
  defense: number;
  missChance: number; // %
  critChance: number; // %
  heal: number; // % of max HP healed when using heal action
}

export interface CollaborationInfo {
  products: Array<{
    productName: string;
    category: string;
  }>;
  synergyScore: number;
  grade: string;
  multiplier: number; // e.g. 1.5
}

export interface Character {
  id: string;
  name: string;
  nameJp?: string;
  productName: string;
  category: string;
  rarity: Rarity;
  stats: CharacterStats;
  description: string;
  imageUrl: string;
  imageKey?: string;
  collaboration?: CollaborationInfo;
}
