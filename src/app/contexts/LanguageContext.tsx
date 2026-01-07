import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "jp" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Home Screen
    appTitle: "AI Barcode Battler",
    appSubtitle: "Scan. Generate. Battle.",
    scanButton: "Scan Barcode",
    collectionButton: "My Collection",
    battleButton: "Battle Arena",

    // Scanner Screen
    scannerTitle: "Scan Barcode",
    scannerSubtitle: "Point camera at product barcode",
    uploadButton: "Upload Barcode Image",
    manualEntry: "Enter JAN Code Manually",
    scanPlaceholder: "Enter 13-digit JAN code",
    scanConfirm: "Scan",

    // Generating Screen
    generatingTitle: "Generating Character...",
    analyzing: "Analyzing product data",
    creating: "Creating character",
    finishing: "Finalizing stats",

    // Character Screen
    characterStats: "Character Stats",
    element: "Element",
    rarity: "Rarity",
    attack: "ATK",
    defense: "DEF",
    hp: "HP",
    speed: "SPD",
    saveToCollection: "Save to Collection",
    startBattle: "Start Battle",

    // Battle Screen
    battleTitle: "Battle Arena",
    selectOpponent: "Select Opponent",
    fight: "FIGHT!",
    victory: "VICTORY!",
    defeat: "DEFEAT",
    battleAgain: "Battle Again",
    battleAction: "Battle",
    powerAction: "Power",
    attackDesc: "Attack",
    healDesc: "Heal 30%",
    yourTurn: "Your Turn!",
    opponentTurn: "Opponent's Turn...",

    // Collection Screen
    collectionTitle: "My Collection",
    emptyCollection: "No characters yet. Scan products to collect!",
    total: "Total",

    // Settings
    settings: "Settings",
    language: "Language",

    // Elements
    fire: "Fire",
    water: "Water",
    earth: "Earth",
    electric: "Electric",
    wind: "Wind",

    // Rarity
    common: "Common",
    rare: "Rare",
    epic: "Epic",
    legendary: "Legendary",

    // Campaign
    campaignBoost: "CAMPAIGN BOOST",
    trendBonus: "Trend Bonus",
    sponsorBonus: "Sponsor Bonus",
  },
  jp: {
    // Home Screen
    appTitle: "AIバーコードバトラー",
    appSubtitle: "スキャン。生成。バトル。",
    scanButton: "バーコードをスキャン",
    collectionButton: "コレクション",
    battleButton: "バトルアリーナ",

    // Scanner Screen
    scannerTitle: "バーコードスキャン",
    scannerSubtitle: "商品のバーコードにカメラを向ける",
    uploadButton: "バーコード画像アップロード",
    manualEntry: "JANコード手動入力",
    scanPlaceholder: "13桁のJANコードを入力",
    scanConfirm: "スキャン",

    // Generating Screen
    generatingTitle: "キャラクター生成中...",
    analyzing: "商品データ分析中",
    creating: "キャラクター作成中",
    finishing: "ステータス最終化中",

    // Character Screen
    characterStats: "キャラクターステータス",
    element: "属性",
    rarity: "レアリティ",
    attack: "攻撃",
    defense: "防御",
    hp: "HP",
    speed: "速度",
    saveToCollection: "コレクションに保存",
    startBattle: "バトル開始",

    // Battle Screen
    battleTitle: "バトルアリーナ",
    selectOpponent: "対戦相手を選択",
    fight: "ファイト！",
    victory: "勝利！",
    defeat: "敗北",
    battleAgain: "再バトル",
    battleAction: "バトル",
    powerAction: "パワーアップ",
    attackDesc: "攻撃",
    healDesc: "HP30%回復",
    yourTurn: "あなたの番！",
    opponentTurn: "相手の番...",

    // Collection Screen
    collectionTitle: "マイコレクション",
    emptyCollection: "まだキャラクターがいません。商品をスキャンして集めよう！",
    total: "合計",

    // Settings
    settings: "設定",
    language: "言語",

    // Elements
    fire: "炎",
    water: "水",
    earth: "土",
    electric: "電気",
    wind: "風",

    // Rarity
    common: "コモン",
    rare: "レア",
    epic: "エピック",
    legendary: "レジェンダリー",

    // Campaign
    campaignBoost: "キャンペーンブースト",
    trendBonus: "トレンドボーナス",
    sponsorBonus: "スポンサーボーナス",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("jp");

  const t = (key: string): string => {
    return (
      translations[language][key as keyof (typeof translations)["jp"]] || key
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
