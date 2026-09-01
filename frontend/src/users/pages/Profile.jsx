import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, MapPin, FileText, Camera, TrendingUp, 
  Edit2, Save, X, Upload, CheckCircle, AlertCircle, Loader 
} from 'lucide-react';
import API from '../../api';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // ─── Form state ──────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatar: null, // file object
    avatarPreview: null, // for preview
  });

  // ─── Stats ──────────────────────────────────────────────────
  const [stats, setStats] = useState({
    reports: 0,
    sightings: 0,
    impact: 0,
  });

  // ─── Fetch profile & stats ──────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const userRes = await API.get('/auth/me');
        const userData = userRes.data;
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          location: userData.location || '',
          bio: userData.bio || '',
          avatar: null,
          avatarPreview: userData.avatar_url || null, // if backend returns URL
        });

        // ─── Stats ──────────────────────────────────────────
        const [reportsRes, sightingsRes] = await Promise.all([
          API.get('/reports'),
          API.get('/sightings'),
        ]);
        const reports = reportsRes.data;
        const sightings = sightingsRes.data;
        const resolved = reports.filter((r) => r.status === 'resolved').length;

        setStats({
          reports: reports.length,
          sightings: sightings.length,
          impact: resolved,
        });
      } catch (err) {
        console.error('Profile fetch error:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          navigate('/user-login', { replace: true });
          return;
        }
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // ─── Form change handlers ──────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear any old success/error messages
    setSuccessMsg('');
    setError(null);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Validate size and type
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPEG, PNG, or WebP images are allowed.');
      return;
    }
    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        avatar: file,
        avatarPreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: null,
      avatarPreview: null,
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Save changes ────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg('');

    try {
      // Build FormData for multipart upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone || '');
      formDataToSend.append('location', formData.location || '');
      formDataToSend.append('bio', formData.bio || '');
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }

      // If you have a dedicated endpoint, use it; otherwise fallback to /auth/me
      const response = await API.put('/auth/me', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update user state with new data (including new avatar URL)
      const updatedUser = response.data.user || response.data;
      setUser(updatedUser);
      setFormData((prev) => ({
        ...prev,
        avatarPreview: updatedUser.avatar_url || prev.avatarPreview,
        avatar: null,
      }));
      // Also update localStorage user
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updatedUser }));

      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Save error:', err);
      const msg = err.response?.data?.msg || err.response?.data?.message || 'Failed to update profile.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ─── Cancel editing ──────────────────────────────────────────
  const cancelEdit = () => {
    // Reset form to current user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        avatar: null,
        avatarPreview: user.avatar_url || null,
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccessMsg('');
  };

  // ─── Loading / Error states ──────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium">
          Retry
        </button>
      </div>
    );
  }

  if (!user) return null;

  // ─── Stats cards ──────────────────────────────────────────────
  const statsCards = [
    { label: 'Reports', value: stats.reports, icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Sightings', value: stats.sightings, icon: Camera, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Impact (Resolved)', value: stats.impact, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User className="w-6 h-6 text-green-600" />
            My Profile
          </h2>
          <p className="text-sm text-gray-500">View and manage your profile information.</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl shadow transition disabled:opacity-60"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl shadow transition"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* ─── Success / Error messages ──────────────────────────── */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* ─── Profile Card ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar with upload */}
          <div className="relative">
            <div
              className={`w-28 h-28 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-6xl shadow-sm overflow-hidden ${isEditing ? 'cursor-pointer hover:opacity-80 transition' : ''}`}
              onClick={isEditing ? handleAvatarClick : undefined}
            >
              {formData.avatarPreview ? (
                <img
                  src={formData.avatarPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user.name?.charAt(0) || '🌿'}</span>
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            {isEditing && (
              <div className="mt-2 flex justify-center gap-2">
                <button
                  onClick={handleAvatarClick}
                  className="text-xs text-green-700 hover:underline flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" /> Upload
                </button>
                {formData.avatarPreview && (
                  <button
                    onClick={removeAvatar}
                    className="text-xs text-red-600 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
          </div>

          {/* User info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-2xl font-bold text-gray-800">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="text-2xl font-bold bg-transparent border-b-2 border-green-300 focus:border-green-600 outline-none"
                    placeholder="Your name"
                  />
                ) : (
                  user.name
                )}
              </h3>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                {user.role === 'admin' ? 'Admin' : 'Community Member'}
              </span>
            </div>

            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-transparent border-b border-gray-300 focus:border-green-500 outline-none"
                    placeholder="Email"
                  />
                ) : (
                  user.email
                )}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-transparent border-b border-gray-300 focus:border-green-500 outline-none"
                    placeholder="Phone number"
                  />
                ) : (
                  formData.phone || 'Not set'
                )}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="bg-transparent border-b border-gray-300 focus:border-green-500 outline-none"
                    placeholder="Your location"
                  />
                ) : (
                  formData.location || 'Not set'
                )}
              </p>
            </div>

            {/* Bio */}
            <div className="mt-2">
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="2"
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-sm text-gray-600">{formData.bio || 'No bio yet.'}</p>
              )}
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Member since {new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Stats ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statsCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Additional editable fields (optional) ────────────── */}
      {/* You can add more fields like social links, etc. */}
    </div>
  );
}