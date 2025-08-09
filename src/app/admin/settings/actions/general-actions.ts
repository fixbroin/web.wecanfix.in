
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface GeneralSettings {
    website_name: string;
    favicon: string;
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
            return docSnap.data() as GeneralSettings;
        } else {
            // Default data if the document doesn't exist
            const defaultData: GeneralSettings = {
                website_name: 'WebDesignBro',
                favicon: '/favicon.ico',
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
