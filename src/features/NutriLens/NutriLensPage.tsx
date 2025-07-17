import React, { useState, useRef, useEffect, FC } from 'react';
import { Camera, CameraOff, RefreshCcw, Check, AlertTriangle, ChevronDown, Upload, Barcode, Info } from 'lucide-react';
import ScanResults, { NutritionData } from './ScanResults';
// Import custom barcode scanner
import { barcodeScanner } from '../../utils/barcodeScanner';

// Helper type for browser detection
interface BrowserInfo {
  name: string;
  version: string;
  mobile: boolean;
  os: string;
}

// Helper function to detect browser
const detectBrowser = (): BrowserInfo => {
  const ua = navigator.userAgent;
  let browser = { name: 'Unknown', version: 'Unknown', mobile: false, os: 'Unknown' };
  
  // Detect mobile
  browser.mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  
  // Detect OS
  if (/Win/.test(ua)) browser.os = 'Windows';
  else if (/Mac/.test(ua)) browser.os = 'MacOS';
  else if (/Linux/.test(ua)) browser.os = 'Linux';
  else if (/Android/.test(ua)) browser.os = 'Android';
  else if (/iOS|iPhone|iPad|iPod/.test(ua)) browser.os = 'iOS';
  
  // Detect browser
  if (/Firefox\/([0-9.]+)/.test(ua)) {
    browser.name = 'Firefox';
    browser.version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || '';
  } else if (/MSIE\/([0-9.]+)/.test(ua) || /Trident\/.*rv:([0-9.]+)/.test(ua)) {
    browser.name = 'IE';
    browser.version = ua.match(/MSIE\/([0-9.]+)/)?.[1] || ua.match(/Trident\/.*rv:([0-9.]+)/)?.[1] || '';
  } else if (/Chrome\/([0-9.]+)/.test(ua)) {
    browser.name = 'Chrome';
    browser.version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || '';
  } else if (/Safari\/([0-9.]+)/.test(ua)) {
    browser.name = 'Safari';
    browser.version = ua.match(/Version\/([0-9.]+)/)?.[1] || '';
  } else if (/Edge\/([0-9.]+)/.test(ua)) {
    browser.name = 'Edge';
    browser.version = ua.match(/Edge\/([0-9.]+)/)?.[1] || '';
  }
  
  return browser;
};

// Debug status for production troubleshooting
interface CameraDebugInfo {
  browserInfo: BrowserInfo;
  secureContext: boolean;
  hasMediaDevices: boolean;
  hasEnumerateDevices: boolean;
  hasGetUserMedia: boolean;
  cameraPermission?: string;
  https: boolean;
  errorLog: string[];
}

