import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import logo from '../assets/image/logo.png';

const Wildlife = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSpecies, setFilteredSpecies] = useState([]);

  // Species data (mock)
  const speciesData = [
    {
      id: 1,
      name: 'African Elephant',
      scientific: 'Loxodonta africana',
      status: 'Endangered',
      habitat: 'Savanna, Forest',
      image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600&q=80',
      description: 'The largest land animal on Earth, known for its intelligence and strong social bonds.',
    },
    {
      id: 2,
      name: 'Lion',
      scientific: 'Panthera leo',
      status: 'Vulnerable',
      habitat: 'Grasslands, Savanna',
      image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600&q=80',
      description: 'The king of the savanna, living in prides and playing a crucial role in the ecosystem.',
    },
    {
      id: 3,
      name: 'Giraffe',
      scientific: 'Giraffa camelopardalis',
      status: 'Vulnerable',
      habitat: 'Savanna, Woodlands',
      image: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=600&q=80',
      description: 'The tallest mammal, using its long neck to reach leaves high in trees.',
    },
    {
      id: 4,
      name: 'Zebra',
      scientific: 'Equus quagga',
      status: 'Near Threatened',
      habitat: 'Grasslands, Savanna',
      image: 'https://images.unsplash.com/photo-1578526423412-5d70d4b7b5b9?w=600&q=80',
      description: 'Famous for its distinctive black-and-white stripes, which are unique to each individual.',
    },
    {
      id: 5,
      name: 'Cheetah',
      scientific: 'Acinonyx jubatus',
      status: 'Vulnerable',
      habitat: 'Savanna, Deserts',
      image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600&q=80',
      description: 'The fastest land animal, capable of incredible bursts of speed to catch prey.',
    },
    {
      id: 6,
      name: 'Hippopotamus',
      scientific: 'Hippopotamus amphibius',
      status: 'Vulnerable',
      habitat: 'Rivers, Lakes',
      image: 'https://images.unsplash.com/photo-1560732488-6d2ba3a77a48?w=600&q=80',
      description: 'A large semi-aquatic mammal, spending most of its time in water to keep cool.',
    },
    {
      id: 7,
      name: 'Rhinoceros',
      scientific: 'Diceros bicornis',
      status: 'Critically Endangered',
      habitat: 'Savanna, Woodlands',
      image: 'https://images.unsplash.com/photo-1569393592614-03b8ed0b499e?w=600&q=80',
      description: 'A powerful herbivore with a distinctive horn, targeted by poachers.',
    },
    {
      id: 8,
      name: 'African Buffalo',
      scientific: 'Syncerus caffer',
      status: 'Least Concern',
      habitat: 'Savanna, Forests',
      image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=600&q=80',
      description: 'A massive and formidable animal, often found in large herds.',
    },
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const results = speciesData.filter(species =>
      species.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      species.scientific.toLowerCase().includes(searchTerm.toLowerCase()) ||
      species.habitat.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSpecies(results);
  }, [searchTerm]);

  // Animation variants
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

  const heroTextVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ===== HERO – Full‑bleed background ===== */}
      <section className="relative min-h-[70vh] lg:min-h-[65vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-700 hover:scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1600&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-emerald-900/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.3)_70%)]" />

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-green-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

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
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white/90 px-4 py-1.5 rounded-full text-xs font-medium border border-white/20 shadow-lg mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Wildlife Encyclopedia
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-lg">
              Kenya's <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200">Wildlife</span> <br />
              Diversity
            </h1>

            <p className="mt-4 text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed drop-shadow">
              Discover the incredible species that call Northern Kenya home – from the majestic elephant to the elusive cheetah.
            </p>

            {/* Search bar – elegant and integrated */}
            <div className="mt-8 max-w-xl mx-auto relative">
              <input
                type="text"
                placeholder="Search by name, scientific name, or habitat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3 pl-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all shadow-lg"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick stat */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-white/60">
              <span className="text-white font-bold text-lg">{speciesData.length}</span>
              <span>Species listed</span>
              <span className="w-px h-6 bg-white/20" />
              <span className="flex items-center gap-1">
                <span className="text-emerald-400">●</span> Live data
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SPECIES GRID ===== */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <span className="text-green-700 font-semibold tracking-widest uppercase text-sm">Species</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-800">
              {searchTerm ? `Results for "${searchTerm}"` : 'Explore Our Wildlife'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-green-600 to-emerald-500 mx-auto mt-4 rounded-full" />
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {filteredSpecies.length} species found
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredSpecies.map((species) => (
              <motion.div
                key={species.id}
                variants={itemVariants}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200 hover:-translate-y-2 flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={species.image}
                    alt={species.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%231a3a2a" width="400" height="300"/%3E%3Ctext x="200" y="165" font-size="60" text-anchor="middle" fill="white" font-family="Arial"%3E🦁%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                      species.status === 'Critically Endangered' ? 'bg-red-500/80 text-white' :
                      species.status === 'Endangered' ? 'bg-orange-500/80 text-white' :
                      species.status === 'Vulnerable' ? 'bg-yellow-500/80 text-white' :
                      'bg-green-500/80 text-white'
                    }`}>
                      {species.status}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800">{species.name}</h3>
                  <p className="text-sm text-gray-500 italic">{species.scientific}</p>
                  <p className="mt-2 text-sm text-gray-600 flex-1">{species.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded-full">🌍 {species.habitat}</span>
                  </div>
                  <Link
                    to={`/wildlife/${species.id}`}
                    className="mt-4 text-green-700 font-medium text-sm hover:text-green-800 transition-colors inline-flex items-center gap-1 group-hover:gap-2"
                  >
                    Learn More
                    <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredSpecies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">No species found matching your search.</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-green-700 font-medium hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-100/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full mb-4">
              Get Involved
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
              Help Protect These Species
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Report sightings, conflicts, or poaching incidents to help us keep wildlife safe.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/report"
                className="px-10 py-4 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white font-semibold rounded-full shadow-2xl shadow-green-500/30 hover:shadow-green-600/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                Report an Incident
              </Link>
              <Link
                to="/register"
                className="px-10 py-4 bg-white text-green-700 border-2 border-green-700 hover:bg-green-50 font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                Sign Up for Updates
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
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

      {/* ================================================================
           CUSTOM ANIMATIONS
           ================================================================ */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(6px); opacity: 0.6; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 2.5s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Wildlife;