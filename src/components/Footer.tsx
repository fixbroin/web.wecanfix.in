
'use client'

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import Logo from '@/components/Logo';
import { usePathname } from 'next/navigation';
import type { GeneralSettings } from '@/app/admin/settings/actions/general-actions';
import VantaBackground from './VantaBackground';
import { getVantaSettings } from '@/app/admin/settings/actions/vanta-actions';
import { useEffect, useState } from 'react';
import { VantaSettings } from '@/types/firestore';
import ScrollAnimation from './ScrollAnimation';
import LoadingLink from './LoadingLink';

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/contact', label: 'Contact' },
];

const legalLinks = [
    { href: '/terms', label: 'Terms and Conditions' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/cancellation-policy', label: 'Cancellation Policy' },
    { href: '/refund-policy', label: 'Refund Policy' },
];

export default function Footer({ settings }: { settings: GeneralSettings | null }) {
  const pathname = usePathname();
  const [vantaSettings, setVantaSettings] = useState<VantaSettings | null>(null);

  useEffect(() => {
    async function fetchVantaSettings() {
        const settings = await getVantaSettings();
        setVantaSettings(settings);
    }
    fetchVantaSettings();
  }, [])


  const socialLinks = [
    { href: settings?.facebook_url, icon: Facebook },
    { href: settings?.instagram_url, icon: Instagram },
    { href: settings?.twitter_url, icon: Twitter },
    { href: settings?.linkedin_url, icon: Linkedin },
    { href: settings?.youtube_url, icon: Youtube },
  ].filter(link => link.href);


  if (pathname.startsWith('/admin')) {
      return null;
  }
  
  const sectionVantaConfig = vantaSettings?.sections?.footer;
  const useVanta = vantaSettings?.globalEnable && sectionVantaConfig?.enabled;


  return (
    <footer className="relative text-secondary-foreground">
        {useVanta && <VantaBackground sectionConfig={sectionVantaConfig} />}
      <ScrollAnimation as="div" className="container py-12 relative z-10" variant="fadeInUp">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4 col-span-1 md:col-span-2">
            <Logo appName={settings?.website_name} logoUrl={settings?.logo} />
            <p className="text-sm max-w-md" style={useVanta ? { color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.4)' } : {}}>
              {settings?.footer_description || 'Crafting high-performance websites with modern technology.'}
            </p>
          </div>
          <div className="md:justify-self-center">
            <h3 className="font-headline text-lg font-semibold" style={useVanta ? { color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' } : {}}>Quick Links</h3>
            <ul className="mt-4 space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <LoadingLink href={link.href} className="text-sm hover:text-primary transition-colors" style={useVanta ? { color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.4)' } : {}}>
                    {link.label}
                  </LoadingLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:justify-self-center">
            <h3 className="font-headline text-lg font-semibold" style={useVanta ? { color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' } : {}}>Connect</h3>
            <div className="mt-4 flex space-x-4">
              {socialLinks.map((link, index) => (
                <a key={index} href={link.href || '#'} target="_blank" rel="noopener noreferrer" className="text-secondary-foreground hover:text-primary transition-colors" style={useVanta ? { color: 'white' } : {}}>
                  <link.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground flex flex-col sm:flex-row justify-between items-center gap-4" style={useVanta ? { color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.4)' } : {}}>
          <p>&copy; {new Date().getFullYear()} {settings?.website_name || 'WebDesignBro'}. All rights reserved.</p>
           <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <LoadingLink href={link.href} className="text-sm hover:text-primary transition-colors" style={useVanta ? { color: 'white' } : {}}>
                    {link.label}
                  </LoadingLink>
                </li>
              ))}
            </ul>
        </div>
      </ScrollAnimation>
    </footer>
  );
}
