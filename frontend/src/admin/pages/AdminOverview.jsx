import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  Camera,
  BookOpen,
  RefreshCw,
  AlertCircle,
  Sprout,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import API from '../../api';

const COLORS = ['#16a34a', '#2563eb', '#8b5cf6', '#f59e0b', '#ef4444', '#14b8a6'];

// ─── Helper: extract array from response ──────────────────
const extractData = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (typeof response === 'object') {
    const keys = ['data', 'users', 'results', 'items', 'records', 'species'];
    for (const key of keys) {
      if (response[key] && Array.isArray(response[key])) {
        return response[key];
      }
    }
    if (response.id || response._id || response.email) return [response];
  }
  return [];
};

export default function AdminOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    users: 0,
    reports: 0,
    sightings: 0,
    encyclopedia: 0,
  });
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [monthlySightings, setMonthlySightings] = useState([]);
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // ─── Fetch all data in parallel ──────────────────────────
      const usersPromise = API.get('/admin/users').catch(() => API.get('/users'));
      const encyclopediaPromise = API.get('/encyclopedia').catch(() => API.get('/admin/encyclopedia'));

      const [usersRes, reportsRes, sightingsRes, encyclopediaRes] = await Promise.all([
        usersPromise.catch(() => ({ data: [] })),
        API.get('/reports?all=true').catch(() => ({ data: [] })),
        API.get('/sightings').catch(() => ({ data: [] })),
        encyclopediaPromise.catch(() => ({ data: [] })),
      ]);

      // ─── Extract arrays ──────────────────────────────────────
      const users = extractData(usersRes.data || usersRes);
      const reports = extractData(reportsRes.data || reportsRes);
      const sightings = extractData(sightingsRes.data || sightingsRes);
      const encyclopedia = extractData(encyclopediaRes.data || encyclopediaRes);

      console.log(`📊 Admin Dashboard: ${users.length} users, ${reports.length} reports, ${sightings.length} sightings, ${encyclopedia.length} encyclopedia entries`);

      // ─── Stats ──────────────────────────────────────────────
      setStats({
        users: users.length,
        reports: reports.length,
        sightings: sightings.length,
        encyclopedia: encyclopedia.length,
      });

      // ─── Monthly Reports (last 6 months) ──────────────────
      const now = new Date();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        months.push({
          month: d.toLocaleString('default', { month: 'short' }),
          index: d.getMonth(),
          year: d.getFullYear(),
        });
      }

      const monthlyCounts = months.map((m) => ({
        month: m.month,
        reports: reports.filter((r) => {
          const date = new Date(r.created_at);
          return date.getMonth() === m.index && date.getFullYear() === m.year;
        }).length,
      }));
      setMonthlyReports(monthlyCounts);

      // ─── Monthly Sightings ──────────────────────────────────
      const sightingsCounts = months.map((m) => ({
        month: m.month,
        sightings: sightings.filter((s) => {
          const date = new Date(s.created_at);
          return date.getMonth() === m.index && date.getFullYear() === m.year;
        }).length,
      }));
      setMonthlySightings(sightingsCounts);

      // ─── Incident Types ────────────────────────────────────
      const typeMap = {};
      reports.forEach((r) => {
        const type = r.incident_type || 'Other';
        typeMap[type] = (typeMap[type] || 0) + 1;
      });
      const typeData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));
      setIncidentTypes(typeData.length ? typeData : [{ name: 'No Reports', value: 1 }]);

      // ─── Recent Activity ──────────────────────────────────
      const activities = [
        ...reports.slice(0, 3).map((r) => ({
          id: `r-${r.id}`,
          type: 'report',
          title: `${r.incident_type} in ${r.location}`,
          time: new Date(r.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        })),
        ...sightings.slice(0, 2).map((s) => ({
          id: `s-${s.id}`,
          type: 'sighting',
          title: `${s.species || 'Unknown'} sighted in ${s.location}`,
          time: new Date(s.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        })),
      ];
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivity(activities.slice(0, 5));

    } catch (err) {
      console.error('❌ Admin dashboard error:', err);
      if (err.response?.status === 401) {
        navigate('/admin-login', { replace: true });
        return;
      }
      setError('Could not load data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Reports', value: stats.reports, icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Sightings', value: stats.sightings, icon: Camera, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Encyclopedia', value: stats.encyclopedia, icon: BookOpen, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-500">Overview of your platform</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl p-4 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* ─── Stats Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Charts ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart – Monthly Reports */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Reports</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyReports}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="reports" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart – Incident Types */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Incident Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={incidentTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name }) => name}
              >
                {incidentTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── Line Chart – Sightings Trend ────────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Sightings Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlySightings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sightings" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ─── Recent Activity ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Sprout className="w-5 h-5 text-green-600" />
          Recent Activity
        </h3>
        {recentActivity.length === 0 ? (
          <p className="text-gray-400 text-sm">No recent activity</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                <span className="text-xl">
                  {activity.type === 'report' ? '📌' : '👀'}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Quick Actions ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
          >
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-gray-700 font-medium">Manage Users</span>
          </button>
          <button
            onClick={() => navigate('/admin/reports')}
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition"
          >
            <FileText className="w-5 h-5 text-green-600" />
            <span className="text-gray-700 font-medium">All Reports</span>
          </button>
          <button
            onClick={() => navigate('/admin/sightings')}
            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition"
          >
            <Camera className="w-5 h-5 text-purple-600" />
            <span className="text-gray-700 font-medium">All Sightings</span>
          </button>
          <button
            onClick={() => navigate('/admin/encyclopedia')}
            className="flex items-center gap-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition"
          >
            <BookOpen className="w-5 h-5 text-yellow-600" />
            <span className="text-gray-700 font-medium">Encyclopedia</span>
          </button>
        </div>
      </div>
    </div>
  );
}