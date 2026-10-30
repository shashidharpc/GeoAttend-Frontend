import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import QRCode from 'qrcode';
import { 
  School, 
  Clock, 
  FileText, 
  RefreshCw, 
  Download, 
  Copy, 
  CheckCircle2, 
  AlertTriangle,
  MapPin,
  ArrowRight
} from 'lucide-react';

export default function GenerateQr() {
  const [searchParams] = useSearchParams();
  const preselectedClass = searchParams.get('classroom');

  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState(2);
  const [session, setSession] = useState(null);
  const [classroom, setClassroom] = useState(null);
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [qrPayload, setQrPayload] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrError, setQrError] = useState('');

  // Helper to parse ISO date safely in UTC
  const parseExpiryMs = (rawDate) => {
    if (!rawDate) return 0;
    if (rawDate instanceof Date) return rawDate.getTime();
    let str = String(rawDate);
    if (!str.endsWith('Z') && !str.includes('+') && !str.includes('-', 10)) {
      str += 'Z';
    }
    const ms = new Date(str).getTime();
    return isNaN(ms) ? 0 : ms;
  };

  useEffect(() => {
    async function init() {
      const clsList = await api.getClassrooms();
      setClassrooms(clsList);
      if (clsList.length > 0) {
        const targetId = preselectedClass || clsList[0]._id;
        setSelectedClassId(targetId);
        generateSession(targetId, 2);
      }
    }
    init();
  }, [preselectedClass]);

  // Countdown timer effect
  useEffect(() => {
    if (!session?.expires_at) return;

    const expiryMs = parseExpiryMs(session.expires_at);
    const updateDiff = () => {
      const now = Date.now();
      const diffSeconds = Math.max(0, Math.floor((expiryMs - now) / 1000));
      setTimeLeft(diffSeconds);
      return diffSeconds;
    };

    updateDiff();
    const interval = setInterval(() => {
      const remaining = updateDiff();
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const generateSession = async (classId, expiryMins) => {
    if (!classId) return;
    setGenerating(true);
    setQrError('');
    try {
      const res = await api.generateQr(classId, expiryMins);
      if (res.success && res.session) {
        setSession(res.session);
        setClassroom(res.classroom);
        setQrPayload(res.qr_payload);

        const expiryMs = parseExpiryMs(res.session.expires_at);
        const diffSeconds = Math.max(0, Math.floor((expiryMs - Date.now()) / 1000));
        setTimeLeft(diffSeconds > 0 ? diffSeconds : (expiryMins || 2) * 60);

        const qrString = typeof res.qr_payload === 'string' ? res.qr_payload : JSON.stringify(res.qr_payload);
        const dataUrl = await QRCode.toDataURL(qrString, {
          width: 400,
          margin: 4,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrImageUrl(dataUrl || res.qr_code_image);
      } else {
        setQrError(res.message || 'Failed to generate session for this classroom');
      }
    } catch (err) {
      console.error(err);
      setQrError('Error generating QR session');
    } finally {
      setGenerating(false);
    }
  };

  const handleClassChange = (newClassId) => {
    setSelectedClassId(newClassId);
    generateSession(newClassId, expiryMinutes);
  };

  const handleExpiryChange = (newExpiry) => {
    setExpiryMinutes(newExpiry);
    generateSession(selectedClassId, newExpiry);
  };

  const handleCopy = () => {
    if (qrPayload) {
      navigator.clipboard.writeText(JSON.stringify(qrPayload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isExpired = session ? timeLeft <= 0 : false;

  return (
    <div className="container" style={{
      maxWidth: '1080px',
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: 'clamp(8px, 1.5vh, 20px) clamp(16px, 2.5vw, 24px)',
      margin: '0 auto',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.15fr',
        gap: 'var(--space-6)',
        alignItems: 'stretch',
        width: '100%',
      }} className="responsive-split-grid">
        {/* Left Column: Controls, Details & Actions */}
        <div className="card" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          padding: '24px',
          height: '100%',
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(194, 120, 92, 0.12)',
              color: 'var(--clay)',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: 'var(--space-2)',
            }}>
              <Clock size={13} />
              <span>Rotating Dynamic Token</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(1.5rem, 2.2vw, 1.95rem)',
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              marginBottom: '4px',
              color: 'var(--ink)',
              lineHeight: 1.2,
            }}>
              Projector QR Broadcast
            </h1>
            <p style={{ color: 'var(--stone)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
              Display this dynamic QR on your classroom screen. Students must be inside the 30m boundary to record presence.
            </p>
          </div>

          {qrError && (
            <div className="alert-box alert-danger" style={{ padding: '8px 12px', fontSize: '0.8rem', marginBottom: 'var(--space-2)' }}>
              <span>{qrError}</span>
            </div>
          )}

          {/* Classroom & Expiry Selector Controls */}
          <div style={{
            background: 'var(--sand)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <School size={14} color="var(--clay)" /> Target Classroom
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="form-select"
                style={{ width: '100%', padding: '9px 12px', fontSize: '0.9rem' }}
              >
                {classrooms.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                  Auto-Expiry
                </label>
                <select
                  value={expiryMinutes}
                  onChange={(e) => handleExpiryChange(Number(e.target.value))}
                  className="form-select"
                  style={{ width: '100%', padding: '9px 12px', fontSize: '0.9rem' }}
                >
                  <option value={2}>2 Minutes (Recommended)</option>
                  <option value={5}>5 Minutes</option>
                  <option value={10}>10 Minutes</option>
                </select>
              </div>

              <button
                onClick={() => generateSession(selectedClassId, expiryMinutes)}
                disabled={generating}
                className="btn btn-primary"
                style={{ padding: '9px 16px', gap: '6px', fontSize: '0.875rem' }}
                title="Regenerate Token Now"
              >
                <RefreshCw size={14} className={generating ? 'spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Quick Info & Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: 'var(--sand)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.775rem',
            }}>
              <span style={{ color: 'var(--stone)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={13} color="var(--clay)" /> Geofence:
              </span>
              <strong style={{ color: 'var(--ink)' }}>30m Radius Locked</strong>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: '4px' }}>
              {qrImageUrl && (
                <a
                  href={qrImageUrl}
                  download={`attendance-qr-${classroom?.name || 'session'}.png`}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, padding: '8px 12px', gap: '6px', fontSize: '0.8rem' }}
                >
                  <Download size={14} /> Download
                </a>
              )}

              <button
                onClick={handleCopy}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, padding: '8px 12px', gap: '6px', fontSize: '0.8rem' }}
              >
                {copied ? <CheckCircle2 size={14} color="var(--sage)" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Key'}</span>
              </button>

              {session && (
                <Link
                  to={`/admin/attendance-report/${session.session_id}`}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1.2, padding: '8px 12px', gap: '6px', fontSize: '0.8rem' }}
                >
                  <FileText size={14} /> Report
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: High-Visibility QR Code & Timer Screen */}
        <div className="card" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px',
          height: '100%',
        }}>
          {/* Live Countdown Banner */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '0.5rem 1.4rem',
            borderRadius: 'var(--radius-full)',
            background: isExpired ? 'var(--rust-bg)' : 'var(--sage-bg)',
            border: `1px solid ${isExpired ? 'rgba(184, 75, 75, 0.3)' : 'rgba(62, 116, 83, 0.3)'}`,
            marginBottom: 'var(--space-3)',
          }}>
            <Clock size={16} color={isExpired ? 'var(--rust)' : 'var(--sage)'} />
            <span style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              color: isExpired ? 'var(--rust)' : 'var(--sage)',
              letterSpacing: '0.04em',
            }}>
              {generating 
                ? 'GENERATING...' 
                : isExpired 
                  ? 'SESSION EXPIRED' 
                  : `${minutes}:${seconds < 10 ? '0' : ''}${seconds} REMAINING`}
            </span>
          </div>

          {/* QR Code Canvas */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
            margin: 'auto 0',
          }}>
            {generating ? (
              <div style={{ width: '250px', height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid var(--clay)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#000000', fontSize: '0.85rem', fontWeight: 600 }}>Rotating cryptographic key...</p>
              </div>
            ) : qrImageUrl ? (
              <img
                src={qrImageUrl}
                alt="Classroom Attendance QR"
                style={{
                  width: '250px',
                  height: '250px',
                  display: 'block',
                  borderRadius: 'var(--radius-sm)',
                  filter: isExpired ? 'grayscale(100%) opacity(25%)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              />
            ) : (
              <div style={{ width: '250px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#000000' }}>Preparing QR...</p>
              </div>
            )}

            {/* Expired Overlay */}
            {!generating && isExpired && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(32, 30, 28, 0.88)',
                borderRadius: 'var(--radius-lg)',
                gap: 'var(--space-2)',
                padding: 'var(--space-4)',
                textAlign: 'center',
              }}>
                <AlertTriangle size={36} color="var(--rust)" />
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.05rem' }}>Token Expired</div>
                <p style={{ color: '#cccccc', fontSize: '0.75rem', maxWidth: '180px' }}>
                  Click below to generate a new active QR token.
                </p>
                <button
                  onClick={() => generateSession(selectedClassId, expiryMinutes)}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '6px', marginTop: '4px' }}
                >
                  <RefreshCw size={13} /> Refresh Code
                </button>
              </div>
            )}
          </div>

          {/* Bottom Session ID display */}
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--stone)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: 'var(--space-2)',
          }}>
            <span>Session:</span>
            <code style={{ color: 'var(--clay)', fontWeight: 600, fontSize: '0.8rem' }}>
              {session?.session_id ? session.session_id.substring(0, 18) + '...' : 'active'}
            </code>
          </div>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 860px) {
          .responsive-split-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
