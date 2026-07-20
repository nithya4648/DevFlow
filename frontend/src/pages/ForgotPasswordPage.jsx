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
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {submitted ? (
          <div className="mt-8 rounded-lg border border-indigo-500/20 bg-indigo-950/20 p-4 text-center">
            <p className="text-sm text-indigo-200">
              We've sent an email with instructions on how to reset your password. Please check your inbox (and spam folder).
            </p>
          </div>
        ) : (
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-650 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-650/30 transition hover:bg-indigo-600 hover:shadow-indigo-600/40 focus:outline-none focus:ring-2 focus:ring-primary"
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
