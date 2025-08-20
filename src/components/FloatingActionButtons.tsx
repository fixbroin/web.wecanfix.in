
'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getContactDetails } from '@/app/admin/settings/actions/contact-actions';
import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

const WhatsAppIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-8 w-8"
      fill="currentColor"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.31 20.55C8.76 21.36 10.37 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2M12.04 3.63C16.56 3.63 20.32 7.39 20.32 11.91C20.32 16.43 16.56 20.19 12.04 20.19C10.51 20.19 9.06 19.78 7.82 19.03L7.43 18.8L3.89 19.9L5.02 16.42L4.79 16.03C3.96 14.68 3.5 13.14 3.5 11.91C3.5 7.39 7.26 3.63 12.04 3.63M9.83 6.89C9.63 6.89 9.32 6.99 9.07 7.25C8.82 7.51 8.04 8.27 8.04 9.38C8.04 10.49 9.09 11.54 9.24 11.73C9.39 11.93 10.74 14.12 12.92 15C14.81 15.77 15.11 15.62 15.42 15.58C15.89 15.51 16.81 14.99 17.01 14.4C17.21 13.82 17.21 13.34 17.15 13.24C17.08 13.14 16.88 13.08 16.63 12.95C16.38 12.82 15.1 12.21 14.88 12.11C14.67 12.02 14.52 11.97 14.37 12.23C14.22 12.48 13.72 13.08 13.57 13.28C13.42 13.48 13.27 13.51 13.02 13.38C12.77 13.25 11.93 12.96 10.91 12.06C10.11 11.36 9.58 10.5 9.43 10.24C9.28 9.99 9.4 9.87 9.53 9.74C9.64 9.63 9.78 9.45 9.93 9.29C10.08 9.13 10.13 9.03 10.23 8.84C10.33 8.64 10.28 8.49 10.23 8.36C10.18 8.24 9.93 7.15 9.83 6.89Z" />
    </svg>
  );

function FloatingButtons() {
    const [contactDetails, setContactDetails] = useState({ phone: "910000000000", whatsAppNumber: "910000000000" });

    useEffect(() => {
        async function fetchDetails() {
            const details = await getContactDetails();
            if(details) {
                setContactDetails({
                    phone: details.phone || "910000000000",
                    whatsAppNumber: details.whatsAppNumber || "910000000000"
                });
            }
        }
        fetchDetails();
    }, [])
    
    const message = encodeURIComponent("Hi, I'm interested in getting a custom website built.");
    const whatsappLink = `https://wa.me/${contactDetails.whatsAppNumber}?text=${message}`;
    const callLink = `tel:${contactDetails.phone}`;

     return (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-center gap-4">
             <Link 
                href={callLink}
                className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "animate-shake hover:animate-none"
                )}
                aria-label="Call us"
            >
                <Phone className="h-8 w-8" />
            </Link>
            <Link 
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                    "animate-shake hover:animate-none"
                )}
                aria-label="Chat on WhatsApp"
            >
                <WhatsAppIcon />
            </Link>
        </div>
    );
}
  
export default function FloatingActionButtons() {
    const pathname = usePathname();

    if (pathname.startsWith('/admin')) {
        return null;
    }

    return <FloatingButtons />;
}
