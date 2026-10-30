import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import Classrooms from './pages/admin/Classrooms';
import Students from './pages/admin/Students';
import GenerateQr from './pages/admin/GenerateQr';
import AttendanceReport from './pages/admin/AttendanceReport';
import ProxyAttempts from './pages/admin/ProxyAttempts';
import StudentDashboard from './pages/student/StudentDashboard';
import ScanQr from './pages/student/ScanQr';

// Simple Error Boundary to catch any render errors and prevent blank screens
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          maxWidth: '500px',
          margin: '60px auto',
          padding: '24px',
          background: 'var(--sand)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center',
          color: 'var(--ink)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Something went wrong</h2>
          <p style={{ color: 'var(--stone)', fontSize: '0.9rem', marginBottom: '16px' }}>
            The application encountered a transient display error.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
            style={{ padding: '8px 20px' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route wrappers
function RequireAdmin({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--stone)', gap: '8px' }}>
        <div style={{ width: '18px', height: '18px', border: '2px solid var(--clay)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span>Verifying administrator session...</span>
      </div>
    );
  }
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RequireStudent({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--stone)', gap: '8px' }}>
        <div style={{ width: '18px', height: '18px', border: '2px solid var(--clay)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span>Verifying student session...</span>
      </div>
    );
  }
  if (!isAuthenticated || user?.role !== 'student') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className={`app-wrapper ${isHomePage ? 'app-wrapper-home' : 'app-wrapper-screen'}`}>
      <Navbar />
      <main className={`main-content ${isHomePage ? 'main-home' : 'main-screen-fitted'}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/classrooms"
            element={
              <RequireAdmin>
                <Classrooms />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/students"
            element={
              <RequireAdmin>
                <Students />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/generate-qr"
            element={
              <RequireAdmin>
                <GenerateQr />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/generate_qr"
            element={
              <RequireAdmin>
                <GenerateQr />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/attendance-report"
            element={
              <RequireAdmin>
                <AttendanceReport />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/attendance-report/:sessionId"
            element={
              <RequireAdmin>
                <AttendanceReport />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/attendance_report"
            element={
              <RequireAdmin>
                <AttendanceReport />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/attendance_report/:sessionId"
            element={
              <RequireAdmin>
                <AttendanceReport />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/proxy-attempts"
            element={
              <RequireAdmin>
                <ProxyAttempts />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/proxy_attempts"
            element={
              <RequireAdmin>
                <ProxyAttempts />
              </RequireAdmin>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <RequireStudent>
                <StudentDashboard />
              </RequireStudent>
            }
          />
          <Route
            path="/student/scan-qr"
            element={
              <RequireStudent>
                <ScanQr />
              </RequireStudent>
            }
          />
          <Route
            path="/student/scan"
            element={
              <RequireStudent>
                <ScanQr />
              </RequireStudent>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {isHomePage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ErrorBoundary>
            <AppLayout />
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
