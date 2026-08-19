"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Benefits", href: "#problem" },
    { name: "Missions", href: "#missions" },
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-[#FAF9F5]/90 backdrop-blur-md border-b border-zinc-200/80 py-3.5 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Mark + Text */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-sm">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-zinc-900 font-sans tracking-tight">
              Make<span className="text-teal-700">Mistakes</span>
            </span>
          </a>

          {/* Right Navigation Links & Action Buttons */}
          <div className="hidden md:flex items-center gap-7">
            <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="hover:text-zinc-900 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            <div className="h-4 w-px bg-zinc-300" />

            <div className="flex items-center gap-4">
              <a
                href="/auth/student/login"
                className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
              >
                Log in
              </a>

              <Button
                variant="primary"
                size="sm"
                onClick={() => (window.location.href = "/auth/student/signup")}
              >
                Sign up now
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-700 rounded-lg hover:bg-zinc-200/50"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pb-4 pt-3 border-t border-zinc-200 flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-medium text-zinc-700 hover:text-zinc-900"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-2 border-t border-zinc-200 flex flex-col gap-2">
              <a
                href="/auth/student/login"
                className="px-3 py-2 text-sm font-medium text-zinc-700"
              >
                Log in
              </a>
              <Button
                variant="primary"
                size="md"
                onClick={() => (window.location.href = "/auth/student/signup")}
              >
                Sign up now
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
