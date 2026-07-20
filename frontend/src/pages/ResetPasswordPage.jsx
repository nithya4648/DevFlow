import { useForm } from "react-hook-form";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import authService from "../services/auth.service";
import { useToast } from "../context/ToastContext";
import { FaLock, FaSpinner, FaArrowLeft } from "react-icons/fa";

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-indigo-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition"
          >
            <FaArrowLeft /> Back to Login
          </Link>
        </div>

        <div className="text-center">
          <h2 className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-3xl font-extrabold text-transparent">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter your new password below.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              New Password
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <FaLock />
              </span>
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                })}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-850 bg-gray-950/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none ring-primary/40 transition focus:border-primary focus:ring-2"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Confirm New Password
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <FaLock />
              </span>
              <input
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) => value === password || "Passwords do not match",
                })}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-850 bg-gray-950/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none ring-primary/40 transition focus:border-primary focus:ring-2"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-650 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-650/30 transition hover:bg-indigo-600 hover:shadow-indigo-600/40 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {isSubmitting ? <FaSpinner className="animate-spin" /> : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
