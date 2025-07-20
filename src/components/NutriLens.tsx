import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  scanBarcode,
  analyzeFood, 
  generateHealthInsights,
  addNutritionEntry,
  NutritionScanResult,
  HealthInsight 
} from '../services/nutriLensService';
import { getUserProfile, UserProfile } from '../services/userProfileService';
import { barcodeScanner } from '../utils/barcodeScanner';
import {
  Camera,
  Scan,
  Mic,
  Upload,
  AlertTriangle,
  CheckCircle,
  Target,
  Brain,
  Utensils,
  Clock,
  Home,
  Users,
  User
} from 'lucide-react';

const NutriLens: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'scan' | 'history' | 'insights' | 'goals'>('scan');
  const [scanMode, setScanMode] = useState<'barcode' | 'camera'>('barcode');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<NutritionScanResult | null>(null);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [isAutoScanning, setIsAutoScanning] = useState(false);
  const autoScanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [healthInsights, setHealthInsights] = useState<HealthInsight[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allergyWarnings, setAllergyWarnings] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to check for allergy warnings
  const checkForAllergyWarnings = (scanResult: NutritionScanResult, userAllergies: string[]): string[] => {
    const warnings: string[] = [];
    const lowerUserAllergies = userAllergies.map(allergy => allergy.toLowerCase().trim());
    
    // Check detected allergens from scan result
    if (scanResult.allergens && scanResult.allergens.length > 0) {
      scanResult.allergens.forEach(allergen => {
        const lowerAllergen = allergen.toLowerCase().trim();
        if (lowerUserAllergies.some(userAllergy => 
          lowerAllergen.includes(userAllergy) || userAllergy.includes(lowerAllergen)
        )) {
          warnings.push(allergen);
        }
      });
    }
    
    // Check food item name for allergen keywords
    if (scanResult.foodItem) {
      const foodName = scanResult.foodItem.toLowerCase();
      lowerUserAllergies.forEach(userAllergy => {
        if (foodName.includes(userAllergy)) {
          warnings.push(userAllergy);
        }
      });
    }
    
    // Check brand name for allergen indicators
    if (scanResult.brand) {
      const brandName = scanResult.brand.toLowerCase();
      lowerUserAllergies.forEach(userAllergy => {
        if (brandName.includes(userAllergy)) {
          warnings.push(userAllergy);
        }
      });
    }
    
    // Remove duplicates and return
    return [...new Set(warnings)];
  };

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  // Cleanup camera when component unmounts or tab changes
  useEffect(() => {
    return () => {
      // Cleanup camera stream when component unmounts
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // Cleanup camera when switching tabs or scan modes
  useEffect(() => {
    if (activeTab !== 'scan' || (scanMode !== 'camera' && scanMode !== 'barcode')) {
      stopCamera();
    }
  }, [activeTab, scanMode]);

  // Cleanup auto-scanning on unmount
  useEffect(() => {
    return () => {
      stopAutoScanning();
    };
  }, []);



  const loadUserData = async () => {
    if (!currentUser) return;
    
    try {
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
      
      const insights = await generateHealthInsights(currentUser.uid);
      setHealthInsights(insights);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim() || !currentUser) return;
    
    try {
      setLoading(true);
      setError('');
      setAllergyWarnings([]); // Clear previous allergy warnings
      
      let result = await scanBarcode(barcodeInput.trim(), currentUser.uid);
      
      // If barcode not found in database, inform user to use camera for AI analysis
      if (!result) {
        console.log('📦 Manual barcode not in database...');
        setError(`Barcode ${barcodeInput.trim()} not found in database. Please use the camera scanner to capture the product image for AI analysis.`);
        return;
      }
      
      if (result) {
        // Enhance manual barcode result with AI analysis for allergen detection
        console.log('🧠 Enhancing manual barcode result with AI analysis...');
        
        // Check for allergy warnings based on user profile
        if (userProfile?.healthProfile?.allergies && userProfile.healthProfile.allergies.length > 0) {
          const warnings = checkForAllergyWarnings(result, userProfile.healthProfile.allergies);
          setAllergyWarnings(warnings);
          
          if (warnings.length > 0) {
            console.log('🚨 MANUAL BARCODE ALLERGY WARNINGS DETECTED:', warnings);
          }
        }
        
        setScanResult(result);
        setBarcodeInput('');
        await loadUserData(); // Refresh insights
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      setError('Failed to scan barcode. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startCameraCapture = async () => {
    try {
      setIsScanning(true);
      setError('');
      setAllergyWarnings([]); // Clear previous allergy warnings
      
      console.log('📹 Starting camera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve, reject) => {
          const video = videoRef.current!;
          
          const onLoadedMetadata = () => {
            console.log('✅ Camera ready:', {
              dimensions: `${video.videoWidth}x${video.videoHeight}`,
              readyState: video.readyState
            });
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            resolve(void 0);
          };
          
          const onError = (error: Event) => {
            console.error('❌ Camera error:', error);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(new Error('Failed to load camera'));
          };
          
          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);
          
          // Start playing
          video.play().catch(reject);
          
          // Timeout after 10 seconds
          setTimeout(() => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(new Error('Camera initialization timeout'));
          }, 10000);
        });
        
        console.log('🎥 Camera started successfully!');
        
        // Start auto-scanning
        startAutoScanning();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Unable to access camera: ${errorMessage}. Please check permissions and try again.`);
      setIsScanning(false);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current || !currentUser) return;
    
    try {
      setLoading(true);
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        // Compress camera capture more aggressively
      let imageData = canvas.toDataURL('image/jpeg', 0.4);
      
      // If still too large, compress further
      if (imageData.length > 1 * 1024 * 1024) {
        // Reduce canvas size and compress more
        const originalWidth = canvas.width;
        const originalHeight = canvas.height;
        canvas.width = originalWidth * 0.7;
        canvas.height = originalHeight * 0.7;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        imageData = canvas.toDataURL('image/jpeg', 0.2);
      }
      
      console.log(`📸 Camera image compressed: ${(imageData.length / 1024 / 1024).toFixed(2)}MB`);
        const result = await analyzeFood(imageData, currentUser.uid);
        
        if (result) {
          setScanResult(result);
          stopCamera();
          await loadUserData(); // Refresh insights
        } else {
          setError('Unable to analyze food. Please try again with better lighting.');
        }
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Test barcode detection without Firebase
  const testBarcodeDetection = async () => {
    if (!videoRef.current) {
      setError('Camera not ready');
      return;
    }
    
    const video = videoRef.current;
    
    // Check if video is ready
    if (video.readyState < 2) {
      setError('Camera is still loading. Please wait a moment and try again.');
      return;
    }
    
    // Check if video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Camera feed not ready. Please wait for the camera to fully initialize.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setAllergyWarnings([]); // Clear previous allergy warnings
      
      console.log('🎥 Video ready for scanning:', {
        readyState: video.readyState,
        dimensions: `${video.videoWidth}x${video.videoHeight}`,
        currentTime: video.currentTime
      });
      
      // Use your advanced barcode scanner
      const detectedBarcode = await barcodeScanner.scanFromVideo(video);
      
      if (detectedBarcode) {
        console.log('✅ SUCCESS! Barcode detected:', detectedBarcode);
        setError(`🎉 BARCODE DETECTED: ${detectedBarcode}\n\nYour advanced scanner is working perfectly!\n\nTo get nutrition data, we need to fix the Firebase permissions.`);
        
        // Create a mock result to show the scanner is working
        const mockResult: NutritionScanResult = {
          foodItem: `Product ${detectedBarcode}`,
          brand: 'Test Brand',
          category: 'Test Category',
          servingSize: '1 serving',
          calories: 100,
          macros: {
            protein: 5,
            carbs: 15,
            fat: 3,
            fiber: 2,
            sugar: 8,
            sodium: 150,
          },
          healthScore: 75,
          healthGrade: 'B+',
          allergens: [],
          warnings: [],
          dietaryFlags: ['test'],
          aiInsights: {
            healthBenefits: ['Barcode scanner working!'],
            concerns: [],
            alternatives: [],
            personalizedTips: [`Detected barcode: ${detectedBarcode}`],
          },
          confidence: 1.0,
          userId: 'test',
          timestamp: new Date(),
          scanMethod: 'barcode',
        };
        
        setScanResult(mockResult);
        stopCamera();
      } else {
        setError('No barcode detected. Please ensure the barcode is:\n• Clearly visible and well-lit\n• Within the red target area\n• Not blurry or distorted\n• A supported format (UPC, EAN, QR, etc.)');
      }
    } catch (error) {
      console.error('Error scanning barcode from camera:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to scan barcode: ${errorMessage}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scanning functionality
  const startAutoScanning = () => {
    if (autoScanIntervalRef.current) {
      clearInterval(autoScanIntervalRef.current);
    }
    
    setIsAutoScanning(true);
    console.log('🔄 Starting auto-scanning...');
    
    autoScanIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !currentUser || isScanning) {
        return;
      }
      
      const video = videoRef.current;
      
      // Check if video is ready
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        return;
      }
      
      try {
        const detectedBarcode = await barcodeScanner.scanFromVideo(video);
        
        if (detectedBarcode) {
          console.log('🎯 Auto-detected barcode:', detectedBarcode);
          
          // Stop auto-scanning and process the barcode
          stopAutoScanning();
          setLoading(true);
          
          let result = await scanBarcode(detectedBarcode, currentUser.uid);
          
          // If barcode not found in database, use Grok AI to analyze the product
          if (!result) {
            console.log('🤖 Barcode not in database, using Grok AI to analyze product...');
            
            // Capture current video frame for AI analysis
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (video && ctx) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.drawImage(video, 0, 0);
              
              // Compress image for AI analysis
              const imageData = canvas.toDataURL('image/jpeg', 0.7);
              console.log('📸 Captured product image for Grok AI analysis...');
              
              // Send to Grok AI with barcode context
              const aiResult = await analyzeImageWithAI(imageData);
              if (aiResult) {
                // Add barcode to the AI result
                result = {
                  ...aiResult,
                  barcode: detectedBarcode,
                  scanMethod: 'barcode',
                  aiInsights: {
                    ...aiResult.aiInsights,
                    personalizedTips: [
                      ...aiResult.aiInsights.personalizedTips,
                      `Barcode: ${detectedBarcode}`,
                      'Product analyzed using AI vision since barcode not in database'
                    ]
                  }
                };
                console.log('✨ Grok AI analysis complete for barcode:', detectedBarcode);
              }
            }
          }
          
          if (result) {
            // Enhance barcode result with AI analysis for allergen detection
            console.log('🧠 Enhancing auto-scanned barcode result with AI analysis...');
            
            // Check for allergy warnings based on user profile
            if (userProfile?.healthProfile?.allergies && userProfile.healthProfile.allergies.length > 0) {
              const warnings = checkForAllergyWarnings(result, userProfile.healthProfile.allergies);
              setAllergyWarnings(warnings);
              
              if (warnings.length > 0) {
                console.log('🚨 AUTO-SCAN ALLERGY WARNINGS DETECTED:', warnings);
              }
            }
            
            setScanResult(result);
            stopCamera();
            await loadUserData();
          }
          setLoading(false);
        }
      } catch (error) {
        // Continue auto-scanning on errors
        console.log('Auto-scan attempt failed, continuing...');
      }
    }, 500); // Scan every 500ms
  };
  
  const stopAutoScanning = () => {
    if (autoScanIntervalRef.current) {
      clearInterval(autoScanIntervalRef.current);
      autoScanIntervalRef.current = null;
    }
    setIsAutoScanning(false);
    console.log('⏹️ Auto-scanning stopped');
  };

  // Advanced barcode scanning using your 3-day custom scanner
  const scanBarcodeFromCamera = async () => {
    if (!videoRef.current || !currentUser) {
      setError('Camera or user not ready');
      return;
    }
    
    const video = videoRef.current;
    
    // Check if video is ready
    if (video.readyState < 2) {
      setError('Camera is still loading. Please wait a moment and try again.');
      return;
    }
    
    // Check if video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Camera feed not ready. Please wait for the camera to fully initialize.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setAllergyWarnings([]); // Clear previous allergy warnings
      
      console.log('🎥 Video ready for scanning:', {
        readyState: video.readyState,
        dimensions: `${video.videoWidth}x${video.videoHeight}`,
        currentTime: video.currentTime
      });
      
      // Use your advanced barcode scanner
      const detectedBarcode = await barcodeScanner.scanFromVideo(video);
      
      if (detectedBarcode) {
        console.log('✅ Barcode detected:', detectedBarcode);
        
        // Use the detected barcode to get nutrition info
        let result = await scanBarcode(detectedBarcode, currentUser.uid);
        
        // If barcode not found in database, use Grok AI to analyze the product
        if (!result) {
          console.log('🤖 Camera barcode not in database, using Grok AI to analyze product...');
          
          // Capture current video frame for AI analysis
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (video && ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            
            // Compress image for AI analysis
            const imageData = canvas.toDataURL('image/jpeg', 0.7);
            console.log('📸 Captured product image for Grok AI analysis...');
            
            // Send to Grok AI with barcode context
            const aiResult = await analyzeImageWithAI(imageData);
            if (aiResult) {
              // Add barcode to the AI result
              result = {
                ...aiResult,
                barcode: detectedBarcode,
                scanMethod: 'barcode',
                aiInsights: {
                  ...aiResult.aiInsights,
                  personalizedTips: [
                    ...aiResult.aiInsights.personalizedTips,
                    `Barcode: ${detectedBarcode}`,
                    'Product analyzed using AI vision since barcode not in database'
                  ]
                }
              };
              console.log('✨ Grok AI analysis complete for camera barcode:', detectedBarcode);
            }
          }
        }
        
        if (result) {
          // Enhance barcode result with AI analysis for allergen detection
          console.log('🧠 Enhancing barcode result with AI analysis...');
          
          // Check for allergy warnings based on user profile
          if (userProfile?.healthProfile?.allergies && userProfile.healthProfile.allergies.length > 0) {
            const warnings = checkForAllergyWarnings(result, userProfile.healthProfile.allergies);
            setAllergyWarnings(warnings);
            
            if (warnings.length > 0) {
              console.log('🚨 ALLERGY WARNINGS DETECTED:', warnings);
            }
          }
          
          setScanResult(result);
          stopCamera();
          await loadUserData();
        }
      } else {
        setError('No barcode detected. Please ensure the barcode is:\n• Clearly visible and well-lit\n• Within the red target area\n• Not blurry or distorted\n• A supported format (UPC, EAN, QR, etc.)');
      }
    } catch (error) {
      console.error('Error scanning barcode from camera:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to scan barcode: ${errorMessage}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    // Stop auto-scanning first
    stopAutoScanning();
    
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    console.log('📹 Camera stopped');
  };



  // Helper function to compress image aggressively for API limits
  const compressImage = (file: File, maxWidth: number = 400, quality: number = 0.4): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions with aggressive compression for API limits
        let { width, height } = img;
        const maxDimension = Math.max(width, height);
        
        // More aggressive size reduction
        if (maxDimension > maxWidth) {
          const ratio = maxWidth / maxDimension;
          width = width * ratio;
          height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress with aggressive settings
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Start with very aggressive compression
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // If still too large (>1MB), compress even more aggressively
        if (compressedDataUrl.length > 1 * 1024 * 1024) {
          compressedDataUrl = canvas.toDataURL('image/jpeg', 0.2);
        }
        
        // Final check - if still too large, reduce dimensions and quality further
        if (compressedDataUrl.length > 1 * 1024 * 1024) {
          canvas.width = width * 0.6;
          canvas.height = height * 0.6;
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          compressedDataUrl = canvas.toDataURL('image/jpeg', 0.15);
        }
        
        // Ultimate fallback - ensure under 500KB
        if (compressedDataUrl.length > 500 * 1024) {
          canvas.width = width * 0.4;
          canvas.height = height * 0.4;
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          compressedDataUrl = canvas.toDataURL('image/jpeg', 0.1);
        }
        
        console.log(`📸 Image compressed: ${(compressedDataUrl.length / 1024 / 1024).toFixed(2)}MB`);
        resolve(compressedDataUrl);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // Grok AI Analysis Functions
  const analyzeImageWithAI = async (imageData: string) => {
    try {
      setLoading(true);
      setError('');
      setAllergyWarnings([]); // Clear previous allergy warnings
      
      console.log('🤖 Starting Grok AI analysis...');
      
      const response = await fetch('/api/ai-analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });
      
      if (!response.ok) {
        throw new Error(`AI analysis failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('🎯 Grok AI analysis result:', result);
      console.log('📊 Raw result keys:', Object.keys(result));
      console.log('🔍 Result allergens:', result.allergens);
      console.log('🍽️ Result foodItems:', result.foodItems);
      console.log('💡 Result healthBenefits:', result.healthBenefits);
      console.log('⚠️ Result concerns:', result.concerns);
      console.log('💭 Result personalizedTips:', result.personalizedTips);
      console.log('🏥 Result nutritionalData:', result.nutritionalData);
      
      // 📊 COMPREHENSIVE GROK AI DATA EXTRACTION 📊
      console.log('🔍 Extracting comprehensive Grok AI data...');
      
      // Extract all food items (could be multiple foods in one image)
      const foodItems = result.foodItems || [];
      const primaryFood = foodItems[0] || {};
      const nutritionalData = result.nutritionalData || {};
      const nutritionalEstimate = nutritionalData.nutritionalEstimate || {};
      
      // Extract ALL allergens from multiple sources
      const directAllergens = result.allergens || []; // Direct allergen array
      const foodAllergens = foodItems.reduce((acc: string[], food: any) => {
        if (food.allergens && Array.isArray(food.allergens)) {
          acc.push(...food.allergens);
        }
        return acc;
      }, []);
      const nutritionAllergens = nutritionalData.allergens || [];
      
      // Combine and deduplicate all allergens
      const allAllergens = [...directAllergens, ...foodAllergens, ...nutritionAllergens];
      const uniqueAllergens = [...new Set(allAllergens)]
        .filter((allergen: any) => allergen && typeof allergen === 'string' && allergen.length > 0)
        .map((allergen: any) => (allergen as string).toLowerCase().trim());
      
      console.log('🧠 Extracted allergens:', uniqueAllergens);
      console.log('🍽️ Food items found:', foodItems.length);
      
      // Calculate comprehensive health score from multiple factors
      const calculateHealthScore = () => {
        let score = 70; // Base score
        
        // Factor in calories (lower is better for most foods)
        const calories = nutritionalEstimate.calories || nutritionalData.calories || 0;
        if (calories > 400) score -= 10;
        if (calories > 600) score -= 10;
        if (calories > 800) score -= 15;
        
        // Factor in allergen count
        score -= Math.min(uniqueAllergens.length * 3, 20);
        
        // Factor in warnings
        const warnings = nutritionalData.warnings || [];
        score -= Math.min(warnings.length * 5, 25);
        
        return Math.max(Math.min(score, 100), 0);
      };
      
      const healthScore = calculateHealthScore();
      const healthGrade = healthScore >= 90 ? 'A+' : 
                         healthScore >= 85 ? 'A' :
                         healthScore >= 80 ? 'B+' :
                         healthScore >= 75 ? 'B' :
                         healthScore >= 70 ? 'C+' :
                         healthScore >= 65 ? 'C' :
                         healthScore >= 60 ? 'D+' :
                         healthScore >= 55 ? 'D' : 'F';
      
      // Create comprehensive scan result with ALL Grok AI data
      const scanResult: NutritionScanResult = {
        userId: currentUser?.uid || '',
        timestamp: new Date(),
        scanMethod: 'ai_vision',
        confidence: result.confidence || 0.8,
        
        // Food identification - handle multiple foods
        foodItem: foodItems.length > 1 
          ? `${primaryFood.name || 'Mixed Food Items'} + ${foodItems.length - 1} other items`
          : primaryFood.name || foodItems.map((f: any) => f.name).join(', ') || 'Food Item',
        brand: primaryFood.brand || 'Unknown',
        category: primaryFood.category || 'Food',
        servingSize: primaryFood.servingSize || '1 serving',
        
        // Comprehensive nutritional data from multiple sources
        calories: nutritionalEstimate.calories || nutritionalData.calories || primaryFood.calories || 0,
        macros: {
          protein: nutritionalEstimate.protein || nutritionalData.protein || primaryFood.protein || 0,
          carbs: nutritionalEstimate.carbs || nutritionalData.carbohydrates || nutritionalData.carbs || primaryFood.carbs || 0,
          fat: nutritionalEstimate.fat || nutritionalData.fat || primaryFood.fat || 0,
          fiber: nutritionalData.fiber || primaryFood.fiber || 0,
          sugar: nutritionalData.sugar || primaryFood.sugar || 0,
          sodium: nutritionalData.sodium || primaryFood.sodium || 0,
        },
        
        // Enhanced micronutrients if available
        micronutrients: {
          vitaminA: nutritionalData.vitaminA || primaryFood.vitaminA,
          vitaminC: nutritionalData.vitaminC || primaryFood.vitaminC,
          vitaminD: nutritionalData.vitaminD || primaryFood.vitaminD,
          calcium: nutritionalData.calcium || primaryFood.calcium,
          iron: nutritionalData.iron || primaryFood.iron,
          potassium: nutritionalData.potassium || primaryFood.potassium,
        },
        
        // Health analysis
        healthScore: healthScore,
        healthGrade: healthGrade as any,
        
        // Comprehensive warnings and alerts
        allergens: uniqueAllergens,
        warnings: [
          ...(uniqueAllergens.length > 0 ? [`⚠️ ALLERGEN WARNING: Contains ${uniqueAllergens.join(', ')}`] : []),
          ...(nutritionalData.warnings || []),
          ...(result.warnings || [])
        ],
        dietaryFlags: [
          ...(result.dietaryFlags || []),
          ...(primaryFood.dietaryFlags || []),
          ...(nutritionalData.dietaryFlags || [])
        ],
        
        // Comprehensive AI insights from all sources
        aiInsights: {
          healthBenefits: [
            ...(result.healthBenefits || []),
            ...(nutritionalData.healthInsights || []),
            ...(primaryFood.benefits || [])
          ],
          concerns: [
            ...(result.healthConcerns || []),
            ...(result.concerns || []),
            ...(nutritionalData.concerns || []),
            ...(primaryFood.concerns || [])
          ],
          alternatives: [
            ...(result.alternatives || []),
            ...(nutritionalData.alternatives || []),
            ...(primaryFood.alternatives || [])
          ],
          personalizedTips: [
            ...(result.personalizedTips || []),
            ...(nutritionalData.tips || []),
            ...(primaryFood.tips || []),
            `Analyzed ${foodItems.length} food item${foodItems.length > 1 ? 's' : ''} using AI vision`,
            `Health score: ${healthScore}/100 (${healthGrade})`,
            ...(uniqueAllergens.length > 0 ? [`⚠️ Contains ${uniqueAllergens.length} allergen${uniqueAllergens.length > 1 ? 's' : ''}: ${uniqueAllergens.join(', ')}`] : []),
            `Nutritional estimate: ${nutritionalEstimate.calories || 'N/A'} cal, ${nutritionalEstimate.protein || 'N/A'}g protein`
          ]
        },
        
        // Store raw Grok AI data for future analysis
        notes: JSON.stringify({
          grokRawData: {
            foodItems: foodItems,
            nutritionalData: nutritionalData,
            allergens: result.allergens,
            timestamp: result.timestamp,
            success: result.success
          },
          analysisMetadata: {
            totalFoodItems: foodItems.length,
            totalAllergens: uniqueAllergens.length,
            confidenceScore: result.confidence || 0.8,
            analysisTimestamp: new Date().toISOString()
          }
        })
      };
      
      console.log('✨ Comprehensive scan result created:', {
        foodItems: foodItems.length,
        allergens: uniqueAllergens.length,
        healthScore: healthScore,
        calories: scanResult.calories,
        warnings: scanResult.warnings.length
      });
      
      console.log('🤖 Final AI Insights in scanResult:');
      console.log('  💪 Health Benefits:', scanResult.aiInsights.healthBenefits);
      console.log('  ⚠️ Concerns:', scanResult.aiInsights.concerns);
      console.log('  💡 Alternatives:', scanResult.aiInsights.alternatives);
      console.log('  📝 Tips:', scanResult.aiInsights.personalizedTips);
      
      // Save to Firebase if user is authenticated
      if (currentUser) {
        // Filter out undefined micronutrients
        const cleanMicronutrients = scanResult.micronutrients ? 
          Object.fromEntries(
            Object.entries(scanResult.micronutrients).filter(([_, value]) => value !== undefined)
          ) as Record<string, number> : undefined;
        
        await addNutritionEntry({
          userId: currentUser.uid,
          timestamp: new Date(),
          foodItem: scanResult.foodItem,
          calories: scanResult.calories,
          macros: scanResult.macros,
          micronutrients: cleanMicronutrients,
          scanMethod: 'ai_vision'
        });
      }
      
      return scanResult;
    } catch (error) {
      console.error('❌ Grok AI analysis failed:', error);
      setError(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const captureImageForAI = async () => {
    if (!videoRef.current || !currentUser) return;
    
    try {
      setLoading(true);
      setError('');
      setAllergyWarnings([]); // Clear previous allergy warnings
      
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      ctx?.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      console.log('📸 Captured image for AI analysis');
      
      const result = await analyzeImageWithAI(imageData);
      if (result) {
        setScanResult(result);
        stopCamera();
        await loadUserData();
      }
    } catch (error) {
      console.error('Error capturing image for AI:', error);
      setError('Failed to capture image for analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    
    try {
      setLoading(true);
      setError('');
      setAllergyWarnings([]); // Clear previous allergy warnings
      
      // Compress image aggressively before sending
      const compressedImageData = await compressImage(file, 600, 0.5);
      const result = await analyzeImageWithAI(compressedImageData);
      
      if (result) {
        setScanResult(result);
        await loadUserData(); // Refresh insights
      } else {
        setError('Unable to analyze the uploaded image.');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to process uploaded image.');
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthGradeColor = (grade: string): string => {
    if (grade.startsWith('A')) return 'bg-green-500';
    if (grade.startsWith('B')) return 'bg-blue-500';
    if (grade.startsWith('C')) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-[#121827] text-white">
      {/* Navigation Header */}
      <div className="bg-[#1e293b] border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 p-2 rounded-lg"
              >
                <Home className="h-5 w-5" />
                <span className="hidden sm:block">Home</span>
              </button>
              <div className="flex items-center">
                <Utensils className="h-8 w-8 text-[#3b82f6] mr-3" />
                <h1 className="text-xl font-bold">NutriLens AI Scanner</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 p-2 rounded-lg"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:block">Dashboard</span>
              </button>
              <button
                onClick={() => navigate('/community-pulse')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 p-2 rounded-lg"
              >
                <Users className="h-5 w-5" />
                <span className="hidden sm:block">Community Pulse</span>
              </button>
              <div className="text-right">
                <p className="text-sm font-medium">{currentUser?.displayName || 'User'}</p>
                <p className="text-xs text-gray-400">Smart Nutrition Analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#1e293b] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'scan', label: 'Scan Food', icon: Scan },
              { id: 'history', label: 'History', icon: Clock },
              { id: 'insights', label: 'AI Insights', icon: Brain },
              { id: 'goals', label: 'Goals', icon: Target },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-[#3b82f6] text-[#3b82f6]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'scan' && (
          <div className="space-y-6">
            {/* Scan Mode Selection */}
            <div className="bg-[#1e293b] rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Choose Scan Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setScanMode('barcode')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    scanMode === 'barcode'
                      ? 'border-[#3b82f6] bg-[#3b82f6]/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <Scan className="h-8 w-8 mx-auto mb-2 text-[#3b82f6]" />
                  <h4 className="font-medium">Barcode Scanner</h4>
                  <p className="text-sm text-gray-400">Most accurate results</p>
                </button>
                
                <button
                  onClick={() => setScanMode('camera')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    scanMode === 'camera'
                      ? 'border-[#3b82f6] bg-[#3b82f6]/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <Camera className="h-8 w-8 mx-auto mb-2 text-[#3b82f6]" />
                  <h4 className="font-medium">AI Vision</h4>
                  <p className="text-sm text-gray-400">Analyze any food</p>
                </button>
              </div>
            </div>

            {/* Scanning Interface */}
            <div className="bg-[#1e293b] rounded-lg p-6">
              {scanMode === 'barcode' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Advanced Barcode Scanner</h3>
                  <div className="space-y-4">
                    {!isScanning ? (
                      <div className="text-center space-y-4">
                        <div className="bg-[#121827] border border-gray-600 rounded-lg p-4">
                          <Scan className="h-12 w-12 mx-auto mb-3 text-[#3b82f6]" />
                          <h4 className="font-medium mb-2">Camera Barcode Scanner</h4>
                          <p className="text-sm text-gray-400 mb-4">
                            Uses your 3-day advanced scanner with native BarcodeDetector API and ZXing fallback
                          </p>
                          <button
                            onClick={startCameraCapture}
                            className="bg-[#3b82f6] text-white py-3 px-6 rounded-lg hover:bg-[#2563eb] flex items-center mx-auto"
                          >
                            <Camera className="h-5 w-5 mr-2" />
                            Start Barcode Scanner
                          </button>
                        </div>
                        
                        <div className="text-gray-500 text-sm">
                          <p>Or use manual input:</p>
                        </div>
                        
                        <form onSubmit={handleBarcodeSubmit} className="space-y-3">
                          <input
                            type="text"
                            value={barcodeInput}
                            onChange={(e) => setBarcodeInput(e.target.value)}
                            placeholder="Enter barcode manually (e.g., 1234567890123)"
                            className="w-full px-3 py-2 bg-[#121827] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#3b82f6] focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={loading || !barcodeInput.trim()}
                            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {loading ? (
                              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                            ) : (
                              <>
                                <Scan className="h-5 w-5 mr-2" />
                                Manual Lookup
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative">
                          <video
                            ref={videoRef}
                            className="w-full max-w-md mx-auto rounded-lg border-2 border-[#3b82f6]"
                            autoPlay
                            playsInline
                          />
                          <canvas ref={canvasRef} className="hidden" />
                          <div className="absolute inset-0 border-2 border-[#3b82f6] rounded-lg pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-red-500 rounded-lg">
                              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500"></div>
                              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500"></div>
                              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500"></div>
                              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500"></div>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="mb-3">
                            {isAutoScanning ? (
                              <div className="flex items-center justify-center text-green-400">
                                <div className="animate-pulse h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                                <span className="text-sm font-medium">Auto-scanning active</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center text-gray-400">
                                <div className="h-2 w-2 bg-gray-400 rounded-full mr-2"></div>
                                <span className="text-sm">Auto-scanning paused</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-4">
                            Point camera at barcode. Advanced scanner will detect automatically.
                          </p>
                        </div>
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={scanBarcodeFromCamera}
                            disabled={loading}
                            className="bg-[#3b82f6] text-white py-2 px-4 rounded-lg hover:bg-[#2563eb] disabled:opacity-50 flex items-center"
                          >
                            {loading ? (
                              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            ) : (
                              <Scan className="h-5 w-5 mr-2" />
                            )}
                            {loading ? 'Scanning...' : 'Manual Scan'}
                          </button>
                          <button
                            onClick={isAutoScanning ? stopAutoScanning : startAutoScanning}
                            className={`py-2 px-4 rounded-lg flex items-center ${
                              isAutoScanning 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : 'bg-gray-600 hover:bg-gray-500 text-white'
                            }`}
                          >
                            <div className={`h-2 w-2 rounded-full mr-2 ${
                              isAutoScanning ? 'bg-white animate-pulse' : 'bg-gray-300'
                            }`}></div>
                            {isAutoScanning ? 'Stop Auto' : 'Start Auto'}
                          </button>
                          <button
                            onClick={stopCamera}
                            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                          >
                            Stop Camera
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {scanMode === 'camera' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">AI Food Analysis</h3>
                  <div className="space-y-4">
                    {!isScanning ? (
                      <div className="text-center">
                        <button
                          onClick={startCameraCapture}
                          className="bg-[#3b82f6] text-white py-3 px-6 rounded-lg hover:bg-[#2563eb] flex items-center mx-auto"
                        >
                          <Camera className="h-5 w-5 mr-2" />
                          Start Camera
                        </button>
                        <div className="mt-4">
                          <p className="text-gray-400 mb-2">Or upload an image:</p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 flex items-center mx-auto"
                          >
                            <Upload className="h-5 w-5 mr-2" />
                            Upload Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative">
                          <video
                            ref={videoRef}
                            className="w-full max-w-md mx-auto rounded-lg"
                            autoPlay
                            playsInline
                          />
                          <canvas ref={canvasRef} className="hidden" />
                        </div>
                        <div className="flex justify-center space-x-4">
                          <button
                            onClick={captureImageForAI}
                            disabled={loading}
                            className="bg-[#3b82f6] text-white py-2 px-4 rounded-lg hover:bg-[#2563eb] disabled:opacity-50"
                          >
                            {loading ? 'Analyzing...' : 'Capture & Analyze with AI'}
                          </button>
                          <button
                            onClick={stopCamera}
                            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {scanMode === 'voice' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Voice Input</h3>
                  <div className="text-center">
                    <button className="bg-[#3b82f6] text-white py-3 px-6 rounded-lg hover:bg-[#2563eb] flex items-center mx-auto">
                      <Mic className="h-5 w-5 mr-2" />
                      Start Recording
                    </button>
                    <p className="text-gray-400 mt-2">Say what you ate, e.g., "I had a banana and yogurt"</p>
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Scan Result */}
            {scanResult && (
              <div className="bg-[#1e293b] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Scan Result</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthGradeColor(scanResult.healthGrade)}`}>
                    Grade {scanResult.healthGrade}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-[#3b82f6] mb-2">Product Information</h4>
                    <div className="space-y-2">
                      <p><span className="text-gray-400">Name:</span> {scanResult.foodItem}</p>
                      {scanResult.brand && <p><span className="text-gray-400">Brand:</span> {scanResult.brand}</p>}
                      <p><span className="text-gray-400">Category:</span> {scanResult.category}</p>
                      <p><span className="text-gray-400">Serving Size:</span> {scanResult.servingSize}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-[#3b82f6] mb-2">Health Score</h4>
                    <div className="flex items-center space-x-4">
                      <div className={`text-3xl font-bold ${getHealthScoreColor(scanResult.healthScore)}`}>
                        {scanResult.healthScore}/100
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              scanResult.healthScore >= 80 ? 'bg-green-500' :
                              scanResult.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${scanResult.healthScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-[#3b82f6] mb-2">Nutrition Facts</h4>
                    <div className="bg-[#121827] rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-400">{scanResult.calories}</p>
                          <p className="text-sm text-gray-400">Calories</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-400">{scanResult.macros.protein}g</p>
                          <p className="text-sm text-gray-400">Protein</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-400">{scanResult.macros.carbs}g</p>
                          <p className="text-sm text-gray-400">Carbs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-yellow-400">{scanResult.macros.fat}g</p>
                          <p className="text-sm text-gray-400">Fat</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-[#3b82f6] mb-2">AI Insights</h4>
                    <div className="space-y-2">
                      {scanResult.aiInsights.healthBenefits.map((benefit, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-300">{benefit}</p>
                        </div>
                      ))}
                      {scanResult.aiInsights.concerns.map((concern, index) => (
                        <div key={index} className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-300">{concern}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {scanResult.allergens.length > 0 && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500 rounded-lg">
                    <h4 className="font-medium text-red-400 mb-2">⚠️ Allergen Warning</h4>
                    <p className="text-sm text-gray-300">
                      Contains: {scanResult.allergens.join(', ')}
                    </p>
                  </div>
                )}
                
                {/* Personalized Allergy Warnings for Barcode Scans */}
                {allergyWarnings.length > 0 && (
                  <div className="mt-4 p-4 bg-red-600/20 border-2 border-red-500 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                      <h4 className="font-bold text-red-400">🚨 PERSONAL ALLERGY ALERT</h4>
                    </div>
                    <p className="text-sm text-red-300 mb-2">
                      This product may contain allergens from your profile:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {allergyWarnings.map((allergen, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-medium"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-red-300 mt-2">
                      ⚠️ Please check the ingredient list carefully before consuming.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-[#1e293b] rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">AI Health Insights</h3>
              {healthInsights.length > 0 ? (
                <div className="space-y-4">
                  {healthInsights.map((insight, index) => (
                    <div key={index} className="bg-[#121827] rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-[#3b82f6] mb-1">{insight.title}</h4>
                          <p className="text-gray-300 mb-2">{insight.description}</p>
                          {insight.actionItems.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-400 mb-1">Recommended Actions:</p>
                              <ul className="text-sm text-gray-300 space-y-1">
                                {insight.actionItems.map((action, actionIndex) => (
                                  <li key={actionIndex} className="flex items-start">
                                    <span className="text-[#3b82f6] mr-2">•</span>
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          insight.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                          insight.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {insight.severity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Start scanning foods to get personalized AI insights!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutriLens;
