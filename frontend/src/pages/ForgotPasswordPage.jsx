import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useState } from "react";
import authService from "../services/auth.service";
import { useToast } from "../context/ToastContext";
import { FaEnvelope, FaSpinner, FaArrowLeft } from "react-icons/fa";

function ForgotPasswordPage() {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const res = await authService.forgotPassword(data.email);
      if (res.success) {
        setSubmitted(true);
        addToast("If your email is registered, we have sent a reset password link.", "success");
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to send reset link";
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
            Forgot Password
          </h2>
          <p className="mt-1 text-xs text-gh-muted font-mono">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {submitted ? (
          <div className="mt-6 rounded-md border border-accent-border bg-accent-light p-4 text-center">
            <p className="text-xs text-accent-fg font-mono">
              We've sent an email with instructions on how to reset your password. Please check your inbox (and spam folder).
            </p>
          </div>
        ) : (
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-2 text-xs"
            >
              {isSubmitting ? <FaSpinner className="animate-spin" /> : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
