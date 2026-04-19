import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App, {AboutSectionsPage, ProcessSectionsPage, PhilosophySectionsPage, AuthorsSectionsPage, MethodologySectionsPage, ProgramSectionsPage, TestimonialsSectionsPage, LocationSectionsPage, ForWhoSectionsPage, ResultSectionsPage, LeadMagnitSectionsPage, PricingSectionsPage, FAQSectionsPage, FinalSectionsPage, FooterSectionsPage, HeroSectionsPage, SectionsIndexPage, DocPage} from './App.tsx';
import AppV1 from './App.v1.tsx';
import AppV3 from './App.v3.tsx';
import AppV4 from './App.v4.tsx';
import './index.css';

const path = window.location.pathname.replace(/\/$/, '');
const Page =
  path === '/v1' ? <AppV1 />
  : path === '/v3' ? <AppV3 />
  : path === '/v4' ? <AppV4 />
  : path === '/about-sections' ? <AboutSectionsPage />
  : path === '/process-sections' ? <ProcessSectionsPage />
  : path === '/philosophy-sections' ? <PhilosophySectionsPage />
  : path === '/authors-sections' ? <AuthorsSectionsPage />
  : path === '/metodology-sections' ? <MethodologySectionsPage />
  : path === '/program-sections' ? <ProgramSectionsPage />
  : path === '/testimonials-sections' ? <TestimonialsSectionsPage />
  : path === '/location-sections' ? <LocationSectionsPage />
  : path === '/for-who-sections' ? <ForWhoSectionsPage />
  : path === '/result-sections' ? <ResultSectionsPage />
  : path === '/leadmagnit-sections' ? <LeadMagnitSectionsPage />
  : path === '/pricing-sections' ? <PricingSectionsPage />
  : path === '/faq-sections' ? <FAQSectionsPage />
  : path === '/final-sections' ? <FinalSectionsPage />
  : path === '/footer-sections' ? <FooterSectionsPage />
  : path === '/hero-sections' ? <HeroSectionsPage />
  : path === '/sections' ? <SectionsIndexPage />
  : path === '/doc' ? <DocPage />
  : <App />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {Page}
  </StrictMode>,
);
