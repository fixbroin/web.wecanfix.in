
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface ContactDetails {
    email: string;
    phone: string;
    location: string;
    whatsAppNumber: string;
}

const docRef = doc(firestore, 'settings', 'contact');

export async function getContactDetails(): Promise<ContactDetails> {
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as ContactDetails;
        } else {
            const defaultData: ContactDetails = {
                email: 'wecanfix.in@gmail.com',
                phone: '+917353145565',
                location: 'Bengaluru, India',
                whatsAppNumber: '917353145565',
            };
            await setDoc(docRef, defaultData);
            return defaultData;
        }
    } catch (error) {
        console.error("Failed to fetch contact details:", error);
        throw error;
    }
}

export async function updateContactDetails(details: ContactDetails): Promise<void> {
    try {
        await setDoc(docRef, details, { merge: true });
        revalidatePath('/contact');
        revalidatePath('/'); // For footer
    } catch (error) {
        console.error("Failed to update contact details:", error);
        throw error;
    }
}
