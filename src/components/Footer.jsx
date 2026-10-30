import React from 'react';
import { QrCode, ShieldCheck, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--paper)',
      padding: 'var(--space-10) 0 var(--space-8) 0',
      marginTop: 'auto',
      transition: 'background-color 0.25s ease, border-color 0.25s ease',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-8)',
        }}>
          {/* Brand info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--clay)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <QrCode size={18} color="#ffffff" />
              </div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.2rem',
                color: 'var(--ink)',
              }}>
                GeoAttend
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--stone)', lineHeight: 1.6 }}>
              A high-security, web-based attendance management system fusing dynamic QR verification, 
              GPS-based geofencing, and automated proxy detection.
            </p>
          </div>

          {/* Security Features */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--ink)' }}>
              Core Protection
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <li style={{ fontSize: '0.85rem', color: 'var(--stone)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <ShieldCheck size={14} color="var(--sage)" /> 2-Minute Rotating QR Codes
              </li>
              <li style={{ fontSize: '0.85rem', color: 'var(--stone)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <MapPin size={14} color="var(--accent-cyan)" /> 30-Meter GPS Classroom Geofence
              </li>
              <li style={{ fontSize: '0.85rem', color: 'var(--stone)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <ShieldCheck size={14} color="var(--amber)" /> Real-time Proxy Attempt Logging
              </li>
            </ul>
          </div>

          {/* System Status */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--ink)' }}>
              System Status
            </h4>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: '0.4rem 0.8rem',
              background: 'var(--sage-bg)',
              border: '1px solid var(--sage)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--sage)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--sage)',
                boxShadow: '0 0 8px var(--sage)',
              }} />
              GPS Geofence Engine Online
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--stone-light)', marginTop: 'var(--space-2)' }}>
              Accuracy verification: Sub-meter precision via WGS84 geodesic calculation.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 'var(--space-5)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          fontSize: '0.825rem',
          color: 'var(--stone-light)',
        }}>
          <div>
            &copy; {new Date().getFullYear()} GeoAttend. Built with React.js & Flask.
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Security Documentation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
