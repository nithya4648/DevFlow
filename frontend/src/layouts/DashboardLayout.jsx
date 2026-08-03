import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { GlobalSearch } from "../components/ui/GlobalSearch";
import useAuth from "../hooks/useAuth";
import useDarkMode from "../hooks/useDarkMode";
import { useToast } from "../context/ToastContext";
import { useNotifications } from "../context/NotificationContext";
import {
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaSun,
  FaMoon,
  FaUserCircle,
  FaSignOutAlt,
  FaHome,
  FaWrench,
  FaFolder,
  FaCode,
  FaBook,
  FaStickyNote,
  FaLock,
  FaBookmark,
  FaCog,
  FaBell,
  FaUsers,
  FaHistory,
} from "react-icons/fa";

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [theme, toggleTheme] = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("devflow_sidebar_collapsed") === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // From context
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    localStorage.setItem("devflow_sidebar_collapsed", collapsed);
  }, [collapsed]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    addToast("Logged out successfully", "info");
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/", icon: FaHome },
    { name: "Dev Tools", path: "/tools", icon: FaWrench },
    { name: "Projects", path: "/projects", icon: FaFolder },
    { name: "Snippets", path: "/snippets", icon: FaCode },
    { name: "Docs", path: "/docs", icon: FaBook },
    { name: "Notes", path: "/notes", icon: FaStickyNote },
    { name: "Env Vault", path: "/env-vault", icon: FaLock },
    { name: "Bookmarks", path: "/bookmarks", icon: FaBookmark },
    { name: "Teams", path: "/teams", icon: FaUsers },
    { name: "Activity", path: "/activity", icon: FaHistory },
    { name: "Settings", path: "/settings", icon: FaCog },
  ];

  const getPageTitle = () => {
    const item = menuItems.find((m) =>
      m.path === "/" ? location.pathname === "/" : location.pathname.startsWith(m.path)
    );
    return item ? item.name : "Dashboard";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. Mobile Hamburger Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* 2. Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200/80 bg-white/95 dark:border-slate-800/80 dark:bg-slate-900/90 backdrop-blur-md transition-all duration-300 lg:static ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "w-20" : "w-64"}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono font-bold text-sm">
              &gt;_
            </div>
            {!collapsed && (
              <span className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                DevFlow
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden text-slate-400"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* Menu Links */}
        <nav className="flex-1 overflow-y-auto py-5 space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all duration-150 group relative ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/20 font-semibold"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100 border border-transparent"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                {!collapsed && <span>{item.name}</span>}
                {collapsed && (
                  <span className="absolute left-20 z-50 rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 pointer-events-none group-hover:opacity-100 transition shadow-md whitespace-nowrap dark:bg-slate-800">
                    {item.name}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse Sidebar Button - Desktop Only */}
        <div className="hidden lg:block p-3 border-t border-slate-200/80 dark:border-slate-800/80 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50 dark:border-slate-800/80 dark:bg-slate-900/40 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
          >
            {collapsed ? <FaChevronRight className="h-3.5 w-3.5" /> : <><FaChevronLeft className="h-3.5 w-3.5" /> Collapse</>}
          </button>
        </div>
      </aside>

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-slate-200/80 bg-white/70 dark:border-slate-800/80 dark:bg-slate-900/40 backdrop-blur-md shrink-0">
          
          <div className="flex items-center gap-4">
            {/* Hamburger Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            >
              <FaBars className="h-5 w-5" />
            </button>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white tracking-tight hidden sm:block w-36 shrink-0">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex-1 flex justify-center px-4 max-w-xl mx-auto hidden sm:flex">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-3">
            {/* Search for mobile */}
            <div className="sm:hidden flex-1">
              <GlobalSearch />
            </div>
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg border border-slate-200/80 bg-slate-50 dark:border-slate-800/80 dark:bg-slate-900/40 p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition"
              title="Toggle Theme"
            >
              {theme === "dark" ? <FaSun className="h-4 w-4" /> : <FaMoon className="h-4 w-4" />}
            </button>

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setProfileDropdownOpen(false);
                  }}
                  className="relative rounded-lg border border-slate-200/80 bg-slate-50 dark:border-slate-800/80 dark:bg-slate-900/40 p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition"
                >
                  <FaBell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white shadow-xs ring-2 ring-white dark:ring-slate-900">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <>
                    <div
                      onClick={() => setNotifDropdownOpen(false)}
                      className="fixed inset-0 z-40"
                    />
                    <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 flex flex-col max-h-[400px]">
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-display text-xs font-semibold text-slate-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* List */}
                      <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-500">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                if (!n.isRead) markAsRead(n._id);
                              }}
                              className={`p-2.5 rounded-lg flex flex-col gap-1 cursor-pointer transition ${
                                n.isRead
                                  ? "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 opacity-70"
                                  : "bg-emerald-500/10 dark:bg-emerald-500/10 hover:bg-emerald-500/15"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-xs ${n.isRead ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-slate-100 font-medium"}`}>
                                  {n.message}
                                </p>
                                {!n.isRead && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />}
                              </div>
                              <span className="font-mono text-[10px] text-slate-400">
                                {new Date(n.createdAt).toLocaleString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Profile Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotifDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 outline-none group"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full border border-emerald-500/30 group-hover:border-emerald-500 transition"
                    />
                  ) : (
                    <FaUserCircle className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                  )}
                </button>

                {profileDropdownOpen && (
                  <>
                    <div
                      onClick={() => setProfileDropdownOpen(false)}
                      className="fixed inset-0 z-40"
                    />
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
                      <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-display text-xs font-semibold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        <Link
                          to="/settings"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition"
                        >
                          <FaCog className="h-3.5 w-3.5" /> Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                        >
                          <FaSignOutAlt className="h-3.5 w-3.5" /> Log Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
