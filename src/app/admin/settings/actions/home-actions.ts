
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface HomePageContent {
    hero_image: string;
}

const docRef = doc(firestore, 'pages', 'home');

export async function getHomePageContent(): Promise<HomePageContent | null> {
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            // Ensure only expected fields are returned
            const data = docSnap.data();
            return {
                hero_image: data.hero_image || 'https://placehold.co/800x600.png',
            };
        } else {
            const defaultData: HomePageContent = {
                hero_image: 'https://placehold.co/800x600.png',
            };
            await setDoc(docRef, defaultData, { merge: true }); // Use merge to avoid overwriting other fields if they exist
            return defaultData;
        }
    } catch (error) {
        console.error('Failed to fetch home page content:', error);
        return null;
    }
}

export async function updateHomePageContent(content: HomePageContent): Promise<void> {
    try {
        // Only update the hero_image field
        await setDoc(docRef, { hero_image: content.hero_image }, { merge: true });
        revalidatePath('/'); // Revalidate the home page
    } catch (error) {
        console.error('Failed to update home page content:', error);
        throw error;
    }
}
