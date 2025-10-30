import React, { useEffect } from 'react';
import Header from '../components/layout/Header';
import Hero from '../components/layout/Hero';
import HowItWorks from '../components/layout/HowItWorks';
import Features from '../components/layout/Features';
import Testimonials from '../components/layout/Testomonials';
import CallToAction from '../components/layout/CallToAction';
import Footer from '../components/layout/Footer';

export default function LandingPage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <>
      {/* <Header /> */}
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}