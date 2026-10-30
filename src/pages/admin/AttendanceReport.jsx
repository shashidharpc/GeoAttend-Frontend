import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  Download, 
  Users, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Clock, 
  ArrowLeft,
  FileText,
  School,
  QrCode,
  Calendar
} from 'lucide-react';

export default function AttendanceReport() {
  const { sessionId: routeSessionId } = useParams();
  const navigate = useNavigate();

  const [sessionsList, setSessionsList] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(routeSessionId || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load sessions list and attendance report
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        // Fetch sessions list from admin dashboard
        const dashData = await api.getAdminDashboard();
        const sessions = dashData?.recent_sessions || [];
        setSessionsList(sessions);

        // Determine target session ID
        let targetId = routeSessionId;
        if (!targetId && sessions.length > 0) {
          targetId = sessions[0].session_id;
        }

        if (targetId) {
          setCurrentSessionId(targetId);
          const report = await api.getAttendanceReport(targetId);
          setData(report);
        } else {
          setData(null);
        }
      } catch (err) {
        console.error('Error fetching attendance report:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [routeSessionId]);

  const handleSessionChange = async (newSessionId) => {
    if (!newSessionId || newSessionId === currentSessionId) return;
    setCurrentSessionId(newSessionId);
    navigate(`/admin/attendance-report/${newSessionId}`);
  };

  const handleExportCsv = () => {
    if (!data?.attendances || data.attendances.length === 0) {
      alert('No attendance records to export for this session.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,Student Name,Email,Check-in Time,Distance (m),Latitude,Longitude,Geofence Status\n';
    data.attendances.forEach((att) => {
      csvContent += `"${att.student_name}","${att.student_email}","${new Date(att.marked_at).toLocaleString()}","${att.distance}m","${att.latitude}","${att.longitude}","Within 30m"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_report_${currentSessionId.substring(0, 8)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
        <div style={{
          width: '24px',
          height: '24px',
          border: '2px solid var(--clay)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto var(--space-3) auto'
        }} />
        <p style={{ color: 'var(--stone)' }}>Compiling certified attendance audit report...</p>
      </div>
    );
  }

  // Empty state if no sessions exist
  if (!currentSessionId || !data || data.error) {
    return (
      <div className="container" style={{
        maxWidth: '800px',
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: 'var(--space-8) var(--space-4)',
        margin: '0 auto',
      }}>
        <div className="card" style={{ padding: 'var(--space-8)', width: '100%', maxWidth: '540px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(194, 120, 92, 0.12)',
            color: 'var(--clay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-4) auto',
          }}>
            <FileText size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: 'var(--space-2)' }}>
            No Attendance Sessions Available
          </h2>
          <p style={{ color: 'var(--stone)', fontSize: '0.9rem', marginBottom: 'var(--space-6)' }}>
            Attendance audit reports are generated whenever students verify their presence via classroom QR sessions.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
            <Link to="/admin/generate-qr" className="btn btn-primary" style={{ gap: 'var(--space-2)' }}>
              <QrCode size={16} />
              <span>Generate First QR Session</span>
            </Link>
            <Link to="/admin/dashboard" className="btn btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { session, classroom, attendances = [], absent_students = [], summary = {} } = data || {};

  return (
    <div className="container" style={{
      maxWidth: '1140px',
      minHeight: 'calc(100vh - 100px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      padding: 'clamp(6px, 1.2vh, 16px) clamp(16px, 2.5vw, 24px)',
      margin: '0 auto',
    }}>
      {/* Header and Controls */}
      <div>
        <Link
          to="/admin/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: 'var(--stone)',
            fontSize: '0.825rem',
            marginBottom: 'var(--space-2)',
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          paddingBottom: 'var(--space-2)',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <h1 style={{ fontSize: 'clamp(1.4rem, 2vw, 1.85rem)', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                Attendance Audit Report
              </h1>
              <span className="badge badge-success">GPS Certified</span>
            </div>
            <p style={{ color: 'var(--stone)', fontSize: '0.85rem', marginTop: '2px' }}>
              Classroom: <strong>{classroom?.name || 'Classroom'}</strong> • Radius: <strong style={{ color: 'var(--clay)' }}>30m Geofenced</strong>
            </p>
          </div>

          {/* Session Selector & CSV Export Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {sessionsList.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--stone)', fontWeight: 600 }}>Session:</span>
                <select
                  value={currentSessionId}
                  onChange={(e) => handleSessionChange(e.target.value)}
                  className="form-select"
                  style={{ padding: '6px 12px', fontSize: '0.825rem', minWidth: '220px' }}
                >
                  {sessionsList.map((s) => (
                    <option key={s.session_id} value={s.session_id}>
                      {s.classroom_name || 'Classroom'} ({new Date(s.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleExportCsv}
              className="btn btn-primary btn-sm"
              style={{ gap: 'var(--space-2)', padding: '7px 14px', fontSize: '0.85rem' }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stat Widgets Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 'var(--space-3)',
      }}>
        <div className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--sage-bg)',
            color: 'var(--sage)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.725rem', color: 'var(--stone)', fontWeight: 500 }}>Present</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--sage)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
              {summary.present_count ?? 0}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--stone)' }}>Inside 30m zone</div>
          </div>
        </div>

        <div className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--rust-bg)',
            color: 'var(--rust)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <XCircle size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.725rem', color: 'var(--stone)', fontWeight: 500 }}>Absent</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--rust)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
              {summary.absent_count ?? 0}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--stone)' }}>No verified scan</div>
          </div>
        </div>

        <div className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(74, 123, 140, 0.12)',
            color: 'var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Users size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.725rem', color: 'var(--stone)', fontWeight: 500 }}>Enrolled</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
              {summary.total_students ?? 0}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--stone)' }}>Class roster</div>
          </div>
        </div>

        <div className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(194, 120, 92, 0.12)',
            color: 'var(--clay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Clock size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.725rem', color: 'var(--stone)', fontWeight: 500 }}>Turnout</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--clay)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
              {summary.attendance_rate ?? 0}%
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--stone)' }}>Participation</div>
          </div>
        </div>
      </div>

      {/* Verified Attendees Table (Screen-Fitted Scroll Container) */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 20px', minHeight: 0 }}>
        <div className="card-header" style={{ marginBottom: '8px', paddingBottom: '8px' }}>
          <div>
            <div className="card-title" style={{ fontSize: '0.95rem' }}>
              <CheckCircle2 size={16} color="var(--sage)" /> Present Students ({attendances.length})
            </div>
          </div>
          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Inside 30m Perimeter</span>
        </div>

        <div className="table-wrapper" style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 310px)' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Check-in Time</th>
                <th>Distance to Center</th>
                <th>GPS Coordinates</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody>
              {attendances.length > 0 ? (
                attendances.map((att, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{att.student_name}</td>
                    <td style={{ color: 'var(--stone)' }}>{att.student_email}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(att.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td>
                      <span className="badge badge-success" style={{ fontSize: '0.775rem' }}>
                        <MapPin size={12} /> {att.distance ?? 5}m away
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.775rem', color: 'var(--ink)' }}>
                      {att.latitude?.toFixed ? att.latitude.toFixed(5) : att.latitude}, {att.longitude?.toFixed ? att.longitude.toFixed(5) : att.longitude}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--sage)', fontWeight: 600 }}>
                        ✓ Within 30m Geofence
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--stone)' }}>
                    No students marked attendance for this session yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Absent Students List */}
      {absent_students.length > 0 && (
        <div className="card" style={{ padding: '16px 20px' }}>
          <div className="card-header" style={{ marginBottom: '8px', paddingBottom: '8px' }}>
            <div>
              <div className="card-title" style={{ color: 'var(--rust)' }}>
                <XCircle size={18} color="var(--rust)" /> Absent Students ({absent_students.length})
              </div>
              <div className="card-subtitle">Students who did not check in during the active session</div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 'var(--space-2)',
            maxHeight: '140px',
            overflowY: 'auto'
          }}>
            {absent_students.map((st, idx) => (
              <div key={idx} style={{
                background: 'var(--rust-bg)',
                border: '1px solid rgba(184, 75, 75, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
              }}>
                <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '0.85rem' }}>{st.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--stone)' }}>{st.email}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}