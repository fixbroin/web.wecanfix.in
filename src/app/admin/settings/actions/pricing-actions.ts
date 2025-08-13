
'use server';

import { collection, getDocs, doc, writeBatch, Timestamp, orderBy, query as firestoreQuery } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface PlanFeature {
    id?: string;
    name: string;
}

export interface PricingPlan {
    id?: string;
    title: string;
    price: string;
    description: string;
    is_featured: boolean;
    features: PlanFeature[];
    createdAt?: Timestamp | string;
}

const pricingPlansCollectionRef = collection(firestore, 'pricing_plans');

export async function getPricingPlans(): Promise<PricingPlan[]> {
    try {
        const q = firestoreQuery(pricingPlansCollectionRef, orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            const defaultPlans = [
                 {
                    title: 'Basic', price: '₹4999', description: 'Perfect for personal sites or small businesses.', is_featured: false,
                    features: [{ name: 'Up to 5 Pages' }, { name: 'Responsive Design' }]
                },
                {
                    title: 'Business Pro', price: '₹9999', description: 'Ideal for growing businesses and professionals.', is_featured: true,
                    features: [{ name: 'Up to 10 Pages' }, { name: 'Blog Integration' }]
                }
            ];
            const batch = writeBatch(firestore);
            defaultPlans.forEach(plan => {
                const newDocRef = doc(pricingPlansCollectionRef);
                batch.set(newDocRef, { ...plan, createdAt: Timestamp.now() });
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
                    is_featured: !!data.is_featured,
                    createdAt: createdAt.toISOString(),
                } as PricingPlan;
            });
        }

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const rawDate = data.createdAt;
            const createdAt = rawDate instanceof Timestamp ? rawDate.toDate() : new Date();
            return {
                id: doc.id,
                ...data,
                is_featured: !!data.is_featured,
                createdAt: createdAt.toISOString(),
            } as PricingPlan;
        });
    } catch (error) {
        console.error('Failed to fetch pricing plans:', error);
        return [];
    }
}

export async function updatePricingPlans(plans: Omit<PricingPlan, 'id'|'createdAt'>[]): Promise<void> {
    try {
        const batch = writeBatch(firestore);

        // First, delete all existing pricing plans
        const existingDocs = await getDocs(pricingPlansCollectionRef);
        existingDocs.forEach(doc => batch.delete(doc.ref));

        // Then, add the updated plans
        plans.forEach(plan => {
            const newDocRef = doc(pricingPlansCollectionRef);
            // Ensure features are just an array of objects with `name`
            const cleanPlan = {
                ...plan,
                features: plan.features.map(f => ({ name: f.name }))
            };
            batch.set(newDocRef, { ...cleanPlan, createdAt: Timestamp.now() });
        });

        await batch.commit();

        revalidatePath('/pricing');
        revalidatePath('/');
    } catch (error) {
        console.error('Failed to update pricing plans:', error);
        throw error;
    }
}
