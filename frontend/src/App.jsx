import './App.css';
import { Routes, Route, Outlet } from 'react-router-dom';

// ─── Public components ──────────────────────────────────────────
import Navbar from './component/Navbar';
import Home from './component/Home';
import About from './component/About';
import Wildlife from './component/Wildlife';
import Report from './component/Report';
// import Map from './component/Map';  // no longer used in public
import Faq from './component/Faq';     // ✅ import from component
import Encyclopedia from './component/Encyclopedia';
import Contact from './component/Contact';
import UserLogin from './component/UserLogin';
import Register from './component/Register';
import AdminLogin from './admin/pages/AdminLogin';

// ─── User Dashboard components ──────────────────────────────────
import UserDashboard from './users/layout/UserDashboard';
import Dashboard from './users/pages/Dashboard';
import Reports from './users/pages/Reports';
import Sightings from './users/pages/Sightings';
import UserMap from './users/pages/UserMap';
import EncyclopediaDashboard from './users/pages/Encyclopedia';
import Notifications from './users/pages/Notifications';
import Messages from './users/pages/Messages';
import Support from './users/pages/Support';
import Profile from './users/pages/Profile';
import Settings from './users/pages/Settings';

// ─── Admin Dashboard components ─────────────────────────────────
import AdminDashboard from './admin/layouts/AdminDashboard';
import AdminOverview from './admin/pages/AdminOverview';
import ManageUsers from './admin/pages/ManageUsers';
import ManageReports from './admin/pages/ManageReports';
import ManageSightings from './admin/pages/ManageSightings';
import AdminMap from './admin/pages/AdminMap';
import AdminEncyclopedia from './admin/pages/AdminEncyclopedia';
import AdminMessages from './admin/pages/AdminMessages';
import AdminSupport from './admin/pages/AdminSupport';
import AdminSettings from './admin/pages/AdminSettings';

// ─── Layouts ─────────────────────────────────────────────────────
function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </>
  );
}

function AuthLayout() {
  return <Outlet />;
}

// ─── Fallback placeholder ──────────────────────────────────────
const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-700">{title}</h2>
      <p className="text-gray-400 mt-2">This page is under construction.</p>
    </div>
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────
function App() {
  return (
    <Routes>
      {/* Public routes – with Navbar */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/wildlife" element={<Wildlife />} />
        <Route path="/report" element={<Report />} />
        <Route path="/faq" element={<Faq />} />               {/* uses imported Faq */}
        <Route path="/encyclopedia" element={<Encyclopedia />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Auth routes – WITHOUT Navbar */}
      <Route element={<AuthLayout />}>
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />
      </Route>

      {/* User Dashboard routes */}
      <Route path="/dashboard" element={<UserDashboard />}>
        <Route index element={<Dashboard />} />
        <Route path="reports" element={<Reports />} />
        <Route path="sightings" element={<Sightings />} />
        <Route path="map" element={<UserMap />} />
        <Route path="encyclopedia" element={<EncyclopediaDashboard />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="messages" element={<Messages />} />
        <Route path="support" element={<Support />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Admin Dashboard routes */}
      <Route path="/admin" element={<AdminDashboard />}>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="reports" element={<ManageReports />} />
        <Route path="sightings" element={<ManageSightings />} />
        <Route path="map" element={<AdminMap />} />
        <Route path="encyclopedia" element={<AdminEncyclopedia />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* 404 fallback */}
      <Route
        path="*"
        element={<div className="text-center text-2xl mt-10">Page Not Found</div>}
      />
    </Routes>
  );
}

export default App;