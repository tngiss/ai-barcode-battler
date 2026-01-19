"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Camera, ImageUp, Trash2, Check } from "lucide-react";
import { Button } from "./ui/button";

export type CaptureImage = { base64: string; mimeType: string };

interface CameraScreenProps {
  requiredCount: number; // 1 for single, 2 for collaboration
  onBack: () => void;
  onSubmit: (images: CaptureImage[]) => Promise<void> | void;
  error?: string | null;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({
  requiredCount,
  onBack,
  onSubmit,
  error,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<CaptureImage[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    } finally {
      setCameraActive(false);
    }
  };

  // Wait until video has dimensions (works better on iOS than only onloadedmetadata)
  const waitForVideoReady = async (
    video: HTMLVideoElement,
    timeoutMs = 2000
  ) => {
    const start = Date.now();

    // Ensure inline playback on iOS
    video.setAttribute("playsinline", "true");

    while (Date.now() - start < timeoutMs) {
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (w > 0 && h > 0) return;
      await new Promise((r) => setTimeout(r, 50));
    }
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
      if (!video) {
        // This should not happen anymore because video is always rendered.
        throw new Error("Video element not mounted.");
      }

      video.srcObject = stream;

      // Mark active now so UI shows preview immediately
      setCameraActive(true);

      // Try to play (must be within user gesture; this is called from click)
      try {
        await video.play();
      } catch {
        // Sometimes play() rejects but video still works after metadata is ready
      }

      // Make sure dimensions are ready (avoids blank/0x0 captures)
      await waitForVideoReady(video, 2500);

      // Retry play after ready
      try {
        await video.play();
      } catch {
        // ignore
      }
    } catch (err: any) {
      stopCamera();
      setCameraError(err?.name ? `${err.name}: ${err.message}` : String(err));
    }
  };

  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addImage = (img: CaptureImage) => {
    setImages((prev) => {
      if (prev.length >= requiredCount) return prev;
      return [...prev, img];
    });
  };

  const capture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth;
    const h = video.videoHeight;

    if (!w || !h) {
      setCameraError("Camera not ready yet. Try again.");
      return;
    }

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);

    const base64 = canvas.toDataURL("image/jpeg", 0.9);
    addImage({ base64, mimeType: "image/jpeg" });

    if (images.length + 1 >= requiredCount) stopCamera();
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    addImage({ base64, mimeType: file.type || "image/jpeg" });

    // allow selecting the same file again
    e.target.value = "";
  };

  const removeImageAt = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (images.length < requiredCount) return;
    setSubmitting(true);
    setCameraError(null);
    try {
      stopCamera();
      await onSubmit(images);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center mb-6"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-4">
            <ArrowLeft className="size-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-white">Camera</h1>
            <p className="text-slate-400 text-sm">
              {requiredCount === 1
                ? "Capture or upload 1 product image."
                : "Capture or upload 2 product images (A and B)."}
            </p>
          </div>
        </motion.div>

        {/* Preview */}
        <motion.div
          className="relative aspect-square bg-slate-900 rounded-xl overflow-hidden mb-4 flex items-center justify-center border border-slate-800"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* IMPORTANT: always render video so ref exists */}
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover ${
              cameraActive ? "opacity-100" : "opacity-0"
            }`}
            playsInline
            muted
            autoPlay
          />

          {!cameraActive && <Camera className="w-20 h-20 text-slate-600" />}

          <canvas ref={canvasRef} className="hidden" />

          {/* IMPORTANT: remove capture attribute so iOS doesn't force camera */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {(cameraError || error) && (
            <div className="absolute bottom-2 left-2 right-2 text-xs text-red-200 bg-red-950/40 border border-red-500/30 rounded px-2 py-2">
              {cameraError || error}
            </div>
          )}
        </motion.div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {!cameraActive ? (
            <Button
              onClick={startCamera}
              disabled={submitting}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              Open Camera
            </Button>
          ) : (
            <Button
              onClick={capture}
              disabled={submitting || images.length >= requiredCount}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              Capture
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleUploadClick}
            disabled={submitting || images.length >= requiredCount}
            className="border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/80 text-white bg-primary"
          >
            <ImageUp className="size-4 mr-2" />
            Upload
          </Button>
        </div>

        {cameraActive && (
          <Button
            variant="outline"
            onClick={stopCamera}
            disabled={submitting}
            className="w-full mb-4 border-slate-700 hover:bg-slate-800 text-white"
          >
            Close Camera
          </Button>
        )}

        {/* Captured thumbnails */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-white font-semibold">
              Images ({images.length}/{requiredCount})
            </div>
            <Button
              onClick={handleSubmit}
              disabled={submitting || images.length < requiredCount}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <Check className="size-4 mr-2" />
              Submit
            </Button>
          </div>

          {images.length === 0 ? (
            <div className="text-slate-400 text-sm">
              No images yet. Use Camera or Upload.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-900"
                >
                  <img
                    src={img.base64}
                    alt={`capture-${idx}`}
                    className="w-full h-28 object-cover"
                  />
                  <div className="absolute top-1 left-1 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded">
                    {requiredCount === 2 ? (idx === 0 ? "A" : "B") : "IMG"}
                  </div>
                  <button
                    onClick={() => removeImageAt(idx)}
                    disabled={submitting}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white p-1 rounded"
                    aria-label="Remove image"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-slate-500">
          Notes: iOS requires HTTPS for camera. If embedded in an iframe, camera
          may be blocked unless permissions are allowed.
        </div>
      </div>
    </div>
  );
};
