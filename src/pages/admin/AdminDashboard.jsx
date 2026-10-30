import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  School, 
  QrCode, 
  ShieldAlert, 
  Plus, 
  Clock, 
  BarChart2, 
  TrendingUp, 
  FileText
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await api.getAdminDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(194, 120, 92, 0.2)',
          borderTopColor: 'var(--clay)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto var(--space-4) auto',
        }} />
        <p style={{ color: 'var(--stone)', fontSize: '0.9rem' }}>Loading analytics and system stats...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const { stats, recent_sessions = [], classroom_stats = [], trend = { dates: [], counts: [] }, proxy_reasons = {} } = data || {};

  const maxClassAttendance = Math.max(...classroom_stats.map((c) => c.attendance_count), 20);
  const maxTrend = Math.max(...trend.counts, 10);

  return (
    <div className="container" style={{
      maxWidth: '1140px',
      minHeight: 'calc(100vh - 110px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 'var(--space-4)',
      padding: 'clamp(8px, 1.5vh, 18px) clamp(16px, 2.5vw, 24px)',
      margin: '0 auto',
    }}>
      {/* Header Banner */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <h1 style={{ fontSize: 'clamp(1.5rem, 2.2vw, 1.95rem)', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              Admin Command Center
            </h1>
            <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.725rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--sage)', display: 'inline-block' }} />
              Active System
            </span>
          </div>
          <p style={{ color: 'var(--stone)', fontSize: '0.85rem', marginTop: '2px' }}>
            Welcome back, <strong>{user?.name || 'Administrator'}</strong>. Monitoring campus geofences and sessions.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link to="/admin/generate-qr" className="btn btn-primary btn-sm" style={{ gap: 'var(--space-2)', padding: '8px 16px', fontSize: '0.85rem' }}>
            <QrCode size={15} />
            <span>Generate Session QR</span>
          </Link>
          <Link to="/admin/classrooms" className="btn btn-secondary btn-sm" style={{ gap: 'var(--space-2)', padding: '8px 16px', fontSize: '0.85rem' }}>
            <School size={15} />
            <span>Classrooms</span>
          </Link>
        </div>
      </div>

      {/* 4 Compact Stat Cards in a Single Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 'var(--space-3)',
      }} className="admin-stats-grid">
        {/* Total Students */}
        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: '38px',
            height: '38px',
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
            <div style={{ fontSize: '0.75rem', color: 'var(--stone)', fontWeight: 500 }}>Students</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
              {stats?.total_students ?? 0}
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--stone)', marginTop: '1px' }}>Enrolled Roster</div>
          </div>
        </div>

        {/* Classrooms */}
        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(62, 116, 83, 0.12)',
            color: 'var(--sage)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <School size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--stone)', fontWeight: 500 }}>Classrooms</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
              {stats?.total_classrooms ?? 0}
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--sage)', fontWeight: 600, marginTop: '1px' }}>30m Geofences</div>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(194, 120, 92, 0.12)',
            color: 'var(--clay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <QrCode size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--stone)', fontWeight: 500 }}>Total Sessions</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
              {stats?.total_sessions ?? 0}
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--clay)', fontWeight: 500, marginTop: '1px' }}>2-Min QR Tokens</div>
          </div>
        </div>

        {/* Proxy Attempts */}
        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--rust-bg)',
            color: 'var(--rust)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <ShieldAlert size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--stone)', fontWeight: 500 }}>Proxy Flagged</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--rust)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
              {stats?.total_proxy_attempts ?? 0}
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--rust)', fontWeight: 600, marginTop: '1px' }}>Intercepted</div>
          </div>
        </div>
      </div>

      {/* Main Section: Analytics & Recent Sessions Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.25fr',
        gap: 'var(--space-4)',
        alignItems: 'stretch',
        flex: 1,
      }} className="admin-main-grid">
        {/* Left Column: Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Attendance by Classroom */}
          <div className="card" style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="card-header" style={{ marginBottom: '8px', paddingBottom: '8px' }}>
              <div>
                <div className="card-title" style={{ fontSize: '0.95rem' }}>
                  <BarChart2 size={16} color="var(--clay)" /> Attendance by Classroom
                </div>
              </div>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Turnout</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '130px' }}>
              {classroom_stats.length > 0 ? (
                classroom_stats.map((c, idx) => {
                  const percentage = Math.min(100, Math.round((c.attendance_count / maxClassAttendance) * 100));
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.name}</span>
                        <span style={{ color: 'var(--stone)' }}>{c.attendance_count} students</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '7px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--sand)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--clay)',
                          transition: 'width 0.8s ease',
                        }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: 'var(--stone)', textAlign: 'center', fontSize: '0.8rem', padding: '12px 0' }}>
                  No classroom attendance recorded yet.
                </p>
              )}
            </div>
          </div>

          {/* 7-Day Attendance Trend */}
          <div className="card" style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="card-header" style={{ marginBottom: '8px', paddingBottom: '8px' }}>
              <div>
                <div className="card-title" style={{ fontSize: '0.95rem' }}>
                  <TrendingUp size={16} color="var(--sage)" /> 7-Day Attendance Volume
                </div>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Weekly</span>
            </div>

            <div style={{
              height: '95px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: 'var(--space-2)',
              padding: '6px 0 0 0',
            }}>
              {trend.dates.map((date, idx) => {
                const count = trend.counts[idx] || 0;
                const heightPct = Math.min(100, Math.max(14, Math.round((count / maxTrend) * 100)));
                return (
                  <div key={idx} style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}>
                    <span style={{ fontSize: '0.675rem', fontWeight: 600, color: 'var(--ink)' }}>{count}</span>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '28px',
                        height: `${heightPct}%`,
                        borderRadius: 'var(--radius-xs) var(--radius-xs) 0 0',
                        background: 'var(--clay)',
                        opacity: 0.85,
                        transition: 'height 0.4s ease',
                      }}
                      title={`${date}: ${count} attendances`}
                    />
                    <span style={{ fontSize: '0.65rem', color: 'var(--stone)', whiteSpace: 'nowrap' }}>{date.split('-').slice(1).join('/')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Sessions Table */}
        <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="card-header" style={{ marginBottom: '8px', paddingBottom: '8px' }}>
            <div>
              <div className="card-title" style={{ fontSize: '0.95rem' }}>
                <Clock size={16} color="var(--clay)" /> Recent Attendance Sessions
              </div>
            </div>
            <Link to="/admin/generate-qr" className="btn btn-primary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}>
              <Plus size={13} /> New Session
            </Link>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '270px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px 12px', fontSize: '0.75rem' }}>Classroom</th>
                  <th style={{ padding: '8px 12px', fontSize: '0.75rem' }}>Created</th>
                  <th style={{ padding: '8px 12px', fontSize: '0.75rem' }}>Status</th>
                  <th style={{ padding: '8px 12px', fontSize: '0.75rem' }}>Present</th>
                  <th style={{ padding: '8px 12px', fontSize: '0.75rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recent_sessions.length > 0 ? (
                  recent_sessions.map((sess, idx) => {
                    const isLive = sess.is_active && new Date(sess.expires_at) > new Date();
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ fontWeight: 600, padding: '8px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <School size={14} color="var(--clay)" />
                            <span>{sess.classroom_name || 'Classroom'}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--stone)', fontSize: '0.785rem', padding: '8px 12px' }}>
                          {new Date(sess.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          {isLive ? (
                            <span className="badge badge-success" style={{ fontSize: '0.685rem', padding: '2px 6px' }}>
                              ACTIVE
                            </span>
                          ) : (
                            <span className="badge badge-primary" style={{ fontSize: '0.685rem', padding: '2px 6px' }}>
                              DONE
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <strong style={{ color: 'var(--ink)' }}>{sess.attendance_count ?? 0}</strong>
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <Link
                            to={`/admin/attendance-report/${sess.session_id}`}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.75rem', gap: '3px' }}
                          >
                            <FileText size={12} /> View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--stone)' }}>
                      No sessions created yet. Click "New Session" to start.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .admin-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .admin-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
