import React from "react";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Timeline from "@/components/sections/Timeline";
import WhyMakeMistakes from "@/components/sections/WhyMakeMistakes";
import StudentJourney from "@/components/sections/StudentJourney";
import FeaturedMissions from "@/components/sections/FeaturedMissions";
import PortfolioShowcase from "@/components/sections/PortfolioShowcase";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans selection:bg-purple-500/30 selection:text-white">
      {/* 1. Sticky Glass Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-grow flex flex-col">
        {/* 2. Hero Section & Interactive Mission Control Dashboard */}
        <Hero />

        {/* 3. Problem Section (Traditional vs MakeMistakes) */}
        <Problem />

        {/* 4. Solution Visual Timeline (6-Step Pipeline) */}
        <Timeline />

        {/* 5. Why MakeMistakes (8 Feature Cards Grid) */}
        <WhyMakeMistakes />

        {/* 6. Student Journey Roadmap */}
        <StudentJourney />

        {/* 7. Featured Developer Missions */}
        <FeaturedMissions />

        {/* 8. Verified Portfolio Showcase */}
        <PortfolioShowcase />

        {/* 9. Student Transformations & Testimonials */}
        <Testimonials />

        {/* 10. Premium FAQ Accordion */}
        <FAQ />

        {/* 11. Final Call To Action */}
        <CTA />
      </main>

      {/* 12. Footer with Live Operational Telemetry */}
      <Footer />
    </div>
  );
}
