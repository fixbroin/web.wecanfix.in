
import { Metadata } from 'next';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME, WEBSITE_URL } from '@/lib/config';
import { getServices } from '@/app/admin/settings/actions/services-actions';
import { getSeoData } from '../admin/seo-geo-settings/actions';
import ScrollAnimation from '@/components/ScrollAnimation';
import LoadingLink from '@/components/LoadingLink';
import PortfolioMedia from '@/components/PortfolioMedia';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('services');
  return {
    title: seoData.meta_title,
    description: seoData.meta_description,
    keywords: seoData.meta_keywords,
    alternates: {
      canonical: `${WEBSITE_URL}/services`,
    },
  };
}


export default async function ServicesPage() {
  const services = await getServices();
  const seoData = await getSeoData('services');

  return (
    <>
      <section className="bg-secondary">
        <ScrollAnimation as="div" variant="fadeInUp" className="container text-center py-12">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">{seoData.h1_title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {seoData.paragraph}
          </p>
        </ScrollAnimation>
      </section>

      <section className="container">
        <div className="space-y-16">
          {services.map((service, index) => (
            <ScrollAnimation as="div" key={service.id || index} variant="fadeInUp" delay={index * 0.1}>
              <Card className="overflow-hidden shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className={`p-8 flex flex-col justify-center ${index % 2 === 1 ? 'md:order-last' : ''}`}>
                          <h2 className="text-3xl font-bold">{service.title}</h2>
                          <p className="mt-2 font-semibold text-primary">{service.price}</p>
                          <p className="mt-4 text-muted-foreground">{service.description}</p>
                          <ul className="mt-6 space-y-3">
                          {service.features.map((feature) => (
                              <li key={feature.name} className="flex items-center">
                              <Check className="mr-2 h-5 w-5 text-green-500" />
                              <span>{feature.name}</span>
                              </li>
                          ))}
                          </ul>
                          <Button asChild className="mt-8 self-start">
                              <LoadingLink href="/contact">Inquire Now</LoadingLink>
                          </Button>
                      </div>
                      {service.mediaUrl && (
                        <div className="relative min-h-[300px] md:min-h-[400px]">
                            <PortfolioMedia item={{...service, category: 'Service'}} />
                        </div>
                      )}
                  </div>
              </Card>
            </ScrollAnimation>
          ))}
        </div>
      </section>
    </>
  );
}
