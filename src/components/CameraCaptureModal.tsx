import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Check, X, Upload, AlertCircle } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

export type PhotoStage = 'intake' | 'microscope_diagnostic' | 'post_repair';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (data: { stage: PhotoStage; dataUrl: string; notes?: string }) => void;
  defaultStage?: PhotoStage;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  defaultStage = 'intake',
}) => {
  const { t } = useI18n();

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [stage, setStage] = useState<PhotoStage>(defaultStage);
  const [notes, setNotes] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream tracks
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  // Start camera stream
  const startStream = async (deviceId?: string) => {
    stopStream();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Webcam API is not supported in this environment.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              facingMode: 'environment',
            },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error);
      }
      setIsStreaming(true);

      // Enumerate available video devices
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoDevices);

      if (!deviceId && videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      setCameraError(
        err?.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access.'
          : err?.message || 'Could not connect to camera or microscope.'
      );
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setNotes('');
      setStage(defaultStage);
      startStream();
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen, defaultStage]);

  const handleDeviceChange = (newDeviceId: string) => {
    setSelectedDeviceId(newDeviceId);
    startStream(newDeviceId);
  };

  const handleCaptureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    // Save as JPEG data URL with high quality
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedImage(dataUrl);
    stopStream();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startStream(selectedDeviceId || undefined);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCapturedImage(reader.result);
        stopStream();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!capturedImage) return;

    onCapture({
      stage,
      dataUrl: capturedImage,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {t('camera_modal_title' as any) || 'Webcam & Microscope Photo Capture'}
              </h2>
              <p className="text-xs text-slate-400">
                Visual Inspection & Intake Defect Evidence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Controls: Stage & Camera Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('camera_stage' as any) || 'Inspection Stage'}
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as PhotoStage)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="intake">
                  {t('stage_intake' as any) || 'Intake Condition'}
                </option>
                <option value="microscope_diagnostic">
                  {t('stage_microscope' as any) || 'Microscope / Board Trace'}
                </option>
                <option value="post_repair">
                  {t('stage_post_repair' as any) || 'Post-Repair Quality Check'}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('camera_select_device' as any) || 'Camera Source'}
              </label>
              <select
                value={selectedDeviceId}
                onChange={(e) => handleDeviceChange(e.target.value)}
                disabled={devices.length <= 1}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
              >
                {devices.length === 0 ? (
                  <option value="">Default Camera</option>
                ) : (
                  devices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Camera ${i + 1}`}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Viewport Area: Live Stream or Captured Photo */}
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured Defect"
                className="w-full h-full object-contain"
              />
            ) : cameraError ? (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-400" />
                <p className="text-xs text-slate-300 max-w-sm">{cameraError}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>{t('camera_fallback_upload' as any) || 'Upload Image File'}</span>
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isStreaming && (
                  <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center text-xs text-slate-400">
                    Connecting to video stream...
                  </div>
                )}
              </>
            )}

            {/* Hidden canvas for snapshot rendering */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Hidden file input for manual upload fallback */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Defect Notes Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('camera_notes' as any) || 'Defect Annotation / Technician Notes'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Broken digitizer glass, burnt inductor L7030, clean solder joints..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t('camera_fallback_upload' as any) || 'Browse File'}</span>
          </button>

          <div className="flex items-center gap-2">
            {capturedImage ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t('camera_retake' as any) || 'Retake'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('camera_save' as any) || 'Attach Photo'}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleCaptureFrame}
                disabled={!isStreaming}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>{t('camera_capture_btn' as any) || 'Capture Photo'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
