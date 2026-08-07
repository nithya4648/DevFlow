import { useForm } from "react-hook-form";
import LogoIcon from "../assets/logo.svg"; // favicon icon
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
        const inviteToken = searchParams.get("inviteToken");
        const redirect = searchParams.get("redirect");
        if (inviteToken) {
          navigate(`/invites/${inviteToken}`);
        } else if (redirect) {
          navigate(decodeURIComponent(redirect));
        } else {
          navigate("/");
        }
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
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "https://devflow-vfnd.onrender.com";
    window.location.href = `${socketUrl}/api/auth/google`;
  };

  return (
    <div className="dark min-h-screen bg-gh-bg">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 font-ui text-gh-text">
        <div className="w-full max-w-md gh-card p-8">
          <div className="text-center">
            <img
              src="/favicon.svg"
              alt="DevFlow"
              className="h-9 w-9 mb-3 mx-auto"
              style={{ filter: 'brightness(0) saturate(100%) invert(1) sepia(1) saturate(2) hue-rotate(120deg)' }}
            />
            <h2 className="text-xl font-bold text-gh-heading">
              Sign in to DevFlow
            </h2>
            <p className="mt-1 text-xs text-gh-muted font-mono">
              Access your developer workstation
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-mono font-medium text-gh-muted mb-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gh-muted">
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
                  className="gh-input pl-9"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400 font-mono">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono font-medium text-gh-muted">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-accent-blue hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gh-muted">
                  <FaLock className="h-3.5 w-3.5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                  })}
                  placeholder="••••••••"
                  className="gh-input pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gh-muted hover:text-gh-heading transition focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash className="h-3.5 w-3.5" /> : <FaEye className="h-3.5 w-3.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400 font-mono">{errors.password.message}</p>
              )}
            </div>

            {unverifiedEmail && (
              <div className="rounded-md bg-accent-light border border-accent-border p-3 text-xs text-gh-text space-y-2">
                <p className="text-center">Didn't receive the verification email?</p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="btn-primary w-full text-xs"
                >
                  {isResending ? <FaSpinner className="animate-spin" /> : "Resend Verification Email"}
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-2"
            >
              {isSubmitting ? <FaSpinner className="animate-spin" /> : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 flex items-center">
            <div className="flex-grow border-t border-gh-border"></div>
            <span className="mx-3 flex-shrink text-xs text-gh-muted font-mono">or</span>
            <div className="flex-grow border-t border-gh-border"></div>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="btn-secondary w-full py-2"
          >
            <FaGoogle className="text-red-400" />
            Continue with Google
          </button>

          <p className="mt-5 text-center text-xs text-gh-muted">
            New to DevFlow?{" "}
            <Link to="/register" className="font-medium text-accent-blue hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );

}

export default LoginPage;
