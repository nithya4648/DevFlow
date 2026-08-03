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
    <div className="flex h-screen overflow-hidden bg-gh-bg text-gh-text font-ui antialiased">
      
      {/* 1. Mobile Hamburger Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* 2. Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gh-border bg-gh-surface transition-all duration-200 lg:static ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "w-16" : "w-60"}`}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-gh-border shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-light text-accent-fg border border-accent-border font-mono font-bold text-xs">
              &gt;_
            </div>
            {!collapsed && (
              <span className="font-mono text-base font-bold tracking-tight text-gh-heading">
                DevFlow
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-1 hover:bg-gh-subtle lg:hidden text-gh-muted hover:text-gh-heading"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* Menu Links */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors group relative ${
                    isActive
                      ? "bg-accent-light text-accent-fg border border-accent-border font-semibold"
                      : "text-gh-text hover:bg-gh-subtle hover:text-gh-heading border border-transparent"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
                {collapsed && (
                  <span className="absolute left-16 z-50 rounded-md bg-gh-surface border border-gh-border px-2 py-1 text-xs font-mono text-gh-heading opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap shadow-md">
                    {item.name}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse Sidebar Button - Desktop Only */}
        <div className="hidden lg:block p-2 border-t border-gh-border shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-gh-border bg-gh-subtle py-1.5 text-xs font-mono font-medium text-gh-muted hover:text-gh-heading transition"
          >
            {collapsed ? <FaChevronRight className="h-3 w-3" /> : <><FaChevronLeft className="h-3 w-3" /> Collapse</>}
          </button>
        </div>
      </aside>

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 items-center justify-between px-5 border-b border-gh-border bg-gh-surface shrink-0">
          
          <div className="flex items-center gap-3">
            {/* Hamburger Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-md p-1.5 text-gh-muted hover:bg-gh-subtle hover:text-gh-heading lg:hidden"
            >
              <FaBars className="h-4 w-4" />
            </button>
            <h1 className="text-sm font-semibold text-gh-heading hidden sm:block w-36 shrink-0 font-ui">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex-1 flex justify-center px-4 max-w-xl mx-auto hidden sm:flex">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search for mobile */}
            <div className="sm:hidden flex-1">
              <GlobalSearch />
            </div>
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-secondary p-1.5"
              title="Toggle Theme"
            >
              {theme === "dark" ? <FaSun className="h-3.5 w-3.5 text-amber-400" /> : <FaMoon className="h-3.5 w-3.5" />}
            </button>

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setProfileDropdownOpen(false);
                  }}
                  className="btn-secondary p-1.5 relative"
                >
                  <FaBell className="h-3.5 w-3.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-mono font-bold text-white">
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
                    <div className="absolute right-0 mt-2 w-80 rounded-md border border-gh-border bg-gh-surface z-50 flex flex-col max-h-[400px] shadow-lg">
                      {/* Header */}
                      <div className="flex items-center justify-between px-3 py-2 border-b border-gh-border">
                        <h2 className="text-xs font-mono font-bold text-gh-heading">Notifications</h2>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-accent-blue hover:underline font-mono"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* List */}
                      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-gh-muted font-mono">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                if (!n.isRead) markAsRead(n._id);
                              }}
                              className={`p-2 rounded-md flex flex-col gap-1 cursor-pointer transition ${
                                n.isRead
                                  ? "bg-transparent hover:bg-gh-subtle text-gh-muted"
                                  : "bg-accent-light border border-accent-border text-gh-heading"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-xs ${n.isRead ? "text-gh-muted" : "text-gh-text font-medium"}`}>
                                  {n.message}
                                </p>
                                {!n.isRead && <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1" />}
                              </div>
                              <span className="font-mono text-[10px] text-gh-muted">
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
                  className="flex items-center gap-2 outline-none"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-7 w-7 rounded-full border border-gh-border object-cover"
                    />
                  ) : (
                    <FaUserCircle className="h-7 w-7 text-gh-muted hover:text-gh-heading" />
                  )}
                </button>

                {profileDropdownOpen && (
                  <>
                    <div
                      onClick={() => setProfileDropdownOpen(false)}
                      className="fixed inset-0 z-40"
                    />
                    <div className="absolute right-0 mt-2 w-52 rounded-md border border-gh-border bg-gh-surface p-1.5 shadow-lg z-50 space-y-1">
                      <div className="px-2.5 py-2 border-b border-gh-border">
                        <p className="text-xs font-bold text-gh-heading">{user.name}</p>
                        <p className="font-mono text-[11px] text-gh-muted truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-gh-text hover:bg-gh-subtle hover:text-gh-heading transition"
                      >
                        <FaCog className="h-3.5 w-3.5 text-gh-muted" /> Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition"
                      >
                        <FaSignOutAlt className="h-3.5 w-3.5" /> Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6 bg-gh-bg">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
