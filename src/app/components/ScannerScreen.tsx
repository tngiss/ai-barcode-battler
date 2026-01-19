"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ScanBarcode, Camera, ArrowLeft } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { mockProducts } from "../utils/mockData";

interface ScannerScreenProps {
  onNavigate: (screen: string) => void;
  onScan: (janCode: string) => void;
}

/**
 * Replace with your API Gateway endpoint (recommended) or Lambda Function URL.
 * Must have CORS enabled for your Vercel domain.
 */
const LAMBDA_ENDPOINT =
  "https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod/scan";

export const ScannerScreen: React.FC<ScannerScreenProps> = ({
  onNavigate,
  onScan,
}) => {
  const { t } = useLanguage();

  const [janCode, setJanCode] = useState("");
  const [scanning, setScanning] = useState(false);

  // Camera / upload
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera not supported in this browser.");
      return;
    }

    // Stop any previous stream
    stopCamera();

    try {
      let stream: MediaStream;

      // Try back camera first
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
      } catch {
        // Fallback if facingMode isn't supported / fails
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;

      // Wait until video has dimensions (prevents "blank video")
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve();
      });

      await video.play();
      setCameraActive(true);
    } catch (err: any) {
      setCameraActive(false);
      setCameraError(err?.name ? `${err.name}: ${err.message}` : String(err));
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const callLambdaWithImage = async (dataUrl: string, mimeType: string) => {
    setScanning(true);
    setCameraError(null);

    try {
      const res = await fetch(LAMBDA_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: [
            {
              base64: dataUrl, // includes: data:image/...;base64,...
              mimeType,
            },
          ],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error ${res.status}: ${text}`);
      }

      const json = await res.json();

      // If your Lambda returns { janCode: "..." }, automatically continue
      if (json?.janCode && typeof json.janCode === "string") {
        onScan(json.janCode);
      } else {
        // If your API returns something else, adjust here
        console.log("Lambda response:", json);
      }
    } catch (e: any) {
      setCameraError(e?.message ?? "Failed calling API.");
    } finally {
      setScanning(false);
    }
  };

  const captureAndSend = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const w = video.videoWidth;
    const h = video.videoHeight;

    if (!w || !h) {
      setCameraError("Camera not ready yet. Try again in a moment.");
      return;
    }

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    stopCamera();
    await callLambdaWithImage(dataUrl, "image/jpeg");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    await callLambdaWithImage(dataUrl, file.type || "image/jpeg");

    // allow selecting the same file again
    e.target.value = "";
  };

  // Existing manual JAN scan (demo)
  const handleScan = () => {
    if (janCode.length === 13) {
      setScanning(true);
      setTimeout(() => {
        onScan(janCode);
      }, 1500);
    }
  };

  const handleQuickScan = (code: string) => {
    setJanCode(code);
    setScanning(true);
    setTimeout(() => {
      onScan(code);
    }, 1500);
  };

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
            onClick={() => {
              stopCamera();
              onNavigate("home");
            }}
            className="mr-4"
          >
            <ArrowLeft className="size-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-white">
              {t("scannerTitle")}
            </h1>
            <p className="text-slate-400 text-sm">{t("scannerSubtitle")}</p>
          </div>
        </motion.div>

        {/* Scanner Area */}
        <motion.div
          className="relative bg-slate-800/50 rounded-2xl p-8 mb-6 backdrop-blur-sm border border-slate-700"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Camera Preview Area */}
          <div className="relative aspect-square bg-slate-900 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />
            ) : (
              <Camera className="w-24 h-24 text-slate-600" />
            )}

            {/* Hidden canvas for snapshot */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Hidden file input for upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Scanning animation */}
            {scanning && (
              <motion.div
                className="absolute inset-0 bg-cyan-500/20"
                initial={{ y: -100 }}
                animate={{ y: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}

            {/* Scanner Frame */}
            <div className="absolute inset-0 border-4 border-cyan-500/50 rounded-xl">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400" />
            </div>

            {scanning && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-cyan-400 text-lg font-bold">
                  SCANNING...
                </div>
              </motion.div>
            )}

            {/* Error message */}
            {cameraError && (
              <div className="absolute bottom-2 left-2 right-2 text-xs text-red-200 bg-red-950/40 border border-red-500/30 rounded px-2 py-2">
                {cameraError}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2 mb-6">
            {!cameraActive ? (
              <>
                <Button
                  onClick={startCamera}
                  disabled={scanning}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600"
                >
                  Open Camera
                </Button>
                <Button
                  variant="outline"
                  onClick={handleUploadClick}
                  disabled={scanning}
                  className="flex-1 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/80 text-white bg-primary"
                >
                  Upload Image
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={captureAndSend}
                  disabled={scanning}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600"
                >
                  Capture & Send
                </Button>
                <Button
                  variant="outline"
                  onClick={stopCamera}
                  disabled={scanning}
                  className="border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/80 text-white bg-primary"
                >
                  Close
                </Button>
              </>
            )}
          </div>

          {/* Manual Input */}
          <div className="space-y-4">
            <label className="text-sm text-slate-400">{t("manualEntry")}</label>
            <Input
              type="text"
              placeholder={t("scanPlaceholder")}
              value={janCode}
              onChange={(e) =>
                setJanCode(e.target.value.replace(/\D/g, "").slice(0, 13))
              }
              className="bg-slate-900 border-slate-700 text-white"
              maxLength={13}
            />
            <Button
              onClick={handleScan}
              disabled={janCode.length !== 13 || scanning}
              className="w-full bg-cyan-500 hover:bg-cyan-600"
            >
              <ScanBarcode className="w-5 h-5 mr-2" />
              {t("scanConfirm")}
            </Button>
          </div>
        </motion.div>

        {/* Quick Scan Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm text-slate-400 mb-3">
            Quick Scan (Demo Products)
          </h2>
          <div className="space-y-2">
            {Object.entries(mockProducts).map(([code, product], index) => (
              <motion.div
                key={code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Button
                  variant="outline"
                  onClick={() => handleQuickScan(code)}
                  disabled={scanning}
                  className="w-full h-auto flex justify-start text-left border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/80 text-white bg-primary"
                >
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {product.name}
                      </div>
                      <div className="text-xs text-slate-400">{code}</div>
                    </div>
                    {product.isCampaign && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded font-bold">
                        ★ BOOST
                      </span>
                    )}
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
