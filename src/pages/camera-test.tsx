import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function CameraTest() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Add log messages that appear on screen for debugging
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().substr(11, 8)}: ${message}`]);
  };

  // List available cameras
  useEffect(() => {
    async function getDevices() {
      try {
        addLog('Checking available devices...');
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setDevices(cameras);
        addLog(`Found ${cameras.length} camera(s)`);
        
        // Log all cameras found
        cameras.forEach((camera, index) => {
          addLog(`Camera ${index+1}: ${camera.label || 'Unlabeled camera'}`);
        });
        
        if (cameras.length > 0) {
          // Find first camera that doesn't have 'OBS' or 'Virtual' in its name
          const physicalCamera = cameras.find(camera => {
            const label = (camera.label || '').toLowerCase();
            return !label.includes('obs') && !label.includes('virtual');
          });
          
          // If found a physical camera, use it, otherwise fall back to first camera
          if (physicalCamera) {
            setSelectedDevice(physicalCamera.deviceId);
            addLog(`Selected physical camera: ${physicalCamera.label}`);
          } else {
            setSelectedDevice(cameras[0].deviceId);
            addLog(`No physical camera found, using first available: ${cameras[0].label || 'Unknown camera'}`);
          }
        }
      } catch (err: any) {
        addLog(`Error listing cameras: ${err.message || 'Unknown error'}`);
        setError(`Failed to list cameras: ${err.message || 'Unknown error'}`);
      }
    }
    
    getDevices();
  }, []);

  // Check permissions explicitly
  const checkPermissions = async () => {
    addLog('Checking camera permissions...');
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
      addLog(`Permission status: ${permissionStatus.state}`);
      return permissionStatus.state;
    } catch (err: any) {
      addLog(`Permission check failed: ${err.message || 'Unknown error'}`);
      return 'unknown';
    }
  };

  // Start camera with explicit permission handling
  const startCamera = async () => {
    if (streamRef.current) {
      addLog('Stopping previous camera stream');
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    try {
      addLog('Requesting camera access...');
      const permState = await checkPermissions();
      
      if (permState === 'denied') {
        addLog('Permission explicitly denied');
        setHasPermission(false);
        setError('Camera permission denied. Please enable it in your browser settings.');
        return;
      }
      
      addLog(`Attempting to access camera: ${selectedDevice}`);
      
      // Request with basic constraints first
      const constraints = {
        video: { 
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      };
      
      addLog(`Using constraints: ${JSON.stringify(constraints)}`);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);
        addLog('Camera started successfully!');
      } else {
        addLog('Video reference not found');
      }
    } catch (err: any) {
      addLog(`Camera error: ${err.message || err.name || 'Unknown error'}`);
      setError(`Failed to access camera: ${err.message || err.name || 'Unknown error'}`);
      setHasPermission(false);
    }
  };

  // Handle device selection
  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDevice(e.target.value);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Head>
        <title>Camera Permission Test</title>
        <meta name="description" content="Test camera permissions for NutriLens" />
      </Head>
      
      <h1 style={{ marginBottom: '20px' }}>Camera Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Select Camera:
          <select 
            value={selectedDevice} 
            onChange={handleDeviceChange}
            style={{ 
              marginLeft: '10px', 
              padding: '8px', 
              borderRadius: '4px',
              border: '1px solid #ccc' 
            }}
          >
            {devices.length === 0 ? (
              <option value="">No cameras found</option>
            ) : (
              devices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.substr(0, 5)}...`}
                </option>
              ))
            )}
          </select>
        </label>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={startCamera}
          style={{
            padding: '10px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Start Camera
        </button>
      </div>
      
      {error && (
        <div style={{ 
          backgroundColor: '#FFEBEE', 
          color: '#C62828', 
          padding: '12px', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '20px',
        backgroundColor: '#000'
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: '100%', height: 'auto', maxHeight: '400px' }}
        />
      </div>
      
      <div>
        <h3>Debug Logs:</h3>
        <div style={{ 
          backgroundColor: '#F5F5F5', 
          padding: '12px', 
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '14px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '4px' }}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
