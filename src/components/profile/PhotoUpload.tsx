'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Camera,
  Upload,
  RefreshCw,
  X,
  Check,
  Sparkles,
  AlertCircle,
  FlipHorizontal,
  Image as ImageIcon,
} from 'lucide-react';

interface PhotoUploadProps {
  photo: string | null;
  onPhotoChange: (photoUrl: string) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ photo, onPhotoChange }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraFallbackInputRef = useRef<HTMLInputElement>(null);

  // Stop camera media stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Start live device camera for selfie
  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    setCameraError(null);
    setIsProcessing(true);
    stopCamera();

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported on this browser. Please upload from your photos.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraActive(true);
      setFacingMode(mode);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      // If WebRTC fails or permissions denied, prompt fallback native camera input
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. You can take a selfie or upload from your library below.'
          : 'Unable to open camera stream. Please use the upload or direct camera button.'
      );
      setIsCameraActive(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Flip between front/back camera
  const toggleCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera(nextMode);
  };

  // Capture frame from video to canvas and compress
  const capturePhoto = () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const size = Math.min(video.videoWidth || 640, video.videoHeight || 640);

      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Center-crop square from video feed
      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;

      // If front camera, mirror image for natural selfie feel
      if (facingMode === 'user') {
        ctx.translate(size, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

      // Compress to high quality WebP/JPEG data URL (~120KB)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      onPhotoChange(dataUrl);
      stopCamera();
    } catch (e) {
      console.error('Capture error:', e);
      setCameraError('Failed to capture photo. Please try uploading an image.');
    }
  };

  // Compress & handle file selected from library
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCameraError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setIsProcessing(true);
    setCameraError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 800;
        let { width, height } = img;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onPhotoChange(compressedDataUrl);
        } else {
          onPhotoChange(event.target?.result as string);
        }
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setIsProcessing(false);
      setCameraError('Failed to read photo file.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* Camera Permission or Capture Error Alert */}
      {cameraError && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraFallbackInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* VIEW 1: Live Video Camera Viewfinder */}
      {isCameraActive ? (
        <div className="relative w-full max-w-sm mx-auto aspect-square rounded-3xl overflow-hidden bg-black border-2 border-cosmic-purple shadow-2xl animate-in zoom-in-95">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />

          {/* Viewfinder Circle Guideline */}
          <div className="absolute inset-0 border-2 border-white/20 rounded-full m-8 pointer-events-none border-dashed animate-pulse" />

          {/* Top Controls: Flip & Close */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
            <button
              type="button"
              onClick={toggleCamera}
              className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 border border-white/15 transition-all"
              title="Flip Camera"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-rose-500/80 border border-white/15 transition-all"
              title="Close Camera"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Controls: Shutter Button */}
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 z-20">
            <button
              type="button"
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-cosmic-purple via-cosmic-pink to-amber-300 p-1 shadow-cosmic hover:scale-105 active:scale-95 transition-all"
              title="Snap Selfie"
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-surface-400">
                <Camera className="w-7 h-7 stroke-[2.5]" />
              </div>
            </button>
          </div>
        </div>
      ) : photo ? (
        /* VIEW 2: Photo Selected / Captured Preview */
        <div className="relative w-full max-w-sm mx-auto aspect-square rounded-3xl overflow-hidden border-2 border-cosmic-purple/60 shadow-cosmic p-1 bg-surface-100 group">
          <div className="w-full h-full rounded-[22px] overflow-hidden relative">
            <Image
              src={photo}
              alt="Your Profile Photo"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 380px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Success badge */}
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Ready</span>
            </div>

            {/* Bottom Actions Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => startCamera('user')}
                className="flex-1 py-2 px-3 rounded-xl bg-surface-200/90 hover:bg-surface-100 backdrop-blur-md border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-cosmic-pink" />
                <span>Retake Selfie</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 rounded-xl bg-surface-200/90 hover:bg-surface-100 backdrop-blur-md border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-cosmic-purple" />
                <span>Change File</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 3: Empty State - Upload or Live Selfie Actions */
        <div className="space-y-4">
          <div className="w-full max-w-sm mx-auto aspect-square rounded-3xl border-2 border-dashed border-cosmic-purple/40 bg-surface-100/60 p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-inner">
            <div className="w-16 h-16 rounded-full bg-cosmic-purple/15 text-cosmic-purple border border-cosmic-purple/30 flex items-center justify-center shadow-cosmic">
              <Camera className="w-8 h-8 text-amber-300 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Add Your Cosmic Portrait</h3>
              <p className="text-xs text-text-secondary max-w-xs">
                Take a live selfie or upload an authentic photo from your device library.
              </p>
            </div>

            <div className="flex flex-col w-full gap-2.5 pt-2">
              {/* Button 1: Live Selfie */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => startCamera('user')}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cosmic-purple to-cosmic-pink hover:opacity-90 text-white text-xs font-bold shadow-cosmic flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Camera className="w-4 h-4" />
                <span>Take Live Selfie</span>
              </button>

              {/* Button 2: Upload from Library */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-2xl bg-surface-200 hover:bg-surface-50 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-purple-300" />
                <span>Upload from Library</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
