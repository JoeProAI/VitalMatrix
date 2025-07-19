// Custom barcode scanner using modern Web APIs
// This approach is more reliable than external libraries

// Native BarcodeDetector result type
interface DetectedBarcode {
  boundingBox: DOMRectReadOnly;
  rawValue: string;
  format: string;
  cornerPoints: { x: number; y: number; }[];
}

// Native BarcodeDetector types
interface NativeBarcodeDetector {
  detect(imageData: ImageData | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement): Promise<DetectedBarcode[]>;
}

interface NativeBarcodeDetectorConstructor {
  new(options?: { formats: string[] }): NativeBarcodeDetector;
}

export class CustomBarcodeScanner {
  private detector: NativeBarcodeDetector | null = null;
  private isSupported: boolean = false;

  constructor() {
    this.initializeDetector();
  }

  private initializeDetector() {
    // Only initialize in browser environment (not during SSR)
    if (typeof window === 'undefined') {
      console.log('ℹ️  Running in SSR environment, skipping barcode detector initialization');
      this.isSupported = false;
      return;
    }

    // Check if the browser supports the native BarcodeDetector API
    if ('BarcodeDetector' in window) {
      try {
        this.detector = new (window as any).BarcodeDetector({
          formats: [
            'code_128',
            'code_93',
            'code_39',
            'codabar',
            'ean_13',
            'ean_8',
            'upc_a',
            'upc_e',
            'qr_code',
            'pdf417',
            'data_matrix'
          ]
        });
        this.isSupported = true;
        console.log('✅ Native BarcodeDetector API initialized successfully');
      } catch (error) {
        console.warn('⚠️  Native BarcodeDetector API failed to initialize:', error);
        this.isSupported = false;
      }
    } else {
      console.log('📱 Using enhanced barcode scanning (compatible mode)');
      this.isSupported = false;
    }
  }

  public async scanFromCanvas(canvas: HTMLCanvasElement): Promise<string | null> {
    // Return null during SSR
    if (typeof window === 'undefined') {
      return null;
    }

    if (!this.isSupported || !this.detector) {
      return await this.fallbackScan(canvas);
    }

    try {
      const results = await this.detector.detect(canvas);
      if (results && results.length > 0) {
        console.log('✅ Barcode detected:', results[0].rawValue, 'Format:', results[0].format);
        return results[0].rawValue;
      }
    } catch (error) {
      console.warn('⚠️  Canvas scanning failed:', error);
      return await this.fallbackScan(canvas);
    }

    return null;
  }

  public async scanFromVideo(video: HTMLVideoElement): Promise<string | null> {
    // Return null during SSR
    if (typeof window === 'undefined') {
      return null;
    }

    if (!this.isSupported || !this.detector) {
      return await this.fallbackScanFromVideo(video);
    }

    try {
      const results = await this.detector.detect(video);
      if (results && results.length > 0) {
        console.log('✅ Barcode detected from video:', results[0].rawValue, 'Format:', results[0].format);
        return results[0].rawValue;
      }
    } catch (error) {
      console.warn('❌ Native barcode detection from video failed:', error);
      return this.fallbackScanFromVideo(video);
    }

    return null;
  }

