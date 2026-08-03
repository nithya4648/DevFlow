import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import authService from "../services/auth.service";
import { useToast } from "../context/ToastContext";
import { FaCheckCircle, FaExclamationCircle, FaSpinner } from "react-icons/fa";

function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState("");
  const verifiedRef = useRef(false);

  useEffect(() => {
    // Avoid double verification call in React 19 StrictMode
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const verify = async () => {
      try {
        const res = await authService.verifyEmail(token);
        if (res.success) {
          setStatus("success");
          setMessage(res.message || "Email verified successfully!");
          addToast("Email verified successfully! You can now log in.", "success");
        }
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || err.message || "Verification failed");
        addToast(err.response?.data?.message || err.message || "Verification failed", "error");
      }
    };

    verify();
  }, [token, addToast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gh-bg px-4 py-12 font-ui text-gh-text">
      <div className="w-full max-w-md gh-card p-8 text-center space-y-4">
        {status === "verifying" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <FaSpinner className="h-8 w-8 animate-spin text-accent-fg" />
            <h2 className="text-lg font-bold text-gh-heading">Verifying Email Address</h2>
            <p className="text-xs text-gh-muted font-mono">Please wait while we verify your account credentials.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <FaCheckCircle className="h-10 w-10 text-accent-fg" />
            <h2 className="text-lg font-bold text-gh-heading">Account Verified!</h2>
            <p className="text-xs text-gh-text font-mono">{message}</p>
            <Link
              to="/login"
              className="btn-primary w-full py-2 text-xs mt-2"
            >
              Sign In to Your Account
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <FaExclamationCircle className="h-10 w-10 text-red-400" />
            <h2 className="text-lg font-bold text-gh-heading">Verification Failed</h2>
            <p className="text-xs text-gh-text font-mono">{message}</p>
            <p className="text-xs text-gh-muted font-mono">The link may have expired or is invalid. Please try registering again.</p>
            <Link
              to="/register"
              className="btn-secondary w-full py-2 text-xs mt-2"
            >
              Back to Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;
