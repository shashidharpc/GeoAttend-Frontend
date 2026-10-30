import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  QrCode, 
  LayoutDashboard, 
  School, 
  Users, 
  ShieldAlert, 
  FileText,
  Camera, 
  LogOut, 
  LogIn, 
  Menu, 
  X, 
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isStudent, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-glass">
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-6)',
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          textDecoration: 'none',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--clay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(194, 120, 92, 0.25)',
            flexShrink: 0,
          }}>
            <QrCode size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}>
              <span className="logo-text">
                GeoAttend
              </span>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                PRO
              </span>
            </div>
            <p className="navbar-subtitle" style={{
              fontSize: '0.725rem',
              color: 'var(--stone)',
              lineHeight: 1,
              marginTop: '2px',
            }}>
              Smart Geofenced Attendance
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links (Frosted Glass Pills) */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: 'var(--space-1)',
        }} className="desktop-only">
          <Link
            to="/"
            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>

          {isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                className={`navbar-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/admin/classrooms"
                className={`navbar-link ${isActive('/admin/classrooms') ? 'active' : ''}`}
              >
                <School size={16} />
                <span>Classrooms</span>
              </Link>
              <Link
                to="/admin/students"
                className={`navbar-link ${isActive('/admin/students') ? 'active' : ''}`}
              >
                <Users size={16} />
                <span>Students</span>
              </Link>
              <Link
                to="/admin/attendance-report"
                className={`navbar-link ${location.pathname.startsWith('/admin/attendance') ? 'active' : ''}`}
              >
                <FileText size={16} />
                <span>Reports</span>
              </Link>
              <Link
                to="/admin/proxy-attempts"
                className={`navbar-link ${isActive('/admin/proxy-attempts') ? 'active' : ''}`}
                style={isActive('/admin/proxy-attempts') ? { color: 'var(--rust)', background: 'var(--rust-bg)', borderColor: 'rgba(184, 75, 75, 0.25)' } : {}}
              >
                <ShieldAlert size={16} color={isActive('/admin/proxy-attempts') ? 'var(--rust)' : 'currentColor'} />
                <span>Proxy Logs</span>
              </Link>
            </>
          )}

          {isStudent && (
            <>
              <Link
                to="/student/dashboard"
                className={`navbar-link ${isActive('/student/dashboard') ? 'active' : ''}`}
              >
                <LayoutDashboard size={16} />
                <span>Student Portal</span>
              </Link>
              <Link
                to="/student/scan-qr"
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: '0.45rem 1rem',
                  fontSize: '0.875rem',
                  marginLeft: 'var(--space-2)',
                }}
              >
                <Camera size={15} />
                <span>Scan QR</span>
              </Link>
            </>
          )}
        </div>

        {/* Right Action Profile / Login / Theme */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}>
          {/* Light / Dark Mode Toggle (Glass Icon Button) */}
          <button
            onClick={toggleTheme}
            className="btn-glass-icon"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun size={17} color="#FBBF24" />
            ) : (
              <Moon size={17} color="var(--clay)" />
            )}
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              {/* Glassy User Avatar + Name & Role Badge Pill */}
              <div className="desktop-only navbar-user-pill">
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isAdmin ? 'var(--primary-gradient)' : 'linear-gradient(135deg, #3E7453 0%, #4A7B8C 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: '#ffffff',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.12)',
                  flexShrink: 0,
                }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.15 }}>
                  <span style={{
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    maxWidth: '130px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {user?.name || 'User'}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    color: 'var(--stone)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    {isAdmin ? 'Admin' : 'Student'}
                  </span>
                </div>
              </div>

              {/* Glassy Logout Button */}
              <button
                onClick={handleLogout}
                className="btn-glass-icon"
                title="Sign out"
                style={{
                  width: 'auto',
                  padding: '0.45rem 0.85rem',
                  gap: 'var(--space-2)',
                  fontSize: '0.825rem',
                  fontWeight: 500,
                }}
              >
                <LogOut size={15} color="var(--rust)" />
                <span className="desktop-only" style={{ color: 'var(--ink)' }}>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Link
                to="/login"
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: '0.45rem 1.1rem',
                  fontSize: '0.875rem',
                }}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button (Glass Icon) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-glass-icon mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Glassy Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-drawer">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
            style={{ padding: 'var(--space-3)' }}
          >
            Home
          </Link>

          {isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`navbar-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
                style={{ padding: 'var(--space-3)' }}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/admin/classrooms"
                onClick={() => setMobileMenuOpen(false)}
                className={`navbar-link ${isActive('/admin/classrooms') ? 'active' : ''}`}
                style={{ padding: 'var(--space-3)' }}
              >
                <School size={18} />
                <span>Classrooms</span>
              </Link>
              <Link
                to="/admin/students"
                onClick={() => setMobileMenuOpen(false)}
                className={`navbar-link ${isActive('/admin/students') ? 'active' : ''}`}
                style={{ padding: 'var(--space-3)' }}
              >
                <Users size={18} />
                <span>Students</span>
              </Link>
              <Link
                to="/admin/attendance-report"
                onClick={() => setMobileMenuOpen(false)}
                className={`navbar-link ${location.pathname.startsWith('/admin/attendance') ? 'active' : ''}`}
                style={{ padding: 'var(--space-3)' }}
              >
                <FileText size={18} />
                <span>Reports</span>
              </Link>
              <Link
                to="/admin/proxy-attempts"
                onClick={() => setMobileMenuOpen(false)}
                className={`navbar-link ${isActive('/admin/proxy-attempts') ? 'active' : ''}`}
                style={{ padding: 'var(--space-3)', color: 'var(--rust)' }}
              >
                <ShieldAlert size={18} color="var(--rust)" />
                <span>Proxy Logs</span>
              </Link>
            </>
          )}

          {isStudent && (
            <>
              <Link
                to="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`navbar-link ${isActive('/student/dashboard') ? 'active' : ''}`}
                style={{ padding: 'var(--space-3)' }}
              >
                <LayoutDashboard size={18} />
                <span>Student Portal</span>
              </Link>
              <Link
                to="/student/scan-qr"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ marginTop: 'var(--space-2)', padding: '0.75rem' }}
              >
                <Camera size={18} />
                <span>Scan Attendance QR</span>
              </Link>
            </>
          )}

          {/* Mobile Theme Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-3) 0',
            borderTop: '1px solid var(--border-subtle)',
            marginTop: 'var(--space-2)',
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--stone)' }}>
              Appearance: <strong>{isDark ? 'Dark' : 'Light'}</strong>
            </span>
            <button
              onClick={toggleTheme}
              className="btn-glass-icon"
              style={{ width: 'auto', padding: '0.4rem 0.8rem', gap: 'var(--space-2)', fontSize: '0.8rem' }}
            >
              {isDark ? <Sun size={14} color="#FBBF24" /> : <Moon size={14} color="var(--clay)" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Style block for responsive navbar */}
      <style>{`
        @media (min-width: 821px) {
          .desktop-only {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 820px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
        @media (max-width: 480px) {
          .navbar-subtitle {
            display: none !important;
          }
          .navbar .container {
            gap: var(--space-2) !important;
          }
        }
      `}</style>
    </nav>
  );
}
