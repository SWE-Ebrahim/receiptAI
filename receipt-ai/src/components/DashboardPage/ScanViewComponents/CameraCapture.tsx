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
          facingMode: 'user', // Use front camera on laptop/desktop
          width: { ideal: 1280 },
          height: { ideal: 720 }
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
      {/* Live Camera Feed */}
      <div className="flex-1 relative overflow-hidden">
        {/* Camera indicator */}
        <div className="absolute top-4 right-4 z-50 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          LIVE
        </div>
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover absolute inset-0"
          style={{ transform: 'scaleX(-1)', backgroundColor: '#000' }} // Mirror for front camera, black bg
          onCanPlay={() => console.log('🎥 Video can play!')}
          onPlaying={() => console.log('🎥 Video is playing!')}
          onError={(e) => console.error('❌ Video error:', e)}
        />

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Scanning overlay with guides */}
        <div className="absolute inset-0 flex items-center justify-center p-6 z-20 pointer-events-none">
          <div className="relative w-full max-w-sm aspect-[3/4]">
            {/* Corner brackets */}
            <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-xl shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
            <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-xl shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
            <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-xl shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-xl shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
            
            {/* Semi-transparent border */}
            <div className="absolute inset-0 border-2 border-white/30 rounded-xl"></div>
            
            {/* Scanning line animation */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(96,165,250,0.8)] animate-[scan_2.5s_ease-in-out_infinite] z-30"></div>
          </div>
        </div>

        {/* Receipt alignment hint */}
        <div className="absolute top-4 left-4 right-16 z-20 pointer-events-none">
          <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
            <p className="text-white text-sm text-center font-medium">
              📄 Align receipt within the frame
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 pb-6 px-6 z-20">
        {/* Capture Button - Large and Prominent */}
        <button
          onClick={capturePhoto}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-white font-bold text-lg shadow-[0_8px_32px_rgba(96,165,250,0.4)] hover:shadow-[0_12px_40px_rgba(96,165,250,0.5)] transition-all active:scale-[0.96] flex items-center justify-center gap-3 border border-white/20"
        >
          <span className="material-symbols-outlined text-2xl">camera</span>
          Take Photo
        </button>

        {/* Close Camera Button */}
        <button
          onClick={() => {
            stopCamera();
            // Notify parent to go back to source selection
            onCapture(new File([], '')); // Empty file signals cancel
          }}
          className="w-full mt-3 py-3 rounded-xl bg-white/10 text-white/80 font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">close</span>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
