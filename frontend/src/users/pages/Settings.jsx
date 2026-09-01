import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Lock, Palette, Save, Sprout } from 'lucide-react';
import API from '../../api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    theme: 'light',
    fontSize: 'medium',
    emailNotifications: true,
    pushNotifications: true,
    profileVisibility: 'public',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get('/settings');
        setSettings(res.data);
      } catch (err) {
        setError('Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    try {
      await API.put('/settings', settings);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save settings.');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-gray-600" />
            Settings
          </h2>
          <p className="text-sm text-gray-500">Manage your account preferences.</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4">{success}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-wrap border-b border-gray-200">
          {[
            { id: 'account', label: 'Account', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'privacy', label: 'Privacy', icon: Lock },
            { id: 'appearance', label: 'Appearance', icon: Palette },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition ${
                activeTab === tab.id ? 'text-green-700 border-b-2 border-green-600 bg-green-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Account Settings</h3>
              <p className="text-sm text-gray-500">Name, email, and password management (coming soon).</p>
              <button onClick={handleSave} className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl font-medium transition flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          )}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Alerts' },
                  { key: 'pushNotifications', label: 'Push Notifications' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <span className="text-sm text-gray-700">{label}</span>
                    <div onClick={() => handleChange(key, !settings[key])} className={`w-12 h-6 rounded-full cursor-pointer transition ${settings[key] ? 'bg-green-600' : 'bg-gray-300'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition ${settings[key] ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
                    </div>
                  </label>
                ))}
              </div>
              <button onClick={handleSave} className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl font-medium transition flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Preferences
              </button>
            </div>
          )}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Privacy & Security</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Visibility</label>
                <select value={settings.profileVisibility} onChange={(e) => handleChange('profileVisibility', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="contacts">Contacts Only</option>
                </select>
              </div>
              <button onClick={handleSave} className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl font-medium transition flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Privacy Settings
              </button>
            </div>
          )}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Appearance</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                <div className="flex gap-3">
                  {['light', 'dark', 'system'].map((theme) => (
                    <button key={theme} onClick={() => handleChange('theme', theme)} className={`px-4 py-2 rounded-xl border-2 transition ${settings.theme === theme ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300'}`}>
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                <select value={settings.fontSize} onChange={(e) => handleChange('fontSize', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500">
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <button onClick={handleSave} className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl font-medium transition flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Appearance
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}