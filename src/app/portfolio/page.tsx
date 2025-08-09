
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { APP_NAME, WEBSITE_URL } from '@/lib/config';
import { getPortfolioItems } from '../admin/settings/actions/portfolio-actions';
import { getSeoData } from '../admin/seo-geo-settings/actions';

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

  return (
    <>
      <section className="bg-secondary">
        <div className="container text-center py-12">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">{seoData.h1_title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {seoData.paragraph}
          </p>
        </div>
      </section>

      <section className="container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {portfolioItems.map((item) => (
            <Link key={item.title} href={item.link}>
              <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="relative h-60 w-full">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      data-ai-hint="portfolio item"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-primary font-medium">{item.category}</p>
                    <h3 className="mt-1 font-headline text-2xl font-semibold">{item.title}</h3>
                    <div className="mt-4 flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      View Project <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
