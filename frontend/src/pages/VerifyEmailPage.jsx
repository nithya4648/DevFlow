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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-indigo-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900/60 p-8 shadow-2xl backdrop-blur-xl text-center">
        {status === "verifying" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <FaSpinner className="h-12 w-12 animate-spin text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Verifying Email Address</h2>
            <p className="text-sm text-gray-400">Please wait while we verify your account credentials.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <FaCheckCircle className="h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold text-white">Verified!</h2>
            <p className="text-sm text-gray-300">{message}</p>
            <Link
              to="/login"
              className="mt-6 inline-block w-full rounded-lg bg-indigo-650 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-600"
            >
              Sign In to Your Account
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <FaExclamationCircle className="h-16 w-16 text-red-500" />
            <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
            <p className="text-sm text-gray-300">{message}</p>
            <p className="text-xs text-gray-400">The link may have expired or is invalid. Please try registering again.</p>
            <Link
              to="/register"
              className="mt-6 inline-block w-full rounded-lg border border-gray-800 bg-gray-950/40 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-gray-800 hover:text-white"
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
