
'use server';

import { collection, doc, getDoc, getDocs, setDoc, query as firestoreQuery } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface LegalPage {
    id?: string;
    title: string;
    slug: string;
    content: string;
}

const legalCollectionRef = collection(firestore, 'legal_pages');

export async function getLegalPages(): Promise<LegalPage[]> {
    try {
        const q = firestoreQuery(legalCollectionRef);
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            const defaultPages: Omit<LegalPage, 'id'>[] = [
                { title: 'Terms and Conditions', slug: 'terms', content: 'Please add your terms and conditions here.' },
                { title: 'Privacy Policy', slug: 'privacy-policy', content: 'Please add your privacy policy here.' },
                { title: 'Cancellation Policy', slug: 'cancellation-policy', content: 'Please add your cancellation policy here.' },
                { title: 'Refund Policy', slug: 'refund-policy', content: 'Please add your refund policy here.' }
            ];
            for (const page of defaultPages) {
                await setDoc(doc(legalCollectionRef, page.slug), page);
            }
            const newSnapshot = await getDocs(q);
            return newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LegalPage));
        }

        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LegalPage));
    } catch (error) {
        console.error('Failed to fetch legal pages:', error);
        return [];
    }
}

export async function getLegalPageContent(slug: string): Promise<LegalPage | null> {
    try {
        const docRef = doc(firestore, 'legal_pages', slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as LegalPage;
        }
        // If not found, check if it should exist and create it
        const pages = await getLegalPages();
        const pageExists = pages.find(p => p.slug === slug);
        if (pageExists) {
             return getLegalPageContent(slug);
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch content for slug ${slug}:`, error);
        return null;
    }
}

export async function updateLegalPageContent(page: { slug: string; content: string }): Promise<void> {
    try {
        const docRef = doc(firestore, 'legal_pages', page.slug);
        await setDoc(docRef, { content: page.content }, { merge: true });
        revalidatePath(`/${page.slug}`);
    } catch (error) {
        console.error(`Failed to update content for slug ${page.slug}:`, error);
        throw error;
    }
}
