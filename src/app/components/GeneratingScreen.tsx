import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Zap, Star, Flame, Droplet, Leaf } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface GeneratingScreenProps {
  onComplete: () => void;
}

export const GeneratingScreen: React.FC<GeneratingScreenProps> = ({
  onComplete,
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);

  const steps = [
    { key: "analyzing", icon: Sparkles },
    { key: "creating", icon: Zap },
    { key: "finishing", icon: Star },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 1200);
    const timer2 = setTimeout(() => setStep(2), 2400);
    const timer3 = setTimeout(() => onComplete(), 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Orbiting particles */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * 360;
        return (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${
                i % 3 === 0 ? "#06b6d4" : i % 3 === 1 ? "#a855f7" : "#ec4899"
              }, ${
                i % 3 === 0 ? "#3b82f6" : i % 3 === 1 ? "#ec4899" : "#f59e0b"
              })`,
              left: "50%",
              top: "50%",
            }}
            animate={{
              x: [
                Math.cos((angle * Math.PI) / 180) * 80,
                Math.cos((angle * Math.PI) / 180) * 150,
                Math.cos((angle * Math.PI) / 180) * 80,
              ],
              y: [
                Math.sin((angle * Math.PI) / 180) * 80,
                Math.sin((angle * Math.PI) / 180) * 150,
                Math.sin((angle * Math.PI) / 180) * 80,
              ],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        );
      })}

      <div className="relative z-10 text-center">
        {/* Central rotating crystal */}
        <div className="relative w-32 h-32 mx-auto mb-12">
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 border-4 border-cyan-400/30 rounded-full"
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity },
            }}
          />

          {/* Middle ring */}
          <motion.div
            className="absolute inset-3 border-4 border-purple-400/30 rounded-full"
            animate={{
              rotate: -360,
              scale: [1.1, 1, 1.1],
            }}
            transition={{
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, delay: 0.5 },
            }}
          />

          {/* Center crystal */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <motion.div
              className="relative"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              {/* Diamond shape */}
              <div className="relative w-16 h-16">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-400 transform rotate-45"
                  style={{
                    boxShadow:
                      "0 0 40px rgba(6, 182, 212, 0.6), 0 0 60px rgba(168, 85, 247, 0.4)",
                  }}
                  animate={{
                    boxShadow: [
                      "0 0 40px rgba(6, 182, 212, 0.6), 0 0 60px rgba(168, 85, 247, 0.4)",
                      "0 0 60px rgba(168, 85, 247, 0.8), 0 0 80px rgba(236, 72, 153, 0.6)",
                      "0 0 40px rgba(6, 182, 212, 0.6), 0 0 60px rgba(168, 85, 247, 0.4)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </div>

              {/* Center icon */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  rotate: [0, -360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Energy pulses */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 border-2 border-cyan-400 rounded-full"
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{
                scale: 2,
                opacity: 0,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
              }}
            />
          ))}
        </div>

        {/* Title */}
        <motion.h1
          className="text-3xl font-black mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t("generatingTitle")}
          </span>
        </motion.h1>

        {/* Step indicator */}
        <motion.div
          className="text-cyan-400 text-sm mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t(steps[step].key)}
        </motion.div>

        {/* Elemental icons floating */}
        <div className="flex justify-center gap-4 mb-8">
          {[
            { Icon: Flame, color: "text-orange-400", delay: 0 },
            { Icon: Droplet, color: "text-blue-400", delay: 0.2 },
            { Icon: Leaf, color: "text-green-400", delay: 0.4 },
            { Icon: Zap, color: "text-yellow-400", delay: 0.6 },
            { Icon: Star, color: "text-purple-400", delay: 0.8 },
          ].map(({ Icon, color, delay }, index) => (
            <motion.div
              key={index}
              className={color}
              initial={{ y: 0, opacity: 0.5 }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay,
              }}
            >
              <Icon className="size-6" />
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-64 h-2 bg-slate-800/50 rounded-full overflow-hidden mx-auto backdrop-blur-sm">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.6, ease: "easeInOut" }}
            style={{
              boxShadow: "0 0 20px rgba(6, 182, 212, 0.8)",
            }}
          />
        </div>

        {/* Percentage counter */}
        <motion.div
          className="mt-4 text-2xl font-black text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {step === 0 ? "33%" : step === 1 ? "66%" : "99%"}
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
};
