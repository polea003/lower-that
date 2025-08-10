import { useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';

type Props = {
  onCapture: (dataUrl: string) => void;
};

export default function WebcamCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    async function init() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        setError('Webcam unavailable');
      }
    }
    void init();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const takeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCapture(dataUrl);
  };

  return (
    <div className="flex flex-col gap-2">
      {error && <div role="alert" className="text-red-600">{error}</div>}
      <video ref={videoRef} className="rounded border w-full max-w-md" muted />
      <canvas ref={canvasRef} className="hidden" />
      <Button variant="contained" color="primary" onClick={takeSnapshot}>Capture</Button>
    </div>
  );
}
