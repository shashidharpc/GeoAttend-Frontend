import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  School, 
  Plus, 
  MapPin, 
  Navigation, 
  QrCode, 
  X,
  Search,
  Crosshair,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ExternalLink,
  Edit2,
  Trash2,
  ClipboardPaste,
  Globe,
  RefreshCw
} from 'lucide-react';

export default function Classrooms() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClassroomId, setEditingClassroomId] = useState(null);
  const [search, setSearch] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null); // { type: 'success' | 'warning' | 'info', message: '' }
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Coordinate paste & location search helpers
  const [pasteInput, setPasteInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('gps'); // 'gps' | 'paste' | 'search'

  useEffect(() => {
    loadClassrooms();
  }, []);

  async function loadClassrooms() {
    setLoading(true);
    try {
      const data = await api.getClassrooms();
      setClassrooms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const openCreateModal = () => {
    setEditingClassroomId(null);
    setName('');
    setLatitude('');
    setLongitude('');
    setPasteInput('');
    setSearchQuery('');
    setSearchResults([]);
    setGpsStatus(null);
    setFormError('');
    setActiveTab('gps');
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setEditingClassroomId(c._id);
    setName(c.name || '');
    setLatitude(c.latitude?.toString() || '');
    setLongitude(c.longitude?.toString() || '');
    setPasteInput('');
    setSearchQuery('');
    setSearchResults([]);
    setGpsStatus({
      type: 'info',
      message: `Editing coordinates for "${c.name}". Current: (${c.latitude}, ${c.longitude})`
    });
    setFormError('');
    setActiveTab('gps');
    setShowModal(true);
  };

  const handleDeleteClassroom = async (c) => {
    if (!window.confirm(`Are you sure you want to delete classroom "${c.name}"?`)) {
      return;
    }
    try {
      const res = await api.deleteClassroom(c._id);
      if (res.success) {
        await loadClassrooms();
      } else {
        alert(res.message || 'Failed to delete classroom');
      }
    } catch (err) {
      alert('Error deleting classroom');
    }
  };

  const handleQuickSyncLocation = async (c) => {
    if (!window.confirm(`Update coordinates for "${c.name}" to Lat: 14.377778, Lng: 75.091805?`)) return;
    try {
      const res = await api.updateClassroom(c._id, c.name, 14.377778, 75.091805);
      if (res.success) {
        await loadClassrooms();
      } else {
        alert(res.message || 'Failed to update coordinates');
      }
    } catch (e) {
      alert('Error updating classroom coordinates');
    }
  };

  // High Accuracy Hardware/Browser GPS Detection (No IP spoofing or fake Bengaluru fallback)
  const handleFetchCurrentGps = async () => {
    setGpsLoading(true);
    setFormError('');
    setGpsStatus({ type: 'info', message: 'Requesting precise device GPS (please click "Allow" if browser asks)...' });

    if (!navigator.geolocation) {
      setGpsLoading(false);
      setGpsStatus({
        type: 'warning',
        message: 'Geolocation is not supported by your browser. Please enter coordinates manually or paste from Google Maps below.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        const acc = Math.round(pos.coords.accuracy || 10);
        setLatitude(lat);
        setLongitude(lng);
        if (acc > 1000) {
          setGpsStatus({
            type: 'warning',
            message: `ISP Network Estimated Location (${lat}, ${lng} ±${Math.round(acc / 1000)}km accuracy). On desktop PCs without satellite GPS, Windows resolves to ISP center (often Bengaluru). Click "Match Current Student GPS (14.3778, 75.0918)" below if testing.`,
          });
        } else {
          setGpsStatus({
            type: 'success',
            message: `Precise device GPS locked (±${acc}m accuracy at ${lat}, ${lng}).`,
          });
        }
        setGpsLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGpsLoading(false);
        let errorMsg = 'Could not acquire device GPS. ';
        if (err.code === 1) {
          errorMsg += 'Location permission was denied. Please allow location in your browser address bar.';
        } else if (err.code === 3) {
          errorMsg += 'GPS request timed out. Please try again or paste coordinates below.';
        } else {
          errorMsg += 'Position unavailable on this network. Please paste coordinates from Google Maps or search below.';
        }
        setGpsStatus({
          type: 'warning',
          message: errorMsg,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Coordinate Parser (splits "14.377778, 75.091805" or "14.377778 75.091805" etc.)
  const parseCoordinates = (text) => {
    if (!text || typeof text !== 'string') return null;
    const clean = text.trim();
    // Regular expression matching two decimal numbers separated by comma, space, or tab
    const regex = /(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/;
    const match = clean.match(regex);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat: lat.toFixed(6), lng: lng.toFixed(6) };
      }
    }
    return null;
  };

  const handleApplyPastedCoords = (textToParse) => {
    const coords = parseCoordinates(textToParse || pasteInput);
    if (coords) {
      setLatitude(coords.lat);
      setLongitude(coords.lng);
      setPasteInput('');
      setFormError('');
      setGpsStatus({
        type: 'success',
        message: `Parsed & applied coordinates: Lat ${coords.lat}, Lng ${coords.lng}.`,
      });
    } else {
      setFormError('Could not recognize coordinates format. Expected e.g. "14.377778, 75.091805"');
    }
  };

  const handleClipboardPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPasteInput(text);
        handleApplyPastedCoords(text);
      }
    } catch (e) {
      setFormError('Clipboard permission denied. Please paste manually into the text box.');
    }
  };

  // Nominatim OpenStreetMap Campus/City Geocoder Search
  const handleSearchLocation = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setFormError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&limit=4`
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSearchResults(data);
      } else {
        setSearchResults([]);
        setFormError(`No locations found matching "${searchQuery}". Try typing your college name, landmark, or city.`);
      }
    } catch (err) {
      setFormError('Failed to search locations. Please check internet connection or enter coordinates directly.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat).toFixed(6);
    const lng = parseFloat(result.lon).toFixed(6);
    setLatitude(lat);
    setLongitude(lng);
    setSearchResults([]);
    setFormError('');
    setGpsStatus({
      type: 'success',
      message: `Selected location: ${result.display_name.split(',')[0]} (${lat}, ${lng})`,
    });
  };

  // Submit Handler (Create or Update)
  const handleSaveClassroom = async (e) => {
    e.preventDefault();
    if (!name.trim() || latitude === '' || longitude === '') {
      setFormError('Please fill in classroom name, latitude, and longitude.');
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      setFormError('Please enter valid numeric latitude (-90 to 90) and longitude (-180 to 180).');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      let res;
      if (editingClassroomId) {
        res = await api.updateClassroom(editingClassroomId, name.trim(), latNum, lngNum);
      } else {
        res = await api.createClassroom(name.trim(), latNum, lngNum);
      }

      if (res.success) {
        setShowModal(false);
        setName('');
        setLatitude('');
        setLongitude('');
        setEditingClassroomId(null);
        await loadClassrooms();
      } else {
        setFormError(res.message || 'Failed to save classroom.');
      }
    } catch (err) {
      setFormError('Error communicating with server while saving classroom.');
    } finally {
      setSaving(false);
    }
  };

  const filteredClassrooms = classrooms.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

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
              Classrooms & Geofences
            </h1>
            <span className="badge badge-primary">{classrooms.length} Configured</span>
          </div>
          <p style={{ color: 'var(--stone)', fontSize: '0.85rem', marginTop: '2px' }}>
            Define precise GPS coordinates and strict 30-meter radius boundaries for attendance enforcement.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn btn-primary btn-sm"
          style={{ gap: 'var(--space-2)', padding: '9px 18px', fontSize: '0.85rem' }}
        >
          <Plus size={16} />
          <span>Add New Classroom</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        background: 'var(--bg-card)',
        padding: '10px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="var(--stone)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classrooms by name or hall..."
            className="form-control"
            style={{ paddingLeft: '38px', padding: '8px 12px 8px 38px', fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {/* Classrooms Grid (Screen-Fitted Scroll Container) */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 250px)', paddingRight: '4px' }}>

      {/* Classroom Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="spinner-border text-primary" style={{ width: '32px', height: '32px', margin: '0 auto var(--space-3) auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading classrooms...</p>
        </div>
      ) : filteredClassrooms.length > 0 ? (
        <div className="grid-cards">
          {filteredClassrooms.map((c) => (
            <div key={c._id} className="glass-card lift" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(194, 120, 92, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <School size={22} color="var(--clay)" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => openEditModal(c)}
                    className="btn btn-secondary btn-icon"
                    title="Edit Coordinates & Name"
                    style={{ width: '30px', height: '30px', padding: 0 }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteClassroom(c)}
                    className="btn btn-secondary btn-icon"
                    title="Delete Classroom"
                    style={{ width: '30px', height: '30px', padding: 0, color: '#EF4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3 }}>
                  {c.name}
                </h3>
                <span className="badge badge-success" style={{ fontSize: '0.725rem' }}>
                  <Crosshair size={12} /> 30m Geofence
                </span>
              </div>

              {/* Coordinates Box */}
              <div style={{
                background: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
                border: '1px solid var(--border-subtle)',
                marginBottom: 'var(--space-4)',
                fontSize: '0.85rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-muted)' }}>
                    <MapPin size={14} color="var(--accent-cyan)" />
                    <strong>GPS Coordinates</strong>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.75rem', color: '#818CF8', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                  >
                    <span>View Map</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
                <div style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600 }}>
                  Lat: {Number(c.latitude).toFixed(6)}
                </div>
                <div style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600 }}>
                  Lng: {Number(c.longitude).toFixed(6)}
                </div>
              </div>

              {/* One-click Sync to Active Student Coordinates */}
              <button
                type="button"
                onClick={() => handleQuickSyncLocation(c)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.725rem', padding: '4px 8px', gap: '4px', width: '100%', marginBottom: 'var(--space-3)' }}
                title="Sync this classroom to active test coordinates (14.3778, 75.0918)"
              >
                <MapPin size={11} color="var(--clay)" />
                <span>Sync to Location (14.3778, 75.0918)</span>
              </button>

              {/* Stats summary */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.825rem',
                color: 'var(--text-muted)',
                marginBottom: 'var(--space-4)',
              }}>
                <span>Students: <strong style={{ color: 'var(--text-main)' }}>{c.student_count ?? 0}</strong></span>
                <span>Sessions: <strong style={{ color: 'var(--text-main)' }}>{c.session_count ?? 0}</strong></span>
              </div>

              {/* Action Button */}
              <Link
                to={`/admin/generate-qr?classroom=${c._id}`}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 'auto', gap: 'var(--space-2)', fontSize: '0.875rem' }}
              >
                <QrCode size={16} />
                <span>Generate QR Session</span>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <School size={48} color="var(--text-dim)" style={{ margin: '0 auto var(--space-4) auto' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-2)' }}>No Classrooms Found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto var(--space-4) auto' }}>
            Get started by adding your first classroom location with accurate GPS coordinates.
          </p>
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={16} /> Add Classroom
          </button>
        </div>
      )}
      </div>

      {/* Modal: Create or Edit Classroom */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <School size={22} color="#818CF8" />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                  {editingClassroomId ? 'Edit Classroom Coordinates' : 'Add New Classroom'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary btn-icon"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="alert-box alert-danger" style={{ marginBottom: 'var(--space-4)' }}>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveClassroom}>
              <div className="form-group">
                <label className="form-label">Classroom / Hall Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Science Lab 4 or Room 204"
                  required
                  className="form-control"
                />
              </div>

              {/* Coordinate Setting Tools Box */}
              <div style={{
                background: 'var(--bg-glass-card, rgba(99, 102, 241, 0.05))',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-5)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Navigation size={16} color="#818CF8" />
                      <span>Set Classroom GPS Location</span>
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Choose your preferred method to set accurate coordinates:
                    </div>
                  </div>
                </div>

                {/* Sub-tabs for location setting */}
                <div className="location-subtabs" style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-2)' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('gps')}
                    className={`btn btn-sm ${activeTab === 'gps' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.78rem', gap: '4px' }}
                  >
                    <Crosshair size={13} />
                    <span>My Device GPS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('paste')}
                    className={`btn btn-sm ${activeTab === 'paste' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.78rem', gap: '4px' }}
                  >
                    <ClipboardPaste size={13} />
                    <span>Paste from Maps</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('search')}
                    className={`btn btn-sm ${activeTab === 'search' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.78rem', gap: '4px' }}
                  >
                    <Globe size={13} />
                    <span>Search Campus/City</span>
                  </button>
                </div>

                {/* Tab 1: Hardware GPS Detection */}
                {activeTab === 'gps' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Detect coordinates of the current device physically located in this classroom.
                      </span>
                      <button
                        type="button"
                        onClick={handleFetchCurrentGps}
                        disabled={gpsLoading}
                        className="btn btn-primary btn-sm"
                        style={{ gap: 'var(--space-2)' }}
                      >
                        {gpsLoading ? (
                          <>
                            <div className="spinner-border spinner-border-sm" style={{ width: '13px', height: '13px', borderWidth: '2px' }} />
                            <span>Detecting GPS...</span>
                          </>
                        ) : (
                          <>
                            <Crosshair size={14} />
                            <span>Fetch My GPS</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quick Match Presets */}
                    <div style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px dashed var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setLatitude('14.377778');
                          setLongitude('75.091805');
                          setGpsStatus({
                            type: 'success',
                            message: 'Applied active student coordinates: Lat 14.377778, Lng 75.091805',
                          });
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '3px 8px', gap: '4px' }}
                      >
                        <MapPin size={11} color="var(--clay)" />
                        <span>Student Location (14.3778, 75.0918)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 2: Paste Coordinates from Google Maps */}
                {activeTab === 'paste' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Right-click anywhere on Google Maps, click the coordinates to copy, and paste here:
                    </span>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <input
                        type="text"
                        value={pasteInput}
                        onChange={(e) => setPasteInput(e.target.value)}
                        placeholder="e.g. 14.377778, 75.091805"
                        className="form-control"
                        style={{ fontSize: '0.85rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyPastedCoords()}
                        className="btn btn-primary btn-sm"
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        onClick={handleClipboardPaste}
                        className="btn btn-secondary btn-sm"
                        title="Paste from Clipboard"
                      >
                        <ClipboardPaste size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 3: Search Location via Nominatim */}
                {activeTab === 'search' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Search by campus name, landmark, or city (e.g. "Sirsi Karnataka" or "KLE College"):
                    </span>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchLocation(); } }}
                        placeholder="Type college or city name..."
                        className="form-control"
                        style={{ fontSize: '0.85rem' }}
                      />
                      <button
                        type="button"
                        onClick={handleSearchLocation}
                        disabled={searchLoading}
                        className="btn btn-primary btn-sm"
                        style={{ gap: '4px' }}
                      >
                        {searchLoading ? (
                          <div className="spinner-border spinner-border-sm" style={{ width: '13px', height: '13px' }} />
                        ) : (
                          <Search size={14} />
                        )}
                        <span>Find</span>
                      </button>
                    </div>

                    {/* Search results list */}
                    {searchResults.length > 0 && (
                      <div style={{
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        maxHeight: '140px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                      }}>
                        {searchResults.map((res, i) => (
                          <div
                            key={i}
                            onClick={() => handleSelectSearchResult(res)}
                            style={{
                              padding: '6px 10px',
                              fontSize: '0.78rem',
                              borderBottom: i < searchResults.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                            className="search-result-item"
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '380px' }}>
                              📍 {res.display_name}
                            </span>
                            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Use</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Status Feedback Banner */}
                {gpsStatus && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    background: gpsStatus.type === 'success' 
                      ? 'rgba(16, 185, 129, 0.12)' 
                      : gpsStatus.type === 'warning' 
                        ? 'rgba(245, 158, 11, 0.12)' 
                        : 'rgba(99, 102, 241, 0.12)',
                    border: `1px solid ${
                      gpsStatus.type === 'success' 
                        ? 'rgba(16, 185, 129, 0.3)' 
                        : gpsStatus.type === 'warning' 
                          ? 'rgba(245, 158, 11, 0.3)' 
                          : 'rgba(99, 102, 241, 0.3)'
                    }`,
                    color: gpsStatus.type === 'success' 
                      ? '#10B981' 
                      : gpsStatus.type === 'warning' 
                        ? '#F59E0B' 
                        : '#818CF8',
                  }}>
                    {gpsStatus.type === 'success' ? (
                      <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                    ) : gpsStatus.type === 'warning' ? (
                      <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <Compass size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                    )}
                    <span>{gpsStatus.message}</span>
                  </div>
                )}
              </div>

              {/* Coordinates Inputs */}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 14.377778"
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 75.091805"
                    required
                    className="form-control"
                  />
                </div>
              </div>

              {/* Verification & Google Maps Link */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: 'var(--text-dim)',
                marginBottom: 'var(--space-5)',
              }}>
                <span>Strict 30-meter perimeter enforced around coordinates.</span>
                {latitude && longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#818CF8', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none', fontWeight: 600 }}
                  >
                    <span>Check on Google Maps</span>
                    <ExternalLink size={12} />
                  </a>
                )}
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
                  {saving ? 'Saving...' : editingClassroomId ? 'Update Classroom' : 'Save Classroom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
