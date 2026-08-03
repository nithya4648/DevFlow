import { useForm } from "react-hook-form";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import authService from "../services/auth.service";
import { useToast } from "../context/ToastContext";
import { FaLock, FaSpinner, FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
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
      const res = await authService.resetPassword(token, data.password);
      if (res.success) {
        addToast(res.message || "Password reset successfully!", "success");
        navigate("/login");
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to reset password";
      addToast(errMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition"
          >
            <FaArrowLeft /> Back to Login
          </Link>
        </div>

        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-white tracking-tight">
            Reset Password
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Enter your new password below.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Password Field */}
          <div>
            <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1">
              New Password
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
              Confirm New Password
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
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {isSubmitting ? <FaSpinner className="animate-spin" /> : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
