import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        setTimedOut(true);
      }
    }, 10000);
    return () => clearTimeout(timeoutId);
  }, [loading]);

  if (loading && !timedOut) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (timedOut) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
