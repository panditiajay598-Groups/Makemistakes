"use client";

import React from "react";
import { Terminal, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#FAF9F5] border-t border-zinc-200/80 pt-16 pb-12 text-zinc-600 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-zinc-200">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="font-bold text-xl text-zinc-900 font-sans tracking-tight">
                Make<span className="text-teal-700">Mistakes</span>
              </span>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              Learn by building real software, breaking production specs, and debugging synthetic outages instead of passively watching video tutorials.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-zinc-900 uppercase font-mono tracking-wider">Platform</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-zinc-900 transition-colors">Features</a></li>
              <li><a href="#missions" className="hover:text-zinc-900 transition-colors">Missions</a></li>
              <li><a href="#journey" className="hover:text-zinc-900 transition-colors">Student Journey</a></li>
              <li><a href="#portfolio" className="hover:text-zinc-900 transition-colors">Proof of Work</a></li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-zinc-900 uppercase font-mono tracking-wider">Community</h4>
            <ul className="space-y-2">
              <li><a href="https://github.com/makemistakes40-cpu/mmp" target="_blank" rel="noreferrer" className="hover:text-zinc-900 transition-colors">GitHub Workspace</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Developer Blog</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">System Architecture Guides</a></li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-zinc-900 uppercase font-mono tracking-wider">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Security Audit</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <p>© {new Date().getFullYear()} MakeMistakes Inc. Built for ambitious developers.</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/makemistakes40-cpu/mmp" target="_blank" rel="noreferrer" className="hover:text-zinc-900 transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-zinc-900 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-zinc-900 transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
