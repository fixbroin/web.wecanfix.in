
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface PageSeoContent {
    h1_title: string;
    paragraph: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
}

const defaultContent: Record<string, PageSeoContent> = {
    home: {
        h1_title: 'Stunning Websites that Convert',
        paragraph: 'We design and build fast, responsive, and SEO-optimized websites that help your business grow. Get a custom quote today.',
        meta_title: 'WebDesignBro - Custom Web Design Services',
        meta_description: 'High-performance, SEO-optimized, and mobile-friendly websites built with Next.js. We offer custom web design, e-commerce solutions, and more.',
        meta_keywords: 'web design, next.js developer, bangalore, india, custom websites',
    },
    services: {
        h1_title: 'What We Offer',
        paragraph: 'From simple landing pages to complex web applications, we have a solution for you.',
        meta_title: 'Our Services | WebDesignBro',
        meta_description: 'We offer a wide range of web design and development services, including business websites, e-commerce stores, and custom dashboards.',
        meta_keywords: 'web development, e-commerce, custom dashboards, business websites',
    },
    portfolio: {
        h1_title: 'Our Portfolio',
        paragraph: 'A glimpse into the quality and creativity we bring to every project.',
        meta_title: 'Portfolio | WebDesignBro',
        meta_description: 'Explore our portfolio of successfully launched websites, from e-commerce stores to corporate pages.',
        meta_keywords: 'portfolio, web design projects, e-commerce examples',
    },
    pricing: {
        h1_title: 'Our Pricing',
        paragraph: 'Transparent and affordable pricing for top-quality web design services.',
        meta_title: 'Pricing | WebDesignBro',
        meta_description: 'Find the perfect plan for your web design needs. We offer flexible pricing for businesses of all sizes.',
        meta_keywords: 'website pricing, web design cost, affordable websites',
    },
    about: {
        h1_title: 'About WebDesignBro',
        paragraph: 'We are passionate about building beautiful, functional, and high-performance web experiences.',
        meta_title: 'About Us | WebDesignBro',
        meta_description: 'Learn more about WebDesignBro, our mission, and the technologies we use to build amazing websites.',
        meta_keywords: 'about us, web design company, our mission',
    },
    contact: {
        h1_title: 'Get in Touch',
        paragraph: 'We\'re here to help you turn your ideas into reality. Reach out to us for a free consultation.',
        meta_title: 'Contact Us | WebDesignBro',
        meta_description: 'Get in touch with WebDesignBro for a free quote or to discuss your project. We are available via email, phone, or WhatsApp.',
        meta_keywords: 'contact us, free quote, web design consultation',
    },
};

export async function getSeoData(pageSlug: string): Promise<PageSeoContent> {
    try {
        const docRef = doc(firestore, 'page_seo', pageSlug);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as PageSeoContent;
        } else {
            const initialData = defaultContent[pageSlug] || Object.values(defaultContent)[0];
            await setDoc(docRef, initialData);
            return initialData;
        }
    } catch (error) {
        console.error(`Failed to fetch SEO data for ${pageSlug}:`, error);
        return defaultContent[pageSlug] || Object.values(defaultContent)[0];
    }
}

export async function updateSeoData(pageSlug: string, data: PageSeoContent): Promise<{ success: boolean; error?: string }> {
    try {
        const docRef = doc(firestore, 'page_seo', pageSlug);
        await setDoc(docRef, data, { merge: true });

        // Revalidate the path of the page that was updated
        const pathToRevalidate = pageSlug === 'home' ? '/' : `/${pageSlug}`;
        revalidatePath(pathToRevalidate, 'page');
        
        // Also revalidate the layout to update metadata
        revalidatePath(pathToRevalidate, 'layout');
        
        // Revalidate the admin page itself
        revalidatePath('/admin/seo-geo-settings');

        return { success: true };
    } catch (error) {
        console.error(`Failed to update SEO data for ${pageSlug}:`, error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}
