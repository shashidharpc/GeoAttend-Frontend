import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Camera, 
  CheckCircle2, 
  Calendar, 
  School, 
  Clock, 
  ArrowRight, 
  MapPin,
  AlertCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        const res = await api.getStudentDashboard();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
        <p style={{ color: 'var(--stone)' }}>Loading student profile and attendance...</p>
      </div>
    );
  }

  const { student = {}, total_attended = 0, total_classes = 0, attendance_percentage = 0, recent_attendance = [] } = data || {};

  // Color according to attendance percentage per editorial palette
  const pctColor = attendance_percentage >= 75 ? 'var(--sage)' : attendance_percentage >= 60 ? 'var(--amber)' : 'var(--rust)';
  const pctBg = attendance_percentage >= 75 ? 'var(--sage-bg)' : attendance_percentage >= 60 ? 'var(--amber-bg)' : 'var(--rust-bg)';

  // SVG circle calculation (radius = 34, circumference = 2 * PI * 34 ≈ 213.6)
  const radius = 34;
  const circumference = 213.6;
  const strokeOffset = circumference - (circumference * Math.min(100, Math.max(0, attendance_percentage))) / 100;

  return (
    <div className="container student-dashboard-wrapper">
      <div className="student-dashboard-grid">
        {/* Left Column: Student Profile, Attendance Health & Primary Action */}
        <div className="card student-profile-panel">
          {/* Greeting & Enrollment Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                Student Portal
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--stone)' }}>
                ID: {student.id?.substring(0, 8) || 'student'}
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(1.6rem, 2.2vw, 1.95rem)',
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              marginBottom: '4px',
              color: 'var(--ink)',
              lineHeight: 1.2,
            }}>
              Hello, {student.name || user?.name || 'Student'}
            </h1>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              color: 'var(--stone)',
            }}>
              <School size={15} color="var(--clay)" />
              <span>Enrolled in:</span>
              <strong style={{ color: 'var(--ink)' }}>{student.classroom_name || 'Classroom'}</strong>
            </div>
          </div>

          {/* Primary CTA Button: Scan Attendance QR */}
          <Link
            to="/student/scan-qr"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px 20px',
              gap: 'var(--space-2)',
              fontSize: '0.95rem',
              borderRadius: 'var(--radius-md)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Camera size={18} />
            <span>Scan Attendance QR</span>
            <ArrowRight size={16} />
          </Link>

          {/* Overall Attendance Health Card with Circular Gauge */}
          <div style={{
            background: 'var(--sand)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
          }}>
            <div style={{ position: 'relative', width: '74px', height: '74px', flexShrink: 0 }}>
              <svg width="74" height="74" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  fill="transparent"
                  stroke="rgba(43, 43, 43, 0.08)"
                  strokeWidth="7"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  fill="transparent"
                  stroke={pctColor}
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.05rem',
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                color: 'var(--ink)',
              }}>
                {Math.round(attendance_percentage)}%
              </div>
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.785rem', color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Overall Attendance
              </div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: pctColor,
                lineHeight: 1.2,
                marginTop: '2px',
              }}>
                {attendance_percentage >= 75 ? 'Safe Status' : 'Attention Required'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--stone)', marginTop: '2px' }}>
                Minimum 75% required
              </div>
            </div>
          </div>

          {/* Two Compact Metric Tiles */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-3)',
          }}>
            <div style={{
              padding: '12px 14px',
              background: 'var(--sand)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <CheckCircle2 size={15} color="var(--sage)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--stone)', fontWeight: 500 }}>Attended</span>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
                {total_attended}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--sage)', fontWeight: 600, marginTop: '2px' }}>
                Verified Present
              </div>
            </div>

            <div style={{
              padding: '12px 14px',
              background: 'var(--sand)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Calendar size={15} color="var(--clay)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--stone)', fontWeight: 500 }}>Total Held</span>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
                {total_classes}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--stone)', fontWeight: 500, marginTop: '2px' }}>
                Current Semester
              </div>
            </div>
          </div>

          {/* Security Compliance Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '8px 12px',
            background: 'rgba(194, 120, 92, 0.08)',
            border: '1px solid rgba(194, 120, 92, 0.2)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.775rem',
            color: 'var(--clay)',
            fontWeight: 500,
          }}>
            <MapPin size={14} color="var(--clay)" style={{ flexShrink: 0 }} />
            <span>30m Classroom Radius GPS Enforced</span>
          </div>
        </div>

        {/* Right Column: Attendance Activity History */}
        <div className="card student-history-panel">
          <div className="card-header" style={{ marginBottom: 'var(--space-3)', paddingBottom: 'var(--space-3)' }}>
            <div>
              <div className="card-title" style={{ fontSize: '1.15rem' }}>
                <Clock size={18} color="var(--clay)" />
                <span>Recent Verified Check-ins</span>
              </div>
              <div className="card-subtitle" style={{ fontSize: '0.8rem' }}>
                Your physical check-in history
              </div>
            </div>
            <span className="badge badge-success">
              <CheckCircle2 size={12} /> GPS Validated
            </span>
          </div>

          {/* Table Container fitting the remaining height */}
          <div className="student-history-table-container">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 14px', fontSize: '0.785rem' }}>Classroom / Subject</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.785rem' }}>Check-in Date & Time</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.785rem' }}>Status</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.785rem' }}>Verification</th>
                </tr>
              </thead>
              <tbody>
                {recent_attendance && recent_attendance.length > 0 ? (
                  recent_attendance.map((rec, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ fontWeight: 600, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <School size={15} color="var(--clay)" />
                          <span>{rec.classroom}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--stone)', fontSize: '0.85rem', padding: '12px 14px' }}>
                        {new Date(rec.marked_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="badge badge-success" style={{ fontSize: '0.75rem', gap: '4px' }}>
                          <CheckCircle2 size={11} /> Present
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: '0.785rem', color: 'var(--sage)', fontWeight: 600 }}>
                          Within 30m Boundary
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--stone)' }}>
                      <Clock size={32} color="var(--stone)" style={{ margin: '0 auto 8px auto', opacity: 0.5, display: 'block' }} />
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--ink)' }}>
                        No attendance records yet
                      </div>
                      <div style={{ fontSize: '0.825rem', marginTop: '4px' }}>
                        Click "Scan Attendance QR" to check into your first class.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
