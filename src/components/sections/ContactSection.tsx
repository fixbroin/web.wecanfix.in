
import ContactForm from "@/app/contact/ContactForm";
import VantaBackground from '../VantaBackground';
import { getVantaSettings } from '@/app/admin/settings/actions/vanta-actions';

export default async function ContactSection() {
  const vantaSettings = await getVantaSettings();
  const sectionVantaConfig = vantaSettings?.sections?.contact;
  const useVanta = vantaSettings.globalEnable && sectionVantaConfig?.enabled;

  return (
    <section id="contact" className="relative">
      {useVanta && <VantaBackground sectionConfig={sectionVantaConfig} />}
      <div className="container">
        <div className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl" style={useVanta ? { color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' } : {}}>Ready to Start Your Project?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground" style={useVanta ? { color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.4)' } : {}}>
            Fill out the form below or send us a message on WhatsApp. We'd love to hear about your ideas.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-xl">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
