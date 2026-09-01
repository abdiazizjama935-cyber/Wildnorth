import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Eye,
  Image,
  Globe,
  Ruler,
  Utensils,
  MapPin,
} from 'lucide-react';
import API from '../../api';

const ITEMS_PER_PAGE = 10;

export default function AdminEncyclopedia() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // ─── Modal states ──────────────────────────────────────────────
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingEntry, setViewingEntry] = useState(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    scientific_name: '',
    status: '',
    habitat: '',
    diet: '',
    size: '',
    image_url: '',
    description: '',
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState(null);

  // ─── Fetch entries ──────────────────────────────────────────────
  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/encyclopedia');
      setEntries(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.response?.status === 401) {
        navigate('/admin-login', { replace: true });
        return;
      }
      setError('Could not load encyclopedia entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // ─── Filter and pagination ──────────────────────────────────────
  const filteredEntries = entries.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.scientific_name && e.scientific_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (e.habitat && e.habitat.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // ─── View handler ──────────────────────────────────────────────
  const openViewModal = (entry) => {
    setViewingEntry(entry);
    setShowViewModal(true);
  };

  // ─── Modal helpers ──────────────────────────────────────────────
  const openAddModal = () => {
    setModalMode('add');
    setEditingEntry(null);
    setFormData({
      name: '',
      scientific_name: '',
      status: '',
      habitat: '',
      diet: '',
      size: '',
      image_url: '',
      description: '',
    });
    setShowFormModal(true);
  };

  const openEditModal = (entry) => {
    setModalMode('edit');
    setEditingEntry(entry);
    setFormData({
      name: entry.name || '',
      scientific_name: entry.scientific_name || '',
      status: entry.status || '',
      habitat: entry.habitat || '',
      diet: entry.diet || '',
      size: entry.size || '',
      image_url: entry.image_url || '',
      description: entry.description || '',
    });
    setShowFormModal(true);
  };

  const openDeleteModal = (entry) => {
    setDeletingEntry(entry);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowFormModal(false);
    setShowDeleteModal(false);
    setViewingEntry(null);
    setEditingEntry(null);
    setDeletingEntry(null);
  };

  // ─── Handle form change ─────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ─── Submit add/edit ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionInProgress(true);

    try {
      if (modalMode === 'add') {
        await API.post('/encyclopedia', formData);
        setNotification({ type: 'success', message: 'Entry added successfully.' });
      } else {
        await API.put(`/encyclopedia/${editingEntry.id}`, formData);
        setNotification({ type: 'success', message: 'Entry updated successfully.' });
      }
      await fetchEntries();
      closeModals();
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } catch (err) {
      console.error('Submit error:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.msg || 'Operation failed. Please try again.',
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } finally {
      setActionInProgress(false);
    }
  };

  // ─── Delete handler ─────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deletingEntry) return;
    setActionInProgress(true);
    try {
      await API.delete(`/encyclopedia/${deletingEntry.id}`);
      await fetchEntries();
      setShowDeleteModal(false);
      setDeletingEntry(null);
      setNotification({ type: 'success', message: 'Entry deleted successfully.' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setNotification({ type: 'error', message: 'Failed to delete entry.' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } finally {
      setActionInProgress(false);
    }
  };

  // ─── Status badge ──────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const config = {
      'Least Concern': 'bg-green-100 text-green-700',
      'Near Threatened': 'bg-blue-100 text-blue-700',
      'Vulnerable': 'bg-yellow-100 text-yellow-700',
      'Endangered': 'bg-orange-100 text-orange-700',
      'Critically Endangered': 'bg-red-100 text-red-700',
      'Extinct in the Wild': 'bg-gray-100 text-gray-700',
      'Extinct': 'bg-gray-200 text-gray-500',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[status] || 'bg-gray-100 text-gray-700'}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  // ─── Render ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-3" />
        <p className="font-medium">{error}</p>
        <button
          onClick={fetchEntries}
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
            <BookOpen className="w-6 h-6 text-yellow-600" />
            Encyclopedia
          </h2>
          <p className="text-sm text-gray-500">{entries.length} total entries</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, scientific name, habitat..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={fetchEntries}
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition shadow-sm"
            title="Refresh"
            disabled={actionInProgress}
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${actionInProgress ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-xl transition"
            disabled={actionInProgress}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Entry</span>
          </button>
        </div>
      </div>

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
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Table ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Image</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Scientific Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Habitat</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    {searchTerm ? 'No entries match your search.' : 'No entries available.'}
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition group">
                    <td className="px-4 py-3 text-gray-800 font-medium">#{entry.id}</td>
                    <td className="px-4 py-3">
                      {entry.image_url ? (
                        <img
                          src={entry.image_url}
                          alt={entry.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"%3E%3Crect fill="%23f3f4f6" width="48" height="48"/%3E%3Ctext x="24" y="32" font-size="20" text-anchor="middle" fill="%239ca3af"%3E🌿%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                          🌿
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{entry.name}</td>
                    <td className="px-4 py-3 text-gray-600 italic">{entry.scientific_name || '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{entry.habitat || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openViewModal(entry)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                          title="View"
                          disabled={actionInProgress}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(entry)}
                          className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition"
                          title="Edit"
                          disabled={actionInProgress}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(entry)}
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
        {filteredEntries.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 flex-wrap gap-2">
            <p className="text-xs text-gray-500">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredEntries.length)} of {filteredEntries.length}
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

      {/* ─── View Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showViewModal && viewingEntry && (
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-yellow-600" />
                  {viewingEntry.name}
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
                  {viewingEntry.image_url && (
                    <div>
                      <img
                        src={viewingEntry.image_url}
                        alt={viewingEntry.name}
                        className="w-full h-56 object-cover rounded-xl border border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="200" y="165" font-size="60" text-anchor="middle" fill="%239ca3af"%3E🌿%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Scientific Name</h4>
                    <p className="text-gray-800 italic">{viewingEntry.scientific_name || '—'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <StatusBadge status={viewingEntry.status} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Description</h4>
                    <div className="bg-gray-50 rounded-xl p-4 text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto border border-gray-100">
                      {viewingEntry.description || 'No description available.'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Habitat</h4>
                      <p className="text-gray-800 flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {viewingEntry.habitat || '—'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Diet</h4>
                      <p className="text-gray-800 flex items-center gap-1">
                        <Utensils className="w-4 h-4 text-gray-400" />
                        {viewingEntry.diet || '—'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <h4 className="text-sm font-medium text-gray-500">Size</h4>
                      <p className="text-gray-800 flex items-center gap-1">
                        <Ruler className="w-4 h-4 text-gray-400" />
                        {viewingEntry.size || '—'}
                      </p>
                    </div>
                  </div>
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

      {/* ─── Add/Edit Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showFormModal && (
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
                  {modalMode === 'add' ? (
                    <Plus className="w-6 h-6 text-yellow-600" />
                  ) : (
                    <Edit className="w-6 h-6 text-yellow-600" />
                  )}
                  {modalMode === 'add' ? 'Add New Entry' : 'Edit Entry'}
                </h3>
                <button
                  onClick={closeModals}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scientific Name
                    </label>
                    <input
                      type="text"
                      name="scientific_name"
                      value={formData.scientific_name}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    >
                      <option value="">Select status</option>
                      <option value="Least Concern">Least Concern</option>
                      <option value="Near Threatened">Near Threatened</option>
                      <option value="Vulnerable">Vulnerable</option>
                      <option value="Endangered">Endangered</option>
                      <option value="Critically Endangered">Critically Endangered</option>
                      <option value="Extinct in the Wild">Extinct in the Wild</option>
                      <option value="Extinct">Extinct</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Habitat
                    </label>
                    <input
                      type="text"
                      name="habitat"
                      value={formData.habitat}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diet
                    </label>
                    <input
                      type="text"
                      name="diet"
                      value={formData.diet}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size
                    </label>
                    <input
                      type="text"
                      name="size"
                      value={formData.size}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleFormChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows="4"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionInProgress}
                    className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionInProgress ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : modalMode === 'add' ? (
                      'Add Entry'
                    ) : (
                      'Update Entry'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Delete Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showDeleteModal && deletingEntry && (
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
                  Delete Entry
                </h3>
                <button
                  onClick={closeModals}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the entry <strong>"{deletingEntry.name}"</strong>? This action cannot be undone.
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
                  {actionInProgress ? 'Deleting...' : 'Delete Entry'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}