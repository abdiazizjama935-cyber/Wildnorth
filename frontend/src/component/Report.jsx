import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Camera, MapPin, Upload, X, CheckCircle, AlertCircle, Loader2,
  User, Phone, Mail, Calendar, Globe, Shield, AlertTriangle,
  PawPrint, TreePine, Clock, ChevronRight, ChevronLeft,
  Send, Home, ChevronDown, Sparkles, Users, Share2, Sun, Moon,
  Maximize2, Minimize2, HeartPulse, FileText, Check, RefreshCw,
} from 'lucide-react';
import API from '../api';
import logo from '../assets/image/logo.png';

// ─── Constants ──────────────────────────────────────────────
const INCIDENT_TYPES = [
  { value: 'Human-Wildlife Conflict', label: 'Human-Wildlife Conflict', icon: AlertTriangle, color: 'text-orange-500' },
  { value: 'Poaching', label: 'Poaching', icon: Shield, color: 'text-red-500' },
  { value: 'Injured/Dead Wildlife', label: 'Injured or Dead Wildlife', icon: HeartPulse, color: 'text-rose-500' },
  { value: 'Wildlife Sighting', label: 'Wildlife Sighting', icon: PawPrint, color: 'text-emerald-500' },
  { value: 'Habitat Destruction', label: 'Habitat Destruction', icon: TreePine, color: 'text-amber-600' },
  { value: 'Other', label: 'Other', icon: FileText, color: 'text-gray-500' },
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700 border-red-200' },
];

const WEATHER_OPTIONS = [
  'Clear Sky', 'Partly Cloudy', 'Cloudy', 'Rain', 'Heavy Rain',
  'Storm', 'Fog', 'Mist', 'Snow', 'Windy', 'Hot', 'Cold', 'Humid'
];

const SPECIES_SUGGESTIONS = [
  'African Elephant', 'Lion', 'Leopard', 'Cheetah', 'Hyena', 'Buffalo',
  'Rhinoceros', 'Hippopotamus', 'Giraffe', 'Zebra', 'Wildebeest', 'Impala',
  'Gazelle', 'Oryx', 'Eland', 'Kudu', 'Nyala', 'Bushbuck', 'Duiker',
  'African Wild Dog', 'Jackal', 'Fox', 'Baboon', 'Monkey', 'Galago',
  'Crocodile', 'Python', 'Mamba', 'Vulture', 'Eagle', 'Ostrich',
  'Flamingo', 'Pelican', 'Stork', 'Heron', 'Kingfisher', 'Bee-eater',
  'Hornbill', 'Parrot', 'Goat', 'Camel', 'Donkey', 'Horse', 'Cattle'
];

const COUNTIES = ['Garissa', 'Wajir', 'Mandera', 'Isiolo', 'Marsabit'];

