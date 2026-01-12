import React, { useCallback, useState } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { HomeScreen } from "./components/HomeScreen";
import { ScannerScreen } from "./components/ScannerScreen";
import { GeneratingScreen } from "./components/GeneratingScreen";
import { CharacterCard } from "./components/CharacterCard";
import { BattleScreen } from "./components/BattleScreen";
import { CollectionScreen } from "./components/CollectionScreen";
import { Character, generateCharacter } from "./utils/mockData";

type Screen =
  | "home"
  | "scanner"
  | "generating"
  | "character"
  | "battle"
  | "collection"
  | "selectOpponent";

// ---- fake basic auth (client-side) ----
const AUTH_KEY = "fake_basic_auth_ok";
const AUTH_USER = "admin";
const AUTH_PASS = "password123";

function ensureAuth(): boolean {
  if (localStorage.getItem(AUTH_KEY) === "true") return true;

  while (true) {
    const u = window.prompt("Username:");
    if (u == null) return false;

    const p = window.prompt("Password:"); // not masked
    if (p == null) return false;

    if (u === AUTH_USER && p === AUTH_PASS) {
      localStorage.setItem(AUTH_KEY, "true");
      return true;
    }

    window.alert("Wrong username/password");
  }
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_KEY) === "true";
    } catch {
      return false;
    }
  });

  const runAuth = useCallback(() => {
    const ok = ensureAuth();
    setAuthed(ok);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="w-[340px] rounded border border-slate-800 bg-slate-900 p-6">
          <div className="text-lg font-semibold mb-2">Protected</div>
          <div className="text-sm text-slate-300 mb-4">
            Click the button to enter credentials.
          </div>

          <button
            onClick={runAuth}
            className="w-full rounded bg-slate-700 hover:bg-slate-600 px-3 py-2"
          >
            Authenticate
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(
    null
  );
  const [collection, setCollection] = useState<Character[]>([]);
  const [battlePlayer, setBattlePlayer] = useState<Character | null>(null);
  const [battleOpponent, setBattleOpponent] = useState<Character | null>(null);

  const handleScan = (janCode: string) => {
    const character = generateCharacter(janCode);
    setCurrentCharacter(character);
    setCurrentScreen("generating");
  };

  const handleGeneratingComplete = () => {
    setCurrentScreen("character");
  };

  const handleSaveToCollection = () => {
    if (currentCharacter) {
      const exists = collection.some(
        (char) => char.janCode === currentCharacter.janCode
      );
      if (!exists) setCollection([...collection, currentCharacter]);
      setCurrentScreen("collection");
    }
  };

  const handleStartBattle = () => {
    if (!currentCharacter) return;

    setBattlePlayer(currentCharacter);

    if (collection.length > 0) {
      const randomOpponent =
        collection[Math.floor(Math.random() * collection.length)];
      setBattleOpponent(randomOpponent);
      setCurrentScreen("battle");
    } else {
      const opponentJAN = "4902102119917"; // Pocky
      const opponent = generateCharacter(opponentJAN);
      setBattleOpponent(opponent);
      setCurrentScreen("battle");
    }
  };

  const handleBattleFromCollection = (
    player: Character,
    opponent: Character
  ) => {
    setBattlePlayer(player);
    setBattleOpponent(opponent);
    setCurrentScreen("battle");
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-slate-950">
        {currentScreen === "home" && <HomeScreen onNavigate={handleNavigate} />}

        {currentScreen === "scanner" && (
          <ScannerScreen onNavigate={handleNavigate} onScan={handleScan} />
        )}

        {currentScreen === "generating" && (
          <GeneratingScreen onComplete={handleGeneratingComplete} />
        )}

        {currentScreen === "character" && currentCharacter && (
          <CharacterCard
            character={currentCharacter}
            onSave={handleSaveToCollection}
            onBattle={handleStartBattle}
            onBack={() => handleNavigate("scanner")}
            showActions={true}
          />
        )}

        {currentScreen === "collection" && (
          <CollectionScreen
            characters={collection}
            onNavigate={handleNavigate}
            onBattle={handleBattleFromCollection}
          />
        )}

        {currentScreen === "battle" && battlePlayer && battleOpponent && (
          <BattleScreen
            playerCharacter={battlePlayer}
            opponentCharacter={battleOpponent}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </LanguageProvider>
  );
}

export default function App() {
  return (
    <AuthGate>
      <MainApp />
    </AuthGate>
  );
}
