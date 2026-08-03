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
    <div className="flex min-h-screen items-center justify-center bg-gh-bg px-4 py-12 font-ui text-gh-text">
      <div className="w-full max-w-md gh-card p-8">
        <div className="mb-5">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-gh-muted hover:text-gh-heading transition"
          >
            <FaArrowLeft /> Back to Login
          </Link>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gh-heading">
            Reset Password
          </h2>
          <p className="mt-1 text-xs text-gh-muted font-mono">
            Enter your new password below.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Password Field */}
          <div>
            <label className="block text-xs font-mono font-medium text-gh-muted mb-1">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gh-muted">
                <FaLock className="h-3.5 w-3.5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
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

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-mono font-medium text-gh-muted mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gh-muted">
                <FaLock className="h-3.5 w-3.5" />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) => value === password || "Passwords do not match",
                })}
                placeholder="••••••••"
                className="gh-input pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gh-muted hover:text-gh-heading transition focus:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FaEyeSlash className="h-3.5 w-3.5" /> : <FaEye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-400 font-mono">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-2 text-xs"
          >
            {isSubmitting ? <FaSpinner className="animate-spin" /> : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
