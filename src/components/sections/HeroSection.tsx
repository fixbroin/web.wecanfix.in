
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { getHomePageContent, HomePageContent } from '@/app/admin/settings/actions/home-actions';
import { getSeoData } from '@/app/admin/seo-geo-settings/actions';
import VantaBackground from '../VantaBackground';
import { getVantaSettings } from '@/app/admin/settings/actions/vanta-actions';
import ScrollAnimation from '../ScrollAnimation';
import LoadingLink from '../LoadingLink';
import HeroMedia from '../HeroMedia';

async function getData() {
    const homeContent = await getHomePageContent();
    const seoData = await getSeoData('home');
    const vantaSettings = await getVantaSettings();
    return { home: homeContent, seo: seoData, vantaSettings };
}

export default async function HeroSection() {
    const { home, seo, vantaSettings } = await getData();

    if (!home || !seo) {
        return (
            <section className="bg-secondary">
                <div className="container text-center py-20">
                    <p>Could not load hero section content.</p>
                </div>
            </section>
        );
    }

    const sectionVantaConfig = vantaSettings?.sections?.hero;
    const useVanta = vantaSettings.globalEnable && sectionVantaConfig?.enabled;


  return (
    <section className="relative overflow-hidden">
       {useVanta && <VantaBackground sectionConfig={sectionVantaConfig} />}
      <div className="container grid grid-cols-1 items-center gap-12 pt-10 md:grid-cols-2 md:pt-16">
        <div className="space-y-6 text-center md:text-left">
          <ScrollAnimation as="h1" variant="fadeInUp" className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl"
            style={useVanta ? { color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' } : {}}
          >
            {seo.h1_title.split(' ').map((word:string, index:number) => (
              word.toLowerCase() === 'convert' ? <span key={index} className="text-primary">{word} </span> : <span key={index}>{word} </span>
            ))}
          </ScrollAnimation>
          <ScrollAnimation as="p" variant="fadeInUp" delay={0.2} className="max-w-xl text-lg text-muted-foreground md:text-xl"
             style={useVanta ? { color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.4)' } : {}}
          >
            {seo.paragraph}
          </ScrollAnimation>
          <ScrollAnimation as="div" variant="fadeInUp" delay={0.4} className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
            <Button asChild size="lg">
              <LoadingLink href="/contact">Get a Free Quote</LoadingLink>
            </Button>
            <Button asChild size="lg" variant="outline">
              <LoadingLink href="/portfolio">View Our Work</LoadingLink>
            </Button>
          </ScrollAnimation>
        </div>
        <ScrollAnimation as="div" variant="zoomIn" delay={0.1} className="relative aspect-video w-full z-10">
            <HeroMedia media={home} />
        </ScrollAnimation>
      </div>
    </section>
  );
}
