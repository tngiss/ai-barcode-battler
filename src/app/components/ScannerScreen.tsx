"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ScanBarcode, Users, User } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "./ui/button";

interface ScannerScreenProps {
  onNavigate: (screen: string) => void;
  onChooseMode: (mode: "single" | "collaboration") => void;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({
  onNavigate,
  onChooseMode,
}) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"single" | "collaboration">("single");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
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
              {t("scannerTitle")}
            </h1>
            <p className="text-slate-400 text-sm">
              Choose scan type before taking photos.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <ScanBarcode className="size-6 text-cyan-400" />
            <div className="text-white font-bold">Scan Type</div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setMode("single")}
              className={`w-full text-left rounded-xl border p-4 transition ${
                mode === "single"
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-slate-700 bg-slate-900/40 hover:bg-slate-900/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-2">
                  <User className="size-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">Single Product</div>
                  <div className="text-slate-400 text-xs">
                    Requires 1 image (camera or upload).
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode("collaboration")}
              className={`w-full text-left rounded-xl border p-4 transition ${
                mode === "collaboration"
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-slate-700 bg-slate-900/40 hover:bg-slate-900/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-2">
                  <Users className="size-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">Collaboration</div>
                  <div className="text-slate-400 text-xs">
                    Requires 2 images (product A + product B).
                  </div>
                </div>
              </div>
            </button>
          </div>

          <Button
            onClick={() => onChooseMode(mode)}
            className="w-full mt-5 bg-cyan-500 hover:bg-cyan-600"
          >
            Continue to Camera
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
