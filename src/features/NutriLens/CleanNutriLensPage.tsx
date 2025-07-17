import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, RefreshCcw, Check, AlertTriangle, Upload, Barcode } from 'lucide-react';
import '../../styles/nutrilens-clean.css';

// Simplified nutrition data type
interface NutritionData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: string;
}

const CleanNutriLensPage: React.FC = () => {
  // State declarations
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isScanningForBarcodes, setIsScanningForBarcodes] = useState(false);
  const [lastBarcodeValue, setLastBarcodeValue] = useState<string | null>(null);
  
  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const barcodeScannerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Start camera function
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported on this device or browser');
        return;
      }
      
      const constraints = {
        video: { facingMode: 'environment' }
      };
      
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Get camera access
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
            setIsCameraReady(true);
            setError(null);
          }
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions.');
    }
  };
  
  // Stop camera stream
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
  };
  
  // Toggle barcode scanner
  const toggleBarcodeScanner = () => {
    if (isScanningForBarcodes) {
      if (barcodeScannerIntervalRef.current) {
        clearInterval(barcodeScannerIntervalRef.current);
        barcodeScannerIntervalRef.current = null;
      }
      setIsScanningForBarcodes(false);
    } else {
      setIsScanningForBarcodes(true);
      // In a real app, we would implement barcode scanning here
    }
  };
  
  // Capture image
  const captureImage = () => {
    if (!canvasRef.current || !videoRef.current) {
      setError('Camera not ready');
      return;
    }
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      try {
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImageUrl(imageDataUrl);
        analyzeImage(imageDataUrl);
      } catch (err) {
        console.error('Error capturing image:', err);
        setError('Failed to capture image');
      }
    }
  };
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        const imageDataUrl = e.target.result as string;
        setCapturedImageUrl(imageDataUrl);
        analyzeImage(imageDataUrl);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading uploaded file');
    };
    
    reader.readAsDataURL(file);
  };
  
  // Analyze image using AI
  const analyzeImage = async (imageDataUrl: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulated API call to analyze food
      setTimeout(() => {
        // Mock nutrition data
        setNutritionData({
          name: 'Apple',
          calories: 95,
          protein: 0.5,
          carbs: 25,
          fat: 0.3,
          source: 'AI Analysis'
        });
        setIsLoading(false);
      }, 2000);
      
      // In a real app, we would call our API:
      // const response = await fetch('/api/ai-analyze-food', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ image: imageDataUrl })
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.error || 'Analysis failed');
      // setNutritionData(data);
      // setIsLoading(false);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Could not analyze the image. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Reset the scan
  const resetScan = () => {
    setCapturedImageUrl(undefined);
    setNutritionData(null);
    setError(null);
  };
  
  // Initialize camera on component mount
  useEffect(() => {
    startCamera();
    
    return () => {
      stopCameraStream();
      if (barcodeScannerIntervalRef.current) {
        clearInterval(barcodeScannerIntervalRef.current);
      }
    };
  }, []);
  
  // Render nutrition results
  const renderNutritionResults = () => {
    if (!nutritionData) return null;
    
    return (
      <div className="scan-card">
        <div className="card-header">
          <h2>Nutrition Analysis</h2>
        </div>
        <div className="card-body">
          <div className="nutrition-item">
            <h3 className="text-xl font-bold mb-1">{nutritionData.name}</h3>
            <div className="nutrition-grid">
              <div className="nutrition-value">
                <span className="label">Calories</span>
                <span className="value">{nutritionData.calories}</span>
              </div>
              <div className="nutrition-value">
                <span className="label">Protein</span>
                <span className="value">{nutritionData.protein}g</span>
              </div>
              <div className="nutrition-value">
                <span className="label">Carbs</span>
                <span className="value">{nutritionData.carbs}g</span>
              </div>
              <div className="nutrition-value">
                <span className="label">Fat</span>
                <span className="value">{nutritionData.fat}g</span>
              </div>
            </div>
            <div className="source-info">
              <span className="text-sm text-gray-500">Source: {nutritionData.source}</span>
            </div>
          </div>
          <div className="mt-4">
            <button className="btn btn-scan" onClick={resetScan}>
              <RefreshCcw size={18} />
              Scan Another
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <div className="scanner-container">
        {capturedImageUrl && nutritionData ? (
          <>
            <div className="captured-image-container">
              <img src={capturedImageUrl} alt="Captured food" className="captured-image" />
            </div>
            {renderNutritionResults()}
          </>
        ) : (
          <>
            <div className="scan-card">
              <div className="card-header">
                <h2>Food Scanner</h2>
              </div>
              <div className="card-body">
                {error && (
                  <div className="error-message">
                    <AlertTriangle size={18} />
                    <span>{error}</span>
                  </div>
                )}
                
                {!isCameraReady && !error && (
                  <div className="camera-message">
                    <Camera size={24} />
                    <span>Accessing camera...</span>
                  </div>
                )}
                
                {capturedImageUrl && isLoading && (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Processing Image</h3>
                      <p className="text-sm">Analyzing your food for detailed nutritional information</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="camera-container">
                {/* Video element for camera feed */}
                <video ref={videoRef} className="camera-feed" />
                
                {/* Hidden canvas for image processing */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                <div className="camera-overlay">
                  {isScanningForBarcodes && (
                    <div className="barcode-scanner-indicator">
                      <div className="scan-line"></div>
                      <div className="scanning-text">Scanning for barcodes...</div>
                    </div>
                  )}
                  
                  <div className="camera-status">
                    <div className="status-indicator"></div>
                    <span>{isScanningForBarcodes ? 'Scanner Active' : 'Camera Active'}</span>
                  </div>
                  
                  {/* Display last scanned barcode */}
                  {lastBarcodeValue && (
                    <div className="last-barcode">
                      <strong>Last Barcode:</strong> {lastBarcodeValue}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action buttons at the bottom */}
              <div className="bottom-actions">
                <div className="button-group">
                  {/* Barcode scanner toggle button */}
                  <button
                    className={isScanningForBarcodes ? "btn btn-secondary" : "btn btn-scan"}
                    onClick={toggleBarcodeScanner}
                    disabled={!isCameraReady || isLoading}
                  >
                    <Barcode size={18} />
                    {isScanningForBarcodes ? 'Stop Scanning' : 'Scan Barcode'}
                  </button>
                  
                  {/* Capture button */}
                  <button
                    className="btn btn-scan"
                    onClick={captureImage}
                    disabled={!isCameraReady || isLoading}
                  >
                    <Camera size={18} />
                    Capture Photo
                  </button>
                  
                  {/* Upload button */}
                  <button 
                    className="btn btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <Upload size={18} />
                    Upload Image
                  </button>
                </div>
              </div>
              
              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              
              <div className="card-footer">
                <div>Position food item in frame or tap to scan</div>
                <div className="badge badge-primary">AI Enhanced</div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CleanNutriLensPage;
