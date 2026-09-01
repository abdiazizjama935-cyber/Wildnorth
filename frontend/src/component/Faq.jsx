import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Search, AlertCircle, Shield, MapPin, Camera, FileText, Users } from 'lucide-react';

// ─── FAQ data ──────────────────────────────────────────────
const faqData = [
  {
    category: 'General',
    icon: HelpCircle,
    questions: [
      {
        q: 'What is WildNorth Kenya?',
        a: 'WildNorth Kenya is a conservation initiative that protects wildlife and habitats in Northern Kenya through community engagement, technology, and education. We provide tools for reporting incidents, tracking sightings, and learning about local species.',
      },
      {
        q: 'Who can use this platform?',
        a: 'Anyone – from local communities, tourists, researchers, to conservation officers. The platform is designed for everyone interested in wildlife conservation in the Garissa, Wajir, Mandera, Isiolo, and Marsabit counties.',
      },
      {
        q: 'Is the platform free?',
        a: 'Yes! WildNorth Kenya is completely free for all users. Our mission is to empower communities and protect wildlife without any barriers.',
      },
    ],
  },
  {
    category: 'Reporting Incidents',
    icon: AlertCircle,
    questions: [
      {
        q: 'What types of incidents can I report?',
        a: 'You can report human-wildlife conflicts, poaching, injured or dead wildlife, wildlife sightings, habitat destruction, and other conservation-related issues.',
      },
      {
        q: 'How do I submit a report?',
        a: 'Click on the "Report Incident" button in the navigation bar. Fill in the required details (type, location, description, date/time, and optionally attach a photo) and submit. You can also report anonymously.',
      },
      {
        q: 'What happens after I submit a report?',
        a: 'Your report is reviewed by our team. Depending on the severity, we may dispatch rangers, contact authorities, or use the data for research. You will receive updates via the dashboard if you are logged in.',
      },
      {
        q: 'Do I need to be logged in to report?',
        a: 'No – you can report as a guest. However, creating an account allows you to track your reports, receive notifications, and access your history.',
      },
    ],
  },
  {
    category: 'Wildlife & Sightings',
    icon: Camera,
    questions: [
      {
        q: 'What is a wildlife sighting?',
        a: 'A sighting is any observation of wildlife in the wild. You can log the species, location, number of animals, and behaviour. This helps us monitor populations and movements.',
      },
      {
        q: 'How do I log a sighting?',
        a: 'Use the "Report Incident" form and select "Wildlife Sighting" as the incident type. Provide as much detail as possible, including photos if available.',
      },
      {
        q: 'Can I see sightings on a map?',
        a: 'Yes! The interactive map in the dashboard shows recent sightings and incidents. You can filter by species and date.',
      },
    ],
  },
  {
    category: 'Safety & Emergency',
    icon: Shield,
    questions: [
      {
        q: 'What should I do in a wildlife emergency?',
        a: 'Call our emergency hotline immediately: +254 728 252 288. For life-threatening situations, also contact local wildlife rangers or police. Use the emergency button on the website for quick access.',
      },
      {
        q: 'How can I stay safe in wildlife areas?',
        a: 'Always maintain a safe distance from wild animals, never feed them, and follow local guidelines. Avoid travelling alone in high-risk areas. Our encyclopedia provides safety tips for specific species.',
      },
      {
        q: 'Who do I contact for help?',
        a: 'Use the "Support" page to submit a ticket, or call our emergency hotline. Our team is available 24/7 for urgent matters.',
      },
    ],
  },
  {
    category: 'Account & Privacy',
    icon: Users,
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click on "Login" in the navbar and select "Register". Fill in your details and verify your email. You can also sign up directly via the "Register" page.',
      },
      {
        q: 'Is my data safe?',
        a: 'Yes – we use encryption and secure servers. Your personal information is only used for conservation purposes and is never shared with third parties without your consent.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes. Contact our support team or use the "Settings" page in your dashboard to request account deletion. Please note that this action is irreversible.',
      },
    ],
  },
];

// ─── FAQ Accordion Item ─────────────────────────────────────
const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800/30 rounded-lg transition-colors duration-200 group"
        aria-expanded={isOpen}
      >
        <span className="text-gray-800 dark:text-gray-200 font-medium pr-4 text-sm md:text-base">
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform duration-300 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-4 px-2 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main FAQ Component ─────────────────────────────────────
const Faq = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // ─── Filtered categories ──────────────────────────────────
  const getFilteredData = () => {
    let data = faqData;
    if (activeCategory !== 'all') {
      data = data.filter(cat => cat.category === activeCategory);
    }
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      data = data.map(cat => ({
        ...cat,
        questions: cat.questions.filter(q =>
          q.q.toLowerCase().includes(term) || q.a.toLowerCase().includes(term)
        ),
      })).filter(cat => cat.questions.length > 0);
    }
    return data;
  };

  const filteredData = getFilteredData();

  // ─── Category filter buttons ─────────────────────────────
  const categories = ['all', ...new Set(faqData.map(c => c.category))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-x-hidden">
      {/* ─── Hero Section ───────────────────────────────────── */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-green-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-1.5 rounded-full text-xs font-medium border border-white/20 shadow-lg mb-4">
              <HelpCircle className="w-4 h-4 text-emerald-300" />
              Frequently Asked Questions
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg">
              Got Questions?{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200">
                We Have Answers
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              Find quick answers to the most common questions about WildNorth Kenya,
              reporting incidents, wildlife conservation, and more.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ Content ────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Search & Filter */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for questions or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent transition dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        {filteredData.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No results found</h3>
            <p className="text-gray-400">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredData.map((category) => (
              <div
                key={category.category}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                  <category.icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {category.category}
                  </h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {category.questions.map((item, index) => (
                    <FaqItem key={index} question={item.q} answer={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Still need help? */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Can't find what you're looking for?
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition"
            >
              Contact Support
            </a>
            <a
              href="/support"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Submit a Ticket
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Faq;