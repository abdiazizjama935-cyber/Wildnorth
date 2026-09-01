import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Utensils, Ruler, BookOpen } from 'lucide-react';
import logo from '../assets/image/logo.png';
import API from '../api';

const Encyclopedia = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [speciesData, setSpeciesData] = useState([]);
  const [filteredSpecies, setFilteredSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // ─── Modal state ──────────────────────────────────────────────
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ─── Fetch encyclopedia entries ──────────────────────────────
  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/encyclopedia');
      setSpeciesData(response.data);
      setFilteredSpecies(response.data);
    } catch (err) {
      console.error('Failed to fetch encyclopedia:', err);
      setError('Could not load encyclopedia entries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsVisible(true);
    fetchEntries();
  }, []);

  // ─── Filtering ────────────────────────────────────────────────
  useEffect(() => {
    let results = speciesData;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          (s.scientific_name && s.scientific_name.toLowerCase().includes(term)) ||
          (s.habitat && s.habitat.toLowerCase().includes(term)) ||
          (s.diet && s.diet.toLowerCase().includes(term))
      );
    }
    if (statusFilter !== 'all') {
      results = results.filter((s) => s.status === statusFilter);
    }
    setFilteredSpecies(results);
  }, [searchTerm, statusFilter, speciesData]);

  const statuses = ['all', ...new Set(speciesData.map((s) => s.status).filter(Boolean))];

  // ─── Modal handlers ──────────────────────────────────────────
  const openModal = (species) => {
    setSelectedSpecies(species);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSpecies(null);
    document.body.style.overflow = 'unset';
  };

  // ─── Status badge helper ────────────────────────────────────
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

  // ─── Hero variants ──────────────────────────────────────────
  const heroTextVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center max-w-md">
          <p className="font-medium">{error}</p>
          <button
            onClick={fetchEntries}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ─── Hero Section ──────────────────────────────────────── */}
      <section className="relative min-h-[45vh] lg:min-h-[40vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-emerald-900/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.3)_70%)]" />

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-green-400/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: '1.5s' }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <motion.div
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            variants={heroTextVariants}
            className="max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white/90 px-4 py-1.5 rounded-full text-xs font-medium border border-white/20 shadow-lg mb-4"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Wildlife Encyclopedia
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-lg">
              Explore Kenya's <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200">Wildlife</span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed drop-shadow">
              Learn about the incredible species that call Northern Kenya home – their habits, habitats, and conservation status.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Search & Filters ──────────────────────────────────── */}
      <section className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search by name, habitat, diet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3 pl-12 rounded-full bg-white border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-full bg-white border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-sm shadow-sm flex-1 sm:flex-none"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All' : status}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-500 w-full sm:w-auto text-center sm:text-right">
              {filteredSpecies.length} species found
            </div>
          </div>
        </div>
      </section>

      {/* ─── Species Grid ──────────────────────────────────────── */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredSpecies.map((species) => (
              <motion.div
                key={species.id}
                variants={itemVariants}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200 hover:-translate-y-2 flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={species.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={species.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%231a3a2a" width="400" height="300"/%3E%3Ctext x="200" y="165" font-size="60" text-anchor="middle" fill="white" font-family="Arial"%3E🌿%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={species.status} />
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800">{species.name}</h3>
                  <p className="text-sm text-gray-500 italic">{species.scientific_name || '—'}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded-full">🌍 {species.habitat || '—'}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-full">🍽️ {species.diet || '—'}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 flex-1 line-clamp-3">
                    {species.description || 'No description available.'}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{species.size || '—'}</span>
                    <button
                      onClick={() => openModal(species)}
                      className="text-green-700 font-medium text-sm hover:text-green-800 transition-colors inline-flex items-center gap-1"
                    >
                      Read More
                      <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredSpecies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">No species found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="mt-2 text-green-700 font-medium hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────── */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-100/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full mb-4">
              Contribute
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
              Help Us Grow the Encyclopedia
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Share your wildlife knowledge, photos, and sightings to enrich our community database.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/report"
                className="px-10 py-4 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white font-semibold rounded-full shadow-2xl shadow-green-500/30 hover:shadow-green-600/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                Report a Sighting
              </Link>
              <Link
                to="/contact"
                className="px-10 py-4 bg-white text-green-700 border-2 border-green-700 hover:bg-green-50 font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                Suggest an Edit
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            <div>
              <div className="flex items-center gap-3">
                <img src={logo} alt="WildNorth Kenya" className="w-10 h-10 object-contain" />
                <span className="text-white font-bold text-xl">WildNorth Kenya</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gray-400 max-w-xs">
                Protecting wildlife through community action, technology, and education across Northern Kenya.
              </p>
              <div className="mt-4 flex gap-3">
                {['🐘', '🦒', '🦁', '🦓'].map((emoji, i) => (
                  <span key={i} className="text-xl opacity-60 hover:opacity-100 transition-opacity cursor-default">
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/about" className="hover:text-green-400 transition-colors">About</Link></li>
                <li><Link to="/report" className="hover:text-green-400 transition-colors">Report Incident</Link></li>
                <li><Link to="/encyclopedia" className="hover:text-green-400 transition-colors">Encyclopedia</Link></li>
                <li><Link to="/contact" className="hover:text-green-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/news" className="hover:text-green-400 transition-colors">News</Link></li>
                <li><Link to="/map" className="hover:text-green-400 transition-colors">Interactive Map</Link></li>
                <li><Link to="/dashboard" className="hover:text-green-400 transition-colors">Community Dashboard</Link></li>
                <li><Link to="/blog" className="hover:text-green-400 transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <div className="space-y-2.5 text-sm">
                <p className="flex items-center gap-2">
                  <span className="text-green-400">📍</span> Garissa, Kenya
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-400">📞</span> +254 (0) 728 252 288
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-400">✉️</span> info@wildnorthkenya.org
                </p>
              </div>
              <div className="mt-4 flex gap-3">
                {['🐦', '📘', '📸', '▶️'].map((icon, i) => (
                  <span key={i} className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-sm hover:bg-green-700 hover:text-white transition-all cursor-pointer">
                    {icon}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} WildNorth Kenya. All rights reserved. Made with ❤️ for conservation.
          </div>
        </div>
      </footer>

      {/* ─── Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && selectedSpecies && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full hover:bg-gray-100 transition"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedSpecies.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={selectedSpecies.name}
                    className="w-full h-56 object-cover rounded-xl border border-gray-200"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="200" y="165" font-size="60" text-anchor="middle" fill="%239ca3af"%3E🌿%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="mt-4 space-y-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Scientific Name</h4>
                      <p className="text-gray-800 italic">{selectedSpecies.scientific_name || '—'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Status</h4>
                      <StatusBadge status={selectedSpecies.status} />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedSpecies.name}</h2>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Description</h4>
                    <div className="bg-gray-50 rounded-xl p-4 text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto border border-gray-100">
                      {selectedSpecies.description || 'No description available.'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Habitat</h4>
                      <p className="text-gray-800 flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {selectedSpecies.habitat || '—'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Diet</h4>
                      <p className="text-gray-800 flex items-center gap-1">
                        <Utensils className="w-4 h-4 text-gray-400" />
                        {selectedSpecies.diet || '—'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <h4 className="text-sm font-medium text-gray-500">Size</h4>
                      <p className="text-gray-800 flex items-center gap-1">
                        <Ruler className="w-4 h-4 text-gray-400" />
                        {selectedSpecies.size || '—'}
                      </p>
                    </div>
                  </div>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Encyclopedia;