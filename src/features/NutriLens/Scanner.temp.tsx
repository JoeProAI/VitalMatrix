import React, { useRef, useState, useEffect, useCallback } from 'react';
import styles from './scanner.module.css';

// Define types for the Scanner component
type CaptureMode = 'camera' | 'upload' | 'barcode';

interface CameraInfo {
  deviceId: string;
  label: string;
}

interface BarcodeDetectionResult {
  barcode: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface ScannerProps {
  onScanComplete: (result: { imageData?: string; barcode?: string; scanSource: CaptureMode }) => void;
  isProcessing?: boolean;
  className?: string;
}

// Theme colors - Dark mode with blue accents
const colors = {
  primary: '#111827', // Dark gray background
  secondary: '#1f2937', // Slightly lighter gray
  accent: '#3b82f6',   // Blue accent
  text: '#f9fafb',
  textMuted: '#9ca3af'
};

// Icons for the UI
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
  </svg>
);

const BarcodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

const SwitchCameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const CaptureIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={styles.captureIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <circle cx="12" cy="12" r="6" fill="currentColor" />
  </svg>
);

const Scanner: React.FC<ScannerProps> = ({
  onScanComplete,
  isProcessing = false,
  className = '',
}) => {
  // State variables
  const [availableCameras, setAvailableCameras] = useState<CameraInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [captureMode, setCaptureMode] = useState<CaptureMode>('camera');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isBarcodeScanActive, setIsBarcodeScanActive] = useState<boolean>(false);
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [scanningStatus, setScanningStatus] = useState<string>('');
  const [isLocalProcessing, setIsLocalProcessing] = useState<boolean>(false);
  
  // Refs for DOM elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannerOverlayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const barcodeScanIntervalRef = useRef<number | null>(null);
  
  // Effect to enumerate cameras when component mounts
  useEffect(() => {
    enumerateCameras();
    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', enumerateCameras);
    
    return () => {
      // Clean up on unmount
      stopCamera();
      navigator.mediaDevices.removeEventListener('devicechange', enumerateCameras);
      if (barcodeScanIntervalRef.current) {
        window.clearInterval(barcodeScanIntervalRef.current);
        barcodeScanIntervalRef.current = null;
      }
    };
  }, []);
  
  // Effect to start camera when available cameras change or selected camera changes
  useEffect(() => {
    if (availableCameras.length > 0 && !selectedCameraId) {
      setSelectedCameraId(availableCameras[0].deviceId);
    }
    
    if (selectedCameraId && (captureMode === 'camera' || captureMode === 'barcode')) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [availableCameras, selectedCameraId, captureMode]);
  
  // Effect to handle barcode scanning mode
  useEffect(() => {
    if (captureMode === 'barcode' && isCameraActive) {
      startBarcodeScanning();
    } else {
      stopBarcodeScanning();
    }
  }, [captureMode, isCameraActive]);
  
  // Helper function to enumerate cameras
  const enumerateCameras = async () => {
    try {
      // Check for camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices
        .filter((device) => device.kind === 'videoinput')
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 4)}`,
        }));
      
      setAvailableCameras(cameras);
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.error('Error enumerating cameras:', err);
      setAvailableCameras([]);
    }
  };
  
  // Helper function to generate valid barcode for testing/fallback purposes
  const generateValidBarcode = (): string => {
    // Generate a random UPC-A barcode (12 digits)
    let digits = '';
    for (let i = 0; i < 11; i++) {
      digits += Math.floor(Math.random() * 10).toString();
    }
    
    // Calculate check digit
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      sum += parseInt(digits[i]) * (i % 2 === 0 ? 3 : 1);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    
    return digits + checkDigit;
  };
  
  // Start camera function
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        stopCamera();
      }
      
      // Get stream from selected camera
      const constraints = {
        video: {
          deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined,
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // Connect stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error('Error playing video:', e));
          setIsCameraActive(true);
        };
      }
    } catch (err) {
      console.error('Error starting camera:', err);
      setIsCameraActive(false);
    }
  };
  
  // Stop camera function
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
  };
  
  // Capture image from camera
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || isProcessing || isLocalProcessing) return;
    
    try {
      setIsLocalProcessing(true);
      setScanningStatus('Capturing image...');
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data as base64 string
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Call onScanComplete with image data
      setTimeout(() => {
        onScanComplete({
          imageData,
          scanSource: 'camera'
        });
        setIsLocalProcessing(false);
        setScanningStatus('');
      }, 500); // Small delay for better UX
    } catch (err) {
      console.error('Error capturing image:', err);
      setIsLocalProcessing(false);
      setScanningStatus('Error capturing image');
    }
  };
  
  // Handle file selection for upload mode
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || isProcessing || isLocalProcessing) return;
    
    try {
      setIsLocalProcessing(true);
      setScanningStatus('Processing image...');
      
      const file = e.target.files[0];
      
      // Check file is an image
      if (!file.type.startsWith('image/')) {
        throw new Error('Selected file is not an image');
      }
      
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (!event.target || typeof event.target.result !== 'string') {
          setIsLocalProcessing(false);
          setScanningStatus('Error reading file');
          return;
        }
        
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          if (!canvasRef.current) {
            setIsLocalProcessing(false);
            return;
          }
          
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          
          if (!context) {
            setIsLocalProcessing(false);
            return;
          }
          
          // Set canvas dimensions to match image
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image to canvas
          context.drawImage(img, 0, 0, img.width, img.height);
          
          // Get image data
          const imageData = canvas.toDataURL('image/jpeg', 0.8);
          
          // Call onScanComplete with image data
          setTimeout(() => {
            onScanComplete({
              imageData,
              scanSource: 'upload'
            });
            setIsLocalProcessing(false);
            setScanningStatus('');
            
            // Reset file input
            if (e.target) {
              e.target.value = '';
            }
          }, 500);
        };
        
        img.onerror = () => {
          setIsLocalProcessing(false);
          setScanningStatus('Error loading image');
        };
      };
      
      reader.onerror = () => {
        setIsLocalProcessing(false);
        setScanningStatus('Error reading file');
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error processing image:', err);
      setIsLocalProcessing(false);
      setScanningStatus('Error processing image');
    }
  };
  
  // Start barcode scanning
  const startBarcodeScanning = () => {
    if (barcodeScanIntervalRef.current) {
      stopBarcodeScanning();
    }
    
    setIsBarcodeScanActive(true);
    setScanningStatus('Scanning for barcode...');
    
    // Set up scanning interval
    barcodeScanIntervalRef.current = window.setInterval(() => {
      performScan();
    }, 500) as unknown as number;
  };
  
  // Optimized scanning function that adapts based on device capability
  const performScan = () => {
    if (!videoRef.current || !canvasRef.current || isProcessing || isLocalProcessing) return;
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;
      
      // Set canvas dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data for processing
      const imageData = canvas.toDataURL('image/jpeg', 0.7);
      
      // For demonstration - simulating barcode detection
      // In a real app, you would use a barcode detection library here
      // like zxing-js, quagga.js, or the Barcode Detection API
      
      // Simulated barcode detection - randomly detect a barcode after a few seconds
      // In a real implementation, replace this with actual barcode detection logic
      if (Math.random() < 0.1) {
        const barcode = generateValidBarcode();
        const boundingBox = {
          x: Math.floor(Math.random() * (canvas.width - 100)),
          y: Math.floor(Math.random() * (canvas.height - 100)),
          width: 100,
          height: 50
        };
        
        handleBarcodeDetected({
          barcode,
          boundingBox
        });
      }
    } catch (err) {
      console.error('Error scanning barcode:', err);
    }
  };
  
  // Stop barcode scanning
  const stopBarcodeScanning = () => {
    if (barcodeScanIntervalRef.current) {
      window.clearInterval(barcodeScanIntervalRef.current);
      barcodeScanIntervalRef.current = null;
    }
    
    setIsBarcodeScanActive(false);
    setScanningStatus('');
  };
  
  // Handle barcode detection
  const handleBarcodeDetected = (result: BarcodeDetectionResult) => {
    setScannedBarcode(result.barcode);
    stopBarcodeScanning();
    setIsLocalProcessing(true);
    
    // Highlight barcode in UI
    if (scannerOverlayRef.current && result.boundingBox) {
      const overlay = scannerOverlayRef.current;
      overlay.style.left = `${result.boundingBox.x}px`;
      overlay.style.top = `${result.boundingBox.y}px`;
      overlay.style.width = `${result.boundingBox.width}px`;
      overlay.style.height = `${result.boundingBox.height}px`;
      overlay.style.display = 'block';
    }
    
    // Notify parent component
    setTimeout(() => {
      onScanComplete({
        barcode: result.barcode,
        scanSource: 'barcode'
      });
      setIsLocalProcessing(false);
      
      if (scannerOverlayRef.current) {
        scannerOverlayRef.current.style.display = 'none';
      }
    }, 1000); // Delay to show the highlight
  };
  
  // Re-enumerate cameras when permissions change
  const handlePermissionChange = () => {
    enumerateCameras();
  };
  
  // Switch capture mode
  const switchMode = (mode: CaptureMode) => {
    setCaptureMode(mode);
    setScannedBarcode('');
    setScanningStatus('');
  };
  
  return (
    <div className={`${styles.scannerContainer} ${className}`}>
      <div className={styles.scannerHeader}>
        <div className={styles.modeSwitcher}>
          <button
            className={`${styles.modeButton} ${captureMode === 'camera' ? styles.activeMode : ''}`}
            onClick={() => switchMode('camera')}
            disabled={isProcessing || isLocalProcessing}
            aria-label="Camera mode"
            title="Take photo"
          >
            <CameraIcon />
          </button>
          
          <button
            className={`${styles.modeButton} ${captureMode === 'upload' ? styles.activeMode : ''}`}
            onClick={() => switchMode('upload')}
            disabled={isProcessing || isLocalProcessing}
            aria-label="Upload mode"
            title="Upload image"
          >
            <UploadIcon />
          </button>
          
          <button
            className={`${styles.modeButton} ${captureMode === 'barcode' ? styles.activeMode : ''}`}
            onClick={() => switchMode('barcode')}
            disabled={isProcessing || isLocalProcessing}
            aria-label="Barcode mode"
            title="Scan barcode"
          >
            <BarcodeIcon />
          </button>
        </div>
      </div>
      
      <div className={styles.scannerContent}>
        {/* Common elements across modes */}
        <canvas ref={canvasRef} className={styles.hiddenCanvas} />
        
        {/* Camera and barcode scan UI */}
        {(captureMode === 'camera' || captureMode === 'barcode') ? (
          <div className={styles.cameraContainer}>
            <video
              ref={videoRef}
              className={styles.cameraPreview}
              playsInline
              muted
              autoPlay
            />
            
            {captureMode === 'barcode' && (
              <div className={styles.barcodeScanOverlay}>
                <div className={styles.barcodeTargetBox} />
                <div ref={scannerOverlayRef} className={styles.barcodeDetectedBox} />
                {scannedBarcode && (
                  <div className={styles.scannedBarcodeDisplay}>
                    {scannedBarcode}
                  </div>
                )}
              </div>
            )}
            
            {/* Status display */}
            {(isProcessing || isLocalProcessing) && (
              <div className={styles.processingOverlay}>
                <div className={styles.processingSpinner} />
                <div className={styles.processingText}>
                  {scanningStatus || 'Processing...'}
                </div>
              </div>
            )}
            
            {/* Camera controls */}
            <div className={styles.cameraControls}>
              {/* Camera switch button - only show when multiple cameras available */}
              {availableCameras.length > 1 && (
                <button
                  className={styles.switchCameraButton}
                  onClick={() => {
                    const currentIndex = availableCameras.findIndex(
                      (camera) => camera.deviceId === selectedCameraId
                    );
                    const nextIndex = (currentIndex + 1) % availableCameras.length;
                    setSelectedCameraId(availableCameras[nextIndex].deviceId);
                  }}
                  disabled={isProcessing || isLocalProcessing}
                  aria-label="Switch camera"
                >
                  <SwitchCameraIcon />
                </button>
              )}
              
              {/* Camera selection dropdown - Only show when camera mode is active and multiple cameras available */}
              {(captureMode === 'camera' || captureMode === 'barcode') && availableCameras.length > 1 && (
                <div className={styles.cameraSelector}>
                  <select
                    className={styles.cameraSelectorDropdown}
                    value={selectedCameraId}
                    onChange={(e) => {
                      setSelectedCameraId(e.target.value);
                      if (isCameraActive) {
                        stopCamera();
                        setTimeout(() => startCamera(), 300); // Brief delay to ensure camera switches properly
                      }
                    }}
                    aria-label="Select camera"
                  >
                    {availableCameras.map((camera) => (
                      <option key={camera.deviceId} value={camera.deviceId}>
                        {camera.label || `Camera ${camera.deviceId.slice(0, 4)}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Capture button or processing indicator */}
              {captureMode === 'camera' && (
                <div className={styles.captureButtonContainer}>
                  {isProcessing || isLocalProcessing ? (
                    <div className={styles.processingIndicator}>
                      <div className={styles.processingSpinner} />
                    </div>
                  ) : isCameraActive && (
                    <button
                      onClick={captureImage}
                      className={styles.captureButton}
                      disabled={isProcessing || isLocalProcessing}
                      aria-label="Take photo"
                    >
                      <CaptureIcon />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.uploadContainer}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className={styles.hiddenFileInput}
              ref={fileInputRef}
              disabled={isProcessing || isLocalProcessing}
            />
            {isProcessing || isLocalProcessing ? (
              <div className={styles.processingContainer}>
                <div className={styles.processingSpinner} />
                <div className={styles.processingText}>
                  {scanningStatus || 'Processing...'}
                </div>
              </div>
            ) : (
              <div
                className={styles.uploadPrompt}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={styles.uploadIconContainer}>
                  <UploadIcon />
                </div>
                <div className={styles.uploadText}>
                  Click to upload an image
                </div>
                <div className={styles.uploadSubtext}>
                  Supports JPEG, PNG, and WebP formats
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className={styles.instructionText}>
        {captureMode === 'camera' && !isProcessing && !isLocalProcessing && (
          <span>Position your food in the frame and tap the button to capture</span>
        )}
        {captureMode === 'barcode' && !isProcessing && !isLocalProcessing && (
          <span>Align the barcode within the blue box and hold steady</span>
        )}
        {captureMode === 'upload' && !isProcessing && !isLocalProcessing && (
          <span>Upload a clear image of your food or a product barcode</span>
        )}
      </div>
    </div>
  );
};

export default Scanner;
