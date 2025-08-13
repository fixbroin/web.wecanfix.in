
import { Metadata } from 'next';
import { Phone, Mail, MapPin } from 'lucide-react';
import ContactForm from './ContactForm';
import { APP_NAME, WEBSITE_URL } from '@/lib/config';
import { getContactDetails } from '@/app/admin/settings/actions/contact-actions';
import { getSeoData } from '../admin/seo-geo-settings/actions';
import ScrollAnimation from '@/components/ScrollAnimation';

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData('contact');
  return {
    title: seoData.meta_title,
    description: seoData.meta_description,
    keywords: seoData.meta_keywords,
    alternates: {
      canonical: `${WEBSITE_URL}/contact`,
    },
  };
}


export default async function ContactPage() {
  const contactInfo = await getContactDetails();
  const seoData = await getSeoData('contact');

  const contactDetails = [
    {
      icon: <Mail className="h-8 w-8 text-primary" />,
      title: 'Email',
      value: contactInfo.email,
      href: `mailto:${contactInfo.email}`,
    },
    {
      icon: <Phone className="h-8 w-8 text-primary" />,
      title: 'Phone',
      value: contactInfo.phone,
      href: `tel:${contactInfo.phone}`,
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary" />,
      title: 'Location',
      value: contactInfo.location,
      href: '#',
    },
  ];

  return (
    <>
      <section className="bg-secondary">
        <ScrollAnimation as="div" variant="fadeInUp" className="container text-center py-12">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">{seoData.h1_title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {seoData.paragraph}
          </p>
        </ScrollAnimation>
      </section>

      <section className="container">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <ScrollAnimation as="div" variant="slideInLeft" className="space-y-8">
            <h2 className="text-3xl font-bold">Contact Information</h2>
            <p className="text-muted-foreground">
              Use the form on the right to send us a message, or contact us directly through one of the channels below. We typically respond within 24 hours.
            </p>
            <div className="space-y-6">
              {contactDetails.map((detail) => (
                <a key={detail.title} href={detail.href} className="flex items-center gap-4 group">
                  <div className="flex-shrink-0">{detail.icon}</div>
                  <div>
                    <h3 className="font-headline text-xl font-semibold group-hover:text-primary transition-colors">{detail.title}</h3>
                    <p className="text-muted-foreground">{detail.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </ScrollAnimation>
          <ScrollAnimation as="div" variant="slideInRight">
            <ContactForm />
          </ScrollAnimation>
        </div>
      </section>
    </>
  );
}
