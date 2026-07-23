import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { FaGoogle, FaUser, FaEnvelope, FaLock, FaSpinner } from "react-icons/fa";

function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-indigo-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <h2 className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-3xl font-extrabold text-transparent">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Join DevFlow and start building.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Full Name
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <FaUser />
              </span>
              <input
                type="text"
                {...register("name", {
                  required: "Name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                })}
                placeholder="John Doe"
                className="w-full rounded-lg border border-gray-850 bg-gray-950/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none ring-primary/40 transition focus:border-primary focus:ring-2"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

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
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Password
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
              Confirm Password
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
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-650 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-650/30 transition hover:bg-indigo-600 hover:shadow-indigo-600/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
          >
            {isSubmitting ? <FaSpinner className="animate-spin" /> : "Sign Up"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center">
          <div className="flex-grow border-t border-gray-800"></div>
          <span className="mx-4 flex-shrink text-xs text-gray-500">or register with</span>
          <div className="flex-grow border-t border-gray-800"></div>
        </div>

        {/* Google OAuth Placeholder */}
        <button
          type="button"
          onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-800 bg-gray-950/40 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white"
        >
          <FaGoogle className="text-red-500" />
          Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
