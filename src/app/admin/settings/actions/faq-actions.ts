
'use server';

import { collection, getDocs, writeBatch, doc, Timestamp, orderBy, query as firestoreQuery } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface FaqItem {
    id?: string;
    question: string;
    answer: string;
    createdAt?: Timestamp | string;
}

const faqsCollectionRef = collection(firestore, 'faqs');

export async function getFaqs(): Promise<FaqItem[]> {
    try {
        const q = firestoreQuery(faqsCollectionRef, orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            const defaultFaqs: Omit<FaqItem, 'id' | 'createdAt'>[] = [
                {
                    question: 'What is the typical timeline for a new website?',
                    answer: 'A basic website typically takes 1-2 weeks. More complex projects like e-commerce stores or custom applications can take 4-8 weeks or more, depending on the requirements.',
                },
                {
                    question: 'Do you provide website hosting?',
                    answer: 'While we don\'t host websites directly, we deploy all our projects to Vercel, a world-class hosting platform. We can also help you configure your custom domain.',
                },
                {
                    question: 'What kind of support do you offer after the website is launched?',
                    answer: 'We offer one year of free technical support for all our projects. This includes bug fixes and assistance with any technical issues. We also offer paid maintenance plans for ongoing content updates and feature enhancements.',
                },
            ];
            const batch = writeBatch(firestore);
            defaultFaqs.forEach(faq => {
                const newDocRef = doc(faqsCollectionRef);
                batch.set(newDocRef, { ...faq, createdAt: Timestamp.now() });
            });
            await batch.commit();
            const newSnapshot = await getDocs(q);
            return newSnapshot.docs.map(doc => {
                const data = doc.data();
                const rawDate = data.createdAt;
                const createdAt = rawDate instanceof Timestamp ? rawDate.toDate() : new Date();
                return { 
                    id: doc.id, 
                    ...data,
                    createdAt: createdAt.toISOString()
                } as FaqItem;
            });
        }
        
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const rawDate = data.createdAt;
            const createdAt = rawDate instanceof Timestamp ? rawDate.toDate() : new Date();
            return { 
                id: doc.id, 
                ...data,
                createdAt: createdAt.toISOString()
            } as FaqItem;
        });
    } catch (error) {
        console.error('Failed to fetch FAQs:', error);
        return [];
    }
}

export async function updateFaqs(faqs: Omit<FaqItem, 'id' | 'createdAt'>[]): Promise<void> {
    try {
        const batch = writeBatch(firestore);

        const existingDocs = await getDocs(faqsCollectionRef);
        existingDocs.forEach(doc => batch.delete(doc.ref));

        faqs.forEach(faq => {
            const newDocRef = doc(faqsCollectionRef);
            batch.set(newDocRef, { ...faq, createdAt: Timestamp.now() });
        });
        
        await batch.commit();

        revalidatePath('/');
    } catch (error) {
        console.error('Failed to update FAQs:', error);
        throw error;
    }
}
