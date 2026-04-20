import React, { useRef, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Start camera
  const startCamera = async () => {
    try {
      console.log('🎥 Opening camera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile for better receipt capture
          width: { ideal: 1920 }, // Higher resolution for better OCR
          height: { ideal: 1080 }
        }
      });
      
      console.log('✅ Camera stream obtained:', mediaStream);
      console.log('📹 Video tracks:', mediaStream.getVideoTracks());
      
      // Set stream first to trigger re-render with video element
      setStream(mediaStream);
      setHasPermission(true);
      
      // Wait for React to render the video element
      setTimeout(() => {
        if (videoRef.current) {
          console.log('📺 Video element found, attaching stream...');
          videoRef.current.srcObject = mediaStream;
          
          // Wait for metadata to load, then play
          videoRef.current.onloadedmetadata = () => {
            console.log('📹 Video metadata loaded');
            videoRef.current?.play().then(() => {
              console.log('🎥 Video playing!');
            }).catch(err => {
              console.error('❌ Video play failed:', err);
            });
          };
        } else {
          console.error('❌ Video element still not found after timeout!');
        }
      }, 100);
    } catch (error) {
      console.error('❌ Camera access denied:', error);
      setHasPermission(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `receipt_${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        onCapture(file);
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Ensure video plays when stream is set
  React.useEffect(() => {
    if (stream && videoRef.current) {
      console.log('🎥 Stream set, ensuring video plays...');
      const video = videoRef.current;
      
      // Wait a tick for DOM to update
      requestAnimationFrame(() => {
        video.play().then(() => {
          console.log('✅ Video started playing');
        }).catch(err => {
          console.error('❌ Video play error:', err);
        });
      });
    }
  }, [stream]);

  if (hasPermission === false) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-surface-container-low">
        <span className="material-symbols-outlined text-6xl text-error mb-4">videocam_off</span>
        <p className="text-on-surface font-medium mb-2">Camera Access Denied</p>
        <p className="text-on-surface-variant text-sm mb-4">
          Please enable camera permissions in your browser settings
        </p>
        <button
          onClick={startCamera}
          className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-surface-container-low">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">photo_camera</span>
        <p className="text-on-surface font-medium mb-2">Use Camera</p>
        <p className="text-on-surface-variant text-sm mb-4">
          Take a photo of your receipt
        </p>
        <button
          onClick={startCamera}
          className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined">camera_alt</span>
          Open Camera
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black flex flex-col z-10">
      {/* Live Camera Feed - Full Screen */}
      <div className="flex-1 relative overflow-hidden">
        {/* Camera indicator - Small and minimal */}
        <div className="absolute top-3 right-3 z-50 bg-red-500/90 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          LIVE
        </div>
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover absolute inset-0"
          style={{ backgroundColor: '#000' }}
          onCanPlay={() => console.log('🎥 Video can play!')}
          onPlaying={() => console.log('🎥 Video is playing!')}
          onError={(e) => console.error('❌ Video error:', e)}
        />

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Minimal scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-4 z-20 pointer-events-none">
          <div className="relative w-full max-w-md aspect-[3/4]">
            {/* Simple corner brackets */}
            <div className="absolute -top-0.5 -left-0.5 w-10 h-10 border-t-3 border-l-3 border-white rounded-tl-xl opacity-80"></div>
            <div className="absolute -top-0.5 -right-0.5 w-10 h-10 border-t-3 border-r-3 border-white rounded-tr-xl opacity-80"></div>
            <div className="absolute -bottom-0.5 -left-0.5 w-10 h-10 border-b-3 border-l-3 border-white rounded-bl-xl opacity-80"></div>
            <div className="absolute -bottom-0.5 -right-0.5 w-10 h-10 border-b-3 border-r-3 border-white rounded-br-xl opacity-80"></div>
            
            {/* Subtle border */}
            <div className="absolute inset-0 border border-white/20 rounded-xl"></div>
            
            {/* Scanning line */}
            <div className="absolute left-0 right-0 h-0.5 bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-[scan_2.5s_ease-in-out_infinite] z-30"></div>
          </div>
        </div>
      </div>

      {/* Minimal Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-12 pb-6 px-4 z-20">
        {/* Compact Buttons Row */}
        <div className="flex gap-3">
          {/* Capture Button - Compact */}
          <button
            onClick={capturePhoto}
            className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">camera_alt</span>
            Capture
          </button>

          {/* Cancel Button - Compact */}
          <button
            onClick={() => {
              stopCamera();
              onCapture(new File([], ''));
            }}
            className="flex-1 py-3 rounded-xl bg-white/20 text-white font-semibold text-sm hover:bg-white/30 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-xl">close</span>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
