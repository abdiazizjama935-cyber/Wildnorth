import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  X,
  MapPin,
  Calendar,
  Image,
  Save,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api';

const ALLOWED_COUNTIES = ['Garissa', 'Wajir', 'Mandera', 'Isiolo', 'Marsabit'];

export default function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawStats, setRawStats] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    incidentType: 'all',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    incident_type: '',
    species: '',
    location: '',
    description: '',
    status: '',
  });
  const [saving, setSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── Helper: extract array from response ──────────────────
  const extractData = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (typeof response === 'object') {
      const keys = ['data', 'reports', 'sightings', 'results', 'items', 'records'];
      for (const key of keys) {
        if (response[key] && Array.isArray(response[key])) {
          return response[key];
        }
      }
      if (response.id || response._id) return [response];
    }
    return [];
  };

  // ─── Fetch both reports and sightings ──────────────────────
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setRawStats(null);

    try {
      console.log('🔄 Fetching reports and sightings...');

      const [reportsRes, sightingsRes] = await Promise.all([
        API.get('/reports?all=true').catch((err) => {
          console.warn('⚠️ Reports fetch error:', err);
          return null;
        }),
        API.get('/sightings').catch((err) => {
          console.warn('⚠️ Sightings fetch error:', err);
          return null;
        }),
      ]);

      console.log('📦 Raw reports response:', reportsRes);
      console.log('📦 Raw sightings response:', sightingsRes);

      const reportsData = extractData(reportsRes);
      const sightingsData = extractData(sightingsRes);

      console.log(`📊 Found ${reportsData.length} reports and ${sightingsData.length} sightings`);

      setRawStats({ reports: reportsData.length, sightings: sightingsData.length });

      // ─── Convert sightings ─────────────────────────────────
      const sightingReports = sightingsData.map((s) => ({
        id: s.id || s._id,                      // ← keep the real ID (numeric)
        incident_type: 'Wildlife Sighting',
        species: s.species || '',
        location: s.location || '',
        description: s.notes || s.description || '',
        date_time: s.date_time || s.created_at || s.timestamp || new Date().toISOString(),
        status: s.status || 'pending',
        photo_url: s.image_url || s.photo_url || null,
        _sighting: true,
        original: s,                            // ← keep original object with real ID
      }));

      // ─── Convert reports ───────────────────────────────────
      const formattedReports = reportsData.map((r) => ({
        id: r.id || r._id,                      // ← keep real ID
        incident_type: r.incident_type || r.type || '',
        species: r.species || '',
        location: r.location || '',
        description: r.description || '',
        date_time: r.date_time || r.created_at || r.timestamp || new Date().toISOString(),
        status: r.status || 'pending',
        photo_url: r.photo_url || r.image_url || null,
        _sighting: false,
        original: r,
      }));

      // ─── Merge and filter by county ────────────────────────
      let all = [...formattedReports, ...sightingReports];
      console.log(`🔄 Before county filter: ${all.length} items`);

      const filtered = all.filter((report) => {
        if (!report.location) return false;
        const lower = report.location.toLowerCase();
        return ALLOWED_COUNTIES.some(county => lower.includes(county.toLowerCase()));
      });

      console.log(`✅ After county filter: ${filtered.length} items`);

      filtered.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));

      setReports(filtered);
      setPagination((prev) => ({ ...prev, total: filtered.length }));

      if (filtered.length === 0 && all.length > 0) {
        console.warn('⚠️ All items filtered out – check "location" field for county names.');
      }

    } catch (err) {
      console.error('❌ Fetch error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/user-login', { replace: true });
        return;
      }
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // ─── Filter & pagination ────────────────────────────────────
  const filteredReports = reports.filter((report) => {
    const matchesStatus = filters.status === 'all' || report.status === filters.status;
    const matchesType = filters.incidentType === 'all' || report.incident_type === filters.incidentType;
    const searchTerm = filters.search.toLowerCase();
    const matchesSearch =
      (report.species?.toLowerCase() || '').includes(searchTerm) ||
      report.location.toLowerCase().includes(searchTerm) ||
      report.description.toLowerCase().includes(searchTerm);
    return matchesStatus && matchesType && matchesSearch;
  });

  const indexOfLast = pagination.page * pagination.limit;
  const indexOfFirst = indexOfLast - pagination.limit;
  const currentReports = filteredReports.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredReports.length / pagination.limit);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  // ─── CRUD ──────────────────────────────────────────────────
  const handleDelete = async (report) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const endpoint = report._sighting ? '/sightings' : '/reports';
      // Use the real ID from the original object
      const id = report.original?.id || report.original?._id || report.id;
      await API.delete(`${endpoint}/${id}`);
      setReports(reports.filter((r) => r.id !== report.id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete report.');
    }
  };

  const handleView = (report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleEdit = (report) => {
    setSelectedReport(report);
    setEditForm({
      incident_type: report.incident_type,
      species: report.species || '',
      location: report.location,
      description: report.description,
      status: report.status,
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!selectedReport) {
      alert('No report selected to edit.');
      return;
    }

    setSaving(true);
    try {
      const endpoint = selectedReport._sighting ? '/sightings' : '/reports';
      // Use the real ID from the original object
      const id = selectedReport.original?.id || selectedReport.original?._id || selectedReport.id;
      console.log(`🔄 Updating ${endpoint}/${id} with:`, editForm);

      await API.put(`${endpoint}/${id}`, editForm);

      // Update the local state with the new data
      setReports((prev) =>
        prev.map((r) =>
          r.id === selectedReport.id
            ? { ...r, ...editForm, original: { ...r.original, ...editForm } }
            : r
        )
      );

      setShowEditModal(false);
      alert('Report updated successfully!');
    } catch (err) {
      console.error('❌ Update error:', err);
      // Show the actual error message from the backend
      const msg = err.response?.data?.msg || err.message || 'Failed to update report.';
      alert(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedReport(null);
  };

  // ─── Status Badge ──────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const statusMap = {
      pending: { label: 'Pending', icon: Clock, className: 'bg-yellow-100 text-yellow-700' },
      resolved: { label: 'Resolved', icon: CheckCircle, className: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejected', icon: XCircle, className: 'bg-red-100 text-red-700' },
    };
    const { label, icon: Icon, className } = statusMap[status] || statusMap.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  // ─── Loading State ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
        <p className="text-gray-500 text-sm">Loading reports...</p>
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        <p className="font-medium">{error}</p>
        <button
          onClick={fetchData}
          className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-green-600" />
            Incident Reports
          </h2>
          <p className="text-sm text-gray-500">
            {reports.length} reports from North Eastern Kenya
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {ALLOWED_COUNTIES.join(', ')}
            </span>
            {rawStats && (
              <span className="ml-2 text-xs text-gray-400">
                (Raw: {rawStats.reports} reports, {rawStats.sightings} sightings)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setIsRefreshing(true); fetchData(); }}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl shadow transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl shadow transition"
          >
            <Plus className="w-4 h-4" /> New Report
          </Link>
        </div>
      </div>

      {/* ─── Empty State ───────────────────────────────────── */}
      {reports.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-lg font-semibold">No reports found</h3>
          <p className="text-sm mt-1">
            {rawStats && (rawStats.reports > 0 || rawStats.sightings > 0)
              ? `Found ${rawStats.reports + rawStats.sightings} total records, but none matched the county filter.`
              : 'No data in the database yet. Submit a new report!'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Allowed counties: {ALLOWED_COUNTIES.join(', ')}.
            Make sure your location field contains one of these names.
          </p>
        </div>
      )}

      {/* ─── Filters ────────────────────────────────────────── */}
      {reports.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by species, location, description..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={filters.incidentType}
                onChange={(e) => setFilters({ ...filters, incidentType: e.target.value })}
                className="px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Types</option>
                <option value="Human-Wildlife Conflict">Conflict</option>
                <option value="Poaching">Poaching</option>
                <option value="Injured/Dead Wildlife">Injured/Dead</option>
                <option value="Wildlife Sighting">Sighting</option>
                <option value="Habitat Destruction">Habitat</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ─── Table ───────────────────────────────────────────── */}
      {reports.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Species</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Location</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentReports.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      No reports match your filters.
                    </td>
                  </tr>
                ) : (
                  currentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition group">
                      <td className="px-4 py-3 text-gray-800 font-medium">
                        #{String(report.id).slice(0, 8)}
                        {report._sighting && (
                          <span className="ml-1 text-xs text-blue-500 font-normal">(sighting)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 truncate max-w-[150px]">
                        {report.incident_type}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{report.species || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 truncate max-w-[120px]">
                        {report.location}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(report.date_time).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(report)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(report)}
                            className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(report)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition"
                            title="Delete"
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
          {filteredReports.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Showing {indexOfFirst + 1}–{Math.min(indexOfLast, filteredReports.length)} of {filteredReports.length}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {pagination.page} of {totalPages || 1}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === totalPages || totalPages === 0}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── View Modal (unchanged) ───────────────────────────── */}
      <AnimatePresence>
        {showViewModal && selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={closeModals}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-green-600" />
                    Report #{String(selectedReport.id).slice(0, 8)}
                  </h3>
                  <button onClick={closeModals} className="p-2 rounded-lg hover:bg-gray-100 transition">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    {selectedReport._sighting && (
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                          ⚡ Sighting
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                      <div className="bg-gray-50 rounded-xl p-4 text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto border border-gray-100">
                        {selectedReport.description}
                      </div>
                    </div>
                    {selectedReport.photo_url ? (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Photo</h4>
                        <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                          <img
                            src={selectedReport.photo_url}
                            alt="Evidence"
                            className="max-h-64 w-full object-contain rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<p class="text-sm text-gray-400 p-4">Image failed to load</p>';
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
                        <Image className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No photo</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
                  <button onClick={closeModals} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Edit Modal (fixed) ──────────────────────────────── */}
      <AnimatePresence>
        {showEditModal && selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={closeModals}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Edit className="w-6 h-6 text-yellow-600" />
                    Edit Report #{String(selectedReport.id).slice(0, 8)}
                  </h3>
                  <button onClick={closeModals} className="p-2 rounded-lg hover:bg-gray-100 transition">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Incident Type</label>
                    <select
                      name="incident_type"
                      value={editForm.incident_type}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    >
                      <option value="Human-Wildlife Conflict">Human‑Wildlife Conflict</option>
                      <option value="Poaching">Poaching</option>
                      <option value="Injured/Dead Wildlife">Injured/Dead Wildlife</option>
                      <option value="Wildlife Sighting">Wildlife Sighting</option>
                      <option value="Habitat Destruction">Habitat Destruction</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                    <input
                      type="text"
                      name="species"
                      value={editForm.species}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editForm.location}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      rows="4"
                      value={editForm.description}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </form>

                <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
                  <button
                    onClick={closeModals}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}