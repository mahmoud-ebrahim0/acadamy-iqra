import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CoursesSection from '../../components/CoursesSection';
import InstructorsSection from '../../components/InstructorsSection';
import { useLang } from '../../i18n/lang';
import { pagesContent } from '../../i18n/pagesContent';

const PageHeader = ({ title, subtitle }) => (
  <header style={{ background: 'var(--primary-color)', color: '#fff', padding: '5rem 1.5rem 3rem', textAlign: 'center', borderBottom: '5px solid var(--accent-color)' }}>
    <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontFamily: 'var(--font-heading)', marginBottom: subtitle ? '0.8rem' : 0 }}>{title}</h1>
    {subtitle && <p style={{ fontSize: '1.15rem', opacity: 0.9 }}>{subtitle}</p>}
  </header>
);

/** Full list of courses (linked from "View All Courses" and the footer). */
export const CoursesPage = () => {
  const { lang } = useLang();
  const content = pagesContent[lang] || pagesContent.en;
  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
      <Navbar />
      <PageHeader title={content.coursesTitle} subtitle={content.coursesSubtitle} />
      <CoursesSection showTitle={false} />
      <Footer />
    </div>
  );
};

/** All instructors (linked from the footer). */
export const InstructorsPage = () => {
  const { lang } = useLang();
  const content = pagesContent[lang] || pagesContent.en;
  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
      <Navbar />
      <PageHeader title={content.instructorsPageTitle} />
      <InstructorsSection />
      <Footer />
    </div>
  );
};
