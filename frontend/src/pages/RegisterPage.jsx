import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { FaGoogle, FaUser, FaEnvelope, FaLock, FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";

function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const res = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      if (res.success) {
        addToast(res.message || "Registration successful! Please check your email.", "success");
        navigate("/login");
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to register";
      addToast(errMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold text-lg mb-3">
            &gt;_
          </div>
          <h2 className="font-display text-2xl font-bold text-white tracking-tight">
            Create Account
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Join DevFlow and start building.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Name Field */}
          <div>
            <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <FaUser className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                {...register("name", {
                  required: "Name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                })}
                placeholder="John Doe"
                className="w-full rounded-lg border border-slate-800 bg-slate-950/60 py-2.5 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>
            )}
          </div>

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
            <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <FaLock className="h-3.5 w-3.5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
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

          {/* Confirm Password Field */}
          <div>
            <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <FaLock className="h-3.5 w-3.5" />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) => value === password || "Passwords do not match",
                })}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-800 bg-slate-950/60 py-2.5 pl-9 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition focus:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FaEyeSlash className="h-3.5 w-3.5" /> : <FaEye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
          >
            {isSubmitting ? <FaSpinner className="animate-spin" /> : "Sign Up"}
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
          onClick={() => window.location.href = `${import.meta.env.VITE_SOCKET_URL}/api/auth/google`}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-950/40 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <FaGoogle className="text-rose-500" />
          Continue with Google
        </button>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
