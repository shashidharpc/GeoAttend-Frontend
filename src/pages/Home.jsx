import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  QrCode, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Clock, 
  BarChart3, 
  Crosshair,
  ChevronDown
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Viewport Section (Screen-fitted) */}
      <section className="home-hero-section">
        <div className="container home-hero-content">
          {/* Subtle Editorial Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '0.45rem 1.15rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(194, 120, 92, 0.12)',
            border: '1px solid rgba(194, 120, 92, 0.25)',
            color: 'var(--clay)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: 'clamp(1rem, 2.5vh, 1.75rem)',
          }}>
            <Zap size={15} color="var(--clay)" />
            Next-Gen Academic Verification
          </div>

          {/* Headline */}
          <h1 className="home-hero-headline">
            Intelligent QR Attendance{' '}
            <span style={{ color: 'var(--clay)', fontStyle: 'italic', display: 'inline-block' }}>
              Enforced by Geofencing
            </span>
          </h1>

          {/* One crisp sentence per website-style-guide.md */}
          <p className="home-hero-subtext">
            Permanently eliminate proxy attendance by pairing dynamic cryptographic QR tokens
            with strict 30-meter physical GPS perimeter verification.
          </p>

          {/* One primary clay button per website-style-guide.md */}
          <div>
            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: '14px 32px',
                  fontSize: '1.05rem',
                  borderRadius: '12px',
                }}
              >
                <span>Go to {isAdmin ? 'Admin Dashboard' : 'Student Portal'}</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <Link
                to="/login"
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: '14px 32px',
                  fontSize: '1.05rem',
                  borderRadius: '12px',
                }}
              >
                <span>Launch Portal</span>
                <ArrowRight size={18} />
              </Link>
            )}
          </div>

          {/* Horizontal Quick Metrics / Integrity Row */}
          <div className="home-hero-metrics">
            <div>
              <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
                100%
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--stone)', marginTop: '2px' }}>Proxy Prevention</div>
            </div>
            <div>
              <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 600, color: 'var(--clay)', fontFamily: 'var(--font-display)' }}>
                30m
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--stone)', marginTop: '2px' }}>Classroom Perimeter</div>
            </div>
            <div>
              <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 600, color: 'var(--sage)', fontFamily: 'var(--font-display)' }}>
                2 min
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--stone)', marginTop: '2px' }}>Token Rotation</div>
            </div>
          </div>
        </div>

        {/* Quiet scroll prompt */}
        <a
          href="#features"
          aria-label="Scroll to features"
          className="hero-scroll-indicator"
        >
          <span>Explore</span>
          <ChevronDown size={16} />
        </a>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto var(--space-10) auto' }}>
          <span className="badge badge-primary" style={{ marginBottom: 'var(--space-2)' }}>Architecture</span>
          <h2 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.5rem)', marginBottom: 'var(--space-3)', fontFamily: 'var(--font-display)' }}>
            Engineered for Absolute Integrity
          </h2>
          <p style={{ color: 'var(--stone)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Say goodbye to paper sign-in sheets, forwarded screenshots, and remote check-ins.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid">
          {/* Bento Card 1: 8 Columns - Dynamic Rotating QR Spotlight */}
          <div className="bento-col-8">
            <div className="bento-card" style={{ height: '100%', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(194, 120, 92, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <QrCode size={24} color="var(--clay)" />
                  </div>
                  <span className="badge badge-primary">2-Minute Auto-Expiry</span>
                </div>

                <h3 style={{ fontSize: '1.45rem', marginBottom: 'var(--space-2)', fontFamily: 'var(--font-display)' }}>
                  Dynamic Cryptographic QR Tokens
                </h3>
                <p style={{ color: 'var(--stone)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '620px' }}>
                  Every generated QR code includes an ephemeral cryptographic session token. 
                  Tokens expire strictly after 2 minutes, rendering forwarded screenshots or photos completely invalid.
                </p>
              </div>

              {/* Session hash badge */}
              <div style={{
                marginTop: 'var(--space-6)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--sand)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <Clock size={18} color="var(--clay)" />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--stone)' }}>Current Ephemeral Token</div>
                    <code style={{ fontSize: '0.85rem', color: 'var(--clay)', fontWeight: 600 }}>token_99b4_verified_wgs84</code>
                  </div>
                </div>
                <span className="badge badge-success">Auto-Rotating</span>
              </div>
            </div>
          </div>

          {/* Bento Card 2: 4 Columns - 30m Geofence Lock */}
          <div className="bento-col-4">
            <div className="bento-card" style={{ height: '100%', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(74, 123, 140, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-4)',
                }}>
                  <MapPin size={24} color="var(--accent-cyan)" />
                </div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: 'var(--space-2)', fontFamily: 'var(--font-display)' }}>
                  30m Physical Geofence
                </h3>
                <p style={{ color: 'var(--stone)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                  Sub-meter Haversine distance verification confirms students are physically inside the lecture hall.
                </p>
              </div>

              <div style={{
                marginTop: 'var(--space-6)',
                padding: 'var(--space-3) var(--space-4)',
                background: 'rgba(74, 123, 140, 0.1)',
                border: '1px solid rgba(74, 123, 140, 0.25)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.825rem',
                color: 'var(--accent-cyan)',
                fontWeight: 600,
              }}>
                Haversine Matrix Verified
              </div>
            </div>
          </div>

          {/* Bento Card 3: 4 Columns - Proxy Auditing */}
          <div className="bento-col-4">
            <div className="bento-card" style={{ height: '100%' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--rust-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-4)',
              }}>
                <ShieldCheck size={24} color="var(--rust)" />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: 'var(--space-2)', fontFamily: 'var(--font-display)' }}>
                Zero-Trust Proxy Detection
              </h3>
              <p style={{ color: 'var(--stone)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                Flagged attempts from students outside the classroom or with expired tokens are logged
                with GPS coordinates for administrative review.
              </p>
            </div>
          </div>

          {/* Bento Card 4: 4 Columns - One-Click Analytics & Export */}
          <div className="bento-col-4">
            <div className="bento-card" style={{ height: '100%' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--sage-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-4)',
              }}>
                <BarChart3 size={24} color="var(--sage)" />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: 'var(--space-2)', fontFamily: 'var(--font-display)' }}>
                Live Audit & CSV Export
              </h3>
              <p style={{ color: 'var(--stone)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                Immediate visibility into turnout rates, verified present attendees, and absent rosters with instant export capability.
              </p>
            </div>
          </div>

          {/* Bento Card 5: 4 Columns - Camera & Browser-Native */}
          <div className="bento-col-4">
            <div className="bento-card" style={{ height: '100%' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--amber-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-4)',
              }}>
                <Crosshair size={24} color="var(--amber)" />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: 'var(--space-2)', fontFamily: 'var(--font-display)' }}>
                Zero App Installation
              </h3>
              <p style={{ color: 'var(--stone)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                Runs seamlessly in any smartphone web browser via HTML5 camera feed and native Geolocation permissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Pipeline Section (Clean Editorial Flow) */}
      <section className="container">
        <div className="bento-card" style={{ padding: 'var(--space-10) var(--space-8)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <span className="badge badge-primary" style={{ marginBottom: 'var(--space-2)' }}>Simple 4-Step Flow</span>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)' }}>How GeoAttend Operates</h2>
          </div>

          <div className="bento-grid">
            {[
              { 
                step: '01', 
                title: 'Lecturer Broadcasts QR', 
                desc: 'Selects the classroom hall. A secure rotating QR code appears on the classroom screen.' 
              },
              { 
                step: '02', 
                title: 'Student Scans In', 
                desc: 'Students open the web app on their phone camera or upload a captured code.' 
              },
              { 
                step: '03', 
                title: 'GPS Geofence Match', 
                desc: 'Browser securely reads GPS coordinates and validates physical presence inside 30 meters.' 
              },
              { 
                step: '04', 
                title: 'Instant Certified Records', 
                desc: 'Live dashboard registers attendance with distance breakdown and automated CSV export.' 
              }
            ].map((item, idx) => (
              <div key={idx} className="bento-col-3">
                <div style={{
                  padding: 'var(--space-5)',
                  background: 'var(--sand)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  height: '100%',
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: 'var(--clay)',
                    fontFamily: 'var(--font-display)',
                    marginBottom: 'var(--space-2)',
                    opacity: 0.9,
                  }}>
                    {item.step}
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--ink)' }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--stone)', lineHeight: 1.6 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional Call To Action */}
      <section className="container" style={{ paddingBottom: 'var(--space-12)' }}>
        <div className="bento-card" style={{
          padding: 'var(--space-8)',
          background: 'var(--sand-card)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-6)',
        }}>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
              Modernize Your Campus Attendance
            </h3>
            <p style={{ color: 'var(--stone)', maxWidth: '580px', fontSize: '0.95rem' }}>
              Enforce verified classroom presence, eliminate proxy marking, and automate instant attendance analytics in real time.
            </p>
          </div>

          <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: '14px 28px' }}>
            <span>Sign In to Portal</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
