import { useEffect } from "react";
import "./landing.css";
import LandingNav from "./landing/LandingNav";
import Hero from "./landing/Hero";
import ProblemSolution from "./landing/ProblemSolution";
import Features from "./landing/Features";
import HowItWorks from "./landing/HowItWorks";
import Roles from "./landing/Roles";
import Pricing from "./landing/Pricing";
import FinalCta from "./landing/FinalCta";
import LandingFooter from "./landing/LandingFooter";

function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal:not(.reveal--visible)");
    if (!("IntersectionObserver" in window) || elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal--visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function Landing() {
  useScrollReveal();

  return (
    <div className="landing">
      <LandingNav />
      <main>
        <Hero />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <Roles />
        <Pricing />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
