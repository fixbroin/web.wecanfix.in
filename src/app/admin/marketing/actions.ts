
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

interface Setting {
    enabled: boolean;
    value: string;
}

export interface MarketingSettings {
    googleTagManagerId: Setting;
    googleAnalyticsId: Setting;
    googleAdsId: Setting;
    googleAdsLabel: Setting;
    googleRemarketing: Setting;
    googleOptimizeId: Setting;
    metaPixelId: Setting;
    metaPixelAccessToken: Setting;
    metaConversionsApiKey: Setting;
    bingUetTagId: Setting;
    pinterestTagId: Setting;
    customHeadScript: Setting;
    customBodyScript: Setting;
}

const docRef = doc(firestore, 'settings', 'marketing');

export async function getMarketingSettings(): Promise<MarketingSettings> {
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as MarketingSettings;
        } else {
            // Default data if the document doesn't exist
            const defaultSettingValue = { enabled: false, value: '' };
            const defaultData: MarketingSettings = {
                googleTagManagerId: { ...defaultSettingValue },
                googleAnalyticsId: { ...defaultSettingValue },
                googleAdsId: { ...defaultSettingValue },
                googleAdsLabel: { ...defaultSettingValue },
                googleRemarketing: { ...defaultSettingValue },
                googleOptimizeId: { ...defaultSettingValue },
                metaPixelId: { ...defaultSettingValue },
                metaPixelAccessToken: { ...defaultSettingValue },
                metaConversionsApiKey: { ...defaultSettingValue },
                bingUetTagId: { ...defaultSettingValue },
                pinterestTagId: { ...defaultSettingValue },
                customHeadScript: { ...defaultSettingValue },
                customBodyScript: { ...defaultSettingValue },
            };
            await setDoc(docRef, defaultData);
            return defaultData;
        }
    } catch (error) {
        console.error("Failed to fetch marketing settings:", error);
        throw error;
    }
}

export async function updateMarketingSettings(settings: MarketingSettings): Promise<void> {
    try {
        await setDoc(docRef, settings, { merge: true });
        // Revalidate the entire site layout since these scripts affect every page
        revalidatePath('/', 'layout');
    } catch (error) {
        console.error("Failed to update marketing settings:", error);
        throw error;
    }
}