  private async fallbackScan(canvas: HTMLCanvasElement): Promise<string | null> {
    console.log('🔄 Using fallback barcode scanning...');
    
    // Try to use ZXing as fallback if available
    try {
      const ZXing = await import('@zxing/browser');
      const { DecodeHintType, BarcodeFormat } = await import('@zxing/library');
      
      // Create hints for better barcode detection
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.QR_CODE,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_93,
        BarcodeFormat.CODE_39,
        BarcodeFormat.CODABAR,
        BarcodeFormat.ITF,
        BarcodeFormat.RSS_14,
        BarcodeFormat.RSS_EXPANDED
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      hints.set(DecodeHintType.PURE_BARCODE, false);
      
      // Create a properly configured reader with hints
      let reader;
      try {
        reader = new ZXing.BrowserMultiFormatReader(hints);
        console.log('📋 ZXing reader created with format hints:', [
          'QR_CODE', 'EAN_13', 'EAN_8', 'UPC_A', 'UPC_E', 'CODE_128', 'CODE_93', 'CODE_39'
        ]);
      } catch (hintError) {
        console.log('⚠️ Failed to create reader with hints, using default:', hintError.message);
        try {
          reader = new ZXing.BrowserMultiFormatReader();
          console.log('📋 ZXing reader created with default settings');
        } catch (defaultError) {
          console.log('❌ Failed to create ZXing reader:', defaultError.message);
          return this.simplePatternRecognition(canvas);
        }
      }
      
      // Make sure canvas has proper dimensions
      if (canvas.width === 0 || canvas.height === 0) {
        console.log('❌ Canvas has invalid dimensions:', canvas.width, 'x', canvas.height);
        return this.simplePatternRecognition(canvas);
      }
      
      console.log('📐 Canvas dimensions:', canvas.width, 'x', canvas.height);
      
      // Method 1: Try decoding from canvas directly
      try {
        console.log('🔄 Trying ZXing decodeFromCanvas...');
        const result = await reader.decodeFromCanvas(canvas);
        if (result && result.getText()) {
          console.log('✅ ZXing canvas decode successful:', result.getText());
          return result.getText();
        }
      } catch (err) {
        console.log('❌ ZXing decodeFromCanvas failed:', err.message);
      }
      
      // Method 2: Try with ImageData
      try {
        console.log('🔄 Trying ZXing with ImageData...');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (context) {
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          console.log('📊 ImageData size:', imageData.width, 'x', imageData.height);
          
          // Create a new canvas for ZXing with the imageData
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = imageData.width;
          tempCanvas.height = imageData.height;
          const tempContext = tempCanvas.getContext('2d');
          
          if (tempContext) {
            tempContext.putImageData(imageData, 0, 0);
            const result = await reader.decodeFromCanvas(tempCanvas);
            if (result && result.getText()) {
              console.log('✅ ZXing ImageData decode successful:', result.getText());
              return result.getText();
            }
          }
        }
      } catch (err) {
        console.log('❌ ZXing ImageData decode failed:', err.message);
      }
      
      // Method 3: Try creating a fresh canvas with better quality
      try {
        console.log('🔄 Trying ZXing with enhanced canvas...');
        const context = canvas.getContext('2d');
        if (context) {
          // Create a high-contrast version
          const enhancedCanvas = document.createElement('canvas');
          enhancedCanvas.width = canvas.width;
          enhancedCanvas.height = canvas.height;
          const enhancedContext = enhancedCanvas.getContext('2d');
          
          if (enhancedContext) {
            // Copy the original image
            enhancedContext.drawImage(canvas, 0, 0);
            
            // Apply contrast enhancement
            const imageData = enhancedContext.getImageData(0, 0, enhancedCanvas.width, enhancedCanvas.height);
            const data = imageData.data;
            
            // Increase contrast
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              const enhanced = avg > 128 ? 255 : 0; // High contrast black/white
              data[i] = enhanced;     // Red
              data[i + 1] = enhanced; // Green
              data[i + 2] = enhanced; // Blue
            }
            
            enhancedContext.putImageData(imageData, 0, 0);
            
            const result = await reader.decodeFromCanvas(enhancedCanvas);
            if (result && result.getText()) {
              console.log('✅ ZXing enhanced decode successful:', result.getText());
              return result.getText();
            }
          }
        }
      } catch (err) {
        console.log('❌ ZXing enhanced decode failed:', err.message);
      }
      
    } catch (importError) {
      console.warn('⚠️ ZXing not available for fallback:', importError);
    }
    
    // If ZXing fails, try simple pattern recognition
    return this.simplePatternRecognition(canvas);
  }

  private async fallbackScanFromVideo(video: HTMLVideoElement): Promise<string | null> {
    // Create a canvas to capture the video frame
    const canvas = document.createElement('canvas');
    
    // Get video dimensions, fallback to reasonable defaults if not available
    const width = video.videoWidth || video.clientWidth || 640;
    const height = video.videoHeight || video.clientHeight || 480;
    
    canvas.width = width;
    canvas.height = height;
    
    console.log('🎥 Capturing video frame:', width, 'x', height);
    
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      console.log('❌ Failed to get canvas context');
      return null;
    }

    // Ensure video is ready and has valid dimensions
    if (video.readyState >= 2 && width > 0 && height > 0) {
      context.drawImage(video, 0, 0, width, height);
      console.log('✅ Video frame captured successfully');
      return this.fallbackScan(canvas);
    } else {
      console.log('❌ Video not ready or invalid dimensions. ReadyState:', video.readyState);
      return null;
    }
  }

  private simplePatternRecognition(canvas: HTMLCanvasElement): string | null {
    console.log('🔍 Using simple pattern recognition...');
    
    // This is a very basic pattern recognition
    // In production, you'd want a more sophisticated algorithm
    const context = canvas.getContext('2d');
    if (!context) return null;
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;
    
    // Look for vertical line patterns typical of barcodes
    let lineCount = 0;
    const threshold = 100;
    
    for (let x = 0; x < width - 1; x++) {
      let verticalEdges = 0;
      for (let y = 0; y < height; y++) {
        const currentPixel = (y * width + x) * 4;
        const nextPixel = (y * width + x + 1) * 4;
        
        // Convert to grayscale
        const currentGray = (data[currentPixel] + data[currentPixel + 1] + data[currentPixel + 2]) / 3;
        const nextGray = (data[nextPixel] + data[nextPixel + 1] + data[nextPixel + 2]) / 3;
        
        // Check for significant change (edge)
        if (Math.abs(currentGray - nextGray) > threshold) {
          verticalEdges++;
        }
      }
      
      if (verticalEdges > height * 0.2) {
        lineCount++;
      }
    }
    
    // If we detect patterns, log it but can't decode actual value
    if (lineCount > 15) {
      console.log('🔍 Pattern detected but cannot decode - need proper barcode library');
    }
    
    return null; // Cannot decode actual barcode value with simple pattern recognition
  }

  public isNativeSupported(): boolean {
    // Return false during SSR
    if (typeof window === 'undefined') {
      return false;
    }
    return this.isSupported;
  }

  public getSupportedFormats(): string[] {
    // Return empty array during SSR
    if (typeof window === 'undefined') {
      return [];
    }
    
    if (this.isSupported) {
      return [
        'code_128', 'code_93', 'code_39', 'codabar',
        'ean_13', 'ean_8', 'upc_a', 'upc_e',
        'qr_code', 'pdf417', 'data_matrix'
      ];
    }
    return ['fallback_pattern_recognition'];
  }
}

export const barcodeScanner = new CustomBarcodeScanner();
