import { NavLink, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Camera,
  Map,
  BookOpen,
  User,
  Settings,
  Bell,
  LogOut,
  Search,
  Menu,
  ChevronLeft,
  ChevronRight,
  X,
  Sprout,
  MessageCircle,
  LifeBuoy,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userName, setUserName] = useState("Community Member");
  const [userEmail, setUserEmail] = useState("");

  // ─── Load user data from localStorage ────────────────────────────
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/user-login', { replace: true });
      return;
    }

    // Get user data
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('🔍 UserDashboard: userData =', userData);
    
    if (userData && userData.name) {
      setUserName(userData.name);
    } else {
      // Try to get name from email
      const email = userData.email || '';
      const nameFromEmail = email.split('@')[0];
      setUserName(nameFromEmail || 'Community Member');
    }
    
    setUserEmail(userData.email || '');
  }, [navigate]);

  // ─── Navigation items ──────────────────────────────────────────
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, end: true },
    { name: "Incident Reports", path: "/dashboard/reports", icon: FileText },
    { name: "My Sightings", path: "/dashboard/sightings", icon: Camera },
    { name: "Map", path: "/dashboard/map", icon: Map },
    { name: "Encyclopedia", path: "/dashboard/encyclopedia", icon: BookOpen },
    { name: "Notifications", path: "/dashboard/notifications", icon: Bell },
    { name: "Messages", path: "/dashboard/messages", icon: MessageCircle },
    { name: "Support", path: "/dashboard/support", icon: LifeBuoy },
    { name: "Profile", path: "/dashboard/profile", icon: User },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  // ─── Helper: page title from path ─────────────────────────────
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard Overview";
    if (path.includes("/reports")) return "Incident Reports";
    if (path.includes("/sightings")) return "My Sightings";
    if (path.includes("/map")) return "Wildlife Map";
    if (path.includes("/encyclopedia")) return "Encyclopedia";
    if (path.includes("/notifications")) return "Notifications";
    if (path.includes("/messages")) return "Messages";
    if (path.includes("/support")) return "Support";
    if (path.includes("/profile")) return "Profile";
    if (path.includes("/settings")) return "Settings";
    return "Dashboard";
  };

  // ─── Logout handler – redirects to home page ──────────────────
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/', { replace: true });   // 🔁 go to home page
  };

  // ─── Sidebar width classes ─────────────────────────────────────
  const sidebarWidth = isCollapsed ? "w-20" : "w-72";
  const mainMargin = isCollapsed ? "lg:ml-20" : "lg:ml-72";

  return (
    <div className="h-screen overflow-hidden bg-gray-50 font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ===== SIDEBAR – Green brand colors ===== */}
      <aside className={`fixed left-0 top-0 z-50 flex h-full flex-col bg-gradient-to-b from-green-800 to-green-700 text-white transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${sidebarWidth}`}>
        {/* Logo */}
        <div className="shrink-0 border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between">
            {!isCollapsed ? (
              <div>
                <div className="flex items-center gap-2">
                  <Sprout className="h-7 w-7 text-green-300" />
                  <h1 className="text-xl font-bold tracking-tight">
                    Wild<span className="text-green-300">North</span>
                  </h1>
                </div>
                <p className="mt-0.5 text-xs text-white/50">Conservation Dashboard</p>
              </div>
            ) : (
              <Sprout className="mx-auto h-7 w-7 text-green-300" />
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 lg:block"
              >
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 lg:hidden"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.end || false}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? item.name : ""}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-green-600/40 text-white shadow-lg"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    } ${isCollapsed ? "justify-center" : ""}`
                  }
                >
                  <Icon size={isCollapsed ? 20 : 18} className="shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom section – user info and logout */}
        <div className="shrink-0 border-t border-white/10 p-3">
          {!isCollapsed && (
            <div className="mb-3 rounded-xl bg-white/5 p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/40">Logged in as</p>
              <p className="mt-0.5 text-sm font-semibold text-white">{userName}</p>
              <p className="mt-0.5 text-[10px] text-green-300">{userEmail}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/20 px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className={`flex h-full flex-col transition-all duration-300 ${mainMargin}`}>
        <header className="shrink-0 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 lg:hidden"
              >
                <Menu size={18} />
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-900 lg:text-xl">{getPageTitle()}</h2>
                <p className="text-xs text-gray-500">
                  Welcome back, {userName.split(" ")[0]} · Community Member
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-9 w-48 rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition focus:border-green-500 focus:bg-white lg:w-64"
                />
              </div>
              <NavLink to="/dashboard/messages" className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50">
                <MessageCircle size={16} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-green-500" />
              </NavLink>
              <NavLink to="/dashboard/notifications" className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50">
                <Bell size={16} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
              </NavLink>
              <NavLink to="/dashboard/profile" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50">
                <User size={16} />
              </NavLink>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] hover:bg-red-700"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          <Outlet />
        </main>

        <footer className="shrink-0 border-t border-gray-200 bg-white px-4 py-2 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Sprout size={12} className="text-green-700" />
              <p>© 2026 WildNorth Kenya.</p>
            </div>
            <div className="flex items-center gap-3">
              <NavLink to="/dashboard/profile" className="transition hover:text-green-700">Profile</NavLink>
              <span className="text-[10px]">v1.0.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}