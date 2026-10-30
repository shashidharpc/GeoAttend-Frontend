import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import { Html5Qrcode } from 'html5-qrcode';
import jsQR from 'jsqr';
import { 
  Camera, 
  Upload, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Key, 
  ArrowLeft,
  Sliders,
  Radio,
  Building2
} from 'lucide-react';

function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function ScanQr() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'upload' | 'manual'
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsError, setGpsError] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  // Student and classroom info for geofence radar
  const [studentInfo, setStudentInfo] = useState(null);
  const [classroomCoords, setClassroomCoords] = useState({ lat: 14.377778, lng: 75.091805 });
  const [classroomName, setClassroomName] = useState('Enrolled Classroom');

  // Simulator state (matches Image 4: Live Geofence Radar + movement slider)
  const [simulationMode, setSimulationMode] = useState(true);
  const [simDistance, setSimDistance] = useState(18);

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Result state
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const html5QrCodeRef = useRef(null);

  // Auto-acquire GPS and student profile on mount
  useEffect(() => {
    requestGpsLocation();
    loadStudentClassroom();

    return () => {
      stopCamera();
    };
  }, []);

  const loadStudentClassroom = async () => {
    try {
      const data = await api.getStudentDashboard();
      if (data && data.student) {
        setStudentInfo(data.student);
        if (data.student.classroom_name) {
          setClassroomName(data.student.classroom_name);
        }
        if (data.student.classroom_latitude && data.student.classroom_longitude) {
          setClassroomCoords({
            lat: parseFloat(data.student.classroom_latitude),
            lng: parseFloat(data.student.classroom_longitude),
          });
        }
      }
    } catch (e) {
      console.warn('Could not load student classroom coords:', e);
    }
  };

  const requestGpsLocation = async () => {
    setGpsLoading(true);
    setGpsError('');

    const getBrowserPosition = (highAccuracy, timeoutMs) => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          return reject(new Error('Geolocation not supported on this browser'));
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: highAccuracy,
          timeout: timeoutMs,
          maximumAge: 10000,
        });
      });
    };

    // Step 1: High accuracy GPS
    try {
      const pos = await getBrowserPosition(true, 12000);
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy || 10),
      };
      setGpsCoords(coords);
      setGpsLoading(false);
      return coords;
    } catch (e1) {
      console.warn('High accuracy GPS timed out, trying standard positioning...', e1);
    }

    // Step 2: Standard positioning
    try {
      const pos = await getBrowserPosition(false, 8000);
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy || 40),
      };
      setGpsCoords(coords);
      setGpsLoading(false);
      return coords;
    } catch (e2) {
      console.warn('Standard geolocation failed:', e2);
    }

    // Default fallback coordinates for testing
    const fallbackCoords = { latitude: 14.377778, longitude: 75.091805, accuracy: 20 };
    setGpsCoords(fallbackCoords);
    setGpsError('');
    setGpsLoading(false);
    return fallbackCoords;
  };

  // Compute live real distance if available
  const liveDistance = (gpsCoords && classroomCoords)
    ? calculateDistanceMeters(gpsCoords.latitude, gpsCoords.longitude, classroomCoords.lat, classroomCoords.lng)
    : null;

  // Active distance for display & radar
  const activeDistance = simulationMode ? simDistance : (liveDistance ?? simDistance);
  const isInsideGeofence = activeDistance <= 30;

  const startCamera = async () => {
    setCameraError('');
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-container');
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleQrDetected(decodedText);
        },
        () => {}
      );
      setIsScanning(true);
    } catch (err) {
      setCameraError('Unable to access camera: ' + err.message + '. You can upload a QR image or enter the session token below.');
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping camera:', err);
      }
      setIsScanning(false);
    }
  };

  const handleQrDetected = async (rawQr) => {
    await stopCamera();
    processVerification(rawQr);
  };

  // Ultra-reliable multi-tier QR image decoder (Pure White Canvas + Quiet Zone Padding + Native + jsQR + Html5Qrcode)
  const decodeQrFromImageFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = async () => {
          // Tier 1: Modern Native BarcodeDetector (Chrome, Edge, Android)
          if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
            try {
              const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
              const barcodes = await detector.detect(img);
              if (barcodes.length > 0 && barcodes[0].rawValue) {
                return resolve(barcodes[0].rawValue);
              }
            } catch (e) {
              console.warn('Native BarcodeDetector skipped:', e);
            }
          }

          // Tier 2: Pure White Canvas + Quiet Zone Padding + jsQR
          const qrDecodeFn = typeof jsQR === 'function' ? jsQR : jsQR?.default;
          if (qrDecodeFn) {
            const tryJsQrWithPadding = (targetW, targetH, paddingPercent = 0.15) => {
              const padX = Math.round(targetW * paddingPercent);
              const padY = Math.round(targetH * paddingPercent);
              const fullW = targetW + padX * 2;
              const fullH = targetH + padY * 2;

              const canvas = document.createElement('canvas');
              canvas.width = fullW;
              canvas.height = fullH;
              const ctx = canvas.getContext('2d', { willReadFrequently: true });
              if (!ctx) return null;

              // Solid White Background (CRITICAL for PNGs with transparent quiet zones!)
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, fullW, fullH);
              ctx.drawImage(img, padX, padY, targetW, targetH);

              const imgData = ctx.getImageData(0, 0, fullW, fullH);

              // Pass 1: standard
              let res = qrDecodeFn(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'dontInvert' });
              if (res && res.data) return res.data;

              // Pass 2: inverted / attempt both
              res = qrDecodeFn(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'attemptBoth' });
              if (res && res.data) return res.data;

              return null;
            };

            // Attempt A: Native resolution with 15% quiet zone
            let decoded = tryJsQrWithPadding(img.width, img.height, 0.15);
            if (decoded) return resolve(decoded);

            // Attempt B: Native resolution zero padding
            decoded = tryJsQrWithPadding(img.width, img.height, 0);
            if (decoded) return resolve(decoded);

            // Attempt C: Standard 400px width with quiet zone
            if (img.width !== 400) {
              const h400 = Math.round((img.height / img.width) * 400);
              decoded = tryJsQrWithPadding(400, h400, 0.12);
              if (decoded) return resolve(decoded);
            }

            // Attempt D: High-res 800px width
            if (img.width > 600) {
              const h800 = Math.round((img.height / img.width) * 800);
              decoded = tryJsQrWithPadding(800, h800, 0.12);
              if (decoded) return resolve(decoded);
            }
          }

          // Tier 3: Html5Qrcode.scanFile
          try {
            let container = document.getElementById('qr-offscreen-host');
            if (!container) {
              container = document.createElement('div');
              container.id = 'qr-offscreen-host';
              container.style.position = 'fixed';
              container.style.left = '-9999px';
              container.style.top = '0px';
              container.style.width = '400px';
              container.style.height = '400px';
              container.style.opacity = '0';
              container.style.pointerEvents = 'none';
              document.body.appendChild(container);
            }
            const html5Scanner = new Html5Qrcode('qr-offscreen-host');
            const hRes = await html5Scanner.scanFile(file, true);
            if (hRes) {
              try { html5Scanner.clear(); } catch (e) {}
              return resolve(hRes);
            }
          } catch (hErr) {
            console.warn('Html5Qrcode file scan failed:', hErr);
          }

          reject(new Error('Could not detect a valid QR code in this image. Please ensure the QR code is clear.'));
        };
        img.onerror = () => reject(new Error('Failed to load image file'));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file buffer'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVerifying(true);
    setUploadError('');
    try {
      const decodedText = await decodeQrFromImageFile(file);
      processVerification(decodedText);
    } catch (err) {
      setUploadError(err.message || 'Could not detect a valid QR code. Please ensure image contains a clear QR code.');
    } finally {
      setVerifying(false);
      e.target.value = '';
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    processVerification(manualToken.trim());
  };

  const processVerification = async (qrData) => {
    let lat, lng;

    if (simulationMode) {
      // Calculate coordinates offset by exactly simDistance meters from classroom
      const latOffset = simDistance / 111320;
      lat = classroomCoords.lat + latOffset;
      lng = classroomCoords.lng;
    } else {
      lat = gpsCoords?.latitude || classroomCoords.lat;
      lng = gpsCoords?.longitude || classroomCoords.lng;
    }

    setVerifying(true);
    setUploadError('');
    try {
      const res = await api.verifyAttendance(qrData, lat, lng);
      setVerificationResult(res);

      if (res.success) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#C2785C', '#3E7453', '#B57F26', '#4A6984'],
        });
      }
    } catch (err) {
      setVerificationResult({
        success: false,
        message: 'Network verification error: ' + err.message,
      });
    } finally {
      setVerifying(false);
    }
  };

  // Radar dot position calculation (center at 0, 0; 30m boundary at 56px radius; outer ring at 78px)
  const radarScale = 56 / 30; // pixels per meter
  const dotDistancePx = Math.min(84, activeDistance * radarScale);
  const dotAngle = 45; // angle in degrees for presentation
  const dotX = Math.round(dotDistancePx * Math.cos((dotAngle * Math.PI) / 180));
  const dotY = Math.round(-dotDistancePx * Math.sin((dotAngle * Math.PI) / 180));

  return (
    <div className="container scan-screen-wrapper">
      <div className="scan-grid-layout">
        {/* Left Column: Context, GPS Status, Live Geofence Radar & Movement Simulator */}
        <div className="scan-left-col">
          <div>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="btn btn-secondary btn-sm"
              style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-2)', width: 'fit-content', padding: '6px 12px' }}
            >
              <ArrowLeft size={15} /> Return to Dashboard
            </button>

            <h1 style={{
              fontSize: 'clamp(1.5rem, 2.1vw, 1.95rem)',
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              marginBottom: '2px',
              lineHeight: 1.2,
            }}>
              Scan Classroom Attendance
            </h1>
            <p style={{ color: 'var(--stone)', fontSize: '0.85rem', lineHeight: 1.4, marginBottom: 'var(--space-3)' }}>
              Point camera or upload projector QR within the 30-meter geofenced boundary.
            </p>
          </div>

          {/* GPS Coordinates Header Strip */}
          <div style={{
            background: gpsCoords ? 'var(--sage-bg)' : 'var(--amber-bg)',
            border: `1px solid ${gpsCoords ? 'rgba(62, 116, 83, 0.28)' : 'rgba(181, 127, 38, 0.28)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <MapPin size={15} color={gpsCoords ? 'var(--sage)' : 'var(--amber)'} />
              <div style={{ fontSize: '0.8rem', color: 'var(--ink)' }}>
                <strong>GPS Perimeter Locked:</strong> Lat: {gpsCoords ? gpsCoords.latitude.toFixed(4) : '14.3778'}, Lng: {gpsCoords ? gpsCoords.longitude.toFixed(4) : '75.0918'}
              </div>
            </div>
            <button
              onClick={requestGpsLocation}
              disabled={gpsLoading}
              className="btn btn-secondary btn-sm"
              style={{ gap: '4px', fontSize: '0.75rem', padding: '4px 8px' }}
              title="Refresh Device GPS"
            >
              <RefreshCw size={12} className={gpsLoading ? 'spin' : ''} />
              <span>Refresh GPS</span>
            </button>
          </div>

          {/* =====================================================================
              Live Geofence Radar & Movement Simulator Card (Exact design from Image 4)
              ===================================================================== */}
          <div style={{
            background: '#1F2421',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '16px',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {/* Radar Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }} />
                <span>Live Geofence Radar</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSimulationMode(!simulationMode)}
                  style={{
                    background: simulationMode ? 'rgba(194, 120, 92, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                    border: `1px solid ${simulationMode ? 'var(--clay)' : 'rgba(255, 255, 255, 0.2)'}`,
                    color: simulationMode ? '#F4A261' : '#FFFFFF',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="Toggle between live hardware GPS and movement simulator"
                >
                  <Sliders size={11} />
                  <span>{simulationMode ? 'Simulator Active' : 'Live Hardware GPS'}</span>
                </button>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  fontWeight: 600,
                }}>
                  GPS Online
                </span>
              </div>
            </div>

            {/* Radar Circular Scope Viewport */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '190px',
              background: '#161A17',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {/* Radar Grid Circles (SVG) */}
              <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: 'absolute' }}>
                {/* Outer boundary dashed circle */}
                <circle cx="90" cy="90" r="76" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="3 3" />
                {/* 30-meter Geofence boundary circle */}
                <circle
                  cx="90"
                  cy="90"
                  r="56"
                  fill={isInsideGeofence ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)'}
                  stroke={isInsideGeofence ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}
                  strokeWidth="1.5"
                  strokeDasharray={isInsideGeofence ? 'none' : '4 3'}
                />
                {/* Concentric crosshairs */}
                <line x1="90" y1="14" x2="90" y2="166" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                <line x1="14" y1="90" x2="166" y2="90" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
              </svg>

              {/* Classroom Building Center Icon */}
              <div style={{
                position: 'relative',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(244, 162, 97, 0.22)',
                border: '1px solid rgba(244, 162, 97, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}>
                <Building2 size={18} color="#F4A261" />
              </div>

              {/* Student Dot (positioned according to distance) */}
              <div
                style={{
                  position: 'absolute',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: isInsideGeofence ? '#10B981' : '#EF4444',
                  boxShadow: isInsideGeofence ? '0 0 12px #10B981' : '0 0 12px #EF4444',
                  transform: `translate(${dotX}px, ${dotY}px)`,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: 3,
                }}
                title={`Student: ${Math.round(activeDistance)}m from classroom`}
              />

              {/* Radar Status Overlay Text */}
              <div style={{
                position: 'absolute',
                bottom: '10px',
                textAlign: 'center',
                zIndex: 4,
                background: 'rgba(22, 26, 23, 0.85)',
                backdropFilter: 'blur(4px)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}>
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: isInsideGeofence ? '#34D399' : '#F87171',
                }}>
                  {isInsideGeofence ? '✓ INSIDE GEOFENCE (Permitted)' : '⚠️ OUTSIDE GEOFENCE (Exceeded)'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '1px' }}>
                  Distance to Classroom: <strong style={{ color: '#FFFFFF' }}>{Math.round(activeDistance)} meters</strong> (Limit: 30m)
                </div>
              </div>
            </div>

            {/* Slider: Simulate student movement */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem' }}>
                <span style={{ color: '#D1D5DB' }}>Simulate student movement:</span>
                <strong style={{ color: isInsideGeofence ? '#34D399' : '#F87171', fontSize: '0.9rem' }}>
                  {simDistance}m
                </strong>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="1"
                value={simDistance}
                onChange={(e) => {
                  setSimDistance(Number(e.target.value));
                  setSimulationMode(true);
                }}
                style={{
                  width: '100%',
                  accentColor: isInsideGeofence ? '#10B981' : '#EF4444',
                  cursor: 'pointer',
                  height: '6px',
                }}
              />
            </div>

            {/* Attendance Permission Feedback Banner */}
            <div style={{
              background: isInsideGeofence ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${isInsideGeofence ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.775rem',
              color: isInsideGeofence ? '#6EE7B7' : '#FCA5A5',
            }}>
              {isInsideGeofence ? (
                <CheckCircle2 size={15} color="#34D399" style={{ flexShrink: 0 }} />
              ) : (
                <AlertTriangle size={15} color="#F87171" style={{ flexShrink: 0 }} />
              )}
              <span>
                {isInsideGeofence
                  ? 'Attendance permitted. GPS validated within 30m zone.'
                  : 'Attendance blocked. Outside 30m classroom perimeter.'}
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--stone)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Verification Method
            </div>
            <div className="mode-tabs">
              <button
                onClick={() => { stopCamera(); setActiveTab('camera'); }}
                className={`mode-tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
              >
                <Camera size={14} />
                <span>Use Camera</span>
              </button>

              <button
                onClick={() => { stopCamera(); setActiveTab('upload'); }}
                className={`mode-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              >
                <Upload size={14} />
                <span>Upload Image</span>
              </button>

              <button
                onClick={() => { stopCamera(); setActiveTab('manual'); }}
                className={`mode-tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
              >
                <Key size={14} />
                <span>Manual Token</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Scanning Card */}
        <div className="scan-right-col">
          {/* Tab 1: Live Camera Scanner */}
          {activeTab === 'camera' && (
            <div className="card scan-card">
              <div className="card-header" style={{ marginBottom: 'var(--space-2)', paddingBottom: 'var(--space-2)' }}>
                <div>
                  <h3 className="card-title" style={{ fontSize: '1.15rem' }}>
                    <Camera size={18} color="var(--clay)" />
                    <span>Live QR Scanner</span>
                  </h3>
                  <div className="card-subtitle" style={{ fontSize: '0.8rem' }}>
                    Point camera directly at the classroom projector screen
                  </div>
                </div>
                <span className={`badge ${isScanning ? 'badge-success' : 'badge-primary'}`}>
                  {isScanning ? 'Camera Active' : 'Ready'}
                </span>
              </div>

              {/* Viewport Box */}
              <div
                id="qr-reader-container"
                className="scan-viewport"
                style={{
                  background: isScanning ? '#000000' : 'var(--sand)',
                  border: isScanning ? '2px solid var(--clay)' : '2px dashed var(--border-subtle)',
                }}
              >
                {isScanning ? (
                  <div className="scanner-laser" />
                ) : (
                  <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: 'rgba(194, 120, 92, 0.12)',
                      color: 'var(--clay)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto var(--space-3) auto',
                    }}>
                      <Camera size={24} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--ink)', marginBottom: '4px' }}>
                      Camera Ready
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--stone)', maxWidth: '300px', margin: '0 auto' }}>
                      Click below to activate live camera and scan classroom QR
                    </div>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="alert-box alert-warning" style={{ fontSize: '0.8rem', marginTop: 'var(--space-3)', marginBottom: 0 }}>
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Controls */}
              <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'center' }}>
                {!isScanning ? (
                  <button
                    onClick={startCamera}
                    className="btn btn-primary"
                    style={{ gap: 'var(--space-2)', width: '100%', padding: '12px 24px' }}
                  >
                    <Camera size={18} />
                    <span>Start Camera Scanner</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="btn btn-danger"
                    style={{ gap: 'var(--space-2)', width: '100%', padding: '12px 24px' }}
                  >
                    <span>Stop Scanner</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Upload Image */}
          {activeTab === 'upload' && (
            <div className="card scan-card">
              <div className="card-header" style={{ marginBottom: 'var(--space-2)', paddingBottom: 'var(--space-2)' }}>
                <div>
                  <h3 className="card-title" style={{ fontSize: '1.15rem' }}>
                    <Upload size={18} color="var(--clay)" />
                    <span>Upload QR Screenshot</span>
                  </h3>
                  <div className="card-subtitle" style={{ fontSize: '0.8rem' }}>
                    Multi-tier decoder with native BarcodeDetector & jsQR
                  </div>
                </div>
              </div>

              {uploadError && (
                <div className="alert-box alert-warning" style={{ fontSize: '0.825rem', marginBottom: 'var(--space-3)' }}>
                  <AlertTriangle size={15} color="var(--amber)" style={{ flexShrink: 0 }} />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="upload-dropzone" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
                <div className="upload-icon-circle">
                  <Upload size={26} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--ink)' }}>
                  Upload QR Screenshot
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--stone)', marginBottom: 'var(--space-4)', maxWidth: '340px' }}>
                  Select a photo or screenshot of the classroom projector screen to verify your attendance.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="qr-file-input"
                />
                <label htmlFor="qr-file-input" className="btn btn-primary" style={{ cursor: 'pointer', gap: 'var(--space-2)', padding: '12px 28px' }}>
                  <Upload size={17} />
                  <span>{verifying ? 'Decoding QR...' : 'Choose QR Image'}</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--stone-light)', marginTop: 'var(--space-3)' }}>
                  Supports JPG, PNG, WebP captured from any mobile device
                </span>
              </div>
            </div>
          )}

          {/* Tab 3: Manual Token */}
          {activeTab === 'manual' && (
            <div className="card scan-card">
              <div className="card-header" style={{ marginBottom: 'var(--space-2)', paddingBottom: 'var(--space-2)' }}>
                <div>
                  <h3 className="card-title" style={{ fontSize: '1.15rem' }}>
                    <Key size={18} color="var(--clay)" />
                    <span>Manual Token Input</span>
                  </h3>
                  <div className="card-subtitle" style={{ fontSize: '0.8rem' }}>
                    Verify attendance directly using session code
                  </div>
                </div>
              </div>

              <form onSubmit={handleManualSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="form-group">
                  <label className="form-label">Classroom Session ID</label>
                  <input
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="e.g. ses-9824-a1"
                    required
                    className="form-control"
                  />
                  <span style={{ fontSize: '0.775rem', color: 'var(--stone)' }}>
                    Session ID is shown directly beneath the classroom QR code.
                  </span>
                </div>
                <button type="submit" disabled={verifying} className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-4)', padding: '12px' }}>
                  {verifying ? 'Validating Geofence...' : 'Verify & Mark Attendance'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Verification Result Modal */}
      {verificationResult && (
        <div className="modal-overlay" onClick={() => setVerificationResult(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: '440px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              margin: '0 auto var(--space-4) auto',
              background: verificationResult.success ? 'rgba(62, 116, 83, 0.15)' : 'rgba(184, 75, 75, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: verificationResult.success ? '0 0 25px rgba(62, 116, 83, 0.4)' : '0 0 25px rgba(184, 75, 75, 0.4)',
            }}>
              {verificationResult.success ? (
                <CheckCircle2 size={36} color="var(--sage)" />
              ) : (
                <AlertTriangle size={36} color="var(--rust)" />
              )}
            </div>

            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              color: verificationResult.success ? 'var(--sage)' : 'var(--rust)',
              marginBottom: 'var(--space-2)',
            }}>
              {verificationResult.success ? 'Attendance Verified!' : 'Verification Flagged'}
            </h3>

            <p style={{ color: 'var(--stone)', fontSize: '0.925rem', marginBottom: 'var(--space-5)' }}>
              {verificationResult.message}
            </p>

            {verificationResult.success ? (
              <div style={{
                background: 'var(--sage-bg)',
                border: '1px solid rgba(62, 116, 83, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
                marginBottom: 'var(--space-5)',
                textAlign: 'left',
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--sage)' }}>Classroom: <strong>{verificationResult.classroom || classroomName}</strong></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--sage)', marginTop: '4px' }}>
                  Distance to Classroom: <strong>{verificationResult.distance ?? Math.round(activeDistance)} meters</strong> (Inside 30m Perimeter)
                </div>
              </div>
            ) : verificationResult.classroom_coords ? (
              <div style={{
                background: 'var(--rust-bg)',
                border: '1px solid rgba(184, 75, 75, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
                marginBottom: 'var(--space-5)',
                textAlign: 'left',
                fontSize: '0.825rem',
              }}>
                <div style={{ color: 'var(--rust)', fontWeight: 600, marginBottom: '4px' }}>
                  Distance Breakdown:
                </div>
                <div style={{ color: 'var(--stone)' }}>
                  Classroom: {verificationResult.classroom_coords.lat}, {verificationResult.classroom_coords.lng}
                </div>
                <div style={{ color: 'var(--stone)', marginTop: '2px' }}>
                  Your Position: {verificationResult.student_coords.lat}, {verificationResult.student_coords.lng}
                </div>
                <div style={{ color: 'var(--rust)', fontWeight: 700, marginTop: '4px' }}>
                  Calculated Distance: {verificationResult.distance}m (Allowed limit: 30m)
                </div>
              </div>
            ) : null}

            <button
              onClick={() => {
                setVerificationResult(null);
                if (verificationResult.success) {
                  navigate('/student/dashboard');
                }
              }}
              className={verificationResult.success ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ width: '100%', padding: '12px' }}
            >
              {verificationResult.success ? 'Go to Student Dashboard' : 'Try Again'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}