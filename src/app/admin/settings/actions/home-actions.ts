
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface HomePageContent {
    hero_title: string;
    hero_subtitle: string;
    hero_image: string;
}

const docRef = doc(firestore, 'pages', 'home');

export async function getHomePageContent(): Promise<HomePageContent | null> {
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as HomePageContent;
        } else {
            const defaultData: HomePageContent = {
                hero_title: 'Stunning Websites that Convert',
                hero_subtitle: 'We design and build fast, responsive, and SEO-optimized websites that help your business grow. Get a custom quote today.',
                hero_image: 'https://placehold.co/800x600.png',
            };
            await setDoc(docRef, defaultData);
            return defaultData;
        }
    } catch (error) {
        console.error('Failed to fetch home page content:', error);
        return null;
    }
}

export async function updateHomePageContent(content: HomePageContent): Promise<void> {
    try {
        await setDoc(docRef, content, { merge: true });
        revalidatePath('/'); // Revalidate the home page
    } catch (error) {
        console.error('Failed to update home page content:', error);
        throw error;
    }
}
