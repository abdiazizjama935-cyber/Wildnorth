import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import heroImage from '../assets/image/hero.png';
import logo from '../assets/image/logo.png';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({ reports: 0, sightings: 0, partners: 0, communities: 0 });
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });

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

  const blobVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { duration: 1.2, ease: 'easeOut', delay: 0.3 },
    },
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animated counters
  useEffect(() => {
    if (statsInView) {
      animateCounters();
    }
  }, [statsInView]);

  const animateCounters = () => {
    const targets = { reports: 1247, sightings: 3892, partners: 28, communities: 15 };
    const duration = 2000;
    const steps = 60;
    const increment = (key) => Math.ceil(targets[key] / steps);
    let step = 0;

    const interval = setInterval(() => {
      step++;
      setCounters({
        reports: Math.min(step * increment('reports'), targets.reports),
        sightings: Math.min(step * increment('sightings'), targets.sightings),
        partners: Math.min(step * increment('partners'), targets.partners),
        communities: Math.min(step * increment('communities'), targets.communities),
      });
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
  };

  const features = [
    { icon: '📍', title: 'GPS Wildlife Reporting', desc: 'Submit incidents with automatic GPS location, photos, and descriptions – instantly routed to authorities.' },
    { icon: '🦁', title: 'Wildlife Sightings', desc: 'Log species, counts, behaviour, and location to build a comprehensive sightings database.' },
    { icon: '⚠️', title: 'Human–Wildlife Conflict', desc: 'Report livestock attacks, crop destruction, and dangerous wildlife near settlements.' },
    { icon: '🚫', title: 'Poaching & Illegal Activity', desc: 'Anonymous reporting of poaching, trafficking, and habitat destruction.' },
    { icon: '🏥', title: 'Injured or Dead Wildlife', desc: 'Quickly report injured or dead animals so responders can reach them in time.' },
    { icon: '🗺️', title: 'Interactive Wildlife Map', desc: 'View real‑time sightings, conflict hotspots, and protected areas on a dynamic map.' },
    { icon: '📚', title: 'Wildlife Encyclopedia', desc: 'Learn about species, habitats, behaviour, and conservation status.' },
    { icon: '📰', title: 'News & Updates', desc: 'Stay informed with success stories, community initiatives, and educational articles.' },
  ];

  const testimonials = [
    { quote: 'WildNorth Kenya has transformed how we respond to wildlife incidents. The real‑time reports save lives – both human and animal.', author: 'Grace Mwangi', role: 'Community Ranger, Samburu' },
    { quote: 'I can now report a sick elephant directly from the field. The response time has improved dramatically.', author: 'David Lekuta', role: 'Elder, Ngorongoro' },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ===== HERO – Ultra compact, at very top ===== */}
      <section className="relative py-2 lg:py-4 flex items-center bg-gradient-to-br from-white via-green-50/40 to-emerald-50/20 overflow-hidden">
        {/* Decorative backgrounds */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-200/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-green-100/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 items-center">

            {/* --- LEFT: Content --- */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="relative z-10"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="inline-flex items-center gap-2 bg-green-100/80 backdrop-blur-sm text-green-800 px-3 py-1 rounded-full text-xs font-medium border border-green-200/50 mb-3 shadow-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600" />
                </span>
                Northern Kenya Conservation
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-gray-900"
              >
                Protect Wildlife,<br />
                <span className="relative inline-block">
                  <span className="text-green-700 relative z-10">Empower Communities</span>
                  {/* <svg className="absolute -bottom-1 left-0 w-full h-2.5 text-green-300/50 z-0" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q25 0 50 5 T100 5" stroke="currentColor" strokeWidth="6" fill="none" />
                  </svg> */}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="mt-3 text-base sm:text-lg text-gray-600 max-w-lg leading-relaxed"
              >
                WildNorth Kenya connects communities, rangers, and authorities through real‑time wildlife reporting,
                education, and collaboration – safeguarding the rich biodiversity of Northern Kenya.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="mt-4 flex flex-wrap gap-3"
              >
                <Link
                  to="/report"
                  className="group relative px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white font-semibold rounded-full shadow-xl shadow-green-500/30 hover:shadow-green-600/50 transition-all duration-300 flex items-center gap-2 overflow-hidden text-sm"
                >
                  <span className="relative z-10">Report an Incident</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
                <Link
                  to="/about"
                  className="px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold rounded-full border-2 border-gray-200 hover:border-green-600 hover:text-green-700 hover:bg-white transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md text-sm"
                >
                  Learn More
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : {}}
                transition={{ duration: 0.7, delay: 0.8 }}
                className="mt-4 flex items-center gap-6 text-xs"
              >
                <div className="flex -space-x-2">
                  {['👩🏾', '🧑🏿', '👨🏾‍🦱', '👩🏽‍🦰', '🧔🏿'].map((emoji, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-sm shadow-sm">
                      {emoji}
                    </div>
                  ))}
                </div>
                <div>
                  <span className="font-bold text-gray-800">2,500+</span>
                  <span className="text-gray-500 ml-1">community members</span>
                </div>
                <div className="w-px h-6 bg-gray-200" />
                <div>
                  <span className="font-bold text-gray-800">★★★★★</span>
                  <span className="text-gray-500 ml-1">(4.9/5)</span>
                </div>
              </motion.div>
            </motion.div>

            {/* --- RIGHT: Blob Image (slightly smaller) --- */}
            <motion.div
              variants={blobVariants}
              initial="hidden"
              animate={isVisible ? 'visible' : 'hidden'}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-lg">
                <div className="absolute -inset-8 rounded-full bg-green-400/20 blur-3xl animate-pulse-slow" />
                <div className="absolute -inset-4 rounded-full bg-emerald-400/10 blur-2xl" />

                <div className="relative rounded-[40%_60%_55%_45%/45%_40%_60%_55%] overflow-hidden shadow-2xl shadow-green-500/30 border-4 border-white/80 backdrop-blur-sm">
                  <img
                    src={heroImage}
                    alt="Wildlife conservation in Northern Kenya"
                    className="h-[300px] lg:h-[350px] w-full object-cover scale-105 transition-transform duration-700 hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%231a3a2a" width="400" height="300"/%3E%3Ccircle cx="200" cy="150" r="60" fill="%232d5a3d"/%3E%3Ctext x="200" y="165" font-size="60" text-anchor="middle" fill="white" font-family="Arial"%3E🦁%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-green-800/10 to-transparent" />
                </div>

                {/* Floating stats card */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
                  className="absolute -bottom-3 -left-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-3 border border-gray-100/50 min-w-[120px] animate-float"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-lg shadow-inner">
                      🦁
                    </div>
                    <div>
                      <div className="text-lg font-extrabold text-gray-800">1,247</div>
                      <div className="text-[9px] text-gray-500 font-medium">Reports</div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1, ease: 'easeOut' }}
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-3 py-1.5 rounded-full text-[10px] font-semibold shadow-lg shadow-green-500/40 animate-pulse-slow flex items-center gap-1.5"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                  </span>
                  Live ● Active
                </motion.div>

                <div className="absolute -top-12 -right-12 w-32 h-32 bg-green-200/30 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator - removed or hidden */}
      </section>

      {/* ===== MISSION + STATS ===== */}
      <section className="py-24 bg-white relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-50/30 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            <div>
              <span className="text-green-700 font-semibold tracking-widest uppercase text-sm">Our Mission</span>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                Empowering Communities to <br />Protect Wildlife
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-green-600 to-emerald-500 mt-4 rounded-full" />
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                WildNorth Kenya provides a simple, reliable, and technology‑driven platform for wildlife reporting,
                education, and collaboration. We bridge the gap between communities, rangers, researchers, and
                government agencies to ensure every incident is reported, tracked, and acted upon.
              </p>
              <div className="mt-8 flex items-center gap-4 p-4 bg-green-50/50 rounded-2xl border border-green-100/50">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-3xl shadow-inner">
                  🌍
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-lg">15 Communities Engaged</p>
                  <p className="text-sm text-gray-500">Across Northern Kenya</p>
                </div>
              </div>
            </div>

            {/* Stats with animated counters */}
            <div ref={statsRef} className="grid grid-cols-2 gap-5">
              {[
                { key: 'reports', label: 'Reports Submitted', color: 'green' },
                { key: 'sightings', label: 'Wildlife Sightings', color: 'emerald' },
                { key: 'partners', label: 'Conservation Partners', color: 'teal' },
                { key: 'communities', label: 'Communities Engaged', color: 'green' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`bg-gradient-to-br from-${stat.color}-50 to-white rounded-2xl p-6 text-center border border-${stat.color}-100/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className={`text-4xl font-extrabold text-${stat.color}-700`}>
                    {counters[stat.key].toLocaleString()}
                  </div>
                  <div className="mt-1 text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-100/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <span className="text-green-700 font-semibold tracking-widest uppercase text-sm">Capabilities</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-800">Everything You Need</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-green-600 to-emerald-500 mx-auto mt-4 rounded-full" />
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              From reporting to education – WildNorth Kenya equips you with tools to protect wildlife.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200 flex flex-col items-start hover:-translate-y-2 hover:bg-white relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 via-transparent to-emerald-50/0 group-hover:from-green-50/30 group-hover:to-emerald-50/20 transition-all duration-500 pointer-events-none" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 mb-4 shadow-sm group-hover:shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition-colors relative z-10">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600 text-sm flex-1 leading-relaxed relative z-10">{feature.desc}</p>
                <div className="mt-4 w-8 h-0.5 bg-green-200 rounded-full group-hover:w-12 group-hover:bg-green-500 transition-all duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== MAP PREVIEW ===== */}
      <section className="py-24 bg-white relative">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-green-100/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16"
          >
            <div className="flex-1">
              <span className="text-green-700 font-semibold tracking-widest uppercase text-sm">Live Data</span>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-800">Interactive Wildlife Map</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-green-600 to-emerald-500 mt-4 rounded-full" />
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Explore real‑time wildlife sightings, conflict hotspots, and protected areas.
                Filter by species, date, incident type, and location – making data actionable.
              </p>
              <ul className="mt-6 space-y-3">
                {['Automatic GPS‑tagged reports', 'Heatmaps for conflict areas', 'Mobile‑first, responsive design'].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm font-bold">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </motion.li>
                ))}
              </ul>
              <Link
                to="/map"
                className="mt-8 inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white font-semibold rounded-full shadow-lg shadow-green-500/25 hover:shadow-green-600/40 transition-all duration-300"
              >
                Explore the Map →
              </Link>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1 w-full"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/3] flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
                <div className="text-center text-gray-500 p-8 relative">
                  <svg className="w-20 h-20 mx-auto text-green-700 opacity-60 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="mt-4 font-semibold text-gray-700 text-lg">Interactive Map Preview</p>
                  <p className="text-sm text-gray-400">Real‑time wildlife data coming soon</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Live</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">GPS</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">Hotspots</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 bg-gradient-to-br from-green-800 via-green-900 to-emerald-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <span className="text-green-300 font-semibold tracking-widest uppercase text-sm">Testimonials</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold">What Our Community Says</h2>
            <div className="w-20 h-1 bg-white/60 mx-auto mt-4 rounded-full" />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-12 grid md:grid-cols-2 gap-8"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
              >
                <svg className="w-10 h-10 text-green-300 mb-4 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-lg leading-relaxed">“{t.quote}”</p>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="font-semibold text-white">{t.author}</p>
                  <p className="text-sm text-green-200">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-100/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full mb-4">
              Join the Movement
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
              Ready to Make a Difference?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Every report helps protect Kenya's wildlife. Join the movement today and be part of the change.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/report"
                className="px-10 py-4 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white font-semibold rounded-full shadow-2xl shadow-green-500/30 hover:shadow-green-600/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                Report Now
              </Link>
              <Link
                to="/register"
                className="px-10 py-4 bg-white text-green-700 border-2 border-green-700 hover:bg-green-50 font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                Sign Up Free
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-400">✓ Free forever  ✓ No credit card required  ✓ Join 2,500+ members</p>
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

      {/* ===== CUSTOM ANIMATIONS ===== */}
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

export default Home;