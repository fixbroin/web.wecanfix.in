
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPortfolioItems, getPortfolioPageContent } from '@/app/admin/settings/actions/portfolio-actions';
import VantaBackground from '../VantaBackground';
import { getVantaSettings } from '@/app/admin/settings/actions/vanta-actions';
import ScrollAnimation from '../ScrollAnimation';
import PortfolioMedia from '../PortfolioMedia';
import LoadingLink from '../LoadingLink';


export default async function PortfolioSection() {
    const [allItems, pageContent, vantaSettings] = await Promise.all([
        getPortfolioItems(),
        getPortfolioPageContent(),
        getVantaSettings()
    ]);
    
    const sectionVantaConfig = vantaSettings?.sections?.portfolio;
    const useVanta = vantaSettings.globalEnable && sectionVantaConfig?.enabled;
    // Get first 4 items for the home page section
    const portfolioItems = allItems.slice(0, 4);

    const PortfolioCard = ({ item }: { item: typeof portfolioItems[0] }) => (
      <Card className="group overflow-hidden flex flex-col h-full">
        <CardContent className="p-0 flex flex-col flex-grow">
          <div className="relative h-64 w-full">
            <PortfolioMedia item={item} />
          </div>
          <div className="p-6 flex-grow flex flex-col">
            <h3 className="font-headline text-xl font-semibold">{item.title}</h3>
          </div>
        </CardContent>
      </Card>
    );

  return (
    <section id="portfolio" className="relative">
       {useVanta && <VantaBackground sectionConfig={sectionVantaConfig} />}
      <div className="container">
        <ScrollAnimation variant="fadeInUp" className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl" style={useVanta ? { color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' } : {}}>{pageContent.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground" style={useVanta ? { color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.4)' } : {}}>
            {pageContent.subtitle}
          </p>
        </ScrollAnimation>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          {portfolioItems.map((item, index) => (
            <ScrollAnimation key={item.id || index} as="div" variant="fadeInUp" delay={index * 0.1}>
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
        <ScrollAnimation as="div" variant="fadeInUp" className="mt-12 text-center">
          <Button asChild size="lg">
            <LoadingLink href="/portfolio">View Full Portfolio</LoadingLink>
          </Button>
        </ScrollAnimation>
      </div>
    </section>
  );
}
