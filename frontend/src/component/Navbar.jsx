import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/image/logo.png';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Wildlife', path: '/wildlife' },
    { name: 'Report Incident', path: '/report' },
    { name: 'FAQ', path: '/faq' }, // ← changed from 'Map'
    { name: 'Encyclopedia', path: '/encyclopedia' },
    { name: 'Contact', path: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsLoginDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
    setIsLoginDropdownOpen(false);
  };

  const toggleLoginDropdown = () => {
    setIsLoginDropdownOpen((prev) => !prev);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-out ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-black/5 border-b border-gray-200/80'
            : 'bg-transparent border-b border-transparent'
        }`}
        role="banner"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* ---- Logo ---- */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-xl shadow-md shadow-green-500/20 overflow-hidden bg-white">
                <img
                  src={logo}
                  alt="WildNorth Kenya logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%231a6d3b"/%3E%3Ctext x="50" y="62" font-size="40" text-anchor="middle" fill="white" font-family="Arial"%3E🦁%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              <div className="leading-tight">
                <span className="block font-poppins font-bold text-[#0b1e33] text-base md:text-lg tracking-tight">
                  WildNorth
                </span>
                <span className="block font-poppins font-semibold text-[10px] md:text-xs text-[#1a6d3b] tracking-widest uppercase opacity-80">
                  Kenya
                </span>
              </div>
            </div>

            {/* ---- Desktop Nav Links ---- */}
            <nav
              className="hidden lg:flex items-center gap-x-6 xl:gap-x-8"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={handleLinkClick}
                  className={({ isActive }) => `
                    relative px-1 py-2 text-sm font-medium tracking-wide transition-all duration-300 ease-out
                    hover:text-[#1a6d3b] group
                    ${isActive ? 'text-[#1a6d3b]' : 'text-[#1e293b]'}
                  `}
                  end={link.path === '/'}
                  aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
                >
                  {link.name}
                  <span
                    className={({ isActive }) => `
                      absolute left-1/2 -bottom-1 h-0.5 bg-[#1a6d3b] rounded-full transition-all duration-300 ease-out
                      ${
                        isActive
                          ? 'w-6 -translate-x-1/2 opacity-100'
                          : 'w-0 -translate-x-1/2 opacity-0 group-hover:w-6 group-hover:opacity-100'
                      }
                    `}
                    aria-hidden="true"
                  />
                </NavLink>
              ))}
            </nav>

            {/* ---- Login Dropdown (desktop) ---- */}
            <div className="hidden lg:flex items-center gap-3 relative">
              <button
                onClick={toggleLoginDropdown}
                className="px-5 py-2.5 text-sm font-semibold text-[#1a6d3b] bg-white border-2 border-[#1a6d3b] rounded-full transition-all duration-200 ease-out hover:bg-[#1a6d3b] hover:text-white hover:shadow-lg hover:shadow-green-500/20 focus:ring-2 focus:ring-[#1a6d3b] focus:ring-offset-2 flex items-center gap-2"
                aria-label="Login options"
                aria-expanded={isLoginDropdownOpen}
                aria-haspopup="true"
              >
                <span>Login</span>
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${
                    isLoginDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isLoginDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-3 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-10"
                  role="menu"
                  aria-label="Login options"
                >
                  <NavLink
                    to="/user-login"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-2.5 text-sm text-[#1e293b] hover:bg-[#f1f5f9] transition-colors duration-150"
                    role="menuitem"
                  >
                    <svg className="mr-3 w-4 h-4 text-[#1a6d3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    User Login
                  </NavLink>
                  <NavLink
                    to="/admin-login"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-2.5 text-sm text-[#1e293b] hover:bg-[#f1f5f9] transition-colors duration-150"
                    role="menuitem"
                  >
                    <svg className="mr-3 w-4 h-4 text-[#1a6d3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Admin Login
                  </NavLink>
                </div>
              )}
            </div>

            {/* ---- Mobile Hamburger ---- */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                setIsLoginDropdownOpen(false);
              }}
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-lg text-[#1e293b] hover:bg-[#1a6d3b]/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1a6d3b] focus:ring-offset-2"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* ---- Mobile Menu ---- */}
        <div
          id="mobile-menu"
          className={`
            lg:hidden overflow-hidden transition-all duration-300 ease-out
            ${isMobileMenuOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}
          `}
          role="menu"
          aria-label="Mobile navigation"
        >
          <div className="bg-white/95 backdrop-blur-md border-t border-gray-200/60 px-4 py-5 shadow-lg shadow-black/5">
            <nav className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={handleLinkClick}
                  className={({ isActive }) => `
                    px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive
                      ? 'text-[#1a6d3b] bg-[#1a6d3b]/8'
                      : 'text-[#1e293b] hover:bg-[#f1f5f9]'
                    }
                  `}
                  role="menuitem"
                  end={link.path === '/'}
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>
            <div className="mt-5 pt-4 border-t border-gray-200/60">
              <button
                onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-[#1a6d3b] bg-white border-2 border-[#1a6d3b] rounded-full transition-colors hover:bg-[#1a6d3b] hover:text-white"
                aria-expanded={isLoginDropdownOpen}
              >
                <span>Login</span>
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${
                    isLoginDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isLoginDropdownOpen && (
                <div className="flex flex-col gap-1 pl-4 mt-2">
                  <NavLink
                    to="/user-login"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-2.5 text-sm text-[#1e293b] hover:bg-[#f1f5f9] rounded-lg transition-colors"
                  >
                    <svg className="mr-3 w-4 h-4 text-[#1a6d3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    User Login
                  </NavLink>
                  <NavLink
                    to="/admin-login"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-2.5 text-sm text-[#1e293b] hover:bg-[#f1f5f9] rounded-lg transition-colors"
                  >
                    <svg className="mr-3 w-4 h-4 text-[#1a6d3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Admin Login
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16 md:h-20" aria-hidden="true"></div>
    </>
  );
};

export default Navbar;