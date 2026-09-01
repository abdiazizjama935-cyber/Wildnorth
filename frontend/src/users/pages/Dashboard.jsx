import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sprout,
  FileText,
  Camera,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import API from '../../api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28D4E'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [stats, setStats] = useState({
    reports: 0,
    sightings: 0,
    users: 0,
    resolved: 0,
    pending: 0,
    rejected: 0,
  });
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [sightingsData, setSightingsData] = useState([]);
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const fetchDashboardData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    setError(null);

    try {
      // 🔥 IMPORTANT: Add ?all=true to get ALL reports (not just user's own)
      const [reportsRes, sightingsRes] = await Promise.all([
        API.get('/reports?all=true'),
        API.get('/sightings'),
      ]);

      // Ensure we have arrays (fallback to empty)
      const reports = Array.isArray(reportsRes.data) ? reportsRes.data : [];
      const sightings = Array.isArray(sightingsRes.data) ? sightingsRes.data : [];

      // ─── Stats ──────────────────────────────────────────────
      const resolved = reports.filter((r) => r.status === 'resolved').length;
      const pending = reports.filter((r) => r.status === 'pending').length;
      const rejected = reports.filter((r) => r.status === 'rejected').length;

      setStats({
        reports: reports.length,
        sightings: sightings.length,
        users: 0,
        resolved,
        pending,
        rejected,
      });

      // ─── Monthly Reports ──────────────────────────────────
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyCounts = months.map((month, index) => {
        const count = reports.filter((r) => {
          const date = new Date(r.created_at);
          return date.getMonth() === index && date.getFullYear() === new Date().getFullYear();
        }).length;
        return { month, reports: count };
      });
      setMonthlyReports(monthlyCounts);

      // ─── Sightings Trend ──────────────────────────────────
      const sightingsTrend = months.map((month, index) => {
        const count = sightings.filter((s) => {
          const date = new Date(s.created_at);
          return date.getMonth() === index && date.getFullYear() === new Date().getFullYear();
        }).length;
        return { month, sightings: count };
      });
      setSightingsData(sightingsTrend);

      // ─── Incident Types ──────────────────────────────────
      const typeMap = {};
      reports.forEach((r) => {
        typeMap[r.incident_type] = (typeMap[r.incident_type] || 0) + 1;
      });
      const typeData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));
      setIncidentTypes(typeData.length ? typeData : [{ name: 'No data', value: 1 }]);

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
          status: r.status,
        })),
        ...sightings.slice(0, 2).map((s) => ({
          id: `s-${s.id}`,
          type: 'sighting',
          title: `${s.species} sighted in ${s.location}`,
          time: new Date(s.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          status: null,
        })),
      ];
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivity(activities.slice(0, 5));

      setLastUpdated(new Date());

    } catch (err) {
      console.error('Dashboard error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/user-login', { replace: true });
        return;
      }
      setError('Could not load dashboard data.');
    } finally {
      setLoading(false);
      if (showRefresh) setRefreshing(false);
    }
  };

  // ─── Initial load + auto‑refresh every 30 seconds ────────────
  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // ─── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
      </div>
    );
  }

  // ─── Error ──────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        <p className="font-medium">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  // ─── Stats cards ────────────────────────────────────────────
  const statsCards = [
    { label: 'Total Reports', value: stats.reports, icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Sightings', value: stats.sightings, icon: Camera, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-sm text-gray-500">
            {stats.reports + stats.sightings > 0
              ? `You have ${stats.reports} reports and ${stats.sightings} sightings.`
              : 'Start by submitting a report or logging a sighting.'}
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ─── Stats Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value.toLocaleString()}</p>
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
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Monthly Reports ({new Date().getFullYear()})
          </h3>
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

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Sightings Trend ({new Date().getFullYear()})
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={sightingsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sightings" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── Pie + Status ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Incident Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={220}>
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

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-green-600">{stats.resolved}</div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" /> Resolved
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${stats.reports ? (stats.resolved / stats.reports) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-4 h-4 text-yellow-600" /> Pending
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-yellow-600 h-2 rounded-full"
                style={{ width: `${stats.reports ? (stats.pending / stats.reports) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-red-600" /> Rejected
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{ width: `${stats.reports ? (stats.rejected / stats.reports) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Recent Activity ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Sprout className="w-5 h-5 text-green-600" />
          Recent Activity
        </h3>
        {recentActivity.length === 0 ? (
          <p className="text-gray-400 text-sm">No recent activity yet. Submit a report or log a sighting!</p>
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
                {activity.status && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.status === 'resolved'
                      ? 'bg-green-100 text-green-700'
                      : activity.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {activity.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Quick Actions ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/report"
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition"
          >
            <FileText className="w-5 h-5 text-green-600" />
            <span className="text-gray-700 font-medium">Report Incident</span>
          </Link>
          <Link
            to="/report"
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
          >
            <Camera className="w-5 h-5 text-blue-600" />
            <span className="text-gray-700 font-medium">Log Sighting</span>
          </Link>
          <Link
            to="/dashboard/map"
            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition"
          >
            <MapPin className="w-5 h-5 text-purple-600" />
            <span className="text-gray-700 font-medium">View Map</span>
          </Link>
          <Link
            to="/dashboard/encyclopedia"
            className="flex items-center gap-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition"
          >
            <BookOpen className="w-5 h-5 text-yellow-600" />
            <span className="text-gray-700 font-medium">Encyclopedia</span>
          </Link>
        </div>
      </div>
    </div>
  );
}