
import { Metadata } from 'next';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { APP_NAME, WEBSITE_URL } from '@/lib/config';
import { getAboutPageContent } from '@/app/admin/settings/actions/about-actions';
import { getSeoData } from '../admin/seo-geo-settings/actions';
import ScrollAnimation from '@/components/ScrollAnimation';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('about');
  return {
    title: seoData.meta_title,
    description: seoData.meta_description,
    keywords: seoData.meta_keywords,
    alternates: {
      canonical: `${WEBSITE_URL}/about`,
    },
  };
}

export default async function AboutPage() {
  const content = await getAboutPageContent();
  const seoData = await getSeoData('about');

  if (!content) {
    return <p className="text-center py-20">Could not load page content.</p>;
  }

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
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <ScrollAnimation as="div" variant="slideInLeft" className="relative h-96 w-full order-last md:order-first">
            <Image
              src={content.mission_image}
              alt="A developer working on a laptop"
              fill
              className="rounded-lg object-cover shadow-lg"
              data-ai-hint="developer portrait"
            />
          </ScrollAnimation>
          <ScrollAnimation as="div" variant="slideInRight">
            <h2 className="text-3xl font-bold">{content.mission_title}</h2>
            <p className="mt-4 text-muted-foreground">
              {content.mission_description.split('\n\n')[0]}
            </p>
            {content.mission_description.split('\n\n')[1] && (
               <p className="mt-4 text-muted-foreground">
                {content.mission_description.split('\n\n')[1]}
               </p>
            )}
          </ScrollAnimation>
        </div>
      </section>
      
      <section className="bg-secondary">
        <div className="container">
            <ScrollAnimation variant="fadeInUp" className="text-center">
                <h2 className="text-3xl font-bold">{content.stack_title}</h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                {content.stack_description}
                </p>
            </ScrollAnimation>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
                {content.skills.map((skill, index) => (
                    <ScrollAnimation as="div" key={skill.name} variant="zoomIn" delay={index * 0.1}>
                      <Card className="bg-card p-4 shadow-sm">
                          <CardContent className="p-0 flex items-center gap-2">
                              <Check className="h-5 w-5 text-primary" />
                              <span className="font-medium">{skill.name}</span>
                          </CardContent>
                      </Card>
                    </ScrollAnimation>
                ))}
            </div>
        </div>
      </section>
    </>
  );
}
