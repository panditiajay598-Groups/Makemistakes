import React from "react";
import Link from "next/link";
import { Terminal } from "lucide-react";
import BrandingPanel from "@/components/auth/BrandingPanel";

export const metadata = {
  title: "MakeMistakes — Create Your Developer Identity",
  description: "Sign in or create your MakeMistakes developer account to begin Mission Zero.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-zinc-900 font-sans flex flex-col lg:flex-row antialiased selection:bg-teal-500/20 selection:text-teal-900">
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between p-4 px-6 border-b border-zinc-200/80 bg-[#FAF9F5]/90 backdrop-blur-md sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white font-mono font-bold text-xs shadow-sm">
            <Terminal className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg text-zinc-900 tracking-tight font-sans">
            Make<span className="text-teal-700">Mistakes</span>
          </span>
        </Link>
        <span className="text-[10px] font-mono font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full uppercase">
          Mission Zero
        </span>
      </div>

      {/* Desktop Left Side Branding Panel */}
      <div className="w-full lg:w-5/12 xl:w-5/12 hidden lg:block shrink-0">
        <BrandingPanel />
      </div>

      {/* Right Side Form Content Canvas */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 md:p-12 min-h-[calc(100vh-65px)] lg:min-h-screen overflow-y-auto">
        <div className="w-full max-w-md my-auto py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
