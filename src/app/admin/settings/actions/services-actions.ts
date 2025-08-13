
'use server';

import { collection, getDocs, writeBatch, doc, Timestamp, orderBy, query as firestoreQuery } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface ServiceFeature {
    id?: string;
    name: string;
}
export interface Service {
    id?: string;
    icon: string;
    title: string;
    price: string;
    description: string;
    image: string;
    features: ServiceFeature[];
    createdAt?: Timestamp | string;
}

const servicesCollectionRef = collection(firestore, 'services');

export async function getServices(): Promise<Service[]> {
    try {
        const q = firestoreQuery(servicesCollectionRef, orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);

        if(querySnapshot.empty) {
            const defaultServices = [{
                icon: 'Briefcase',
                title: 'Business Websites', price: 'Starting at ₹4999', description: 'A professional online presence is crucial. We build beautiful, fast, and secure websites that represent your brand and attract customers.', image: 'https://placehold.co/600x400.png',
                features: [{ name: 'Custom Design' }, { name: 'Mobile-Friendly' }]
            }];
            const batch = writeBatch(firestore);
            defaultServices.forEach(service => {
                const newDocRef = doc(servicesCollectionRef);
                batch.set(newDocRef, { ...service, createdAt: Timestamp.now() });
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
                } as Service
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
            } as Service
        });
    } catch (error) {
        console.error('Failed to fetch services:', error);
        return [];
    }
}

export async function updateServices(services: Omit<Service, 'id' | 'createdAt'>[]): Promise<void> {
    try {
        const batch = writeBatch(firestore);
        
        const existingDocs = await getDocs(servicesCollectionRef);
        existingDocs.forEach(doc => batch.delete(doc.ref));

        services.forEach(service => {
            const newDocRef = doc(servicesCollectionRef);
            batch.set(newDocRef, { ...service, createdAt: Timestamp.now() });
        });
        
        await batch.commit();

        revalidatePath('/services');
        revalidatePath('/');
    } catch (error) {
        console.error('Failed to update services:', error);
        throw error;
    }
}
