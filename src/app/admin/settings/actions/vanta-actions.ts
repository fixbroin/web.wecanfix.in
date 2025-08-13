
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import type { VantaSettings } from '@/types/firestore';

const vantaSettingsDocRef = doc(firestore, 'settings', 'vanta');

const defaultSectionSettings = {
    enabled: false,
    effect: 'WAVES',
    color1: '#0055ff',
    color2: '#00aaff',
};

const defaultVantaSettings: VantaSettings = {
    globalEnable: true,
    sections: {
        hero: { ...defaultSectionSettings, enabled: true, effect: 'GLOBE' },
        services: { ...defaultSectionSettings },
        whyChooseUs: { ...defaultSectionSettings },
        portfolio: { ...defaultSectionSettings },
        pricing: { ...defaultSectionSettings },
        testimonials: { ...defaultSectionSettings },
        faq: { ...defaultSectionSettings },
        contact: { ...defaultSectionSettings },
        footer: { ...defaultSectionSettings },
    }
};

export async function getVantaSettings(): Promise<VantaSettings> {
    try {
        const docSnap = await getDoc(vantaSettingsDocRef);
        if (docSnap.exists()) {
            // Merge with defaults to ensure all sections are present
            const dbSettings = docSnap.data() as VantaSettings;
            const settings = {
                ...defaultVantaSettings,
                ...dbSettings,
                sections: {
                    ...defaultVantaSettings.sections,
                    ...dbSettings.sections,
                },
            };
            return settings;
        } else {
            // If no settings exist, create them with defaults
            await setDoc(vantaSettingsDocRef, defaultVantaSettings);
            return defaultVantaSettings;
        }
    } catch (error) {
        console.error("Failed to fetch vanta settings:", error);
        return defaultVantaSettings;
    }
}

export async function updateVantaSettings(settings: VantaSettings): Promise<{ success: boolean; error?: string }> {
    try {
        await setDoc(vantaSettingsDocRef, settings, { merge: true });
        // Revalidate the entire site since vanta backgrounds can be on any page
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error("Failed to update vanta settings:", error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}
