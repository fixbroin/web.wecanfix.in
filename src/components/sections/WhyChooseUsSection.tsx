
import Image from 'next/image';
import { getWhyChooseUsContent } from '@/app/admin/settings/actions/why-choose-us-actions';
import VantaBackground from '../VantaBackground';
import { getVantaSettings } from '@/app/admin/settings/actions/vanta-actions';
import DynamicIcon from '../DynamicIcon';
import ScrollAnimation from '../ScrollAnimation';
import PortfolioMedia from '../PortfolioMedia';

export default async function WhyChooseUsSection() {
    const content = await getWhyChooseUsContent();
    const vantaSettings = await getVantaSettings();
    const sectionVantaConfig = vantaSettings?.sections?.whyChooseUs;
    const useVanta = vantaSettings.globalEnable && sectionVantaConfig?.enabled;

    const mediaItem = {
      title: content.title,
      category: 'Why Choose Us',
      mediaType: content.media_type || 'image',
      mediaUrl: content.media_url,
      displayOrder: 1,
    };

  return (
    <section id="why-choose-us" className="relative">
       {useVanta && <VantaBackground sectionConfig={sectionVantaConfig} />}
      <div className="container grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div>
          <ScrollAnimation variant="fadeInUp">
            <h2 className="text-3xl font-bold md:text-4xl" style={useVanta ? { color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' } : {}}>{content.title}</h2>
            <p className="mt-4 text-lg text-muted-foreground" style={useVanta ? { color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.4)' } : {}}>
              {content.subtitle}
            </p>
          </ScrollAnimation>
          <ul className="mt-8 space-y-6">
            {content.features.map((feature, index) => (
              <ScrollAnimation as="li" key={feature.title} variant="fadeInUp" delay={0.2 + index * 0.1} className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0">
                    <DynamicIcon name={feature.icon} className="h-6 w-6 text-primary" />
                </div>
                <div style={useVanta ? { color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.4)' } : {}}>
                  <h3 className="font-headline text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-muted-foreground" style={useVanta ? { color: 'white' } : {}}>{feature.description}</p>
                </div>
              </ScrollAnimation>
            ))}
          </ul>
        </div>
        <ScrollAnimation as="div" variant="slideInRight" delay={0.2} className="relative h-96 w-full z-10 rounded-lg overflow-hidden shadow-lg">
          <PortfolioMedia item={mediaItem as any} />
        </ScrollAnimation>
      </div>
    </section>
  );
}
