import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Filter, Clock, FileText, Camera, AlertCircle, Users, Settings, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../../api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Could not load notifications.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAllAsRead = () => {
    // Placeholder – you can implement a PUT /notifications/read-all later
    alert('Mark all as read (mock)');
  };

  const toggleRead = (id) => {
    // Placeholder – implement toggle later
    alert(`Toggle read for notification ${id}`);
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" /></div>;
  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="w-6 h-6 text-green-600" />
            Notifications
          </h2>
          <p className="text-sm text-gray-500">Stay updated on your wildlife reports and community activity.</p>
        </div>
        <button onClick={markAllAsRead} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
          <CheckCheck className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{notifications.filter(n => !n.read).length} unread</span>
          <span className="w-px h-6 bg-gray-200" />
          <span className="text-sm text-gray-500">{notifications.length} total</span>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-1.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 text-sm">
            <option value="all">All</option>
            <option value="report">Report</option>
            <option value="sighting">Sighting</option>
            <option value="system">System</option>
            <option value="alert">Alert</option>
            <option value="message">Message</option>
          </select>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No notifications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div key={n.id} className={`bg-white rounded-2xl p-4 shadow-sm border transition hover:shadow-md ${n.read ? 'border-gray-100' : 'border-green-200 bg-green-50/30'}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${n.read ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-600'}`}>
                  {/* You can map icons based on n.type */}
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm font-medium ${n.read ? 'text-gray-600' : 'text-gray-800'}`}>{n.title}</p>
                      <p className={`text-sm ${n.read ? 'text-gray-500' : 'text-gray-600'} mt-0.5`}>{n.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400 whitespace-nowrap">{n.time}</span>
                      <button onClick={() => toggleRead(n.id)} className={`text-xs px-2 py-0.5 rounded-full ${n.read ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'} transition`}>
                        {n.read ? 'Mark unread' : 'Mark read'}
                      </button>
                    </div>
                  </div>
                  <Link to={n.link || '#'} className="mt-2 inline-block text-xs text-green-700 hover:underline font-medium">View details →</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}