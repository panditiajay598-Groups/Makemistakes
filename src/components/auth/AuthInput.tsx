"use client";

import React, { useState } from "react";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isSuccess?: boolean;
  helperText?: string;
  icon?: React.ComponentType<any>;
}

export default function AuthInput({
  label,
  error,
  isSuccess,
  helperText,
  icon: Icon,
  type = "text",
  className = "",
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";

  const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <div className="flex justify-between items-center">
          <label className="block text-xs font-semibold text-zinc-700 font-sans">
            {label} {props.required && <span className="text-teal-700">*</span>}
          </label>
        </div>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-zinc-400 pointer-events-none transition-colors">
            <Icon className={`h-4 w-4 ${error ? "text-rose-500" : isSuccess ? "text-teal-600" : "text-zinc-400"}`} />
          </div>
        )}

        <input
          type={inputType}
          className={`w-full rounded-xl border bg-zinc-50/60 px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition-all ${
            Icon ? "pl-10" : ""
          } ${isPasswordType || isSuccess || error ? "pr-10" : ""} ${
            error
              ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20"
              : isSuccess
              ? "border-teal-300 bg-teal-50/20 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/20"
              : "border-zinc-200 hover:border-zinc-300 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30"
          } ${className}`}
          {...props}
        />

        <div className="absolute right-3.5 flex items-center gap-1.5">
          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-zinc-400 hover:text-zinc-700 focus:outline-none bg-transparent border-none cursor-pointer p-0"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}

          {isSuccess && !error && (
            <CheckCircle2 className="h-4 w-4 text-teal-600" />
          )}

          {error && (
            <AlertCircle className="h-4 w-4 text-rose-500" />
          )}
        </div>
      </div>

      {error && <p className="text-[11px] text-rose-600 font-sans mt-1 font-medium">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-zinc-500 font-sans mt-1">{helperText}</p>}
    </div>
  );
}
