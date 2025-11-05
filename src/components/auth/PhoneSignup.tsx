// src/components/auth/PhoneSignup.tsx
"use client";

import { useState } from "react";
import { Phone, ArrowRight, ArrowLeft, Loader2, Shield } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import OTPInput from "@/components/ui/OTPInput";
import { ConfirmationResult } from "firebase/auth";

interface PhoneSignupProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function PhoneSignup({ onSuccess, onBack }: PhoneSignupProps) {
  const { signUpWithPhone, verifyOTP } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, "");
    
    // Format as +91 XXXXX XXXXX for India (adjust for your country)
    if (numbers.length <= 2) return `+${numbers}`;
    if (numbers.length <= 7) return `+${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    return `+${numbers.slice(0, 2)} ${numbers.slice(2, 7)} ${numbers.slice(7, 12)}`;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Remove spaces and ensure proper format (+91XXXXXXXXXX)
      const formattedPhone = phoneNumber.replace(/\s/g, "");
      
      const result = await signUpWithPhone(formattedPhone);
      setConfirmationResult(result);
      setStep("otp");
      startResendTimer();
    } catch (error: any) {
      setError(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPComplete = async (otp: string) => {
    if (!confirmationResult) return;
    
    setError("");
    setIsSubmitting(true);

    try {
      await confirmationResult.confirm(otp);
      onSuccess();
    } catch (error: any) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setError("");
    setIsSubmitting(true);

    try {
      const formattedPhone = phoneNumber.replace(/\s/g, "");
      const result = await signUpWithPhone(formattedPhone);
      setConfirmationResult(result);
      startResendTimer();
    } catch (error: any) {
      setError(error.message || "Failed to resend OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-slide-up">
      <div id="recaptcha-container"></div>

      {step === "phone" ? (
        <>
          {/* Phone Number Step */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <Phone className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Enter Phone Number</h2>
            <p className="text-gray-600">We'll send you a verification code</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handlePhoneSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/50"
                  placeholder="+91 XXXXX XXXXX"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Enter your phone number with country code
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || phoneNumber.length < 10}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to email signup
            </button>
          </form>
        </>
      ) : (
        <>
          {/* OTP Verification Step */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Verify OTP</h2>
            <p className="text-gray-600">
              Enter the 6-digit code sent to
              <br />
              <span className="font-semibold text-gray-800">{phoneNumber}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-slide-up">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <OTPInput
              length={6}
              onComplete={handleOTPComplete}
              disabled={isSubmitting}
            />

            {isSubmitting && (
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">Verifying...</span>
              </div>
            )}

            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-gray-600">
                  Resend OTP in <span className="font-semibold text-emerald-600">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResendOTP}
                  disabled={isSubmitting}
                  className="text-emerald-600 hover:text-emerald-700 font-semibold disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setError("");
              }}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Change phone number
            </button>
          </div>
        </>
      )}
    </div>
  );
}