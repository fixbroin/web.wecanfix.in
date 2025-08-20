
'use server';

import { collection, getDocs, writeBatch, doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

// Add all collections you want to manage with this tool
const COLLECTIONS_TO_MANAGE = [
    'contact_submissions',
    'faqs',
    'legal_pages',
    'orders',
    'pages',
    'page_seo',
    'portfolio_items',
    'pricing_plans',
    'services',
    'settings',
    'skills',
    'testimonials',
    'webSettings'
];

export async function exportDatabase(): Promise<Record<string, any[]>> {
  try {
    const data: Record<string, any[]> = {};
    for (const collectionName of COLLECTIONS_TO_MANAGE) {
      const collectionRef = collection(firestore, collectionName);
      const snapshot = await getDocs(collectionRef);
      data[collectionName] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Special handling for nested collections, if any, like why-choose-us features
    const whyChooseUsFeaturesRef = collection(firestore, 'pages/why-choose-us/features');
    const whyChooseUsFeaturesSnap = await getDocs(whyChooseUsFeaturesRef);
    if (!data['pages/why-choose-us/features']) {
        data['pages/why-choose-us/features'] = [];
    }
    data['pages/why-choose-us/features'] = whyChooseUsFeaturesSnap.docs.map(d => ({id: d.id, ...d.data()}));


    return data;
  } catch (error) {
    console.error("Error exporting database:", error);
    throw new Error("Failed to export database.");
  }
}


export async function importDatabase(jsonData: string): Promise<{ success: boolean; error?: string }> {
  try {
    const data = JSON.parse(jsonData) as Record<string, any[]>;
    const batch = writeBatch(firestore);

    for (const collectionName of Object.keys(data)) {
        if (!COLLECTIONS_TO_MANAGE.includes(collectionName) && !collectionName.startsWith('pages/')) {
            console.warn(`Skipping import for unmanaged collection: ${collectionName}`);
            continue;
        }

        const collectionData = data[collectionName];
        if (!Array.isArray(collectionData)) {
            console.warn(`Skipping import for ${collectionName}: data is not an array.`);
            continue;
        }

        // Clear existing collection
        const collectionRef = collection(firestore, collectionName);
        const existingDocs = await getDocs(collectionRef);
        existingDocs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Add new data
        for (const item of collectionData) {
            const { id, ...itemData } = item;
            const docRef = doc(firestore, collectionName, id);
            batch.set(docRef, itemData);
        }
    }

    await batch.commit();

    // Revalidate all paths to reflect changes
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: any) {
    console.error("Error importing database:", error);
    if (error instanceof SyntaxError) {
        return { success: false, error: "Invalid JSON file format." };
    }
    return { success: false, error: `Failed to import database: ${error.message}` };
  }
}
