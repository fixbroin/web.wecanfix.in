
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getFaqs } from '@/app/admin/settings/actions/faq-actions';
import VantaBackground from '../VantaBackground';
import { getVantaSettings } from '@/app/admin/settings/actions/vanta-actions';
import ScrollAnimation from '../ScrollAnimation';

export default async function FaqSection() {
  const faqs = await getFaqs();
  const vantaSettings = await getVantaSettings();
  const sectionVantaConfig = vantaSettings?.sections?.faq;
  const useVanta = vantaSettings.globalEnable && sectionVantaConfig?.enabled;

  return (
    <section id="faq" className="relative">
      {useVanta && <VantaBackground sectionConfig={sectionVantaConfig} />}
      <div className="container">
        <ScrollAnimation variant="fadeInUp" className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl" style={useVanta ? { color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' } : {}}>Frequently Asked Questions</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground" style={useVanta ? { color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.4)' } : {}}>
            Have questions? We have answers. If you don't see your question here, feel free to contact us.
          </p>
        </ScrollAnimation>
        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <ScrollAnimation 
                key={faq.id || index}
                as="div"
                variant='fadeInUp'
                delay={index * 0.1}
              >
                <AccordionItem value={`item-${index}`} className={useVanta ? 'bg-background/80 rounded-md p-2 mb-2 border-b-0' : ''}>
                  <AccordionTrigger className="text-left font-headline text-lg">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              </ScrollAnimation>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