// ─── Main Component ─────────────────────────────────────────
const Report = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [formData, setFormData] = useState({
    incidentType: '',
    species: '',
    location: '',
    description: '',
    dateTime: '',
    photo: null,
    name: '',
    phone: '',
    email: '',
    terms: false,
    severity: '',
    animalCount: '',
    weather: '',
    landmark: '',
    additionalInfo: '',
    isAnonymous: false,
  });
  const [selectedCounty, setSelectedCounty] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [userData, setUserData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [formProgress, setFormProgress] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showSpeciesSuggestions, setShowSpeciesSuggestions] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const speciesInputRef = useRef(null);
  const heroRef = useRef(null);

  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 500], [1, 0.95]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  // ─── Effects ──────────────────────────────────────────────
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setUserData(parsed);
        setFormData(prev => ({
          ...prev,
          name: parsed.name || '',
          email: parsed.email || '',
        }));
      } catch (e) { /* ignore */ }
    }
    setIsVisible(true);
    setFormProgress(calculateProgress());
  }, []);

  useEffect(() => {
    setFormProgress(calculateProgress());
  }, [formData]);

  // ─── Helpers ──────────────────────────────────────────────
  const calculateProgress = useCallback(() => {
    let completed = 0;
    const total = 8;
    if (formData.incidentType) completed++;
    if (formData.location) completed++;
    if (formData.description) completed++;
    if (formData.dateTime) completed++;
    if (formData.severity) completed++;
    if (formData.terms) completed++;
    if (formData.name || formData.email || formData.phone) completed++;
    if (formData.photo) completed++;
    return Math.round((completed / total) * 100);
  }, [formData]);

  // ─── Validation (returns errors object) ──────────────────
  const validateForm = () => {
    const errors = {};
    if (!formData.incidentType) errors.incidentType = 'Please select an incident type.';
    if (!formData.location) {
      errors.location = 'Please enter a location.';
    } else {
      const hasCounty = COUNTIES.some(c => formData.location.toLowerCase().includes(c.toLowerCase()));
      if (!hasCounty) {
        errors.location = 'Location must be in Garissa, Wajir, Mandera, Isiolo, or Marsabit.';
      }
    }
    if (!formData.description) errors.description = 'Please describe the incident.';
    if (!formData.dateTime) errors.dateTime = 'Please select date and time.';
    if (!formData.severity) errors.severity = 'Please select severity level.';
    if (!formData.animalCount) errors.animalCount = 'Please estimate the number of animals.';
    if (!formData.terms) errors.terms = 'You must agree to the terms.';
    return errors;
  };

  // ─── Helper: map an error to its step ────────────────────
  const getStepWithError = (errors) => {
    if (errors.incidentType || errors.location || errors.severity) return 1;
    if (errors.dateTime || errors.animalCount || errors.description) return 2;
    if (errors.terms) return 4;
    return currentStep;
  };

  // ─── Handlers ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      const file = files?.[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          setError('File size exceeds 10MB limit.');
          return;
        }
        setFormData({ ...formData, photo: file });
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
    if (error) setError('');
  };

  const handleCountyChange = (e) => {
    const county = e.target.value;
    setSelectedCounty(county);
    if (county) {
      setFormData({ ...formData, location: county });
      if (fieldErrors.location) {
        setFieldErrors({ ...fieldErrors, location: '' });
      }
    }
  };

  const handleSpeciesInput = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, species: value });
    if (value.length > 1) {
      const filtered = SPECIES_SUGGESTIONS.filter(s =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 8));
      setShowSpeciesSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSpeciesSuggestions(false);
    }
  };

  const selectSpecies = (species) => {
    setFormData({ ...formData, species });
    setSuggestions([]);
    setShowSpeciesSuggestions(false);
    speciesInputRef.current?.focus();
  };

  const removeImage = () => {
    setFormData({ ...formData, photo: null });
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const useLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported.');
      return;
    }
    setIsLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData({
          ...formData,
          location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        });
        setIsLocationLoading(false);
        setError('');
      },
      () => {
        setError('Unable to retrieve location.');
        setIsLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit.');
        return;
      }
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };

  // ─── Submit handler ────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError('Please fix all errors before submitting.');
      const targetStep = getStepWithError(errors);
      setCurrentStep(targetStep);
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }

    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      let response;
      if (formData.incidentType === 'Wildlife Sighting') {
        const sightingData = {
          species: formData.species || null,
          location: formData.location,
          count: parseInt(formData.animalCount) || 1,
          behaviour: formData.weather || '',
          notes: `${formData.description}\n\nAdditional Info: ${formData.additionalInfo || 'N/A'}\nSeverity: ${formData.severity}\nLandmark: ${formData.landmark || 'N/A'}`,
          date_time: new Date(formData.dateTime).toISOString(),
        };
        if (formData.photo) {
          sightingData.image_url = await toBase64(formData.photo);
        }
        response = await API.post('/sightings', sightingData);
      } else {
        const reportData = {
          incident_type: formData.incidentType,
          species: formData.species || null,
          location: formData.location,
          description: `${formData.description}\n\nAdditional Info: ${formData.additionalInfo || 'N/A'}\nSeverity: ${formData.severity}\nWeather: ${formData.weather || 'N/A'}\nLandmark: ${formData.landmark || 'N/A'}\nAnimal Count: ${formData.animalCount}`,
          date_time: new Date(formData.dateTime).toISOString(),
        };
        if (formData.photo) {
          reportData.photo_url = await toBase64(formData.photo);
        }
        response = await API.post('/reports', reportData);
      }

      setReportId(response.data.id || response.data._id || 'report-' + Date.now());
      setSuccessMessage('✅ Report submitted successfully!');
      setShowSuccessModal(true);
      setSubmitted(true);
      setLoading(false);

      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/dashboard/reports', { replace: true });
      }, 4000);

    } catch (err) {
      console.error('Submit error:', err);
      if (err.response?.status === 401) {
        setError('You must be logged in. Redirecting...');
        setTimeout(() => navigate('/user-login'), 2000);
      } else {
        setError(err.response?.data?.msg || 'Failed to submit. Please try again.');
      }
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: formRef.current?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: formRef.current?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const shareReport = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Wildlife Incident Report',
          text: `I reported a wildlife incident: ${formData.incidentType} at ${formData.location}`,
          url: window.location.href,
        });
      } catch (e) { /* ignore */ }
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setSuccessMessage('Link copied to clipboard!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }).catch(() => {});
    }
  };

  // ─── Render Step Content ──────────────────────────────────
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStepOne();
      case 2: return renderStepTwo();
      case 3: return renderStepThree();
      case 4: return renderStepFour();
      default: return null;
    }
  };

  // Step 1 – Details (includes county dropdown)
  const renderStepOne = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="incidentType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Incident Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {INCIDENT_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = formData.incidentType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, incidentType: type.value });
                    setFieldErrors({ ...fieldErrors, incidentType: '' });
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-2 ${
                    isSelected
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                  } ${fieldErrors.incidentType ? 'border-red-300 ring-2 ring-red-200' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${type.color}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type.label}</span>
                </button>
              );
            })}
          </div>
          {fieldErrors.incidentType && <p className="mt-1 text-sm text-red-600 field-error">{fieldErrors.incidentType}</p>}
        </div>

        <div>
          <label htmlFor="severity" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Severity Level <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SEVERITY_LEVELS.map((level) => {
              const isSelected = formData.severity === level.value;
              return (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, severity: level.value });
                    setFieldErrors({ ...fieldErrors, severity: '' });
                  }}
                  className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                    isSelected
                      ? `${level.color} ring-2 ring-${level.value === 'critical' ? 'red' : level.value === 'high' ? 'orange' : level.value === 'medium' ? 'yellow' : 'green'}-500/20 border-${level.value === 'critical' ? 'red' : level.value === 'high' ? 'orange' : level.value === 'medium' ? 'yellow' : 'green'}-500`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  } ${fieldErrors.severity ? 'border-red-300 ring-2 ring-red-200' : ''}`}
                >
                  <span className="text-sm font-medium capitalize">{level.label}</span>
                </button>
              );
            })}
          </div>
          {fieldErrors.severity && <p className="mt-1 text-sm text-red-600 field-error">{fieldErrors.severity}</p>}
        </div>
      </div>

      {/* County dropdown */}
      <div>
        <label htmlFor="county" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          County <span className="text-red-500">*</span>
        </label>
        <select
          id="county"
          name="county"
          value={selectedCounty}
          onChange={handleCountyChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent transition dark:bg-gray-800 dark:text-white"
        >
          <option value="">Select county</option>
          {COUNTIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Species */}
      <div>
        <label htmlFor="species" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Species <span className="text-gray-400 text-xs">(if known)</span>
        </label>
        <div className="relative">
          <input
            ref={speciesInputRef}
            type="text"
            id="species"
            name="species"
            value={formData.species}
            onChange={handleSpeciesInput}
            onFocus={() => {
              if (formData.species.length > 1) {
                const filtered = SPECIES_SUGGESTIONS.filter(s =>
                  s.toLowerCase().includes(formData.species.toLowerCase())
                );
                setSuggestions(filtered.slice(0, 8));
                setShowSpeciesSuggestions(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowSpeciesSuggestions(false), 200)}
            placeholder="e.g., African Elephant"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent transition dark:bg-gray-800 dark:text-white"
          />
          {showSpeciesSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto"
            >
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => selectSpecies(s)}
                  className="w-full px-4 py-2 text-left hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-sm text-gray-700 dark:text-gray-300"
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Location with county validation */}
      <div>
        <label htmlFor="location" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Detailed Location <span className="text-red-500">*</span>
          <span className="text-gray-400 text-xs ml-1">(include county name)</span>
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Garissa, near the river"
            className={`flex-1 px-4 py-3 rounded-xl border ${fieldErrors.location ? 'border-red-300 ring-2 ring-red-200' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition dark:bg-gray-800 dark:text-white`}
          />
          <button
            type="button"
            onClick={useLocation}
            disabled={isLocationLoading}
            className="px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-70"
          >
            {isLocationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            <span className="hidden sm:inline">Use My Location</span>
          </button>
        </div>
        {fieldErrors.location && <p className="mt-1 text-sm text-red-600 field-error">{fieldErrors.location}</p>}
        <p className="mt-1 text-xs text-gray-400">Enter a detailed location including the county (e.g., Garissa, near the bridge).</p>
      </div>

      {/* Landmark */}
      <div>
        <label htmlFor="landmark" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Nearby Landmark <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <input
          type="text"
          id="landmark"
          name="landmark"
          value={formData.landmark}
          onChange={handleChange}
          placeholder="e.g., Near the old bridge"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent transition dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={nextStep}
          className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-500/20 flex items-center gap-2"
        >
          Next Step <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  // Step 2 – Description (unchanged)
  const renderStepTwo = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="dateTime" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="dateTime"
            name="dateTime"
            value={formData.dateTime}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.dateTime ? 'border-red-300 ring-2 ring-red-200' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition dark:bg-gray-800 dark:text-white`}
          />
          {fieldErrors.dateTime && <p className="mt-1 text-sm text-red-600 field-error">{fieldErrors.dateTime}</p>}
        </div>
        <div>
          <label htmlFor="animalCount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Number of Animals <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="animalCount"
            name="animalCount"
            value={formData.animalCount}
            onChange={handleChange}
            min="1"
            placeholder="e.g., 5"
            className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.animalCount ? 'border-red-300 ring-2 ring-red-200' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition dark:bg-gray-800 dark:text-white`}
          />
          {fieldErrors.animalCount && <p className="mt-1 text-sm text-red-600 field-error">{fieldErrors.animalCount}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="weather" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Weather Conditions <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <select
          id="weather"
          name="weather"
          value={formData.weather}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent transition dark:bg-gray-800 dark:text-white"
        >
          <option value="">Select weather condition</option>
          {WEATHER_OPTIONS.map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the incident in detail: what happened, how many animals, any injuries, etc."
          className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.description ? 'border-red-300 ring-2 ring-red-200' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-y dark:bg-gray-800 dark:text-white`}
        />
        {fieldErrors.description && <p className="mt-1 text-sm text-red-600 field-error">{fieldErrors.description}</p>}
      </div>

      <div>
        <label htmlFor="additionalInfo" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Additional Information <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <textarea
          id="additionalInfo"
          name="additionalInfo"
          rows={3}
          value={formData.additionalInfo}
          onChange={handleChange}
          placeholder="Any other relevant details..."
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-y dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-500/20 flex items-center gap-2"
        >
          Next Step <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  // Step 3 – Photo (unchanged)
  const renderStepThree = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Attach Photo <span className="text-gray-400 text-xs">(optional, max 10MB)</span>
        </label>

        {!previewImage ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 scale-105'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-green-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              id="photo"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                <Upload className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                  {isDragging ? 'Drop your image here' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-sm text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="relative inline-block group">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <img src={previewImage} alt="Preview" className="max-h-80 w-auto object-contain" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={removeImage}
                  className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-transform hover:scale-110"
                >
                  <X className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-transform hover:scale-110"
                >
                  <RefreshCw className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full"
            >
              <Check className="w-4 h-4" />
            </motion.div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-500/20 flex items-center gap-2"
        >
          Next Step <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  // Step 4 – Contact & Submit (unchanged)
  const renderStepFour = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <User className="w-4 h-4" /> Your Contact Information
          </h3>
          <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            Report Anonymously
          </label>
        </div>

        {!formData.isAnonymous ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent transition dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+254 7XX XXX XXX"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent transition dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent transition dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <Shield className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p>You are reporting anonymously. No personal information will be stored.</p>
          </div>
        )}
        {userData && !formData.isAnonymous && (
          <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Pre-filled from your profile
          </p>
        )}
      </div>

      <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <input
          type="checkbox"
          id="terms"
          name="terms"
          checked={formData.terms}
          onChange={handleChange}
          className={`mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 ${fieldErrors.terms ? 'border-red-300 ring-2 ring-red-200' : ''}`}
        />
        <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
          I confirm that the information provided is accurate and I understand that this report will be shared with relevant authorities. <span className="text-red-500">*</span>
        </label>
      </div>
      {fieldErrors.terms && <p className="mt-1 text-sm text-red-600 field-error">{fieldErrors.terms}</p>}

      <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={prevStep}
          className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 min-w-[180px] px-8 py-4 bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-800 hover:to-emerald-700 text-white font-bold rounded-full shadow-lg shadow-green-500/30 hover:shadow-green-600/50 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
          ) : (
            <><Send className="w-5 h-5" /> Submit Report</>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        <span className="text-red-500">*</span> Required fields. Your report helps protect wildlife.
      </p>
    </motion.div>
  );

  // ─── Main Render ──────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-x-hidden transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      {/* ─── HERO ────────────────────────────────────────────────── */}
      <motion.section
        ref={heroRef}
        style={{ scale: heroScale, opacity: heroOpacity }}
        className="relative min-h-[45vh] lg:min-h-[50vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              initial={{ x: Math.random() * 100 + '%', y: Math.random() * 100 + '%', scale: Math.random() * 2 + 0.5 }}
              animate={{ y: ['0%', '100%', '0%'], opacity: [0, 1, 0] }}
              transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, delay: Math.random() * 10 }}
            />
          ))}
        </div>

        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"
          animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-green-400/10 rounded-full blur-3xl"
          animate={{ y: [0, 15, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 } }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-1.5 rounded-full text-xs font-medium border border-white/20 shadow-lg mb-4"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Report an Incident
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Protect Wildlife</span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-white drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Report <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200">Wildlife</span> Incident
            </motion.h1>

            <motion.p
              className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Your report helps protect wildlife and communities. Fill in the details below to alert our response team.
            </motion.p>

            <motion.div
              className="mt-6 flex flex-wrap gap-3 justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/80 text-sm border border-white/10">
                <Shield className="w-4 h-4 text-emerald-300" />
                <span>Secure & Confidential</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/80 text-sm border border-white/10">
                <Clock className="w-4 h-4 text-emerald-300" />
                <span>24/7 Response</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/80 text-sm border border-white/10">
                <Users className="w-4 h-4 text-emerald-300" />
                <span>Community Driven</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.section>

      {/* ─── FORM ────────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 md:p-10 border border-gray-100 dark:border-gray-700"
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {formProgress}% Complete
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${formProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {[...Array(totalSteps)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => { if (i + 1 < currentStep) setCurrentStep(i + 1); }}
                  className={`text-xs font-medium transition-colors ${
                    i + 1 <= currentStep
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-600'
                  } ${i + 1 < currentStep ? 'cursor-pointer hover:text-green-500' : 'cursor-default'}`}
                >
                  {i === 0 && 'Details'}
                  {i === 1 && 'Description'}
                  {i === 2 && 'Photo'}
                  {i === 3 && 'Submit'}
                </button>
              ))}
            </div>
          </div>

          {/* Error / Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
                <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
            {successMessage && !showSuccessModal && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl p-4 flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </form>
        </motion.div>
      </section>

      {/* ─── SUCCESS MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-gray-100 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4"
              >
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Report Submitted!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your report has been successfully submitted. Our team will review it and take action.
              </p>
              {reportId && (
                <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 mb-4">
                  Reference ID: <span className="font-mono font-bold text-green-600 dark:text-green-400">{reportId}</span>
                </p>
              )}
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition-all duration-200 shadow-lg shadow-green-500/20"
                >
                  Continue
                </button>
                <button
                  onClick={shareReport}
                  className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <Link
                  to="/dashboard"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all duration-200 flex items-center gap-2"
                >
                  <Home className="w-4 h-4" /> Dashboard
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── EMERGENCY BANNER ──────────────────────────────────── */}
      <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3">
        <AnimatePresence>
          {showEmergency && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="bg-red-600 dark:bg-red-700 text-white rounded-2xl p-6 shadow-2xl max-w-sm w-full"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/30 flex items-center justify-center animate-pulse">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Emergency</h4>
                    <p className="text-xs opacity-90">Immediate assistance needed?</p>
                  </div>
                </div>
                <button onClick={() => setShowEmergency(false)} className="text-white/70 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Emergency Hotline: <strong>+254 728 252 288</strong>
                </p>
                <p className="flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Wildlife Rangers: <strong>999</strong>
                </p>
                <button
                  onClick={() => { window.location.href = 'tel:+254728252288'; }}
                  className="w-full mt-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 rounded-xl transition-colors text-sm"
                >
                  Call Now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowEmergency(!showEmergency)}
          className={`p-4 rounded-full shadow-xl transition-all duration-200 ${
            showEmergency
              ? 'bg-gray-800 dark:bg-gray-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
          }`}
        >
          {showEmergency ? <X className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* ─── QUICK ACTION BUTTONS ──────────────────────────────── */}
      <div className="fixed bottom-4 right-4 z-30 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleDarkMode}
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleFullscreen}
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* ─── FOOTER ────────────────────────────────────────────── */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 border-t border-gray-800 dark:border-gray-800 mt-20">
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
                <li><Link to="/wildlife" className="hover:text-green-400 transition-colors">Wildlife</Link></li>
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
                <p className="flex items-center gap-2"><span className="text-green-400">📍</span> Garissa, Kenya</p>
                <p className="flex items-center gap-2"><span className="text-green-400">📞</span> +254 (0) 728 252 288</p>
                <p className="flex items-center gap-2"><span className="text-green-400">✉️</span> info@wildnorthkenya.org</p>
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
    </div>
  );
};

export default Report;