const NutriLensPage: FC = () => {
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [detectedFoods, setDetectedFoods] = useState<any[]>([]);
  const [scanSource, setScanSource] = useState<string>('AI Vision');
  const [barcodeScannerActive, setBarcodeScannerActive] = useState(false); // Barcode scanner initially off
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  // New debug state for troubleshooting
  const [debugMode, setDebugMode] = useState<boolean>(true); // Enable debug by default in production
  const [debugInfo, setDebugInfo] = useState<CameraDebugInfo>({
    browserInfo: detectBrowser(),
    secureContext: typeof window !== 'undefined' && window.isSecureContext,
    hasMediaDevices: typeof navigator !== 'undefined' && !!navigator.mediaDevices,
    hasEnumerateDevices: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.enumerateDevices,
    hasGetUserMedia: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
    https: typeof window !== 'undefined' && window.location.protocol === 'https:',
    errorLog: []
  });
  
  // Camera status
  const [cameraStatus, setCameraStatus] = useState<'pending'|'initializing'|'active'|'error'|'not-supported'>('pending');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const barcodeReaderRef = useRef<any>(null); // Using any to avoid TypeScript errors with ZXing
  const barcodeScannerIntervalRef = useRef<number | null>(null);
  
  // Logger function that both logs to console and updates debug state
  const logDebug = (message: string, data?: any) => {
    console.log(`[NutriLens] ${message}`, data || '');
    if (debugMode) {
      setDebugInfo(prev => ({
        ...prev,
        errorLog: [...prev.errorLog.slice(-9), `${new Date().toISOString().slice(11, 19)} ${message}`]
      }));
    }
  };
  
  // Error handler for camera issues
  const handleCameraError = (error: any, context: string) => {
    console.error(`Camera error (${context}):`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    setError(`Camera access failed: ${errorMessage}. Please ensure camera permissions are granted in your browser settings.`);
    setCameraStatus('error');
    
    // Update debug info
    setDebugInfo(prev => ({
      ...prev,
      errorLog: [...prev.errorLog.slice(-9), `${new Date().toISOString().slice(11, 19)} ERROR (${context}): ${errorMessage}`]
    }));
  };
  
  // Function to check if camera API is supported
  const checkCameraSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access is not supported in this browser. Please try a modern browser like Chrome, Firefox, or Edge.');
      setCameraStatus('not-supported');
      return false;
    }
    return true;
  };
  
  // Function to stop any active stream
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
      
      // Clear video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      logDebug('Camera stream stopped');
    }
  };

  // Get available camera devices with enhanced error handling and logging
  useEffect(() => {
    const getCameras = async () => {
      try {
        logDebug('Starting camera detection process');
        setDebugInfo(prev => ({ ...prev, cameraPermission: 'checking' }));
        
        // First check if we have the required APIs
        if (!checkCameraSupport()) {
          logDebug('Camera API not supported');
          return;
        }
        
        setCameraStatus('initializing');
        
        // Check if we're in a secure context
        if (window.isSecureContext === false) {
          logDebug('WARNING: Not in a secure context - camera may not work');
        }
        
        // Check if protocol is HTTPS
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          logDebug(`WARNING: Not using HTTPS (${window.location.protocol}) - camera requires HTTPS except on localhost`);
        }

        // Explicitly request camera permission first if permissions API is available
        try {
          if (navigator.permissions && navigator.permissions.query) {
            logDebug('Checking camera permissions...');
            const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
            logDebug(`Permission status: ${permissionStatus.state}`);
            setDebugInfo(prev => ({ ...prev, cameraPermission: permissionStatus.state }));
            
            // Watch for permission changes
            permissionStatus.onchange = () => {
              logDebug(`Permission changed to: ${permissionStatus.state}`);
              setDebugInfo(prev => ({ ...prev, cameraPermission: permissionStatus.state }));
              
              if (permissionStatus.state === 'granted' && cameraStatus === 'error') {
                // If permission was granted after previously being denied, retry
                logDebug('Permission now granted, restarting camera');
                startCamera();
              } else if (permissionStatus.state === 'denied' && streamRef.current) {
                // If permission was revoked while camera was running, stop it
                logDebug('Permission revoked, stopping camera');
                stopCameraStream();
                setCameraStatus('error');
                setError('Camera permission has been denied. Please enable it in your browser settings.');
              }
            };

            if (permissionStatus.state === 'denied') {
              throw new Error('Camera permission has been denied. Please enable it in your browser settings.');
            } else if (permissionStatus.state === 'prompt') {
              logDebug('User will be prompted for camera permission');
            }
          }
        } catch (permError) {
          logDebug('Could not check permissions explicitly', permError);
          // Continue anyway as some browsers don't support the permissions API fully
        }

        logDebug('Enumerating camera devices...');
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        logDebug(`Found ${cameras.length} cameras:`, cameras.map(c => c.label || 'unlabeled camera'));
        setCameraDevices(cameras);
        
        // Initial camera selection logic
        if (cameras.length > 0) {
          // Sort cameras - prefer back/environment facing cameras on mobile
          const sortedCameras = [...cameras].sort((a, b) => {
            const labelA = (a.label || '').toLowerCase();
            const labelB = (b.label || '').toLowerCase();
            
            // Prioritize real cameras over virtual ones
            const aIsVirtual = labelA.includes('obs') || labelA.includes('virtual');
            const bIsVirtual = labelB.includes('obs') || labelB.includes('virtual');
            if (aIsVirtual && !bIsVirtual) return 1;
            if (!aIsVirtual && bIsVirtual) return -1;
            
            // On mobile, prefer 'back', 'rear', or 'environment' cameras
            const aIsBack = labelA.includes('back') || labelA.includes('rear') || labelA.includes('environment');
            const bIsBack = labelB.includes('back') || labelB.includes('rear') || labelB.includes('environment');
            if (aIsBack && !bIsBack) return -1;
            if (!aIsBack && bIsBack) return 1;
            
            return 0;
          });
          
          // Select the first camera after sorting
          const bestCamera = sortedCameras[0];
          logDebug(`Selected camera: ${bestCamera.label || 'unlabeled camera'}`);
          setSelectedCamera(bestCamera.deviceId);
        } else {
          logDebug('No cameras found');
          setError('No cameras detected on your device.');
        }
        
        // Start camera with a slight delay to allow state updates
        setTimeout(() => {
          startCamera();
        }, 500);
      } catch (err) {
        handleCameraError(err, 'getCameras');
      }
    };
    
    getCameras();
    
    return () => {
      // Clean up camera on unmount
      stopCameraStream();
    };
  }, []);
  
  // Auto-start barcode scanner when camera is ready
  useEffect(() => {
    let startScannerTimeout: NodeJS.Timeout | null = null;
    
    if (isCameraReady && !barcodeScannerIntervalRef.current && !barcodeScannerActive) {
      logDebug('Camera is ready, auto-starting barcode scanner');
      // Add a delay to make sure everything is fully initialized
      startScannerTimeout = setTimeout(() => {
        logDebug('Auto-starting barcode scanner');
        if (!barcodeScannerIntervalRef.current) {
          setBarcodeScannerActive(true);
          startBarcodeScanner();
        }
      }, 2000);
    }
    
    return () => {
      if (startScannerTimeout) {
        clearTimeout(startScannerTimeout);
      }
    };
  }, [isCameraReady, barcodeScannerActive]);

  // Initialize barcode reader
  useEffect(() => {
    // Initialize ZXing BrowserMultiFormatReader for barcode scanning
    if (typeof window !== 'undefined') {
      logDebug('Initializing barcode reader...');
      // Dynamic import of the ZXing library
      import('@zxing/browser').then(({ BrowserMultiFormatReader }) => {
        import('@zxing/library').then(({ BarcodeFormat, DecodeHintType }) => {
          try {
            // Configure hints to optimize for common barcode formats
            const hints = new Map();
            hints.set(DecodeHintType.POSSIBLE_FORMATS, [
              BarcodeFormat.EAN_13,
              BarcodeFormat.UPC_A,
              BarcodeFormat.UPC_E,
              BarcodeFormat.EAN_8,
              BarcodeFormat.CODE_128,
              BarcodeFormat.CODE_39,
              BarcodeFormat.QR_CODE // Add QR code support
            ]);
            hints.set(DecodeHintType.TRY_HARDER, true);
            hints.set(DecodeHintType.PURE_BARCODE, false); // Allow imperfect barcodes
            
            // Create reader with optimized settings
            const reader = new BrowserMultiFormatReader(hints, { 
              delayBetweenScanAttempts: 10, // Very aggressive scanning
              delayBetweenScanSuccess: 500 // Shorter delay after successful scan
            });
            
            barcodeReaderRef.current = reader;
            logDebug('Barcode reader initialized successfully with enhanced configuration');
          } catch (err) {
            logDebug('Failed to initialize barcode reader', err);
          }
        }).catch(err => logDebug('Failed to import ZXing library', err));
      }).catch(err => logDebug('Failed to import ZXing browser', err));
    }
    
    // Clean up ZXing reader on unmount
    return () => {
      if (barcodeReaderRef.current) {
        try {
          barcodeReaderRef.current.reset();
          logDebug('Barcode reader reset');
        } catch (err) {
          logDebug('Error resetting barcode reader', err);
        }
      }
      
      if (barcodeScannerIntervalRef.current) {
        clearInterval(barcodeScannerIntervalRef.current);
        barcodeScannerIntervalRef.current = null;
        logDebug('Barcode scanner interval cleared');
      }
      
      stopCameraStream();
    };
  }, []);
  
  // Comprehensive camera initialization function
  const startCamera = async () => {
    // If already streaming, stop it first
    stopCameraStream();
    
    try {
      // Clear any previous errors and update status
      setError(null);
      setCameraStatus('initializing');
      logDebug('Starting camera initialization process');
      
      // Double check API support
      if (!checkCameraSupport()) {
        return;
      }
      
      // Safari/iOS specific fixes
      const browser = detectBrowser();
      const isiOS = browser.os === 'iOS';
      const isSafari = browser.name === 'Safari';
      
      // Get appropriate constraints based on device/browser
      const createConstraints = (deviceId?: string, quality: 'high'|'medium'|'low'|'minimal' = 'high') => {
        const constraints: MediaStreamConstraints = { audio: false, video: {} };
        const videoConstraints: any = {};
        
        // Set device ID if provided
        if (deviceId) {
          videoConstraints.deviceId = { exact: deviceId };
        }
        
        // Set facingMode to 'environment' for mobile devices as fallback
        if (!deviceId && browser.mobile) {
          videoConstraints.facingMode = { ideal: 'environment' };
        }
        
        // Set resolution based on quality
        switch (quality) {
          case 'high':
            videoConstraints.width = { ideal: 1280 };
            videoConstraints.height = { ideal: 720 };
            break;
          case 'medium':
            videoConstraints.width = { ideal: 640 };
            videoConstraints.height = { ideal: 480 };
            break;
          case 'low':
            videoConstraints.width = { ideal: 320 };
            videoConstraints.height = { ideal: 240 };
            break;
          case 'minimal':
            // Just use defaults
            break;
        }
        
        constraints.video = videoConstraints;
        return constraints;
      };
      
      // Progressive fallback strategy
      const tryGetStream = async (): Promise<MediaStream> => {
        const attempts = [
          // 1. Try with selected camera at high quality
          { desc: 'selected camera (high quality)', fn: async () => {
            if (!selectedCamera) throw new Error('No camera selected');
            return navigator.mediaDevices.getUserMedia(createConstraints(selectedCamera, 'high'));
          }},
          // 2. Try with selected camera at medium quality
          { desc: 'selected camera (medium quality)', fn: async () => {
            if (!selectedCamera) throw new Error('No camera selected');
            return navigator.mediaDevices.getUserMedia(createConstraints(selectedCamera, 'medium'));
          }},
          // 3. Try with environment facing camera
          { desc: 'environment facing camera', fn: async () => {
            return navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'environment' },
              audio: false
            });
          }},
          // 4. Try with any camera
          { desc: 'any camera', fn: async () => {
            return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          }},
          // 5. Safari/iOS specific attempt
          { desc: 'iOS/Safari specific', fn: async () => {
            // Special handling for Safari and iOS
            if (isiOS || isSafari) {
              return navigator.mediaDevices.getUserMedia({
                video: {
                  facingMode: 'environment',
                  width: { ideal: 320 },
                  height: { ideal: 240 }
                },
                audio: false
              });
            }
            throw new Error('Not Safari/iOS');
          }},
          // 6. Last resort - minimal constraints
          { desc: 'minimal constraints', fn: async () => {
            return navigator.mediaDevices.getUserMedia({ video: {}, audio: false });
          }}
        ];
        
        // Try each method in sequence until one works
        for (const attempt of attempts) {
          try {
            logDebug(`Trying camera with ${attempt.desc}`);
            const stream = await attempt.fn();
            logDebug(`Successfully got camera stream with ${attempt.desc}`);
            return stream;
          } catch (err) {
            logDebug(`Failed with ${attempt.desc}:`, err);
            // Continue to next attempt
          }
        }
        
        // If we get here, all attempts failed
        throw new Error('All camera initialization attempts failed');
      };
      
      // Start the camera with our progressive strategy
      const stream = await tryGetStream();
      
      // Handle the successful stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Safari/iOS sometimes needs a specific playsinline attribute
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        
        // Set up event handlers for video element
        videoRef.current.onloadedmetadata = () => {
          logDebug('Video metadata loaded');
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                logDebug('Camera video playback started');
                setCameraStatus('active');
                setIsCameraReady(true);
                
                // Get video track info for debugging
                const videoTracks = stream.getVideoTracks();
                if (videoTracks.length > 0) {
                  const settings = videoTracks[0].getSettings();
                  logDebug('Video track settings:', settings);
                }
              })
              .catch(e => {
                handleCameraError(e, 'video.play');
              });
          }
        };
        
        videoRef.current.onerror = (e) => {
          handleCameraError(e, 'video.error');
        };
      } else {
        throw new Error('Video element not available');
      }
    } catch (err) {
      handleCameraError(err, 'startCamera');
    }
  };

  // Track when camera is ready to use
  
  // Effect for camera setup and cleanup
  useEffect(() => {
    // Initialization logic
    if (selectedCamera) {
      startCamera();
    }
    
    // Cleanup function
    return () => {
      // Clean up barcode scanner
      if (barcodeScannerIntervalRef.current) {
        clearInterval(barcodeScannerIntervalRef.current);
        barcodeScannerIntervalRef.current = null;
      }
      
      // Clean up camera stream
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => {
          console.log('Camera track stopped');
          track.stop();
        });
        streamRef.current = null;
      }
      
      // Clean up barcode reader
      if (barcodeReaderRef.current) {
        try {
          barcodeReaderRef.current.reset();
        } catch (err) {
          console.warn('Error resetting barcode reader:', err);
        }
      }
    };
  }, [selectedCamera]);

  // Initialize custom barcode scanner
  useEffect(() => {
    console.log('Custom barcode scanner initialized');
    console.log('Native barcode support:', barcodeScanner.isNativeSupported());
    console.log('Supported formats:', barcodeScanner.getSupportedFormats());
    
    // No cleanup needed as our scanner is stateless
    return () => {
      console.log('Barcode scanner cleanup');
    };
  }, []);

  // Custom barcode scanner with improved reliability
  const startBarcodeScanner = () => {
    // Prevent multiple scanner instances
    if (barcodeScannerIntervalRef.current) {
      console.log('Barcode scanner already running, not starting again');
      return;
    }

    if (!videoRef.current || !streamRef.current) {
      setError('Camera not initialized');
      return;
    }

    setBarcodeScannerActive(true);
    setError(null);
    console.log('Starting custom barcode scanner with 100ms interval...');
    console.log('Native barcode support:', barcodeScanner.isNativeSupported());

    // Use our custom scanner with both video and canvas methods
    barcodeScannerIntervalRef.current = window.setInterval(async () => {
      try {
        if (!videoRef.current || !streamRef.current || !canvasRef.current) return;

        // Check if video is ready and playing
        if (videoRef.current.readyState < 2 || videoRef.current.paused) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        
        if (!context) return;

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        let barcode = null;
        
        try {
          // Try canvas-based scanning first
          barcode = await barcodeScanner.scanFromCanvas(canvas);
          
          // If canvas scanning fails, try video-based scanning
          if (!barcode) {
            barcode = await barcodeScanner.scanFromVideo(video);
          }
        } catch (scanError) {
          // Only log significant errors
          if (scanError && scanError.message && 
              (scanError.message.includes('is not a function') || 
               scanError.message.includes('TypeError') ||
               scanError.message.includes('Cannot read'))) {
            console.error('Barcode scan error:', scanError.message);
          }
          // Silently ignore expected 'not found' barcode errors
        }

        // Process successful barcode detection
        if (barcode && barcode.length > 0) {
          console.log('✅ Barcode detected:', barcode);
          
          if (barcode !== lastBarcode) {
            console.log('🔍 New barcode found:', barcode);
            setLastBarcode(barcode);
            stopBarcodeScanner();
            await lookupBarcodeProduct(barcode);
          }
        }
      } catch (err) {
        // Only log unexpected errors
        console.warn('Barcode scanning error:', err);
      }
    }, 500); // Scan 2 times per second for better ZXing reliability
  };
  
  // Stop barcode scanner
  const stopBarcodeScanner = () => {
    if (barcodeScannerIntervalRef.current) {
      clearInterval(barcodeScannerIntervalRef.current);
      barcodeScannerIntervalRef.current = null;
      console.log('Barcode scanner stopped');
    }
    setBarcodeScannerActive(false);
  };
  
  // Capture image from camera feed
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera not initialized');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      setError('Could not get canvas context');
      return;
    }

    try {
      console.log('Capturing image from camera...');
      // Ensure video is playing and has dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error('Video has zero dimensions. Video state:', {
          readyState: video.readyState,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          paused: video.paused
        });
        setError('Camera stream not ready. Please wait a moment and try again.');
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      console.log(`Canvas set to ${canvas.width}x${canvas.height}`);

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      console.log('Video frame drawn to canvas');

      // Convert canvas to blob with error handling
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            console.error('Failed to create blob from canvas');
            setError('Failed to capture image: Could not create image data');
            return;
          }
          console.log(`Captured image blob size: ${blob.size} bytes`);

          try {
            // Create a File object from the blob
            const imageFile = new File([blob], 'food.jpg', { type: 'image/jpeg' });

            // Create URL for preview image
            const previewUrl = URL.createObjectURL(blob);
            setCapturedImageUrl(previewUrl);
            console.log('Preview image URL created');

            // Analyze the image
            await analyzeImageFood(imageFile);
          } catch (err) {
            console.error('Error processing captured image:', err);
            setError(`Failed to process captured image: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        },
        'image/jpeg',
        0.95 // 95% quality JPEG
      );
    } catch (err) {
      console.error('Error during image capture:', err);
      setError(`Failed to capture image: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Look up product by barcode
  const lookupBarcodeProduct = async (barcode: string) => {
    setIsLoading(true);
    setError(null);
    setScanSource('Barcode');
    
    try {
      console.log(`Looking up product for barcode: ${barcode}`);
      
      // Call the barcode lookup API
      const response = await fetch(`/api/spoonacular/product/${barcode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Barcode product data:', data);
      
      // Handle Spoonacular API response structure directly
      if (data && data.title) {
        // Extract nutrition values from Spoonacular product data
        const nutrition = data.nutrition || {};
        const nutrients = nutrition.nutrients || [];
        
        // Helper function to find nutrient by name
        const findNutrient = (name: string) => {
          const nutrient = nutrients.find((n: any) => 
            n.name?.toLowerCase().includes(name.toLowerCase())
          );
          return nutrient?.amount || 0;
        };
        
        // Format the nutrition data from the Spoonacular product
        const nutritionInfo: NutritionData = {
          foodName: data.title || 'Unknown Product',
          healthScore: data.spoonacularScore || 50,
          calories: findNutrient('calories'),
          protein: findNutrient('protein'),
          carbs: findNutrient('carbohydrates'),
          fat: findNutrient('fat'),
          fiber: findNutrient('fiber'),
          sugar: findNutrient('sugar'),
          sodium: findNutrient('sodium'),
          healthBenefits: ['Product information from barcode scan'] as string[],  
          allergens: data.aisle?.split(',') || [] as string[], 
          recommendations: `This product is available in the ${data.aisle || 'store'}. Check nutritional values for dietary planning.`,
          inflammatoryIndex: 0,
          glycemicLoad: 0,
          nutrientDensity: Math.round((data.spoonacularScore || 50) / 10),
          grokAnalysis: '',
          enhancedBy: 'Barcode Scan via Spoonacular API',
          detectedFoodItems: [{ name: data.title || 'Unknown Product', confidence: 1.0, portion: 'serving' }]
        };
        
        // Set nutrition data
        setNutritionData(nutritionInfo);
        console.log('✅ Product data processed successfully:', nutritionInfo.foodName);
      } else {
        throw new Error('Product not found or invalid barcode');
      }
    } catch (err: any) {
      console.error('Error looking up barcode:', err);
      setError(`Failed to lookup barcode product: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to analyze food images with real APIs only (no fallbacks)
  const analyzeImageFood = async (imageFile: File) => {
    setIsLoading(true);
    setError(null);
    setScanSource('AI Vision');

    try {
      console.log('Starting image analysis...');
      
      // Convert file to base64
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          resolve(base64String); // Keep the complete data URL format with prefix
        };
        reader.readAsDataURL(imageFile);
      });
      
      console.log('Image converted to base64, sending to AI analysis endpoint');
      
      // Call the AI analysis endpoint - no fallbacks, only real API
      const response = await fetch('/api/ai-analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API analysis failed with status:', response.status);
        throw new Error(`API error (${response.status}): ${errorData}`);
      }
      
      const result = await response.json();
      console.log('Successfully received AI analysis result:', result);
      
      if (!result.success || !result.foodItems || result.foodItems.length === 0) {
        throw new Error('Invalid API response: missing food item data');
      }
      
      // Get the primary food (first detected item)
      const primaryFood = result.foodItems[0];
      
      // Store all detected foods
      setDetectedFoods(result.foodItems);
      
      // Extract nutritional data from the API response
      const nutritionalData = result.nutritionalData || {};
      
      // Perform detailed nutritional analysis with health focus
      const detailedAllergens = enhanceAllergenDetection(nutritionalData.allergens || [], primaryFood.name);
      const detailedHealthBenefits = enhanceHealthBenefits(nutritionalData);
      const healthRecommendations = generateHealthRecommendations(nutritionalData, detailedAllergens);
      
      const nutritionInfo: NutritionData = {
        foodName: primaryFood.name || 'Unknown Food',
        healthScore: calculateHealthScore(nutritionalData),
        // Use API data only - no fallbacks to simulated data
        calories: nutritionalData.nutritionalEstimate?.calories || 0,
        protein: Number(String(nutritionalData.nutritionalEstimate?.protein || '0').match(/\d+/)?.[0] || 0),
        carbs: Number(String(nutritionalData.nutritionalEstimate?.carbs || '0').match(/\d+/)?.[0] || 0),
        fat: Number(String(nutritionalData.nutritionalEstimate?.fat || '0').match(/\d+/)?.[0] || 0),
        fiber: Number(nutritionalData.nutritionalEstimate?.fiber || 0),
        sugar: Number(nutritionalData.nutritionalEstimate?.sugar || 0),
        sodium: Number(nutritionalData.nutritionalEstimate?.sodium || 0),
        healthBenefits: detailedHealthBenefits,
        allergens: detailedAllergens,
        recommendations: healthRecommendations,
        // Additional health-focused data
        inflammatoryIndex: calculateInflammatoryIndex(nutritionalData),
        glycemicLoad: calculateGlycemicLoad(nutritionalData),
        nutrientDensity: calculateNutrientDensity(nutritionalData),
        // Grok AI analysis data
        grokAnalysis: result.detailedAnalysis || '',
        enhancedBy: nutritionalData.enhancedBy || 'Grok & Modal APIs',
        detectedFoodItems: result.foodItems || [primaryFood]
      };
      
      setNutritionData(nutritionInfo);
    } catch (err: any) {
      console.error('Error analyzing food:', err);
      setError(`Failed to analyze food: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for enhanced food analysis
  const getCommonAllergensForFood = (foodName: string): string[] => {
    // AI-powered allergen detection based on food characteristics
    const foodLower = foodName.toLowerCase();
    
    const allergenMap: Record<string, string[]> = {
      'dairy': ['milk', 'cheese', 'yogurt', 'cream', 'butter', 'ice cream'],
      'gluten': ['bread', 'pasta', 'wheat', 'cereal', 'cake', 'cookie'],
      'nuts': ['almond', 'pecan', 'walnut', 'cashew', 'pistachio', 'hazelnut', 'peanut'],
      'shellfish': ['shrimp', 'crab', 'lobster', 'scallop', 'clam', 'oyster'],
      'soy': ['tofu', 'soya', 'edamame', 'miso', 'tempeh'],
      'egg': ['egg', 'omelette', 'mayonnaise'],
    };
    
    const detectedAllergens: string[] = [];
    
    // Scan for each allergen category based on food name
    Object.entries(allergenMap).forEach(([allergen, keywords]) => {
      if (keywords.some(keyword => foodLower.includes(keyword))) {
        detectedAllergens.push(allergen);
      }
    });
    
    return detectedAllergens;
  };
  
  const analyzeHealthImpacts = (food: any): string[] => {
    const impacts: string[] = [];
    const foodLower = food.name?.toLowerCase() || '';
    
    // AI-powered health impact analysis
    if (foodLower.includes('vegetable') || 
        foodLower.includes('greens') || 
        foodLower.includes('broccoli') ||
        foodLower.includes('spinach')) {
      impacts.push('High in antioxidants');
      impacts.push('Supports immune function');
    }
    
    if (foodLower.includes('berry') || 
        foodLower.includes('fruit') || 
        foodLower.includes('apple')) {
      impacts.push('Contains natural phytochemicals');
      impacts.push('Provides dietary fiber');
    }
    
    // Add default health impacts if none detected
    if (impacts.length === 0) {
      impacts.push('Contains various nutrients');
    }
    
    return impacts;
  };
  
  const enhanceAllergenDetection = (baseAllergens: string[], foodName: string): string[] => {
    // Start with any allergens detected by the API
    const enhancedAllergens = [...baseAllergens];
    
    // Add any additional allergens detected through our local analysis
    const additionalAllergens = getCommonAllergensForFood(foodName);
    
    // Combine and deduplicate
    additionalAllergens.forEach(allergen => {
      if (!enhancedAllergens.includes(allergen)) {
        enhancedAllergens.push(allergen);
      }
    });
    
    return enhancedAllergens;
  };
  
  const enhanceHealthBenefits = (food: any): string[] => {
    const benefits: string[] = [];
    const foodLower = food.name?.toLowerCase() || '';
    
    // Determine health benefits based on food type
    if (foodLower.includes('vegetable') || foodLower.includes('greens')) {
      benefits.push('Rich in vitamins and minerals');
      benefits.push('High in dietary fiber');
      benefits.push('Low calorie density');
    } else if (foodLower.includes('fruit')) {
      benefits.push('Contains natural antioxidants');
      benefits.push('Source of vitamin C');
      benefits.push('Provides natural sugars for energy');
    } else if (foodLower.includes('fish') || foodLower.includes('salmon')) {
      benefits.push('High in omega-3 fatty acids');
      benefits.push('Complete protein source');
      benefits.push('Contains vitamin D');
    } else {
      benefits.push('Contains essential nutrients');
    }
    
    return benefits;
  };
  
  const generateHealthRecommendations = (food: any, allergens: string[]): string => {
    let recommendation = '';
    const foodLower = food.name?.toLowerCase() || '';
    
    // Generate personalized recommendations
    if (allergens.length > 0) {
      recommendation += `Caution: This food may contain ${allergens.join(', ')}. `;
    }
    
    // Food-specific recommendations
    if (foodLower.includes('vegetable') || foodLower.includes('fruit')) {
      recommendation += 'Excellent choice for daily nutrition! Rich in vitamins and fiber.';
    } else if (foodLower.includes('protein') || foodLower.includes('meat') || foodLower.includes('fish')) {
      recommendation += 'Good protein source. Try to balance with vegetables and whole grains.';
    } else if (foodLower.includes('dessert') || foodLower.includes('cake') || foodLower.includes('sweet')) {
      recommendation += 'Enjoy in moderation. High in sugar and calories.';
    } else {
      recommendation += 'Consider the nutritional profile and how it fits into your overall diet.';
    }
    
    return recommendation;
  };
  
  const calculateHealthScore = (food: any): number => {
    let score = 50; // Default starting score
    const foodLower = food.name?.toLowerCase() || '';
    
    // Adjust score based on food type
    if (foodLower.includes('vegetable') || foodLower.includes('greens')) {
      score += 30;
    } else if (foodLower.includes('fruit')) {
      score += 25;
    } else if (foodLower.includes('whole grain')) {
      score += 20;
    } else if (foodLower.includes('processed') || foodLower.includes('junk')) {
      score -= 20;
    }
    
    // Cap the score between 0 and 100
    return Math.max(0, Math.min(100, score));
  };
  
  const calculateInflammatoryIndex = (food: any): number => {
    let index = 0; // Neutral starting point
    const foodLower = food.name?.toLowerCase() || '';
    
    // Calculate inflammatory index (-5 to 5, negative is anti-inflammatory)
    if (foodLower.includes('vegetable') || foodLower.includes('berry') || foodLower.includes('omega')) {
      index -= 3; // Anti-inflammatory
    } else if (foodLower.includes('sugar') || foodLower.includes('processed')) {
      index += 3; // Pro-inflammatory
    }
    
    return index;
  };
  
  const calculateGlycemicLoad = (food: any): number => {
    let baseGL = 10; // Default medium glycemic load
    const foodLower = food.name?.toLowerCase() || '';
    
    // Adjust based on carb content and type
    if (foodLower.includes('sugar') || foodLower.includes('candy') || foodLower.includes('white bread')) {
      baseGL = 25; // High GL
    } else if (foodLower.includes('whole grain') || foodLower.includes('bean') || foodLower.includes('lentil')) {
      baseGL = 5; // Low GL
    } else if (foodLower.includes('vegetable') && !foodLower.includes('potato')) {
      baseGL = 3; // Very low GL
    } else if (foodLower.includes('meat') || foodLower.includes('fish')) {
      baseGL = 0; // No carbs
    }
    
    // Further adjust based on portion/serving size if available
    const portion = food.portion?.toLowerCase() || '';
    if (portion.includes('large') || portion.includes('big')) {
      baseGL *= 1.5;
    } else if (portion.includes('small')) {
      baseGL *= 0.7;
    }
    
    return Math.round(baseGL);
  };
  
  const calculateNutrientDensity = (food: any): number => {
    let density = 5; // Default medium nutrient density (1-10 scale)
    const foodLower = food.name?.toLowerCase() || '';
    
    // Calculate nutrient density score based on food type
    if (foodLower.includes('vegetable') || foodLower.includes('greens') || foodLower.includes('spinach')) {
      density = 9; // Very high nutrient density
    } else if (foodLower.includes('fruit') || foodLower.includes('berry')) {
      density = 8; // High nutrient density
    } else if (foodLower.includes('whole grain') || foodLower.includes('bean')) {
      density = 7; // Good nutrient density
    } else if (foodLower.includes('processed') || foodLower.includes('junk') || foodLower.includes('candy')) {
      density = 2; // Low nutrient density
    }
    
    return density;
  };

  const handleCameraChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCamera(event.target.value);
  };
  
  const resetResults = () => {
    console.log('Resetting results and reinitializing camera...');
    
    // Clear results state
    setNutritionData(null);
    setCapturedImageUrl(undefined);
    setDetectedFoods([]);
    setError(null);
    setIsLoading(false);
    
    // Reset camera status
    setCameraStatus('initializing');
    setIsCameraReady(false);
    
    // Stop any active barcode scanner
    if (barcodeScannerIntervalRef.current) {
      clearInterval(barcodeScannerIntervalRef.current);
      barcodeScannerIntervalRef.current = null;
    }
    setBarcodeScannerActive(false);
    setLastBarcode(null);
    
    // Reinitialize camera if we have a selected camera
    if (selectedCamera) {
      console.log('Reinitializing camera with device:', selectedCamera);
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        startCamera();
      }, 100);
    } else {
      // If no camera selected, force camera reload
      console.log('No camera selected, forcing camera reload...');
      // This will trigger the camera enumeration and start process again
      setSelectedCamera('');
      setCameraStatus('initializing');
    }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      
      setCapturedImageUrl(previewUrl);
      setScanSource('Uploaded Image');
      
      // Analyze the uploaded image
      analyzeImageFood(file);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.8) return 'text-green-600';
    if (confidence > 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <div className="nutrilens-container">
      <div className="scanner-header">
        <h1>NutriLens Food Scanner</h1>
        <p>Scan food items to get detailed nutrition information</p>
      </div>
      
      {nutritionData ? (
        <>
          <div className="captured-image">
            {capturedImageUrl && (
              <div>
                <img src={capturedImageUrl} alt="Captured food" className="food-image" />
                <div className="image-source">{scanSource}</div>
              </div>
            )}
          </div>
          
          <ScanResults 
            data={nutritionData} 
            onReset={() => {
              setNutritionData(null);
              setError(null);
              setDetectedFoods([]);
              setCapturedImageUrl(undefined);
            }} 
            imageUrl={capturedImageUrl}
            scanSource="camera"
          />
          
          {detectedFoods.length > 1 && (
            <div className="additional-foods">
              <h3>Also Detected:</h3>
              <div className="detected-foods-list">
                {detectedFoods.slice(1).map((food, index) => (
                  <div key={index} className="detected-food-item">
                    <span>{food.name}</span>
                    <span className={getConfidenceColor(food.confidence)}>
                      {Math.round(food.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="action-buttons">
            <div className="button-group">
              <button 
                className="btn btn-primary"
                onClick={resetResults}
              >
                <Camera size={18} />
                Scan Another Item
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="card">
            <div className="card-header">
              <div>Camera Feed</div>
              <div className="select-container">
                <select 
                  value={selectedCamera} 
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="select-styled"
                  disabled={cameraDevices.length === 0 || isLoading}
                >
                  {cameraDevices.length === 0 ? (
                    <option value="">No cameras available</option>
                  ) : (
                    cameraDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.substr(0, 5)}...`}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown size={16} className="select-icon" />
              </div>
            </div>
            
            {error ? (
              <div className="error-container">
                <CameraOff size={48} className="error-icon" />
                <h3>Camera Error</h3>
                <p>{error}</p>
                <button 
                  className="retry-button"
                  onClick={() => {
                    setError(null);
                    // Re-initialize camera
                    if (selectedCamera) {
                      // This will trigger the useEffect to restart camera
                      const currentCamera = selectedCamera;
                      setSelectedCamera('');
                      setTimeout(() => setSelectedCamera(currentCamera), 100);
                    }
                  }}
                >
                  <RefreshCcw size={16} />
                  Retry
                </button>
              </div>
            ) : (
              <div className="camera-container">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="camera-feed"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="camera-overlay">
                  {barcodeScannerActive && (
                    <div className="barcode-scanner-indicator">
                      <div className="scan-line"></div>
                      <div className="scanning-text">Scanning for barcodes...</div>
                    </div>
                  )}
                  
                  <div className="camera-status">
                    <div className="status-indicator"></div>
                    <span>{barcodeScannerActive ? 'Barcode Scanner Active' : 'Camera Active'}</span>
                  </div>
                  
                  {/* Hidden file input */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  
                  {/* Display last scanned barcode */}
                  {lastBarcode && (
                    <div className="last-barcode">
                      <strong>Last Barcode:</strong> {lastBarcode}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="card-footer">
              <div>
                Position food item in frame, tap button to scan, or upload an image
              </div>
              <div className="badge badge-primary">AI Enhanced</div>
            </div>
          </div>
          
          {/* Action buttons always at the bottom */}
          <div className="bottom-actions">
            <div className="button-group">
              {/* Barcode scanner toggle button */}
              <button
                className={`btn ${barcodeScannerActive ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => barcodeScannerActive ? stopBarcodeScanner() : startBarcodeScanner()}
                disabled={!streamRef.current || isLoading}
              >
                <Barcode size={18} />
                {barcodeScannerActive ? 'Stop Scanning' : 'Scan Barcode'}
              </button>
              
              {/* Capture button */}
              <button
                className="btn btn-primary capture"
                onClick={() => captureImage()}
                disabled={!streamRef.current || isLoading}
              >
                <Camera size={18} />
                Capture Photo
              </button>
              
              {/* Upload button */}
              <button 
                className="btn btn-secondary upload"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Upload size={18} />
                Upload Image
              </button>
            </div>
          </div>
          
          {isLoading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Processing Image</h3>
                <p className="text-sm">Our AI is analyzing your food for detailed nutritional information</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NutriLensPage;
