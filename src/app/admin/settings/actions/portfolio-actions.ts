
'use server';

import { collection, getDocs, writeBatch, doc, Timestamp, orderBy, query as firestoreQuery } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface PortfolioItem {
    id?: string;
    title: string;
    category: string;
    image: string;
    link: string;
    createdAt?: Timestamp | string;
}

const portfolioCollectionRef = collection(firestore, 'portfolio_items');

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
    try {
        const q = firestoreQuery(portfolioCollectionRef, orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            const defaultItems = [
                { title: 'E-commerce Platform', category: 'Web App', image: 'https://placehold.co/600x400.png', link: 'https://example.com' },
                { title: 'Corporate Landing Page', category: 'Website', image: 'https://placehold.co/600x400.png', link: 'https://example.com' },
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
                 const createdAt = (data.createdAt as Timestamp)?.toDate();
                 return { 
                    id: doc.id, 
                    ...data,
                    createdAt: createdAt ? createdAt.toISOString() : new Date().toISOString()
                } as PortfolioItem
            });
        }
        
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = (data.createdAt as Timestamp)?.toDate();
            return { 
                id: doc.id, 
                ...data,
                createdAt: createdAt ? createdAt.toISOString() : new Date().toISOString()
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
            const newDocRef = doc(portfolioCollectionRef);
            batch.set(newDocRef, { ...item, createdAt: Timestamp.now() });
        });
        
        await batch.commit();

        revalidatePath('/portfolio');
        revalidatePath('/');
    } catch (error) {
        console.error('Failed to update portfolio items:', error);
        throw error;
    }
}
