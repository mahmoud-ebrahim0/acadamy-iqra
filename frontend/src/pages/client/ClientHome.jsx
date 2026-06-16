import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import HeroSection from '../../components/HeroSection';
import LiveStatsSection from '../../components/LiveStatsSection';
import CoursesSection from '../../components/CoursesSection';
import PricingSection from '../../components/PricingSection';
import MethodologySection from '../../components/MethodologySection';
import WomensAcademySection from '../../components/WomensAcademySection';
import InstructorsSection from '../../components/InstructorsSection';
import StarsOfIqraSection from '../../components/StarsOfIqraSection';
import FAQSection from '../../components/FAQSection';
import TestimonialsSection from '../../components/TestimonialsSection';
import Footer from '../../components/Footer';
import ConsultationModal from '../../components/ConsultationModal';

const ClientHome = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="client-home-page" style={{ position: 'relative' }}>
      <Navbar />
      
      <div id="hero"><HeroSection onBookTrial={() => setIsModalOpen(true)} /></div>
      <LiveStatsSection />
      
      <div id="courses"><CoursesSection /></div>
      <PricingSection openModal={() => setIsModalOpen(true)} />
      
      <MethodologySection />
      <WomensAcademySection />
      
      <div id="instructors"><InstructorsSection /></div>
      <StarsOfIqraSection />
      
      <FAQSection />
      <TestimonialsSection />
      <Footer />

      {/* Floating Action Button */}
      <button className="fab-consultation" onClick={() => setIsModalOpen(true)}>
        ✦ Book Free Trial
      </button>

      {/* Glassmorphic Consultation Modal */}
      <ConsultationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ClientHome;
