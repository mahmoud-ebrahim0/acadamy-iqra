import React from 'react';
import Navbar from '../../components/Navbar';
import HeroSection from '../../components/HeroSection';
import CoursesSection from '../../components/CoursesSection';
import InstructorsSection from '../../components/InstructorsSection';
import TestimonialsSection from '../../components/TestimonialsSection';
import Footer from '../../components/Footer';

const ClientHome = () => {
  return (
    <div className="client-home-page">
      <Navbar />
      <HeroSection />
      <CoursesSection />
      <InstructorsSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default ClientHome;
