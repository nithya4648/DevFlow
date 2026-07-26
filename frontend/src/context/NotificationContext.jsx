// frontend/src/context/NotificationContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import useAuth from "../hooks/useAuth";
import { useToast } from "./ToastContext";
import { notificationService } from "../services/notification.service";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Initial fetch on load if user is logged in
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      notificationService.getNotifications({ limit: 50 })
        .then((res) => {
          setNotifications(res.data);
          setUnreadCount(res.meta.unreadCount);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // 2. Setup Socket Connection
  useEffect(() => {
    if (!user) return; // Only connect if authenticated

    // Since we use httpOnly cookies, credentials: true automatically sends the devflow_token cookie to the backend during the handshake
    const socketInstance = io(import.meta.env.VITE_SOCKET_URL || "https://devflow-vfnd.onrender.com", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    setSocket(socketInstance);

    // Listen for new notifications
    socketInstance.on("notification:new", (newNotification) => {
      // 1. Prepend to list
      setNotifications((prev) => [newNotification, ...prev]);
      
      // 2. Increment unread
      setUnreadCount((prev) => prev + 1);

      // 3. Show Toast
      const typeMap = {
        success: "success",
        error: "error",
        warning: "warning",
        info: "info"
      };
      const toastType = typeMap[newNotification.type] || "info";
      addToast(newNotification.message, toastType);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user, addToast]);

  // 3. Expose Actions
  const markAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error(error);
      // We could revert optimistic update here on fail
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
