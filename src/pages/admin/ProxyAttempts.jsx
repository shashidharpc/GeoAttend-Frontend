import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  ShieldAlert, 
  MapPin, 
  AlertTriangle, 
  Search, 
  Filter, 
  Calendar, 
  ExternalLink,
  Info,
  X
} from 'lucide-react';

export default function ProxyAttempts() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReason, setSelectedReason] = useState('ALL');
  const [inspectModal, setInspectModal] = useState(null);

  useEffect(() => {
    async function fetchProxyLogs() {
      setLoading(true);
      try {
        const data = await api.getProxyAttempts();
        setAttempts(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProxyLogs();
  }, []);

  const filtered = attempts.filter((att) => {
    const matchSearch = (att.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
                        (att.classroom_name || '').toLowerCase().includes(search.toLowerCase()) ||
                        (att.reason || '').toLowerCase().includes(search.toLowerCase());
    const matchReason = selectedReason === 'ALL' || (att.reason || '').includes(selectedReason);
    return matchSearch && matchReason;
  });

  return (
    <div className="container" style={{
      maxWidth: '1140px',
      minHeight: 'calc(100vh - 110px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      padding: 'clamp(8px, 1.5vh, 18px) clamp(16px, 2.5vw, 24px)',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
        paddingBottom: 'var(--space-3)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <h1 style={{ fontSize: 'clamp(1.5rem, 2.2vw, 1.95rem)', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              Proxy Attempt Audit Log
            </h1>
            <span className="badge badge-danger">Security Shield Active</span>
          </div>
          <p style={{ color: 'var(--stone)', fontSize: '0.85rem', marginTop: '2px' }}>
            Real-time audit log of unauthorized, out-of-bounds, or expired check-in attempts.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
        background: 'var(--bg-card)',
        padding: '10px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={16} color="var(--stone)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, class, or reason..."
            className="form-control"
            style={{ paddingLeft: '38px', padding: '8px 12px 8px 38px', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ width: '220px' }}>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="form-select"
            style={{ padding: '8px 12px', fontSize: '0.875rem' }}
          >
            <option value="ALL">All Violation Types</option>
            <option value="Outside">Outside Radius (&gt;30m)</option>
            <option value="expired">Expired QR Token</option>
            <option value="class">Wrong Classroom</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table (Screen-Fitted) */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 20px', minHeight: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <p style={{ color: 'var(--stone)' }}>Loading security audit logs...</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Details</th>
                  <th>Target Classroom</th>
                  <th>Violation Reason</th>
                  <th>Timestamp</th>
                  <th>Coordinates</th>
                  <th style={{ textAlign: 'right' }}>Audit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((attempt, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{attempt.student_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{attempt.student_email}</div>
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {attempt.classroom_name || 'Classroom'}
                      </td>
                      <td>
                        <span className="badge badge-danger" style={{ fontSize: '0.8rem' }}>
                          <AlertTriangle size={12} /> {attempt.reason}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-dim)' }}>
                        {new Date(attempt.timestamp).toLocaleString()}
                      </td>
                      <td style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#A5B4FC' }}>
                        {attempt.scanned_location?.latitude ? (
                          `${attempt.scanned_location.latitude.toFixed(4)}, ${attempt.scanned_location.longitude.toFixed(4)}`
                        ) : (
                          'Recorded'
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setInspectModal(attempt)}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: 'var(--space-1)' }}
                        >
                          <Info size={14} /> Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-dim)' }}>
                      No proxy attempts recorded. System is secure.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Inspection Details */}
      {inspectModal && (
        <div className="modal-overlay" onClick={() => setInspectModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <ShieldAlert size={22} color="#EF4444" />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Security Violation Detail</h3>
              </div>
              <button
                onClick={() => setInspectModal(null)}
                className="btn btn-secondary btn-icon"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="alert-box alert-danger">
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>{inspectModal.reason}</span>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 'var(--space-1)' }}>Student Info</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{inspectModal.student_name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{inspectModal.student_email}</div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 'var(--space-1)' }}>Classroom</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{inspectModal.classroom_name}</div>
              </div>

              <div className="grid-2">
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#F87171', fontWeight: 600 }}>Scanned Location</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '2px' }}>
                    {inspectModal.scanned_location?.latitude?.toFixed ? inspectModal.scanned_location.latitude.toFixed(5) : 'N/A'},{' '}
                    {inspectModal.scanned_location?.longitude?.toFixed ? inspectModal.scanned_location.longitude.toFixed(5) : 'N/A'}
                  </div>
                </div>

                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 600 }}>Classroom Center</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '2px' }}>
                    {inspectModal.expected_location?.latitude?.toFixed ? inspectModal.expected_location.latitude.toFixed(5) : 'N/A'},{' '}
                    {inspectModal.expected_location?.longitude?.toFixed ? inspectModal.expected_location.longitude.toFixed(5) : 'N/A'}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginTop: 'var(--space-4)' }}>
                <button onClick={() => setInspectModal(null)} className="btn btn-secondary">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
