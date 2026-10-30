import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Upload, 
  School, 
  Key, 
  X,
  FileSpreadsheet,
  Mail
} from 'lucide-react';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [classId, setClassId] = useState('');
  const [formMsg, setFormMsg] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  // Bulk import state
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState({ text: '', type: '' });
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.getStudents();
      setStudents(res.students || []);
      setClassrooms(res.classrooms || []);
      if (res.classrooms?.length > 0 && !classId) {
        setClassId(res.classrooms[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!name || !email || !classId) {
      setFormMsg({ text: 'Please fill in all fields', type: 'danger' });
      return;
    }

    setSaving(true);
    setFormMsg({ text: '', type: '' });

    try {
      const res = await api.createStudent(name, email, classId);
      if (res.success) {
        setFormMsg({ text: `Student enrolled! Initial password sent: ${res.student?.generated_password || 'Auto-generated'}`, type: 'success' });
        setTimeout(() => {
          setShowModal(false);
          setName('');
          setEmail('');
          setFormMsg({ text: '', type: '' });
        }, 1500);
        await loadData();
      } else {
        setFormMsg({ text: res.message || 'Error creating student', type: 'danger' });
      }
    } catch {
      setFormMsg({ text: 'Failed to create student', type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async (id, sName) => {
    if (!window.confirm(`Are you sure you want to remove ${sName}?`)) return;

    try {
      await api.deleteStudent(id);
      await loadData();
    } catch (err) {
      alert('Failed to delete student');
    }
  };

  const handleBulkImport = async () => {
    if (!importFile) {
      setImportMsg({ text: 'Please select a file first.', type: 'danger' });
      return;
    }
    setImporting(true);
    setImportMsg({ text: '', type: '' });

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const res = await fetch('/api/admin/import_students', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await res.json();

      if (data.success) {
        const detail = data.errors?.length
          ? ` (${data.errors.length} row error(s): ${data.errors.slice(0, 2).join('; ')})`
          : '';
        setImportMsg({ text: `${data.message}${detail} Credentials emailed to each student.`, type: 'success' });
        setImportFile(null);
        await loadData();
        setTimeout(() => {
          setShowImportModal(false);
          setImportMsg({ text: '', type: '' });
        }, 3000);
      } else {
        setImportMsg({ text: data.message || 'Import failed.', type: 'danger' });
      }
    } catch {
      setImportMsg({ text: 'Network error — could not reach the server.', type: 'danger' });
    } finally {
      setImporting(false);
    }
  };

  const handleTestEmail = async () => {
    const targetEmail = prompt('Enter recipient email to send test credentials to:', 'shashidharpc1012@gmail.com');
    if (!targetEmail) return;

    setTestingEmail(true);
    try {
      const res = await api.testEmail(targetEmail);
      if (res.success) {
        alert(res.message);
      } else {
        alert(`Email test failed: ${res.message}`);
      }
    } catch (e) {
      alert(`Network error testing email: ${e.message}`);
    } finally {
      setTestingEmail(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchSearch = (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
                        (s.email || '').toLowerCase().includes(search.toLowerCase());
    const matchClass = selectedClass === 'ALL' || s.class_id === selectedClass;
    return matchSearch && matchClass;
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
              Student Roster
            </h1>
            <span className="badge badge-primary">{students.length} Enrolled</span>
          </div>
          <p style={{ color: 'var(--stone)', fontSize: '0.85rem', marginTop: '2px' }}>
            Manage classroom enrollments, student access credentials, and directory records.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <button
            onClick={handleTestEmail}
            disabled={testingEmail}
            className="btn btn-secondary btn-sm"
            style={{ gap: 'var(--space-2)', padding: '8px 14px', fontSize: '0.825rem' }}
            title="Send a sample credentials email to test your SMTP delivery setup"
          >
            <Mail size={15} />
            <span>{testingEmail ? 'Sending...' : 'Test Email'}</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="btn btn-secondary btn-sm"
            style={{ gap: 'var(--space-2)', padding: '8px 14px', fontSize: '0.825rem' }}
          >
            <Upload size={15} />
            <span>Bulk Import</span>
          </button>
          <button
            onClick={() => { setShowModal(true); setFormMsg({ text: '', type: '' }); }}
            className="btn btn-primary btn-sm"
            style={{ gap: 'var(--space-2)', padding: '8px 16px', fontSize: '0.825rem' }}
          >
            <Plus size={15} />
            <span>Enroll Student</span>
          </button>
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
            placeholder="Search student by name or email..."
            className="form-control"
            style={{ paddingLeft: '38px', padding: '8px 12px 8px 38px', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ width: '220px' }}>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="form-select"
            style={{ padding: '8px 12px', fontSize: '0.875rem' }}
          >
            <option value="ALL">All Classrooms</option>
            {classrooms.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table (Screen-Fitted) */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 20px', minHeight: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <p style={{ color: 'var(--stone)' }}>Loading student records...</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Assigned Classroom</th>
                  <th>Role</th>
                  <th>Enrolled On</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((st) => (
                    <tr key={st._id}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: 'var(--primary-gradient)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#ffffff',
                          }}>
                            {st.name?.charAt(0) || 'S'}
                          </div>
                          <span>{st.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{st.email}</td>
                      <td>
                        <span className="badge badge-primary">
                          <School size={12} /> {st.classroom_name || 'Assigned Class'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-success">Student</span>
                      </td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-dim)' }}>
                        {st.created_at ? new Date(st.created_at).toLocaleDateString() : 'Active'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteStudent(st._id, st.name)}
                          className="btn btn-secondary btn-icon"
                          style={{ width: '32px', height: '32px', color: '#F87171' }}
                          title="Remove student"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-dim)' }}>
                      No students found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Enroll Student */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Users size={22} color="#818CF8" />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Enroll New Student</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary btn-icon"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={18} />
              </button>
            </div>

            {formMsg.text && (
              <div className={`alert-box alert-${formMsg.type}`}>
                <span>{formMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateStudent}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Michael Chen"
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@edu.com"
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assign to Classroom</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  required
                  className="form-select"
                >
                  {classrooms.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-5)',
                fontSize: '0.8rem',
                color: 'var(--text-dim)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}>
                <Key size={14} color="#FBBF24" />
                A secure random password will be created and associated with this student.
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Enrolling...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk Import */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <FileSpreadsheet size={22} color="#10B981" />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Bulk Student Import</h3>
              </div>
              <button
                onClick={() => { setShowImportModal(false); setImportMsg({ text: '', type: '' }); setImportFile(null); }}
                className="btn btn-secondary btn-icon"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
              Upload an Excel (.xlsx) or CSV file with columns: <code>name</code>, <code>email</code>, <code>password</code> (optional), and <code>class</code> (must match an existing classroom name exactly).
            </p>

            {importMsg.text && (
              <div className={`alert-box alert-${importMsg.type}`} style={{ marginBottom: 'var(--space-4)' }}>
                <span>{importMsg.text}</span>
              </div>
            )}

            <div className="upload-dropzone" style={{ marginBottom: 'var(--space-5)' }}>
              <div className="upload-icon-circle">
                <Upload size={28} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', marginBottom: 'var(--space-1)' }}>
                {importFile ? importFile.name : 'Choose Excel or CSV spreadsheet'}
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                {importFile ? `${(importFile.size / 1024).toFixed(1)} KB selected` : 'Drag and drop or browse files from your computer'}
              </div>
              <input
                type="file"
                accept=".xlsx,.csv"
                style={{ marginTop: 'var(--space-3)' }}
                onChange={(e) => {
                  setImportFile(e.target.files[0] || null);
                  setImportMsg({ text: '', type: '' });
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button
                onClick={() => { setShowImportModal(false); setImportMsg({ text: '', type: '' }); setImportFile(null); }}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={handleBulkImport}
                disabled={importing || !importFile}
                className="btn btn-primary"
              >
                {importing ? 'Uploading...' : 'Start Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
