// Mock product database
export const mockProducts = {
  "4901777289628": {
    name: "Suntory Premium Highball",
    category: "Alcohol",
    price: 198,
    description: "Refreshing whisky highball with crisp carbonation",
    manufacturer: "Suntory",
    element: "earth" as Element,
    imageUrl: "/src/assets/suntory2.jpg",
    isCampaign: true,
  },
  "4902102119917": {
    name: "Pocky Chocolate",
    category: "Snacks",
    price: 158,
    description: "Classic chocolate-coated biscuit sticks",
    manufacturer: "Glico",
    element: "water" as Element,
    imageUrl: "/src/assets/pocky1.jpg",
    isCampaign: false,
  },
  "4901005510111": {
    name: "Shin Ramyun",
    category: "Food",
    price: 248,
    description: "Spicy Korean instant noodles",
    manufacturer: "Nongshim",
    element: "fire" as Element,
    imageUrl: "/src/assets/shin1.jpg",
    isCampaign: false,
  },
  "4901313185322": {
    name: "Boss Coffee",
    category: "Beverage",
    price: 128,
    description: "Rich and smooth canned coffee",
    manufacturer: "Suntory",
    element: "electric" as Element,
    imageUrl: "/src/assets/boss1.jpg",
    isCampaign: true,
  },
  "4902430625937": {
    name: "Kit Kat Matcha",
    category: "Snacks",
    price: 328,
    description: "Green tea flavored chocolate wafers",
    manufacturer: "Nestle",
    element: "wind" as Element,
    imageUrl: "/src/assets/kitkat1.jpg",
    isCampaign: false,
  },
};

export type Element = "fire" | "water" | "earth" | "electric" | "wind";
export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface Character {
  id: string;
  janCode: string;
  name: string;
  productName: string;
  element: Element;
  rarity: Rarity;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  description: string;
  imageUrl: string;
  isCampaign: boolean;
  multiplier: number;
}

// Deterministic character generation based on JAN code
export const generateCharacter = (janCode: string): Character => {
  const product = mockProducts[janCode as keyof typeof mockProducts];

  if (!product) {
    // Default fallback product
    const sum = janCode
      .split("")
      .reduce((acc, char) => acc + parseInt(char), 0);
    return generateFallbackCharacter(janCode, sum);
  }

  // Seed-based generation
  const seed = parseInt(janCode.slice(-6));

  // Determine element based on category
  const elementMap: Record<string, Element> = {
    Alcohol: "water",
    Snacks: "earth",
    Food: "fire",
    Beverage: "water",
    Electronics: "electric",
  };

  const element = elementMap[product.category] || "earth";

  // Determine rarity based on price
  let rarity: Rarity = "common";
  if (product.price > 300) rarity = "legendary";
  else if (product.price > 200) rarity = "epic";
  else if (product.price > 150) rarity = "rare";

  // Base stats depend on category
  const baseStatsMap: Record<
    string,
    { hp: number; attack: number; defense: number; speed: number }
  > = {
    Food: { hp: 120, attack: 85, defense: 70, speed: 75 },
    Alcohol: { hp: 80, attack: 95, defense: 60, speed: 90 },
    Snacks: { hp: 90, attack: 75, defense: 85, speed: 80 },
    Beverage: { hp: 100, attack: 70, defense: 75, speed: 85 },
    Electronics: { hp: 70, attack: 90, defense: 95, speed: 65 },
  };

  const baseStats = baseStatsMap[product.category] || {
    hp: 100,
    attack: 80,
    defense: 80,
    speed: 80,
  };

  // Add randomness based on seed
  const variance = (seed % 20) - 10;

  const stats = {
    hp: Math.max(50, baseStats.hp + variance),
    attack: Math.max(50, baseStats.attack + variance),
    defense: Math.max(50, baseStats.defense + variance),
    speed: Math.max(50, baseStats.speed + variance),
  };

  // Campaign multiplier (Suntory products get 1.5x boost)
  const multiplier = product.isCampaign ? 1.5 : 1.0;

  // Apply multiplier to stats
  const boostedStats = {
    hp: Math.round(stats.hp * multiplier),
    attack: Math.round(stats.attack * multiplier),
    defense: Math.round(stats.defense * multiplier),
    speed: Math.round(stats.speed * multiplier),
  };

  // Generate character name based on product
  const characterName = generateCharacterName(product.name, element);

  return {
    id: `char_${janCode}`,
    janCode,
    name: characterName,
    productName: product.name,
    element: product.element,
    rarity,
    stats: boostedStats,
    description: `Born from ${product.name}. ${product.description}`,
    imageUrl: product.imageUrl,
    isCampaign: product.isCampaign,
    multiplier,
  };
};

