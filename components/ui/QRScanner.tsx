'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from './Button';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function QRScanner({ onScan, onError, className = '' }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const elementId = useRef(`qr-reader-${Math.random().toString(36).slice(2, 9)}`);

  const startScanning = async () => {
    try {
      setError(null);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      setCameraPermission('granted');

      // Initialize scanner if not already created
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(elementId.current);
      }

      // Start scanning
      await scannerRef.current.start(
        { facingMode: 'environment' }, // Use back camera on mobile
        {
          fps: 10, // Frames per second
          qrbox: { width: 250, height: 250 }, // QR code detection box size
        },
        (decodedText) => {
          // Success callback - stop scanning and pass result
          stopScanning();
          onScan(decodedText);
        },
        (errorMessage) => {
          // Error callback (fires frequently, not a critical error)
          // Only log if it's actually an error, not just "No QR code found"
          if (!errorMessage.includes('No MultiFormat Readers')) {
            console.debug('[QRScanner] Scan attempt:', errorMessage);
          }
        }
      );

      setIsScanning(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMsg);
      setCameraPermission('denied');
      onError?.(errorMsg);
      console.error('[QRScanner] Camera access error:', err);
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop();
        setIsScanning(false);
      }
    } catch (err) {
      console.error('[QRScanner] Error stopping scanner:', err);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
        // Note: clear() returns void in html5-qrcode
        try {
          scannerRef.current.clear();
        } catch (err) {
          console.error('[QRScanner] Cleanup error:', err);
        }
      }
    };
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Camera viewport */}
      <div
        id={elementId.current}
        className={`rounded-lg overflow-hidden border-2 ${
          isScanning
            ? 'border-hack-green'
            : error
            ? 'border-signal-500'
            : 'border-grit-500/30'
        }`}
        style={{
          minHeight: isScanning ? '300px' : '0px',
          transition: 'min-height 0.3s ease',
        }}
      />

      {/* Controls */}
      <div className="flex flex-col gap-3">
        {!isScanning ? (
          <Button
            variant="primary"
            onClick={startScanning}
            disabled={cameraPermission === 'denied'}
            className="w-full"
          >
            📷 Start Camera Scanner
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={stopScanning}
            className="w-full"
          >
            ⏸️ Stop Scanner
          </Button>
        )}

        {/* Status messages */}
        {error && (
          <div className="p-4 bg-signal-500/10 border border-signal-500/30 rounded-lg">
            <p className="text-signal-400 text-sm">
              <span className="font-semibold">Camera Error:</span> {error}
            </p>
            {cameraPermission === 'denied' && (
              <p className="text-xs text-grit-400 mt-2">
                Please enable camera permissions in your browser settings and refresh the page.
              </p>
            )}
          </div>
        )}

        {isScanning && (
          <div className="p-4 bg-hack-green/10 border border-hack-green/30 rounded-lg">
            <p className="text-hack-green text-sm flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-hack-green rounded-full animate-pulse" />
              Camera active - Position QR code in the box
            </p>
          </div>
        )}

        {cameraPermission === 'prompt' && !isScanning && !error && (
          <div className="p-4 bg-cobalt-500/10 border border-cobalt-500/30 rounded-lg">
            <p className="text-cobalt-300 text-sm">
              ℹ️ Click &quot;Start Camera Scanner&quot; to scan QR codes using your device camera.
              The browser will request camera permission.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
