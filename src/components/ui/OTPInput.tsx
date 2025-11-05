// src/components/ui/OTPInput.tsx
"use client";

import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";

interface OTPInputProps {
  length: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
}

export default function OTPInput({ length, onComplete, disabled = false }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;

    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only the last digit
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all digits are filled
    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === length) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, length);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < length) {
        newOtp[index] = char;
      }
    });

    setOtp(newOtp);

    // Focus last filled input
    const lastFilledIndex = Math.min(pastedData.length, length) - 1;
    inputRefs.current[lastFilledIndex]?.focus();

    // Call onComplete if all digits are filled
    if (newOtp.every((digit) => digit !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      ))}
    </div>
  );
}