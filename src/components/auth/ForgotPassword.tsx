// src/components/auth/ForgotPassword.tsx
"use client";

import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle, Loader2, KeyRound } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";

interface ForgotPasswordProps {
  onBack: () => void;
}

export default function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await sendPasswordReset(email);
      setSuccess(true);
    } catch (error: any) {
      if (error.message.includes('user-not-found')) {
        setError("No account found with this email address.");
      } else {
        setError(error.message || "Failed to send reset email. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="animate-slide-up text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">Check Your Email</h2>
        
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
          <p className="text-gray-700 leading-relaxed">
            We've sent a password reset link to:
          </p>
          <p className="font-semibold text-emerald-700 text-lg mt-2">{email}</p>
        </div>

        <div className="space-y-4 text-left bg-white/50 rounded-xl p-6 mb-6">
          <p className="text-sm text-gray-600">
            <strong>Next steps:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Check your email inbox (and spam folder)</li>
            <li>Click the reset link in the email</li>
            <li>Create your new password</li>
            <li>Sign in with your new credentials</li>
          </ol>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Didn't receive the email? Check your spam folder or{" "}
          <button
            onClick={() => {
              setSuccess(false);
              setEmail("");
            }}
            className="text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            try again
          </button>
        </p>

        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <KeyRound className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
        <p className="text-gray-600">
          No worries! Enter your email and we'll send you reset instructions
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-slide-up">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/50"
              placeholder="you@example.com"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending Reset Link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </button>
      </form>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800 flex items-start gap-2">
          <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            <strong>Tip:</strong> Make sure to check your spam or junk folder if you don't see the email within a few minutes.
          </span>
        </p>
      </div>
    </div>
  );
}