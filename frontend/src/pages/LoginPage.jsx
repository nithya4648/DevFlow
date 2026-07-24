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
    getValues,
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
      if (err.response?.data?.isVerified === false || errMsg.toLowerCase().includes("not verified")) {
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
        setUnverifiedEmail(""); // hide button after resending
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to resend email";
      addToast(errMsg, "error");
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-indigo-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <h2 className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-3xl font-extrabold text-transparent">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to manage your workspace.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Email Address
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <FaEnvelope />
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
                className="w-full rounded-lg border border-gray-850 bg-gray-950/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none ring-primary/40 transition focus:border-primary focus:ring-2"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <FaLock />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                })}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-850 bg-gray-950/50 py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-600 outline-none ring-primary/40 transition focus:border-primary focus:ring-2"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300 transition focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {unverifiedEmail && (
            <div className="rounded-lg bg-indigo-900/40 border border-indigo-500/50 p-4 text-sm text-indigo-200">
              <p className="mb-2 text-center text-xs">Didn't receive the verification email?</p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-indigo-600 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {isResending ? <FaSpinner className="animate-spin" /> : "Resend Verification Email"}
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-650 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-650/30 transition hover:bg-indigo-600 hover:shadow-indigo-600/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
          >
            {isSubmitting ? <FaSpinner className="animate-spin" /> : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center">
          <div className="flex-grow border-t border-gray-800"></div>
          <span className="mx-4 flex-shrink text-xs text-gray-500">or sign in with</span>
          <div className="flex-grow border-t border-gray-800"></div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-800 bg-gray-950/40 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white"
        >
          <FaGoogle className="text-red-500" />
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
