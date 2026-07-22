import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
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
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300">
      
      {/* 1. Mobile Hamburger Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* 2. Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-150 bg-white dark:border-gray-800 dark:bg-gray-900/40 backdrop-blur-xl transition-all duration-300 lg:static ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "w-20" : "w-64"}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-150 dark:border-gray-800">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {collapsed ? "D" : "DevFlow"}
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden text-gray-400"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Menu Links */}
        <nav className="flex-1 overflow-y-auto py-6 space-y-1.5 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 group relative ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/40 dark:hover:text-white"
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0 transition group-hover:scale-110" />
                {!collapsed && <span>{item.name}</span>}
                {collapsed && (
                  <span className="absolute left-20 z-50 rounded-md bg-gray-900 px-2 py-1 text-xs font-semibold text-white opacity-0 pointer-events-none group-hover:opacity-100 transition shadow-lg whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse Sidebar Button - Desktop Only */}
        <div className="hidden lg:block p-4 border-t border-gray-150 dark:border-gray-800">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-150 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/20 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
          >
            {collapsed ? <FaChevronRight className="h-4.5 w-4.5" /> : <><FaChevronLeft className="h-4 w-4" /> Collapse</>}
          </button>
        </div>
      </aside>

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-gray-150 bg-white/50 dark:border-gray-800 dark:bg-gray-900/20 backdrop-blur-md">
          
          <div className="flex items-center gap-4">
            {/* Hamburger Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
            >
              <FaBars className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-gray-150 bg-gray-50 dark:border-gray-850 dark:bg-gray-950/40 p-2.5 text-gray-500 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400 transition"
            >
              {theme === "dark" ? <FaSun className="h-4.5 w-4.5" /> : <FaMoon className="h-4.5 w-4.5" />}
            </button>

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setProfileDropdownOpen(false);
                  }}
                  className="relative rounded-xl border border-gray-150 bg-gray-50 dark:border-gray-850 dark:bg-gray-950/40 p-2.5 text-gray-500 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400 transition"
                >
                  <FaBell className="h-4.5 w-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-900">
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
                    <div className="absolute right-0 mt-2.5 w-80 origin-top-right rounded-xl border border-gray-150 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 z-50 flex flex-col max-h-[400px]">
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* List */}
                      <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-sm text-gray-500">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                if (!n.isRead) markAsRead(n._id);
                              }}
                              className={`p-3 rounded-lg flex flex-col gap-1 cursor-pointer transition ${
                                n.isRead
                                  ? "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 opacity-70"
                                  : "bg-indigo-50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/20"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-xs ${n.isRead ? "text-gray-600 dark:text-gray-400" : "text-gray-900 dark:text-gray-100 font-medium"}`}>
                                  {n.message}
                                </p>
                                {!n.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1" />}
                              </div>
                              <span className="text-[10px] text-gray-400">
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
                      className="h-9 w-9 rounded-full border border-indigo-500/20 group-hover:border-indigo-500 transition"
                    />
                  ) : (
                    <FaUserCircle className="h-9 w-9 text-gray-400" />
                  )}
                </button>

                {profileDropdownOpen && (
                  <>
                    <div
                      onClick={() => setProfileDropdownOpen(false)}
                      className="fixed inset-0 z-40"
                    />
                    <div className="absolute right-0 mt-2.5 w-56 origin-top-right rounded-xl border border-gray-150 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-900 z-50">
                      <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="mt-1.5 space-y-1">
                        <Link
                          to="/settings"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-850 dark:hover:text-white transition"
                        >
                          <FaCog /> Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                        >
                          <FaSignOutAlt /> Log Out
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
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50 dark:bg-gray-950/20">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