const generateFallbackCharacter = (
  janCode: string,
  seed: number
): Character => {
  const elements: Element[] = ["fire", "water", "earth", "electric", "wind"];
  const rarities: Rarity[] = ["common", "rare", "epic"];

  const element = elements[seed % elements.length];
  const rarity = rarities[seed % rarities.length];

  return {
    id: `char_${janCode}`,
    janCode,
    name: `Mystery ${
      element.charAt(0).toUpperCase() + element.slice(1)
    } Warrior`,
    productName: "Unknown Product",
    element,
    rarity,
    stats: {
      hp: 80 + (seed % 30),
      attack: 70 + (seed % 25),
      defense: 70 + (seed % 25),
      speed: 75 + (seed % 20),
    },
    description: "A mysterious warrior from an unknown product.",
    imageUrl: getCharacterImage(element, rarity),
    isCampaign: false,
    multiplier: 1.0,
  };
};

const generateCharacterName = (
  productName: string,
  element: Element
): string => {
  const prefixes: Record<Element, string[]> = {
    fire: ["Inferno", "Blazing", "Scorching", "Volcanic"],
    water: ["Aquatic", "Frost", "Tidal", "Sparkling"],
    earth: ["Stone", "Terra", "Crystal", "Boulder"],
    electric: ["Thunder", "Volt", "Lightning", "Plasma"],
    wind: ["Gale", "Tempest", "Storm", "Cyclone"],
  };

  const suffixes: Record<Element, string[]> = {
    fire: ["Demon", "Beast", "Dragon", "Fiend"],
    water: ["Demon", "Leviathan", "Kraken", "Serpent"],
    earth: ["Golem", "Titan", "Behemoth", "Giant"],
    electric: ["Demon", "Elemental", "Wyrm", "Spirit"],
    wind: ["Djinn", "Wraith", "Phantom", "Elemental"],
  };

  const prefix =
    prefixes[element][Math.floor(Math.random() * prefixes[element].length)];
  const suffix =
    suffixes[element][Math.floor(Math.random() * suffixes[element].length)];
  const baseName = productName.split(" ")[0];

  return `${prefix} ${baseName} ${suffix}`;
};

const getCharacterImage = (element: Element, rarity: Rarity): string => {
  // Mock character images - in production these would be AI-generated
  const elementImages: Record<Element, string> = {
    fire: "/shin.jpg",
    water: "/suntory.jpg",
    earth: "pocky.jpg",
    electric: "",
    wind: "https://images.unsplash.com/photo-1691684117224-ec6721b57601?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kJTIwc3Rvcm0lMjBjbG91ZHN8ZW58MXx8fHwxNzY3NzAzNjQ2fDA&ixlib=rb-4.1.0&q=80&w=1080",
  };

  return elementImages[element];
};

// Calculate battle outcome
export const simulateBattle = (
  player: Character,
  opponent: Character
): {
  winner: "player" | "opponent";
  playerDamage: number;
  opponentDamage: number;
  turns: number;
} => {
  let playerHP = player.stats.hp;
  let opponentHP = opponent.stats.hp;
  let turns = 0;
  const maxTurns = 20;

  while (playerHP > 0 && opponentHP > 0 && turns < maxTurns) {
    // Player attacks
    const playerDamage = Math.max(
      1,
      player.stats.attack - opponent.stats.defense * 0.5
    );
    opponentHP -= playerDamage;

    if (opponentHP <= 0) break;

    // Opponent attacks
    const opponentDamage = Math.max(
      1,
      opponent.stats.attack - player.stats.defense * 0.5
    );
    playerHP -= opponentDamage;

    turns++;
  }

  return {
    winner: playerHP > opponentHP ? "player" : "opponent",
    playerDamage: player.stats.hp - playerHP,
    opponentDamage: opponent.stats.hp - opponentHP,
    turns,
  };
};
