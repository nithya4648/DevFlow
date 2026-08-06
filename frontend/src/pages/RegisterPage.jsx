import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { FaGoogle, FaUser, FaEnvelope, FaLock, FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";

function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailParam = searchParams.get("email") || "";
  const inviteToken = searchParams.get("inviteToken") || "";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: emailParam,
      password: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    if (emailParam) {
      setValue("email", emailParam);
    }
  }, [emailParam, setValue]);

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const res = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        inviteToken,
      });
      if (res.success) {
        addToast(res.message || "Registration successful!", "success");
        if (inviteToken) {
          navigate(`/login?inviteToken=${inviteToken}`);
        } else {
          navigate("/login");
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to register";
      addToast(errMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-gh-bg px-4 py-12 font-ui text-gh-text">
      <div className="w-full max-w-md gh-card p-8">
        <div className="text-center">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent-light text-accent-fg border border-accent-border font-mono font-bold text-base mb-3">
            &gt;_
          </div>
          <h2 className="text-xl font-bold text-gh-heading">
            Create your account
          </h2>
          <p className="mt-1 text-xs text-gh-muted font-mono">
            Join DevFlow developer workstation
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Name Field */}
          <div>
            <label className="block text-xs font-mono font-medium text-gh-muted mb-1">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gh-muted">
                <FaUser className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                {...register("name", {
                  required: "Name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                })}
                placeholder="John Doe"
                className="gh-input pl-9"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-400 font-mono">{errors.name.message}</p>
            )}
          </div>

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
            <label className="block text-xs font-mono font-medium text-gh-muted mb-1">
              Password
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
              Confirm Password
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
            className="btn-primary w-full py-2"
          >
            {isSubmitting ? <FaSpinner className="animate-spin" /> : "Create Account"}
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
          onClick={() => window.location.href = `${import.meta.env.VITE_SOCKET_URL}/api/auth/google`}
          className="btn-secondary w-full py-2"
        >
          <FaGoogle className="text-red-400" />
          Continue with Google
        </button>

        <p className="mt-5 text-center text-xs text-gh-muted">
          Already have an account?{" "}
          <Link
            to={inviteToken ? `/login?inviteToken=${inviteToken}` : "/login"}
            className="font-medium text-accent-blue hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
