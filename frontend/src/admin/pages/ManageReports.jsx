import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  User,
  Mail,
  MapPin,
  Calendar,
  Image,
  X,
  Loader2,
} from 'lucide-react';
import API from '../../api';

const ITEMS_PER_PAGE = 10;

export default function ManageReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  
  // ─── Modal state ────────────────────────────────────────────────
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ─── Helper: extract data from response ──────────────────────
  const extractReports = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    if (response.reports && Array.isArray(response.reports)) return response.reports;
    if (response.results && Array.isArray(response.results)) return response.results;
    // If it's a single object, wrap it
    if (response.id || response._id) return [response];
    return [];
  };

  // ─── Fetch reports ──────────────────────────────────────────────
  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      // 🔥 Use ?all=true to get ALL reports (admin or not)
      const res = await API.get('/reports?all=true');
      console.log('📦 ManageReports raw response:', res);

      let reportsData = extractReports(res);
      
      // If reportsData is empty, try res.data directly (fallback)
      if (reportsData.length === 0 && res.data) {
        reportsData = extractReports(res.data);
      }

      console.log(`📊 Found ${reportsData.length} reports`);

      // Ensure each report has user_name and user_email (fallback if missing)
      const enriched = reportsData.map(r => ({
        ...r,
        user_name: r.user_name || r.user?.name || 'Unknown',
        user_email: r.user_email || r.user?.email || 'unknown@example.com',
      }));

      setReports(enriched);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      if (err.response?.status === 401) {
        // Unauthorized – redirect to admin login
        navigate('/admin-login', { replace: true });
        return;
      }
      setError('Could not load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ─── Filtered reports ──────────────────────────────────────────
  const filteredReports = reports.filter(r => {
    const matchSearch =
      (r.location && r.location.toLowerCase().includes(search.toLowerCase())) ||
      (r.species && r.species.toLowerCase().includes(search.toLowerCase())) ||
      (r.incident_type && r.incident_type.toLowerCase().includes(search.toLowerCase())) ||
      (r.user_name && r.user_name.toLowerCase().includes(search.toLowerCase())) ||
      (r.user_email && r.user_email.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ─── Pagination ────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // ─── Delete handler ─────────────────────────────────────────────
  const handleDelete = async (id, location) => {
    if (!window.confirm(`Are you sure you want to delete the report from "${location}"? This action cannot be undone.`)) {
      return;
    }
    setActionInProgress(true);
    try {
      await API.delete(`/reports/${id}`);
      setReports(prev => prev.filter(r => r.id !== id));
      setNotification({ type: 'success', message: 'Report deleted successfully.' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setNotification({ type: 'error', message: 'Failed to delete report.' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } finally {
      setActionInProgress(false);
    }
  };

  // ─── Status change handler ──────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    setActionInProgress(true);
    try {
      const report = reports.find(r => r.id === id);
      const updated = { ...report, status: newStatus };
      await API.put(`/reports/${id}`, updated);
      setReports(prev => prev.map(r => r.id === id ? updated : r));
      setNotification({ type: 'success', message: 'Status updated successfully.' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } catch (err) {
      console.error('Status update error:', err);
      setNotification({ type: 'error', message: 'Failed to update status.' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } finally {
      setActionInProgress(false);
    }
  };

  // ─── View handler ──────────────────────────────────────────────
  const handleView = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  // ─── Status badge ──────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const config = {
      pending: { label: 'Pending', icon: Clock, className: 'bg-yellow-100 text-yellow-700' },
      resolved: { label: 'Resolved', icon: CheckCircle, className: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejected', icon: XCircle, className: 'bg-red-100 text-red-700' },
    };
    const { label, icon: Icon, className } = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  // ─── Render ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-3" />
        <p className="font-medium">{error}</p>
        <button
          onClick={fetchReports}
          className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-green-600" />
            All Reports
          </h2>
          <p className="text-sm text-gray-500">{reports.length} total reports</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by location, species, type, user..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={fetchReports}
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition shadow-sm"
            title="Refresh"
            disabled={actionInProgress}
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* ─── Notification ──────────────────────────────────────────── */}
      {notification.message && (
        <div className={`rounded-xl p-4 text-sm flex items-center gap-2 ${
          notification.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          {notification.message}
        </div>
      )}

      {/* ─── Table ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">User</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Species</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Location</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    {search || statusFilter !== 'all'
                      ? 'No reports match your filters.'
                      : 'No reports available.'}
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-800 font-medium">#{report.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-gray-800 font-medium">{report.user_name}</span>
                        <span className="text-xs text-gray-400">{report.user_email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{report.incident_type}</td>
                    <td className="px-4 py-3 text-gray-600">{report.species || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-[150px]">{report.location}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(report.date_time).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusChange(report.id, e.target.value)}
                        disabled={actionInProgress}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-green-500 ${
                          report.status === 'resolved'
                            ? 'bg-green-100 text-green-700'
                            : report.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleView(report)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                          title="View Details"
                          disabled={actionInProgress}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(report.id, report.location)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition"
                          title="Delete"
                          disabled={actionInProgress}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ──────────────────────────────────────────── */}
        {filteredReports.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredReports.length)} of {filteredReports.length}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || actionInProgress}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || actionInProgress}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Modal: Report Details ────────────────────────────────── */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-6 h-6 text-green-600" />
                Report #{selectedReport.id}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column: Report details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Incident Type</h4>
                  <p className="text-gray-800 font-semibold">{selectedReport.incident_type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Species</h4>
                  <p className="text-gray-800">{selectedReport.species || '—'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Location</h4>
                  <p className="text-gray-800 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {selectedReport.location}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
                  <p className="text-gray-800 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(selectedReport.date_time).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <StatusBadge status={selectedReport.status} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Reported by</h4>
                  <p className="text-gray-800 flex items-center gap-1">
                    <User className="w-4 h-4 text-gray-400" />
                    {selectedReport.user_name}
                  </p>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {selectedReport.user_email}
                  </p>
                </div>
              </div>

              {/* Right column: Photo & Description */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                  <div className="bg-gray-50 rounded-xl p-4 text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto border border-gray-100">
                    {selectedReport.description}
                  </div>
                </div>
                {selectedReport.photo_url && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Attached Photo</h4>
                    <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                      <img
                        src={selectedReport.photo_url}
                        alt="Report evidence"
                        className="max-h-64 w-full object-contain rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<p class="text-sm text-gray-400 p-4">Image failed to load</p>';
                        }}
                      />
                    </div>
                  </div>
                )}
                {!selectedReport.photo_url && (
                  <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
                    <Image className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No photo attached</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}