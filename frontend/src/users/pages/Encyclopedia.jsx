// EncyclopediaDashboard.jsx
import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Sprout, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api';

export default function EncyclopediaDashboard() {
  const [entries, setEntries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEntries = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
      setError(null);
    } else {
      setLoading(true);
    }
    try {
      const response = await API.get('/encyclopedia');
      setEntries(response.data);
      setFiltered(response.data);
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        // If you have navigate, you can use it; otherwise handle accordingly.
        // For this example, we'll just reload or redirect.
        window.location.href = '/user-login';
        return;
      }
      setError('Failed to load encyclopedia.');
    } finally {
      if (showRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    let result = entries;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(term) ||
          (e.scientific_name?.toLowerCase() || '').includes(term) ||
          (e.habitat?.toLowerCase() || '').includes(term) ||
          (e.diet?.toLowerCase() || '').includes(term)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((e) => e.status === statusFilter);
    }
    setFiltered(result);
  }, [searchTerm, statusFilter, entries]);

  const uniqueStatuses = ['all', ...new Set(entries.map((e) => e.status).filter(Boolean))];

  // Handlers
  const openModal = (entry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
    document.body.style.overflow = 'unset';
  };

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        <p>{error}</p>
        <button onClick={() => fetchEntries()} className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium">
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* ─── Header ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-green-600" />
              Wildlife Encyclopedia
            </h2>
            <p className="text-sm text-gray-500">Explore species found across Northern Kenya.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fetchEntries(true)}
              disabled={refreshing}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search species..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 text-sm"
            >
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>{status === 'all' ? 'All Status' : status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-500">{filtered.length} species found</div>

        {/* ─── Species Grid ──────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <Sprout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No species found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition hover:-translate-y-1"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={entry.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={entry.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Wildlife';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800">{entry.name}</h3>
                  <p className="text-sm text-gray-500 italic">{entry.scientific_name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{entry.habitat}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{entry.diet}</span>
                    {entry.status && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          entry.status === 'Endangered' || entry.status === 'Critically Endangered'
                            ? 'bg-red-100 text-red-700'
                            : entry.status === 'Vulnerable'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {entry.status}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{entry.description}</p>
                  <div className="mt-3 text-xs text-gray-400">{entry.size}</div>
                  {/* Replace Link with a button that opens the modal */}
                  <button
                    onClick={() => openModal(entry)}
                    className="mt-3 inline-block text-green-700 font-medium text-sm hover:underline focus:outline-none"
                  >
                    Learn More →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeModal} // click overlay to close
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
            >
              {/* Close button */}
              <div className="sticky top-0 flex justify-end p-2 bg-white/80 backdrop-blur-sm z-10 border-b border-gray-100">
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full hover:bg-gray-100 transition"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 pt-2">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-2/5">
                    <img
                      src={selectedEntry.image_url || 'https://via.placeholder.com/600x400?text=No+Image'}
                      alt={selectedEntry.name}
                      className="w-full h-48 md:h-64 object-cover rounded-xl"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Wildlife'; }}
                    />
                  </div>
                  <div className="md:w-3/5">
                    <h2 className="text-2xl font-bold text-gray-800">{selectedEntry.name}</h2>
                    <p className="text-md text-gray-500 italic">{selectedEntry.scientific_name}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700">{selectedEntry.habitat}</span>
                      <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700">{selectedEntry.diet}</span>
                      {selectedEntry.status && (
                        <span
                          className={`text-sm px-3 py-1 rounded-full ${
                            selectedEntry.status === 'Endangered' || selectedEntry.status === 'Critically Endangered'
                              ? 'bg-red-100 text-red-700'
                              : selectedEntry.status === 'Vulnerable'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {selectedEntry.status}
                        </span>
                      )}
                    </div>
                    <p className="mt-4 text-gray-700 leading-relaxed">{selectedEntry.description}</p>
                    {selectedEntry.size && (
                      <p className="mt-2 text-sm text-gray-500"><strong>Size:</strong> {selectedEntry.size}</p>
                    )}
                    {selectedEntry.distribution && (
                      <p className="mt-1 text-sm text-gray-500"><strong>Distribution:</strong> {selectedEntry.distribution}</p>
                    )}
                    {/* Add any other fields you have */}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}