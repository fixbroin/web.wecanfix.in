
'use server';

import { doc, getDoc, setDoc, collection, getDocs, writeBatch, query as firestoreQuery, orderBy, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface WhyChooseUsFeature {
    id?: string;
    icon: string;
    title: string;
    description: string;
    createdAt?: string; // Changed to string
}

export interface WhyChooseUsContent {
    title: string;
    subtitle: string;
    media_url: string;
    media_type: 'image' | 'video';
    features: WhyChooseUsFeature[];
}

const contentDocRef = doc(firestore, 'pages', 'why-choose-us');
const featuresCollectionRef = collection(firestore, 'pages/why-choose-us/features');

export async function getWhyChooseUsContent(): Promise<WhyChooseUsContent> {
    try {
        const contentSnap = await getDoc(contentDocRef);
        let contentData: Omit<WhyChooseUsContent, 'features'>;

        if (contentSnap.exists()) {
            const data = contentSnap.data();
            contentData = {
                title: data.title,
                subtitle: data.subtitle,
                media_url: data.media_url || data.image || 'https://placehold.co/600x800.png',
                media_type: data.media_type || 'image',
            };
        } else {
            contentData = {
                title: 'Why Choose WebDesignBro?',
                subtitle: 'We are committed to delivering excellence and innovation in every project.',
                media_url: 'https://placehold.co/600x800.png',
                media_type: 'image'
            };
            await setDoc(contentDocRef, contentData);
        }

        const featuresQuery = firestoreQuery(featuresCollectionRef, orderBy('createdAt'));
        const featuresSnap = await getDocs(featuresQuery);
        
        const features: WhyChooseUsFeature[] = featuresSnap.docs.map(doc => {
            const data = doc.data();
            const rawDate = data.createdAt;
            const createdAt = rawDate instanceof Timestamp ? rawDate.toDate() : new Date();
            return {
                id: doc.id,
                icon: data.icon,
                title: data.title,
                description: data.description,
                createdAt: createdAt.toISOString(),
            };
        });
        
        if (features.length === 0) {
            const defaultFeatures: Omit<WhyChooseUsFeature, 'id' | 'createdAt'>[] = [
                { icon: 'Zap', title: 'Blazing Fast Performance', description: 'We build websites with Next.js for optimal speed and user experience.' },
                { icon: 'Smartphone', title: 'Fully Responsive Design', description: 'Your website will look perfect on all devices, from desktops to smartphones.' },
                { icon: 'Search', title: 'SEO-Optimized', description: 'Built-in SEO best practices to help you rank higher on search engines.' },
                { icon: 'CircleCheckBig', title: 'Modern Tech Stack', description: 'Leveraging the power of React, Next.js, and Tailwind CSS for robust solutions.' },
            ];
            const batch = writeBatch(firestore);
            defaultFeatures.forEach(feature => {
                const newDocRef = doc(featuresCollectionRef);
                batch.set(newDocRef, { ...feature, createdAt: Timestamp.now() });
            });
            await batch.commit();
            return getWhyChooseUsContent();
        }

        return { ...contentData, features };

    } catch (error) {
        console.error('Failed to fetch Why Choose Us content:', error);
        throw new Error('Could not fetch Why Choose Us content.');
    }
}

export async function updateWhyChooseUsContent(content: Omit<WhyChooseUsContent, 'features'> & { features: Omit<WhyChooseUsFeature, 'id' | 'createdAt'>[] }): Promise<void> {
    try {
        const batch = writeBatch(firestore);

        const { features, ...pageData } = content;
        batch.set(contentDocRef, pageData, { merge: true });

        const existingFeaturesSnap = await getDocs(featuresCollectionRef);
        existingFeaturesSnap.docs.forEach(doc => batch.delete(doc.ref));

        content.features.forEach(feature => {
            const newFeatureRef = doc(featuresCollectionRef);
            batch.set(newFeatureRef, { ...feature, createdAt: Timestamp.now() });
        });

        await batch.commit();

        revalidatePath('/');
        revalidatePath('/admin/settings');
    } catch (error) {
        console.error('Failed to update Why Choose Us content:', error);
        throw error;
    }
}
