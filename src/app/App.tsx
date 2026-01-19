import React, { useCallback, useState } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { HomeScreen } from "./components/HomeScreen";
import { ScannerScreen } from "./components/ScannerScreen";
import { CameraScreen, CaptureImage } from "./components/CameraScreen";
import { GeneratingScreen } from "./components/GeneratingScreen";
import { CharacterCard } from "./components/CharacterCard";
import { BattleScreen } from "./components/BattleScreen";
import { CollectionScreen } from "./components/CollectionScreen";
import { Character } from "./utils/types";

type Screen =
  | "home"
  | "scanner"
  | "camera"
  | "generating"
  | "character"
  | "battle"
  | "collection"
  | "selectOpponent";

/**
 * Replace with your API Gateway endpoint (recommended) or Lambda Function URL.
 * Must have CORS enabled for your Vercel domain.
 */
const LAMBDA_ENDPOINT =
  "https://xrodny7sqwzksywxd6ftmjld640pckib.lambda-url.ap-northeast-1.on.aws/";

// ---- fake basic auth (client-side) ----
const AUTH_KEY = "fake_basic_auth_ok";
const AUTH_USER = "admin";
const AUTH_PASS = "password123";

function ensureAuth(): boolean {
  if (localStorage.getItem(AUTH_KEY) === "true") return true;

  while (true) {
    const u = window.prompt("Username:");
    if (u == null) return false;

    const p = window.prompt("Password:");
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

          <button
            onClick={logout}
            className="w-full mt-2 rounded bg-slate-800 hover:bg-slate-700 px-3 py-2 text-sm"
          >
            Reset Auth
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

async function callLambda(images: CaptureImage[]): Promise<Character> {
  const res = await fetch(LAMBDA_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as Character;

  if (!json?.id || !json?.name || !json?.stats?.hp) {
    throw new Error(
      "Invalid API response (missing required character fields)."
    );
  }

  return json;
}

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");

  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(
    null
  );

  const [collection, setCollection] = useState<Character[]>([]);

  const [battlePlayer, setBattlePlayer] = useState<Character | null>(null);
  const [battleOpponent, setBattleOpponent] = useState<Character | null>(null);

  const [scanMode, setScanMode] = useState<"single" | "collaboration">(
    "single"
  );
  const requiredCount = scanMode === "collaboration" ? 2 : 1;
  const [scanError, setScanError] = useState<string | null>(null);

  const [pendingBattlePlayer, setPendingBattlePlayer] =
    useState<Character | null>(null);

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  const handleChooseMode = (mode: "single" | "collaboration") => {
    setScanMode(mode);
    setScanError(null);
    setCurrentScreen("camera");
  };

  const handleSubmitImages = async (images: CaptureImage[]) => {
    setScanError(null);
    setCurrentScreen("generating");

    try {
      const character = await callLambda(images);
      setCurrentCharacter(character);
      setCurrentScreen("character");
    } catch (e: any) {
      setScanError(e?.message ?? "Failed calling API.");
      setCurrentScreen("camera");
    }
  };

  const handleSaveToCollection = () => {
    if (!currentCharacter) return;

    setCollection((prev) => {
      const exists = prev.some((c) => c.id === currentCharacter.id);
      if (exists) return prev;
      return [...prev, currentCharacter];
    });

    setCurrentScreen("collection");
  };

  const handleStartBattle = () => {
    if (!currentCharacter) return;

    // Require selecting opponent (no static demo opponent)
    setPendingBattlePlayer(currentCharacter);
    setCurrentScreen("selectOpponent");
  };

  const handleSelectOpponent = (opponent: Character) => {
    if (!pendingBattlePlayer) return;
    setBattlePlayer(pendingBattlePlayer);
    setBattleOpponent(opponent);
    setPendingBattlePlayer(null);
    setCurrentScreen("battle");
  };

  const handleBattleFromCollection = (
    player: Character,
    opponent: Character
  ) => {
    setBattlePlayer(player);
    setBattleOpponent(opponent);
    setCurrentScreen("battle");
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-slate-950">
        {currentScreen === "home" && <HomeScreen onNavigate={handleNavigate} />}

        {currentScreen === "scanner" && (
          <ScannerScreen
            onNavigate={handleNavigate}
            onChooseMode={handleChooseMode}
          />
        )}

        {currentScreen === "camera" && (
          <CameraScreen
            requiredCount={requiredCount}
            onBack={() => setCurrentScreen("scanner")}
            onSubmit={handleSubmitImages}
            error={scanError}
          />
        )}

        {currentScreen === "generating" && <GeneratingScreen />}

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

        {currentScreen === "selectOpponent" && pendingBattlePlayer && (
          <CollectionScreen
            characters={collection}
            onNavigate={handleNavigate}
            selectMode={true}
            excludeCharacter={pendingBattlePlayer}
            onSelectCharacter={handleSelectOpponent}
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
