"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MedicationReminderRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/journey/P000001?step=1");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-mono text-xs">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
        <span>Loading Product Challenge P000001...</span>
      </div>
    </div>
  );
}
