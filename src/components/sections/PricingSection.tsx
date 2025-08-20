
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getPricingPlans, getPricingPageContent } from '@/app/admin/settings/actions/pricing-actions';
import VantaBackground from '../VantaBackground';
import { getVantaSettings } from '@/app/admin/settings/actions/vanta-actions';
import ScrollAnimation from '../ScrollAnimation';
import LoadingLink from '../LoadingLink';

function parsePrice(price: string): number {
    // Remove non-numeric characters except for the decimal point
    const numericString = price.replace(/[^0-9.]/g, '');
    return parseFloat(numericString) || 0;
}

export default async function PricingSection() {
    const [pricingPlans, pageContent, vantaSettings] = await Promise.all([
      getPricingPlans(),
      getPricingPageContent(),
      getVantaSettings()
    ]);
    
    const sectionVantaConfig = vantaSettings?.sections?.pricing;
    const useVanta = vantaSettings.globalEnable && sectionVantaConfig?.enabled;
    
  return (
    <section id="pricing" className="relative">
      {useVanta && <VantaBackground sectionConfig={sectionVantaConfig} />}
      <div className="container">
        <ScrollAnimation variant="fadeInUp" className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl" style={useVanta ? { color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' } : {}}>{pageContent.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground" style={useVanta ? { color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.4)' } : {}}>
            {pageContent.subtitle}
          </p>
        </ScrollAnimation>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <ScrollAnimation key={plan.title} as="div" variant="fadeInUp" delay={index * 0.1}>
              <Card
                className={cn('flex flex-col h-full', plan.is_featured && 'border-2 border-primary shadow-lg')}
              >
                <CardHeader>
                  <CardTitle>{plan.title}</CardTitle>
                  <CardDescription className="pt-2">{plan.description}</CardDescription>
                  <p className="pt-4 text-4xl font-bold font-headline">{plan.price}</p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.name} className="flex items-center">
                        <Check className="mr-2 h-5 w-5 text-green-500" />
                        <span className="text-muted-foreground">{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant={plan.is_featured ? 'default' : 'outline'}>
                    <LoadingLink href={plan.title.toLowerCase().includes('custom') ? '/contact' : `/checkout?plan=${encodeURIComponent(plan.title)}&price=${parsePrice(plan.price)}`}>
                      {plan.title.toLowerCase().includes('custom') ? 'Get Quote' : 'Pay Now'}
                    </LoadingLink>
                  </Button>
                </CardFooter>
              </Card>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}
