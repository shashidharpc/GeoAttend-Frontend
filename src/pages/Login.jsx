import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  QrCode, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  ShieldAlert, 
  CheckCircle
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success && res.user) {
        if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setError(res.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{
      minHeight: 'calc(100vh - 100px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(8px, 1.5vh, 20px) var(--space-4)',
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '36px 32px',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--border-subtle)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{
            width: '52px',
            height: '52px',
            margin: '0 auto var(--space-4) auto',
            borderRadius: 'var(--radius-md)',
            background: 'var(--clay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(194, 120, 92, 0.25)',
          }}>
            <QrCode size={26} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: 'var(--space-1)' }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--stone)' }}>
            Sign in to your GeoAttend account
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-box alert-danger">
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <Mail size={16} color="var(--clay)" /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@edu.com"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} color="var(--clay)" /> Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="form-control"
                style={{ paddingRight: '42px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '1rem',
              marginTop: 'var(--space-2)',
            }}
          >
            {loading ? (
              <span>Verifying credentials...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Security badge at bottom */}
        <div style={{
          marginTop: 'var(--space-6)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
          fontSize: '0.775rem',
          color: 'var(--text-dim)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
        }}>
          <CheckCircle size={14} color="#10B981" />
          End-to-end encrypted session with GPS geofence validation
        </div>
      </div>
    </div>
  );
}
