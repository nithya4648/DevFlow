import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import authService from "../services/auth.service";
import { useToast } from "../context/ToastContext";
import { FaGoogle, FaEnvelope, FaLock, FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";

function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      if (error === "AuthenticationFailed") {
        addToast("Google login failed or was cancelled.", "error");
      } else {
        addToast("An error occurred during login.", "error");
      }
      searchParams.delete("error");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, addToast]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setUnverifiedEmail("");
    try {
      setIsSubmitting(true);
      const res = await login(data);
      if (res.success) {
        addToast("Logged in successfully!", "success");
        navigate("/");
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Invalid credentials";
      addToast(errMsg, "error");
      if (
        err.response?.data?.isVerified === false ||
        errMsg.toLowerCase().includes("not verified") ||
        errMsg.toLowerCase().includes("verify your email")
      ) {
        setUnverifiedEmail(data.email);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    try {
      setIsResending(true);
      const res = await authService.resendVerification(unverifiedEmail);
      if (res.success) {
        addToast("Verification email sent! Check your inbox.", "success");
        setUnverifiedEmail("");
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to resend email";
      addToast(errMsg, "error");
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_SOCKET_URL}/api/auth/google`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold text-lg mb-3">
            &gt;_
          </div>
          <h2 className="font-display text-2xl font-bold text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to manage your developer workspace.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Email Field */}
          <div>
            <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <FaEnvelope className="h-3.5 w-3.5" />
              </span>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-800 bg-slate-950/60 py-2.5 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <FaLock className="h-3.5 w-3.5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                })}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-800 bg-slate-950/60 py-2.5 pl-9 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash className="h-3.5 w-3.5" /> : <FaEye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>
            )}
          </div>

          {unverifiedEmail && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs text-emerald-200">
              <p className="mb-2 text-center text-xs">Didn't receive the verification email?</p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {isResending ? <FaSpinner className="animate-spin" /> : "Resend Verification Email"}
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
          >
            {isSubmitting ? <FaSpinner className="animate-spin" /> : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="mx-4 flex-shrink text-xs text-slate-500 font-mono">or</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-950/40 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <FaGoogle className="text-rose-500" />
          Continue with Google
        </button>

        <p className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
