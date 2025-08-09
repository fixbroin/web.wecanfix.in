
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { getHomePageContent, HomePageContent } from '@/app/admin/settings/actions/home-actions';
import { getSeoData } from '@/app/admin/seo-geo-settings/actions';
import VantaBackground from '../VantaBackground';
import { getVantaSettings } from '@/app/admin/settings/actions/vanta-actions';

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
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl"
            style={useVanta ? { color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' } : {}}
          >
            {seo.h1_title.split(' ').map((word:string, index:number) => (
              word.toLowerCase() === 'convert' ? <span key={index} className="text-primary">{word} </span> : <span key={index}>{word} </span>
            ))}
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground md:text-xl"
             style={useVanta ? { color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.4)' } : {}}
          >
            {seo.paragraph}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
            <Button asChild size="lg">
              <Link href="/contact">Get a Free Quote</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/portfolio">View Our Work</Link>
            </Button>
          </div>
        </div>
        <div className="relative h-80 w-full md:h-full z-10">
            <Image
                src={home.hero_image || "https://placehold.co/800x600.png"}
                alt="Modern website design on a laptop screen"
                fill
                priority={true}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="rounded-lg object-cover shadow-lg"
                data-ai-hint="website laptop"
            />
        </div>
      </div>
    </section>
  );
}
