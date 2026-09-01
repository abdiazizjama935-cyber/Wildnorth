import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Filter, Layers, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import API from '../../api';

const pinColors = {
  sighting: 'bg-blue-500',
  conflict: 'bg-red-500',
  poaching: 'bg-purple-500',
  injured: 'bg-orange-500',
  default: 'bg-gray-500',
};

const pinLabels = {
  sighting: 'Sighting',
  conflict: 'Conflict',
  poaching: 'Poaching',
  injured: 'Injured/Dead',
};

export default function AdminMap() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pins, setPins] = useState([]);
  const [filteredPins, setFilteredPins] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [filters, setFilters] = useState({ species: 'all', type: 'all', status: 'all' });
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportsRes, sightingsRes] = await Promise.all([
        API.get('/reports'),
        API.get('/sightings'),
      ]);
      const reports = reportsRes.data;
      const sightings = sightingsRes.data;

      const reportPins = reports.map((r) => ({
        id: `r-${r.id}`,
        type: mapIncidentType(r.incident_type),
        species: r.species || 'Unknown',
        location: r.location,
        status: r.status,
        severity: r.status === 'resolved' ? 'low' : r.status === 'pending' ? 'medium' : 'high',
        created_at: r.created_at,
        incident_type: r.incident_type,
      }));

      const sightingPins = sightings.map((s) => ({
        id: `s-${s.id}`,
        type: 'sighting',
        species: s.species,
        location: s.location,
        status: null,
        severity: 'low',
        created_at: s.created_at,
        count: s.count,
        behaviour: s.behaviour,
      }));

      const allPins = [...reportPins, ...sightingPins];
      setPins(allPins);
      setFilteredPins(allPins);
    } catch (err) {
      console.error('Map fetch error:', err);
      if (err.response?.status === 401) {
        navigate('/admin-login', { replace: true });
        return;
      }
      setError('Could not load map data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const mapIncidentType = (type) => {
    const lower = type.toLowerCase();
    if (lower.includes('conflict')) return 'conflict';
    if (lower.includes('poach')) return 'poaching';
    if (lower.includes('injured') || lower.includes('dead')) return 'injured';
    return 'sighting';
  };

  useEffect(() => {
    let result = pins;
    if (filters.species !== 'all') result = result.filter((p) => p.species === filters.species);
    if (filters.type !== 'all') result = result.filter((p) => p.type === filters.type);
    if (filters.status !== 'all') result = result.filter((p) => p.status === filters.status);
    setFilteredPins(result);
  }, [filters, pins]);

  const uniqueSpecies = [...new Set(pins.map((p) => p.species).filter(Boolean))];

  const handlePinClick = (pin) => {
    setSelectedPin(selectedPin?.id === pin.id ? null : pin);
  };

  const getPosition = () => ({
    left: `${15 + Math.random() * 70}%`,
    top: `${15 + Math.random() * 70}%`,
  });

  const total = filteredPins.length;
  const sightingsCount = filteredPins.filter((p) => p.type === 'sighting').length;
  const conflictsCount = filteredPins.filter((p) => p.type === 'conflict').length;
  const poachingCount = filteredPins.filter((p) => p.type === 'poaching' || p.type === 'injured').length;
  const pendingCount = filteredPins.filter((p) => p.status === 'pending').length;
  const resolvedCount = filteredPins.filter((p) => p.status === 'resolved').length;

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

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
        <button onClick={fetchData} className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-green-600" />
            Admin Map View
          </h2>
          <p className="text-sm text-gray-500">All wildlife sightings and incidents across Northern Kenya.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{total} pins shown</span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            Filters
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
              <select
                value={filters.species}
                onChange={(e) => setFilters({ ...filters, species: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="all">All Species</option>
                {uniqueSpecies.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Incident Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="all">All Types</option>
                <option value="sighting">Sighting</option>
                <option value="conflict">Conflict</option>
                <option value="poaching">Poaching</option>
                <option value="injured">Injured/Dead</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button
              onClick={() => setFilters({ species: 'all', type: 'all', status: 'all' })}
              className="text-sm text-green-700 hover:underline"
            >
              Reset filters
            </button>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Legend</h4>
            {Object.entries(pinColors).map(([type, color]) => {
              if (type === 'default') return null;
              return (
                <div key={type} className="flex items-center gap-2 text-sm">
                  <span className={`w-3 h-3 rounded-full ${color}`} />
                  <span>{pinLabels[type] || type}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map Container */}
        <div className="lg:col-span-3 relative bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[500px]">
          {/* Simple grid background using CSS pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(0,0,0,0.05) 60px),
                repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(0,0,0,0.05) 60px)
              `,
            }}
          />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/4 bg-green-800/20 rounded-tr-full" />
          <div className="absolute top-1/4 right-0 w-1/4 h-1/3 bg-emerald-700/20 rounded-bl-full" />

          {/* Pins */}
          {filteredPins.map((pin) => {
            const pos = getPosition();
            return (
              <div
                key={pin.id}
                className="absolute cursor-pointer group z-10"
                style={{ left: pos.left, top: pos.top }}
                onClick={() => handlePinClick(pin)}
              >
                <div className={`w-5 h-5 rounded-full ${pinColors[pin.type] || pinColors.default} shadow-lg border-2 border-white hover:scale-150 transition-transform`} />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {pin.species}
                </div>
              </div>
            );
          })}

          {/* Selected Pin Tooltip */}
          {selectedPin && (
            <div
              className="absolute bg-white rounded-xl shadow-2xl p-4 max-w-xs z-20 border border-gray-100"
              style={{ left: '35%', top: '30%' }}
            >
              <button
                onClick={() => setSelectedPin(null)}
                className="absolute top-1 right-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
              <h4 className="font-bold text-gray-800">{selectedPin.species}</h4>
              <p className="text-sm text-gray-600">{selectedPin.location}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                  selectedPin.severity === 'critical' ? 'bg-red-100 text-red-700' :
                  selectedPin.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                  selectedPin.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {selectedPin.severity.toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">Type: {pinLabels[selectedPin.type] || selectedPin.type}</span>
              </div>
              {selectedPin.status && (
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  selectedPin.status === 'resolved' ? 'bg-green-100 text-green-700' :
                  selectedPin.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  Status: {selectedPin.status}
                </span>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Reported: {new Date(selectedPin.created_at).toLocaleDateString()}
              </p>
              {selectedPin.count && <p className="text-xs text-gray-400">Count: {selectedPin.count}</p>}
              {selectedPin.behaviour && <p className="text-xs text-gray-400">Behaviour: {selectedPin.behaviour}</p>}
              <p className="text-xs text-gray-400">ID: {selectedPin.id}</p>
            </div>
          )}

          {/* Map controls */}
          <div className="absolute bottom-4 right-4 flex gap-1">
            <button className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg hover:bg-white transition">
              <Layers className="w-4 h-4 text-gray-700" />
            </button>
            <button className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg hover:bg-white transition">
              <Eye className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white/80 text-xs px-3 py-1.5 rounded-lg">
            {total} pins shown
          </div>

          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white/90 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            Live data
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-lg font-bold text-green-700">{total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-lg font-bold text-blue-700">{sightingsCount}</div>
          <div className="text-xs text-gray-500">Sightings</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-lg font-bold text-red-700">{conflictsCount}</div>
          <div className="text-xs text-gray-500">Conflicts</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-lg font-bold text-purple-700">{poachingCount}</div>
          <div className="text-xs text-gray-500">Poaching/Injured</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-lg font-bold text-yellow-700">{pendingCount}</div>
          <div className="text-xs text-gray-500">Pending</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-lg font-bold text-emerald-700">{resolvedCount}</div>
          <div className="text-xs text-gray-500">Resolved</div>
        </div>
      </div>
    </div>
  );
}