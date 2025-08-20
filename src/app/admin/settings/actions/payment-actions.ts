
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface PaymentSettings {
    razorpay_key_id: string;
    razorpay_key_secret: string;
    enable_online_payments: boolean;
    enable_pay_later: boolean;
}

const docRef = doc(firestore, 'settings', 'payments');

export async function getPaymentSettings(): Promise<PaymentSettings | null> {
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                razorpay_key_id: data.razorpay_key_id || '',
                razorpay_key_secret: data.razorpay_key_secret || '',
                enable_online_payments: data.enable_online_payments === true,
                enable_pay_later: data.enable_pay_later === true,
            } as PaymentSettings;
        } else {
            const defaultData: PaymentSettings = {
                razorpay_key_id: 'rzp_test_12345',
                razorpay_key_secret: 'your_secret_key',
                enable_online_payments: true,
                enable_pay_later: false,
            };
            await setDoc(docRef, defaultData);
            return defaultData;
        }
    } catch (error) {
        console.error('Failed to fetch payment settings:', error);
        return null;
    }
}

export async function updatePaymentSettings(settings: PaymentSettings): Promise<void> {
    try {
        const currentSettings = await getPaymentSettings();
        const dataToUpdate: PaymentSettings = { ...settings };
        
        // If the user submits a blank password, keep the existing one.
        if (!settings.razorpay_key_secret) {
            dataToUpdate.razorpay_key_secret = currentSettings?.razorpay_key_secret || '';
        }

        await setDoc(docRef, dataToUpdate, { merge: true });
        
        revalidatePath('/pricing');
        revalidatePath('/admin/settings');
    } catch (error) {
        console.error('Failed to update payment settings:', error);
        throw error;
    }
}
