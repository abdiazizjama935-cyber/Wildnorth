import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Plus,
  Search,
  MapPin,
  Calendar,
  Users,
  Eye,
  Edit,
  Trash2,
  Sprout,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  Save,
} from 'lucide-react';
import API from '../../api';

const ITEMS_PER_PAGE = 9; // 3 columns × 3 rows

export default function Sightings() {
  const navigate = useNavigate();
  const [sightings, setSightings] = useState([]);
  const [filteredSightings, setFilteredSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // ─── Modal states ──────────────────────────────────────────────
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingSighting, setViewingSighting] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSighting, setEditingSighting] = useState(null);
  const [editForm, setEditForm] = useState({
    species: '',
    location: '',
    count: 1,
    behaviour: '',
    notes: '',
    date_time: '',
    image_url: '',
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSighting, setDeletingSighting] = useState(null);

  // ─── Fetch sightings ──────────────────────────────────────────────
  const fetchSightings = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
      setError(null);
    } else {
      setLoading(true);
    }
    try {
      const response = await API.get('/sightings');
      setSightings(response.data);
      setFilteredSightings(response.data);
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/user-login', { replace: true });
        return;
      }
      setError('Could not load sightings.');
    } finally {
      if (showRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchSightings();
  }, []);

  // ─── Filter logic ──────────────────────────────────────────────
  useEffect(() => {
    let result = sightings;
    if (speciesFilter !== 'all') {
      result = result.filter((s) => s.species === speciesFilter);
    }
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.species.toLowerCase().includes(term) ||
          s.location.toLowerCase().includes(term) ||
          (s.notes?.toLowerCase() || '').includes(term)
      );
    }
    setFilteredSightings(result);
    setCurrentPage(1);
  }, [searchTerm, speciesFilter, sightings]);

  // ─── Pagination ────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredSightings.length / ITEMS_PER_PAGE);
  const paginatedSightings = filteredSightings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // ─── Unique species for filter ──────────────────────────────────
  const uniqueSpecies = [...new Set(sightings.map((s) => s.species).filter(Boolean))];

  // ─── View handler ──────────────────────────────────────────────
  const openViewModal = (sighting) => {
    setViewingSighting(sighting);
    setShowViewModal(true);
  };

  // ─── Edit handlers ──────────────────────────────────────────────
  const openEditModal = (sighting) => {
    setEditingSighting(sighting);
    setEditForm({
      species: sighting.species,
      location: sighting.location,
      count: sighting.count || 1,
      behaviour: sighting.behaviour || '',
      notes: sighting.notes || '',
      date_time: sighting.date_time ? sighting.date_time.slice(0, 16) : '',
      image_url: sighting.image_url || '',
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingSighting) return;
    setActionInProgress(true);
    try {
      const updated = { ...editForm };
      await API.put(`/sightings/${editingSighting.id}`, updated);
      // Refresh the list
      await fetchSightings(true);
      setShowEditModal(false);
      setEditingSighting(null);
      setNotification({ type: 'success', message: 'Sighting updated successfully.' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } catch (err) {
      console.error('Update error:', err);
      setNotification({ type: 'error', message: 'Failed to update sighting.' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } finally {
      setActionInProgress(false);
    }
  };

  // ─── Delete handlers ────────────────────────────────────────────
  const openDeleteModal = (sighting) => {
    setDeletingSighting(sighting);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSighting) return;
    setActionInProgress(true);
    try {
      await API.delete(`/sightings/${deletingSighting.id}`);
      await fetchSightings(true);
      setShowDeleteModal(false);
      setDeletingSighting(null);
      setNotification({ type: 'success', message: 'Sighting deleted successfully.' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setNotification({ type: 'error', message: 'Failed to delete sighting.' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } finally {
      setActionInProgress(false);
    }
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setViewingSighting(null);
    setEditingSighting(null);
    setDeletingSighting(null);
  };

  // ─── Refresh handler ──────────────────────────────────────────────
  const handleRefresh = () => {
    fetchSightings(true);
  };

  // ─── Render states ──────────────────────────────────────────────
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
        <button onClick={handleRefresh} className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium">
          Retry
        </button>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ─── Notification ──────────────────────────────────────────── */}
      <AnimatePresence>
        {notification.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-xl p-4 text-sm flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : notification.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-blue-50 border border-blue-200 text-blue-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : notification.type === 'error' ? (
              <XCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Camera className="w-6 h-6 text-blue-600" />
            My Sightings
          </h2>
          <p className="text-sm text-gray-500">{sightings.length} total sightings</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by species, location, notes..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={speciesFilter}
            onChange={(e) => {
              setSpeciesFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Species</option>
            {uniqueSpecies.map((species) => (
              <option key={species} value={species}>{species}</option>
            ))}
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/report"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Log Sighting</span>
          </Link>
        </div>
      </div>

      {/* ─── Cards Grid ────────────────────────────────────────────── */}
      {paginatedSightings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No sightings yet</h3>
          <p className="text-gray-400 mt-2">Start logging your wildlife sightings today.</p>
          <Link to="/report" className="mt-4 inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition">
            Log Your First Sighting
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedSightings.map((sighting) => (
              <motion.div
                key={sighting.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition group"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800 text-lg">{sighting.species}</h3>
                  <span className="text-xs text-gray-400">#{sighting.id}</span>
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-gray-400" /> {sighting.location}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                  <span>Count: {sighting.count || 1}</span>
                  {sighting.behaviour && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                      {sighting.behaviour}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(sighting.date_time).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {sighting.notes && (
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">{sighting.notes}</p>
                )}
                <div className="mt-3 flex justify-end gap-1">
                  <button
                    onClick={() => openViewModal(sighting)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                    title="View Details"
                    disabled={actionInProgress}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(sighting)}
                    className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition"
                    title="Edit"
                    disabled={actionInProgress}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(sighting)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition"
                    title="Delete"
                    disabled={actionInProgress}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ─── Pagination ──────────────────────────────────────────── */}
          {filteredSightings.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex-wrap gap-2">
              <p className="text-xs text-gray-500">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredSightings.length)} of {filteredSightings.length}
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
        </>
      )}

      {/* ─── View Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showViewModal && viewingSighting && (
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Camera className="w-6 h-6 text-blue-600" />
                  Sighting #{viewingSighting.id}
                </h3>
                <button
                  onClick={closeModals}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Species</h4>
                    <p className="text-gray-800 font-semibold">{viewingSighting.species}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Location</h4>
                    <p className="text-gray-800 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {viewingSighting.location}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Count</h4>
                    <p className="text-gray-800">{viewingSighting.count || 1}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Behaviour</h4>
                    <p className="text-gray-800">{viewingSighting.behaviour || '—'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
                    <p className="text-gray-800 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(viewingSighting.date_time).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                    <div className="bg-gray-50 rounded-xl p-4 text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto border border-gray-100">
                      {viewingSighting.notes || 'No notes.'}
                    </div>
                  </div>
                  {viewingSighting.image_url && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Image</h4>
                      <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                        <img
                          src={viewingSighting.image_url}
                          alt={viewingSighting.species}
                          className="max-h-64 w-full object-contain rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                  {!viewingSighting.image_url && (
                    <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
                      <Camera className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No image attached</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
                <button
                  onClick={closeModals}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Edit Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showEditModal && editingSighting && (
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Edit className="w-6 h-6 text-yellow-600" />
                  Edit Sighting #{editingSighting.id}
                </h3>
                <button
                  onClick={closeModals}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Species *</label>
                    <input
                      type="text"
                      name="species"
                      value={editForm.species}
                      onChange={handleEditChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={editForm.location}
                      onChange={handleEditChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
                    <input
                      type="number"
                      name="count"
                      value={editForm.count}
                      onChange={handleEditChange}
                      min="0"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Behaviour</label>
                    <input
                      type="text"
                      name="behaviour"
                      value={editForm.behaviour}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="date_time"
                    value={editForm.date_time}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={editForm.notes}
                    onChange={handleEditChange}
                    rows="3"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    name="image_url"
                    value={editForm.image_url}
                    onChange={handleEditChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
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
                  disabled={actionInProgress}
                  className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {actionInProgress ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Delete Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showDeleteModal && deletingSighting && (
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Trash2 className="w-6 h-6 text-red-600" />
                  Delete Sighting
                </h3>
                <button
                  onClick={closeModals}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the sighting of <strong>"{deletingSighting.species}"</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModals}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={actionInProgress}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50"
                >
                  {actionInProgress ? 'Deleting...' : 'Delete Sighting'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}