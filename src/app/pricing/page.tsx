
import { Metadata } from 'next';
import PricingSection from '@/components/sections/PricingSection';
import { getSeoData } from '../admin/seo-geo-settings/actions';
import { WEBSITE_URL } from '@/lib/config';
import ScrollAnimation from '@/components/ScrollAnimation';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('pricing');
  return {
    title: seoData.meta_title,
    description: seoData.meta_description,
    keywords: seoData.meta_keywords,
    alternates: {
      canonical: `${WEBSITE_URL}/pricing`,
    },
  };
}

export default async function PricingPage() {
  const seoData = await getSeoData('pricing');
  return (
    <>
      <ScrollAnimation as="section" variant="fadeInUp" className="container text-center py-12">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">{seoData.h1_title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {seoData.paragraph}
        </p>
      </ScrollAnimation>
      <PricingSection />
    </>
  );
}
