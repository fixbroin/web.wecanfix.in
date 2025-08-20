
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { APP_NAME, WEBSITE_URL } from '@/lib/config';
import { getPortfolioItems } from '../admin/settings/actions/portfolio-actions';
import { getSeoData } from '../admin/seo-geo-settings/actions';
import ScrollAnimation from '@/components/ScrollAnimation';
import PortfolioMedia from '@/components/PortfolioMedia';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('portfolio');
  return {
    title: seoData.meta_title,
    description: seoData.meta_description,
    keywords: seoData.meta_keywords,
    alternates: {
      canonical: `${WEBSITE_URL}/portfolio`,
    },
  };
}


export default async function PortfolioPage() {
  const portfolioItems = await getPortfolioItems();
  const seoData = await getSeoData('portfolio');

  const PortfolioCard = ({ item }: { item: typeof portfolioItems[0] }) => (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full">
      <CardContent className="p-0 flex flex-col flex-grow">
        <div className="relative h-60 w-full">
          <PortfolioMedia item={item} />
        </div>
        <div className="p-6 flex-grow flex flex-col">
          <p className="text-sm text-primary font-medium">{item.category}</p>
          <h3 className="mt-1 font-headline text-2xl font-semibold">{item.title}</h3>
          {item.link && item.link !== '#' && (
            <div className="mt-auto pt-4 flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
              View Project <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {portfolioItems.map((item, index) => (
            <ScrollAnimation as="div" key={item.id || index} variant='fadeInUp' delay={index * 0.1}>
              {item.link && item.link !== '#' ? (
                <Link href={item.link} target="_blank" rel="noopener noreferrer" className="h-full block">
                  <PortfolioCard item={item} />
                </Link>
              ) : (
                <PortfolioCard item={item} />
              )}
            </ScrollAnimation>
          ))}
        </div>
      </section>
    </>
  );
}
