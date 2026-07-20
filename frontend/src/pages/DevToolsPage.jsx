// src/pages/DevToolsPage.jsx
// The /dev-tools sidebar page — redirects user to /tools landing
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function DevToolsPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/tools", { replace: true });
  }, [navigate]);
  return null;
}
