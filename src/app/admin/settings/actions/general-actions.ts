
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface GeneralSettings {
    website_name: string;
    logo: string;
    favicon: string;
    footer_description: string;
    facebook_url: string;
    instagram_url: string;
    twitter_url: string;
    linkedin_url: string;
    youtube_url: string;
}

const docRef = doc(firestore, 'settings', 'general');

export async function getGeneralSettings(): Promise<GeneralSettings> {
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data() as GeneralSettings;
            // Ensure all fields exist with defaults
            return {
                website_name: data.website_name || 'WebDesignBro',
                logo: data.logo || '',
                favicon: data.favicon || '/favicon.ico',
                footer_description: data.footer_description || 'Crafting high-performance websites with modern technology.',
                facebook_url: data.facebook_url || '',
                instagram_url: data.instagram_url || '',
                twitter_url: data.twitter_url || '',
                linkedin_url: data.linkedin_url || '',
                youtube_url: data.youtube_url || '',
            };
        } else {
            // Default data if the document doesn't exist
            const defaultData: GeneralSettings = {
                website_name: 'WebDesignBro',
                logo: '',
                favicon: '/favicon.ico',
                footer_description: 'Crafting high-performance websites with modern technology.',
                facebook_url: '',
                instagram_url: '',
                twitter_url: '',
                linkedin_url: '',
                youtube_url: '',
            };
            await setDoc(docRef, defaultData);
            return defaultData;
        }
    } catch (error) {
        console.error("Failed to fetch general settings:", error);
        throw error;
    }
}

export async function updateGeneralSettings(settings: GeneralSettings): Promise<void> {
    try {
        await setDoc(docRef, settings, { merge: true });
        revalidatePath('/', 'layout');
    } catch (error) {
        console.error("Failed to update general settings:", error);
        throw error;
    }
}
