import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import logo from '../assets/image/logo.png';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({ reports: 0, sightings: 0, partners: 0, communities: 0 });
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });

  // Animation variants for sections
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

  // Hero text animation
  const heroTextVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

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

  const values = [
    { icon: '🤝', title: 'Community First', desc: 'We prioritize the voices and needs of local communities in all our conservation efforts.' },
    { icon: '🌿', title: 'Sustainability', desc: 'Our solutions are designed to be long-lasting, ecologically sound, and economically viable.' },
    { icon: '📊', title: 'Data-Driven', desc: 'We use real-time data and technology to make informed decisions and track impact.' },
    { icon: '🦁', title: 'Wildlife Protection', desc: 'Every action is guided by the goal of safeguarding Kenya\'s rich biodiversity.' },
    { icon: '🤲', title: 'Transparency', desc: 'We operate with openness, sharing results and challenges with our partners and communities.' },
    { icon: '🌍', title: 'Global Vision', desc: 'While we work locally, we aim to inspire a global movement for wildlife conservation.' },
  ];

  const team = [
    { name: 'Dr. Jane Muthoni', role: 'Executive Director', bio: 'Conservation biologist with 15 years of experience in community-led wildlife protection.' },
    { name: 'Samuel Kiprop', role: 'Head of Operations', bio: 'Former ranger and logistics expert, ensuring our field teams are always well-equipped.' },
    { name: 'Grace Wanjiru', role: 'Community Outreach', bio: 'Passionate about empowering women and youth in conservation through education and training.' },
    { name: 'David Ole Lengai', role: 'Wildlife Researcher', bio: 'Specializes in human-wildlife conflict mitigation and species monitoring using AI.' },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ================================================================
           HERO – Full‑bleed background with overlay (Master‑class)
           ================================================================ */}
      <section className="relative min-h-[85vh] lg:min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background image from Unsplash (wildlife) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-700 hover:scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=80')`,
          }}
        />
        {/* Dark gradient overlay – sophisticated blend */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-green-900/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.4)_70%)]" />

        {/* Decorative animated glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-green-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center lg:text-left">
          <motion.div
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            variants={heroTextVariants}
            className="max-w-3xl mx-auto lg:mx-0"
          >
            {/* Badge with glassmorphism */}
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
              About WildNorth Kenya
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-lg">
              Protecting Wildlife,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200">
                Together
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed drop-shadow">
              WildNorth Kenya is a community‑driven conservation initiative that bridges the gap between local people,
              technology, and wildlife protection across Northern Kenya.
            </p>

            {/* Buttons – glassmorphism style */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                to="/report"
                className="group px-8 py-3.5 bg-white text-green-800 font-semibold rounded-full shadow-2xl shadow-white/20 hover:shadow-white/40 transition-all duration-300 flex items-center gap-2 hover:-translate-y-1"
              >
                Get Involved
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/contact"
                className="px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/30 hover:bg-white/20 transition-all duration-300 flex items-center gap-2 hover:-translate-y-1"
              >
                Contact Us
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Floating statistic – elegantly placed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-10 flex items-center gap-6 text-sm text-white/70 justify-center lg:justify-start"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">2018</span>
                <span className="hidden sm:inline">Founded</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">2,500+</span>
                <span className="hidden sm:inline">Members</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">15</span>
                <span className="hidden sm:inline">Communities</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator – minimal and elegant */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-1 text-white/40 text-[10px] font-medium tracking-widest uppercase animate-bounce-slow">
            <span>Scroll</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* ================================================================
           OUR STORY (unchanged)
           ================================================================ */}
      <section className="py-20 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-green-700 font-semibold tracking-widest uppercase text-sm">Our Story</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-800">A Movement Born from the Heart of Northern Kenya</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-green-600 to-emerald-500 mx-auto mt-4 rounded-full" />
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              WildNorth Kenya was founded in 2018 by a group of community elders, rangers, and conservationists who saw the urgent need to protect the region's wildlife while empowering local communities. What started as a small grassroots initiative has grown into a technology-enabled network that connects over 2,500 members across 15 communities.
            </p>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Our approach combines traditional ecological knowledge with modern tools like GPS, mobile reporting, and AI-driven analytics to create a real-time early warning system for human-wildlife conflict. We believe that conservation succeeds when communities are at the center of decision-making and benefit directly from protecting their natural heritage.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================================================================
           OUR VALUES (unchanged)
           ================================================================ */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-100/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <span className="text-green-700 font-semibold tracking-widest uppercase text-sm">Core Values</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-800">What We Stand For</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-green-600 to-emerald-500 mx-auto mt-4 rounded-full" />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200 flex flex-col items-start hover:-translate-y-2 hover:bg-white relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 via-transparent to-emerald-50/0 group-hover:from-green-50/30 group-hover:to-emerald-50/20 transition-all duration-500 pointer-events-none" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 mb-4 shadow-sm group-hover:shadow-md">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition-colors relative z-10">
                  {value.title}
                </h3>
                <p className="mt-2 text-gray-600 text-sm flex-1 leading-relaxed relative z-10">{value.desc}</p>
                <div className="mt-4 w-8 h-0.5 bg-green-200 rounded-full group-hover:w-12 group-hover:bg-green-500 transition-all duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================
           OUR IMPACT (Stats) (unchanged)
           ================================================================ */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <span className="text-green-700 font-semibold tracking-widest uppercase text-sm">Our Impact</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-800">Making a Difference, Together</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-green-600 to-emerald-500 mx-auto mt-4 rounded-full" />
          </motion.div>

          <div ref={statsRef} className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { key: 'reports', label: 'Incidents Reported', color: 'green' },
              { key: 'sightings', label: 'Sightings Logged', color: 'emerald' },
              { key: 'partners', label: 'Partners', color: 'teal' },
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
        </div>
      </section>

      {/* ================================================================
           TEAM (unchanged)
           ================================================================ */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <span className="text-green-700 font-semibold tracking-widest uppercase text-sm">Team</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-800">Meet the People Behind the Mission</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-green-600 to-emerald-500 mx-auto mt-4 rounded-full" />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 flex flex-col items-center text-center hover:-translate-y-1"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-3xl shadow-inner mb-4">
                  {['👩🏾', '🧑🏿', '👩🏽', '🧔🏿'][index]}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                <p className="text-sm font-medium text-green-600">{member.role}</p>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================
           CTA (unchanged)
           ================================================================ */}
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
              Join Our Mission
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
              Be Part of the Change
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're a ranger, a community member, a researcher, or a supporter – there's a place for you in WildNorth Kenya.
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

      {/* ================================================================
           FOOTER (unchanged)
           ================================================================ */}
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

      {/* ================================================================
           CUSTOM ANIMATIONS (same as before)
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

export default About;