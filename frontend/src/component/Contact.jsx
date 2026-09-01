import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/image/logo.png';

const Contact = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const heroTextVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    // In production, send to backend
  };

  const contactInfo = [
    { icon: '📍', title: 'Visit Us', detail: 'Garissa, Kenya\nNorthern Frontier District' },
    { icon: '📞', title: 'Call Us', detail: '+254 (0) 728 252 288\n+254 (0) 712 345 678' },
    { icon: '✉️', title: 'Email Us', detail: 'info@wildnorthkenya.org\nsupport@wildnorthkenya.org' },
    { icon: '🕐', title: 'Working Hours', detail: 'Mon – Fri: 8:00 AM – 6:00 PM\nSat: 9:00 AM – 1:00 PM' },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ===== HERO ===== */}
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
              Get in Touch
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-lg">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200">Contact</span> Us
            </h1>

            <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed drop-shadow">
              We’d love to hear from you – whether you have a question, want to report an incident, or collaborate with us.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== CONTACT FORM & INFO ===== */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-4">
              {contactInfo.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{item.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <h3 className="font-semibold text-gray-800 mb-2">Follow Us</h3>
                <div className="flex gap-3">
                  {['🐦', '📘', '📸', '▶️'].map((icon, i) => (
                    <span
                      key={i}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg hover:bg-green-100 hover:text-green-700 transition cursor-pointer"
                    >
                      {icon}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100"
              >
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-gray-800">Message Sent!</h2>
                    <p className="mt-2 text-gray-600">
                      Thank you for reaching out. We’ll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-4 text-green-700 font-medium hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Your Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Full name"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="you@example.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="What's this about?"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Tell us how we can help..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white font-semibold rounded-full shadow-lg shadow-green-500/30 hover:shadow-green-600/50 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MAP SECTION ===== */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-center mb-8">
              <span className="text-green-700 font-semibold tracking-widest uppercase text-sm">Location</span>
              <h2 className="mt-1 text-2xl md:text-3xl font-bold text-gray-800">Find Us on the Map</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-green-600 to-emerald-500 mx-auto mt-2 rounded-full" />
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-gray-200 h-80">
              {/* Map placeholder with embedded OpenStreetMap iframe */}
              <iframe
                title="WildNorth Kenya Location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=39.0%2C-1.0%2C41.0%2C1.0&layer=mapnik&marker=0.0%2C40.0"
                className="w-full h-full"
                allowFullScreen
                loading="lazy"
                style={{ border: 0 }}
              />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-sm text-gray-700">
                📍 Garissa, Kenya
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-16 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-100/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full mb-4">
              Quick Actions
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
              Report an Incident
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              For urgent matters, use our dedicated reporting form to alert our response team immediately.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/report"
                className="px-10 py-4 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white font-semibold rounded-full shadow-2xl shadow-green-500/30 hover:shadow-green-600/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                Report Now
              </Link>
              <Link
                to="/"
                className="px-10 py-4 bg-white text-green-700 border-2 border-green-700 hover:bg-green-50 font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                Return Home
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

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Contact;