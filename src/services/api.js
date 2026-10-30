// Production API Client for Attendance Geo Tracker
// Connects directly to Flask REST API backend with cookie session management

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return c * R;
}

async function request(url, options = {}) {
  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  // If using FormData, let the browser set the boundary header automatically
  if (config.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      success: false,
      status: response.status,
      message: data.message || data.error || `Request failed (${response.status})`,
      ...data,
    };
  }

  return data;
}

export const api = {
  // Authentication
  async checkAuthStatus() {
    try {
      const data = await request('/api/auth/status');
      if (data && data.authenticated && data.user) {
        return data.user;
      }
      return null;
    } catch {
      return null;
    }
  },

  async login(email, password) {
    try {
      const data = await request('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      return data;
    } catch (e) {
      return { success: false, message: 'Unable to connect to the authentication server.' };
    }
  },

  async logout() {
    try {
      return await request('/api/auth/logout', { method: 'POST' });
    } catch {
      return { success: true };
    }
  },

  // Admin: Dashboard
  async getAdminDashboard() {
    const data = await request('/api/admin/dashboard');
    if (!data || data.error) {
      return {
        stats: { total_students: 0, total_classrooms: 0, total_sessions: 0, total_proxy_attempts: 0 },
        recent_sessions: [],
        classroom_stats: [],
        trend: { dates: [], counts: [] },
        proxy_reasons: {},
      };
    }
    return data;
  },

  // Admin: Classrooms
  async getClassrooms() {
    const data = await request('/api/admin/classrooms');
    return data?.classrooms || [];
  },

  async createClassroom(name, latitude, longitude) {
    return await request('/api/admin/classrooms', {
      method: 'POST',
      body: { name, latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
    });
  },

  async updateClassroom(classroomId, name, latitude, longitude) {
    return await request(`/api/admin/classrooms/${classroomId}`, {
      method: 'PUT',
      body: { 
        name, 
        latitude: latitude !== undefined ? parseFloat(latitude) : undefined, 
        longitude: longitude !== undefined ? parseFloat(longitude) : undefined 
      },
    });
  },

  async deleteClassroom(classroomId) {
    return await request(`/api/admin/classrooms/${classroomId}`, {
      method: 'DELETE',
    });
  },

  // Admin: Students
  async getStudents() {
    const data = await request('/api/admin/students');
    return {
      students: data?.students || [],
      classrooms: data?.classrooms || [],
    };
  },

  async createStudent(name, email, class_id, password) {
    return await request('/api/admin/students', {
      method: 'POST',
      body: { name, email, class_id, password },
    });
  },

  async deleteStudent(studentId) {
    return await request(`/api/admin/students/${studentId}`, {
      method: 'DELETE',
    });
  },

  async updateStudent(studentId, updateData) {
    return await request(`/api/admin/students/${studentId}`, {
      method: 'PUT',
      body: updateData,
    });
  },

  async updateProfile(name) {
    return await request('/api/user/profile', {
      method: 'PUT',
      body: { name },
    });
  },

  async testEmail(recipient) {
    return await request('/api/admin/test_email', {
      method: 'POST',
      body: { recipient },
    });
  },

  // Admin: Sessions & QR Generation
  async generateQr(classroomId, expiryMinutes = 2) {
    return await request('/api/admin/generate_qr', {
      method: 'POST',
      body: { classroom_id: classroomId, expiry_minutes: expiryMinutes },
    });
  },

  // Admin: Attendance Reports
  async getAttendanceReport(sessionId) {
    return await request(`/api/admin/attendance_report/${sessionId}`);
  },

  // Admin: Security & Proxy Attempts
  async getProxyAttempts() {
    const data = await request('/api/admin/proxy_attempts');
    return data?.proxy_attempts || [];
  },

  // Student: Dashboard
  async getStudentDashboard() {
    const data = await request('/api/student/dashboard');
    if (!data || data.error) {
      return {
        student: {},
        total_attended: 0,
        total_classes: 0,
        attendance_percentage: 0,
        recent_attendance: [],
      };
    }
    return data;
  },

  // Student: Geofence Verification & Attendance
  async verifyAttendance(qrPayload, latitude, longitude) {
    return await request('/api/student/verify_attendance', {
      method: 'POST',
      body: {
        qr_data: typeof qrPayload === 'string' ? qrPayload : JSON.stringify(qrPayload),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    });
  },
};
