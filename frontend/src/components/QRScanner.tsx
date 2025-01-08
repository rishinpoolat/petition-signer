import React, { useEffect, useRef, useCallback } from 'react';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { Result } from '@zxing/library';

interface QRScannerProps {
  onScan: (bioId: string) => void;
  onError?: (error: string) => void;
  onClose: () => void;
}

interface VideoInputDevice {
  deviceId: string;
  label: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const cleanupCamera = useCallback(() => {
    // First, stop any existing stream
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => {
        track.enabled = false;
        track.stop();
      });
      streamRef.current = null;
    }

    // Then, stop any tracks from the video element
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => {
        track.enabled = false;
        track.stop();
      });
      videoRef.current.srcObject = null;
    }

    // Finally, stop the QR scanner
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
        controlsRef.current = null;
      } catch (err) {
        console.error('Error stopping QR scanner:', err);
      }
    }

    // Clear the reader
    if (readerRef.current) {
      readerRef.current = null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeScanner = async () => {
      try {
        // Clean up any existing setup
        cleanupCamera();

        // Create new QR reader
        const reader = new BrowserQRCodeReader();
        readerRef.current = reader;

        // Get available devices
        const devices = await BrowserQRCodeReader.listVideoInputDevices();
        if (!devices.length) throw new Error('No camera found');

        // Select back camera if available
        const device = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];

        // First get direct camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: device.deviceId }
        });

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Start QR scanning
        const controls = await reader.decodeFromVideoDevice(
          device.deviceId,
          videoRef.current!,
          (result: Result | undefined) => {
            if (!result) return;
            const text = result.getText();
            if (text?.match(/^[A-Z0-9]{10}$/)) {
              cleanupCamera();
              onScan(text);
            } else if (onError) {
              onError('Invalid QR code format');
            }
          }
        );

        controlsRef.current = controls;

      } catch (err: any) {
        if (onError) {
          onError(err.name === 'NotAllowedError' 
            ? 'Camera permission denied' 
            : 'Failed to start camera');
        }
        console.error('Scanner initialization error:', err);
      }
    };

    initializeScanner();

    // Set up cleanup
    return () => {
      mounted = false;
      cleanupCamera();
    };
  }, [onScan, onError, cleanupCamera]);

  // Handle cleanup when onClose changes
  useEffect(() => {
    window.addEventListener('beforeunload', cleanupCamera);
    return () => {
      window.removeEventListener('beforeunload', cleanupCamera);
      cleanupCamera();
    };
  }, [cleanupCamera, onClose]);

  return (
    <div className="relative w-full">
      <div className="aspect-video max-h-[300px] relative rounded-lg overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-contain"
          autoPlay
          playsInline
          muted
        />
        <div className="absolute inset-0 border-2 border-dashed border-white/50 m-8 rounded-lg pointer-events-none">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500" />
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2 text-center">
        Position the QR code within the frame
      </p>
    </div>
  );
};

export default QRScanner;