
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getFaqs } from '@/app/admin/settings/actions/faq-actions';
import VantaBackground from '../VantaBackground';
import { getVantaSettings } from '@/app/admin/settings/actions/vanta-actions';

export default async function FaqSection() {
  const faqs = await getFaqs();
  const vantaSettings = await getVantaSettings();
  const sectionVantaConfig = vantaSettings?.sections?.faq;
  const useVanta = vantaSettings.globalEnable && sectionVantaConfig?.enabled;

  return (
    <section id="faq" className="relative">
      {useVanta && <VantaBackground sectionConfig={sectionVantaConfig} />}
      <div className="container">
        <div className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl" style={useVanta ? { color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' } : {}}>Frequently Asked Questions</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground" style={useVanta ? { color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.4)' } : {}}>
            Have questions? We have answers. If you don't see your question here, feel free to contact us.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.id || index} value={`item-${index}`} className={useVanta ? 'bg-background/80 rounded-md p-2 mb-2 border-b-0' : ''}>
                <AccordionTrigger className="text-left font-headline text-lg">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
