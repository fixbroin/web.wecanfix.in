
'use server';

import { collection, getDocs, writeBatch, doc, Timestamp, orderBy, query as firestoreQuery, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface PortfolioItem {
    id?: string;
    title: string;
    category: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
    link?: string;
    displayOrder: number;
    createdAt?: Timestamp | string;
}

export interface PortfolioPageContent {
    title: string;
    subtitle: string;
}

const portfolioCollectionRef = collection(firestore, 'portfolio_items');
const portfolioPageContentDocRef = doc(firestore, 'pages', 'portfolio-section');

export async function getPortfolioPageContent(): Promise<PortfolioPageContent> {
    try {
        const docSnap = await getDoc(portfolioPageContentDocRef);
        if (docSnap.exists()) {
            return docSnap.data() as PortfolioPageContent;
        } else {
            const defaultData: PortfolioPageContent = {
                title: 'Our Recent Work',
                subtitle: 'Check out some of the stunning websites we\'ve delivered to our clients.',
            };
            await setDoc(portfolioPageContentDocRef, defaultData);
            return defaultData;
        }
    } catch (error) {
        console.error("Failed to fetch portfolio page content:", error);
        throw new Error('Could not fetch portfolio page content');
    }
}

export async function updatePortfolioPageContent(content: PortfolioPageContent): Promise<void> {
    try {
        await setDoc(portfolioPageContentDocRef, content, { merge: true });
        revalidatePath('/'); // For home page portfolio section
    } catch (error) {
        console.error('Failed to update portfolio page content:', error);
        throw error;
    }
}

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
    try {
        const q = firestoreQuery(portfolioCollectionRef, orderBy('displayOrder', 'asc'), orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return []; // Return empty array if no items, don't create defaults.
        }
        
        return querySnapshot.docs.map((doc, index) => {
            const data = doc.data();
            const rawDate = data.createdAt;
            const createdAt = rawDate instanceof Timestamp ? rawDate.toDate() : new Date();
            return { 
                id: doc.id, 
                ...data,
                mediaType: data.mediaType || 'image',
                mediaUrl: data.mediaUrl || data.image, // Backwards compatibility
                displayOrder: data.displayOrder ?? index + 1,
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
