import React, { useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Result } from '@zxing/library';

interface QRScannerProps {
  onScan: (bioId: string) => void;
  onError?: (error: string) => void;
}

interface VideoInputDevice {
  deviceId: string;
  label: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);

  useEffect(() => {
    const startScanning = async () => {
      try {
        // Initialize reader only once
        if (!readerRef.current) {
          readerRef.current = new BrowserQRCodeReader();
        }

        const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
        if (videoInputDevices.length === 0) {
          throw new Error('No camera found');
        }

        // Try to use the back camera if available
        const selectedDeviceId = videoInputDevices.find((device: VideoInputDevice) => 
          device.label && device.label.toLowerCase().includes('back')
        )?.deviceId || videoInputDevices[0].deviceId;

        if (readerRef.current && videoRef.current) {
          await readerRef.current.decodeFromVideoDevice(
            selectedDeviceId,
            videoRef.current,
            (result: Result | undefined) => {
              if (result) {
                const scannedText = result.getText();
                if (scannedText && scannedText.match(/^[A-Z0-9]{10}$/)) {
                  onScan(scannedText);
                } else if (onError) {
                  onError('Invalid QR code format');
                }
              }
            }
          );
        }
      } catch (err: any) {
        if (onError) {
          if (err.name === 'NotAllowedError') {
            onError('Camera permission denied');
          } else {
            onError(err.message || 'Failed to start camera');
          }
        }
        console.error('Scanner error:', err);
      }
    };

    startScanning();

    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [onScan, onError]);

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