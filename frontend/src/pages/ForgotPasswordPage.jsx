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
            Forgot Password
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {submitted ? (
          <div className="mt-8 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
            <p className="text-xs text-emerald-300">
              We've sent an email with instructions on how to reset your password. Please check your inbox (and spam folder).
            </p>
          </div>
        ) : (
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
