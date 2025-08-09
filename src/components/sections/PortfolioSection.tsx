
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPortfolioItems } from '@/app/admin/settings/actions/portfolio-actions';
import VantaBackground from '../VantaBackground';
import { getVantaSettings } from '@/app/admin/settings/actions/vanta-actions';


export default async function PortfolioSection() {
    const allItems = await getPortfolioItems();
    const vantaSettings = await getVantaSettings();
    const sectionVantaConfig = vantaSettings?.sections?.portfolio;
    const useVanta = vantaSettings.globalEnable && sectionVantaConfig?.enabled;
    // Get first 4 items for the home page section
    const portfolioItems = allItems.slice(0, 4);

  return (
    <section id="portfolio" className="relative">
       {useVanta && <VantaBackground sectionConfig={sectionVantaConfig} />}
      <div className="container">
        <div className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl" style={useVanta ? { color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' } : {}}>Our Recent Work</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground" style={useVanta ? { color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.4)' } : {}}>
            Check out some of the stunning websites we've delivered to our clients.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          {portfolioItems.map((item) => (
            <Card key={item.title} className="group overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-64 w-full">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="portfolio item"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-headline text-xl font-semibold">{item.title}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/portfolio">View Full Portfolio</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
