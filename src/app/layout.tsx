
import type { Metadata, Viewport } from 'next';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingActionButtons from '@/components/FloatingActionButtons';
import './globals.css';
import Script from 'next/script';
import { getGeneralSettings } from './admin/settings/actions/general-actions';
import { getSeoData } from './admin/seo-geo-settings/actions';
import { WEBSITE_URL } from '@/lib/config';
import { ThemeProvider } from '@/components/ThemeProvider';
import { getThemeSettings } from './admin/settings/actions/theme-actions';
import { DEFAULT_DARK_THEME_COLORS_HSL, DEFAULT_LIGHT_THEME_COLORS_HSL } from '@/lib/colorUtils';
import { getVantaSettings } from './admin/settings/actions/vanta-actions';
import { getMarketingSettings } from './admin/marketing/actions';
import { headers } from 'next/headers';
import { LoadingProvider } from '@/context/LoadingContext';
import GlobalLoader from '@/components/GlobalLoader';

// Use generateMetadata for dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGeneralSettings();
  const seoData = await getSeoData('home');
  const appName = settings?.website_name || 'WebDesignBro';
  const ogImage = settings?.logo || `${WEBSITE_URL}/android-chrome-192x192.png`; // Use logo for OG image

  return {
    metadataBase: new URL(WEBSITE_URL),
    title: {
      default: seoData.meta_title,
      template: `%s | ${appName}`,
    },
    description: seoData.meta_description,
    keywords: seoData.meta_keywords,
    manifest: '/manifest.json',
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: seoData.meta_title,
      description: seoData.meta_description,
      url: WEBSITE_URL,
      siteName: appName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.meta_title,
      description: seoData.meta_description,
      images: [ogImage],
    },
    icons: {
      icon: settings?.favicon || '/favicon.ico',
    }
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAdminPage = pathname.startsWith('/admin');

  const settings = await getGeneralSettings();
  const globalSettings = await getThemeSettings();
  const vantaSettings = await getVantaSettings();
  
  // Only fetch marketing settings for non-admin pages
  const marketingSettings = isAdminPage ? null : await getMarketingSettings();

  const themeColors = globalSettings?.themeColors || {
    light: DEFAULT_LIGHT_THEME_COLORS_HSL,
    dark: DEFAULT_DARK_THEME_COLORS_HSL
  };

  const generateCssVariables = (palette: any) => {
    return Object.entries(palette)
      .map(([key, value]) => value ? `--${key}: ${value};` : '')
      .join('\n');
  };

  const cssVariables = `
    :root {
      ${generateCssVariables(themeColors.light)}
    }
    .dark {
      ${generateCssVariables(themeColors.dark)}
    }
  `;

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap" rel="stylesheet" />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        {vantaSettings.globalEnable && (
           <>
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.cells.min.js" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.clouds.min.js" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.dots.min.js" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.rings.min.js" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.trunk.min.js" strategy="beforeInteractive" />
           </>
        )}
        <style dangerouslySetInnerHTML={{ __html: cssVariables }} />

        {/* Marketing Scripts Injection */}
        {marketingSettings?.googleTagManagerId?.enabled && marketingSettings.googleTagManagerId.value && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${marketingSettings.googleTagManagerId.value}');
            `}
          </Script>
        )}
        {marketingSettings?.googleAnalyticsId?.enabled && marketingSettings.googleAnalyticsId.value && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${marketingSettings.googleAnalyticsId.value}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${marketingSettings.googleAnalyticsId.value}');
              `}
            </Script>
          </>
        )}
        {marketingSettings?.metaPixelId?.enabled && marketingSettings.metaPixelId.value && (
            <Script id="meta-pixel" strategy="afterInteractive">
                {`
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${marketingSettings.metaPixelId.value}');
                    fbq('track', 'PageView');
                `}
            </Script>
        )}
        {marketingSettings?.customHeadScript?.enabled && marketingSettings.customHeadScript.value && (
            <Script id="custom-head-script" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: marketingSettings.customHeadScript.value }} />
        )}
      </head>
      <body className="font-body antialiased">
        {/* Noscript tags for GTM and Meta Pixel */}
        {marketingSettings?.googleTagManagerId?.enabled && marketingSettings.googleTagManagerId.value && (
          <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${marketingSettings.googleTagManagerId.value}`}
          height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe></noscript>
        )}
        {marketingSettings?.metaPixelId?.enabled && marketingSettings.metaPixelId.value && (
          <noscript><img height="1" width="1" style={{display:'none'}}
          src={`https://www.facebook.com/tr?id=${marketingSettings.metaPixelId.value}&ev=PageView&noscript=1`}
          /></noscript>
        )}

        <LoadingProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <GlobalLoader />
            <Header settings={settings} />
            <main>{children}</main>
            <Footer settings={settings} />
            <FloatingActionButtons />
            <Toaster />
          </ThemeProvider>
        </LoadingProvider>
        
        {/* Body End Scripts */}
        {marketingSettings?.customBodyScript?.enabled && marketingSettings.customBodyScript.value && (
            <Script id="custom-body-script" strategy="lazyOnload" dangerouslySetInnerHTML={{ __html: marketingSettings.customBodyScript.value }} />
        )}
      </body>
    </html>
  );
}
