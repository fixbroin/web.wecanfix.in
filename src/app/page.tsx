
import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import WhyChooseUsSection from '@/components/sections/WhyChooseUsSection';
import PortfolioSection from '@/components/sections/PortfolioSection';
import PricingSection from '@/components/sections/PricingSection';
import TestimonialSection from '@/components/sections/TestimonialSection';
import FaqSection from '@/components/sections/FaqSection';
import ContactSection from '@/components/sections/ContactSection';
import { getSeoData } from './admin/seo-geo-settings/actions';
import { Metadata } from 'next';
import { WEBSITE_URL } from '@/lib/config';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('home');
  return {
    title: seoData.meta_title,
    description: seoData.meta_description,
    keywords: seoData.meta_keywords,
    alternates: {
      canonical: WEBSITE_URL,
    },
  };
}


export default function Home() {
  return (
    <main>
      <HeroSection />
      <ServicesSection />
      <WhyChooseUsSection />
      <PortfolioSection />
      <PricingSection />
      <TestimonialSection />
      <FaqSection />
      <ContactSection />
    </main>
  );
}
