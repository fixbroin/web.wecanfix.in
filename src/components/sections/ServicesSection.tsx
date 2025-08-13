
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getServices } from '@/app/admin/settings/actions/services-actions';
import VantaBackground from '../VantaBackground';
import { getVantaSettings } from '@/app/admin/settings/actions/vanta-actions';
import DynamicIcon from '../DynamicIcon';
import ScrollAnimation from '../ScrollAnimation';

export default async function ServicesSection() {
    const services = await getServices();
    const vantaSettings = await getVantaSettings();
    const sectionVantaConfig = vantaSettings?.sections?.services;
    const useVanta = vantaSettings.globalEnable && sectionVantaConfig?.enabled;
    // Get first 6 services for the home page section
    const displayedServices = services.slice(0, 6);

  return (
    <section id="services" className="relative">
       {useVanta && <VantaBackground sectionConfig={sectionVantaConfig} />}
      <div className="container">
        <ScrollAnimation variant="fadeInUp" className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl" style={useVanta ? { color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' } : {}}>Our Services</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground" style={useVanta ? { color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.4)' } : {}}>
            We offer a wide range of web development services to meet your business needs.
          </p>
        </ScrollAnimation>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {displayedServices.map((service, index) => (
            <ScrollAnimation key={service.title} variant="fadeInUp" delay={index * 0.1}>
              <Card className="flex flex-col text-center items-center p-6 transition-transform duration-300 hover:scale-105 hover:shadow-xl h-full">
                <CardHeader className="items-center">
                  <DynamicIcon name={service.icon} className="h-10 w-10 text-primary" />
                  <CardTitle className="mt-4">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}
