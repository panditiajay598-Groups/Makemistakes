"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

interface ResendTimerProps {
  initialSeconds?: number;
  onResend: () => Promise<void>;
  loading?: boolean;
}

export const ResendTimer: React.FC<ResendTimerProps> = ({
  initialSeconds = 60,
  onResend,
  loading = false,
}) => {
  const [seconds, setSeconds] = useState<number>(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const handleResendClick = async () => {
    if (seconds > 0 || loading) return;
    await onResend();
    setSeconds(initialSeconds);
  };

  return (
    <div className="text-center font-sans text-xs text-zinc-500 flex items-center justify-center gap-1.5">
      <span>Didn't get a code?</span>
      {seconds > 0 ? (
        <span className="font-mono text-zinc-400 font-medium">
          Resend code in <strong className="text-amber-500 font-semibold">{seconds}s</strong>
        </span>
      ) : (
        <button
          type="button"
          onClick={handleResendClick}
          disabled={loading}
          className="text-amber-500 hover:text-amber-400 font-semibold bg-transparent border-none cursor-pointer p-0 inline-flex items-center gap-1 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Resending...</span>
            </>
          ) : (
            <span>Resend OTP</span>
          )}
        </button>
      )}
    </div>
  );
};

export default ResendTimer;
