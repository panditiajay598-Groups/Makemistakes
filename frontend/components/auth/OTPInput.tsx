"use client";

import React, { useRef } from "react";

interface OTPInputProps {
  otp: string[];
  setOtp: (otp: string[]) => void;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({ otp, setOtp, disabled }) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    if (!cleanValue) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    if (cleanValue.length > 1) {
      handlePasteString(cleanValue, index);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);

    if (cleanValue && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePasteString = (pasted: string, startIdx = 0) => {
    const digits = pasted.replace(/[^0-9]/g, "").slice(0, 6).split("");
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (startIdx + i < 6) {
        newOtp[startIdx + i] = digit;
      }
    });
    setOtp(newOtp);
    const nextIdx = Math.min(startIdx + digits.length, 5);
    inputsRef.current[nextIdx]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    handlePasteString(pastedData, index);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-between gap-2 my-4">
      {otp.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputsRef.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e.target.value)}
          onPaste={(e) => handlePaste(e, idx)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          className="h-12 w-11 sm:w-12 rounded border border-zinc-800 bg-zinc-900/60 text-center font-mono text-lg font-bold text-zinc-100 outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 disabled:opacity-50"
        />
      ))}
    </div>
  );
};

export default OTPInput;
