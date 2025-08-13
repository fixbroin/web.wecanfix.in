
'use server';

import { collection, getDocs, writeBatch, doc, Timestamp, orderBy, query as firestoreQuery } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface PortfolioItem {
    id?: string;
    title: string;
    category: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
    link?: string;
    createdAt?: Timestamp | string;
}

const portfolioCollectionRef = collection(firestore, 'portfolio_items');

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
    try {
        const q = firestoreQuery(portfolioCollectionRef, orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            const defaultItems = [
                { title: 'E-commerce Platform', category: 'Web App', mediaType: 'image' as const, mediaUrl: 'https://placehold.co/600x400.png', link: 'https://example.com' },
                { title: 'Corporate Landing Page', category: 'Website', mediaType: 'image' as const, mediaUrl: 'https://placehold.co/600x400.png', link: 'https://example.com' },
            ];
            const batch = writeBatch(firestore);
            defaultItems.forEach(item => {
                const newDocRef = doc(portfolioCollectionRef);
                batch.set(newDocRef, { ...item, createdAt: Timestamp.now() });
            });
            await batch.commit();
            // Re-fetch after seeding
            const newSnapshot = await getDocs(q);
            return newSnapshot.docs.map(doc => {
                 const data = doc.data();
                 const rawDate = data.createdAt;
                 const createdAt = rawDate instanceof Timestamp ? rawDate.toDate() : new Date();
                 return { 
                    id: doc.id, 
                    ...data,
                    mediaType: data.mediaType || 'image',
                    mediaUrl: data.mediaUrl || data.image, // Backwards compatibility for old 'image' field
                    createdAt: createdAt.toISOString()
                } as PortfolioItem
            });
        }
        
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const rawDate = data.createdAt;
            const createdAt = rawDate instanceof Timestamp ? rawDate.toDate() : new Date();
            return { 
                id: doc.id, 
                ...data,
                mediaType: data.mediaType || 'image',
                mediaUrl: data.mediaUrl || data.image, // Backwards compatibility
                createdAt: createdAt.toISOString()
            } as PortfolioItem
        });
    } catch (error) {
        console.error('Failed to fetch portfolio items:', error);
        return [];
    }
}

export async function updatePortfolioItems(items: Omit<PortfolioItem, 'id' | 'createdAt'>[]): Promise<void> {
    try {
        const batch = writeBatch(firestore);

        const existingDocs = await getDocs(portfolioCollectionRef);
        existingDocs.forEach(doc => batch.delete(doc.ref));

        items.forEach(item => {
            const { ...itemToSave } = item;
            const newDocRef = doc(portfolioCollectionRef);
            batch.set(newDocRef, { ...itemToSave, createdAt: Timestamp.now() });
        });
        
        await batch.commit();

        revalidatePath('/portfolio');
        revalidatePath('/');
    } catch (error) {
        console.error('Failed to update portfolio items:', error);
        throw error;
    }
}
