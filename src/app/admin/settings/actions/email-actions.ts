
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface EmailSettings {
    smtp_host: string;
    smtp_port: number;
    smtp_user: string;
    smtp_password?: string;
    smtp_sender_email: string;
}

const docRef = doc(firestore, 'settings', 'email');

export async function getEmailSettings(): Promise<EmailSettings> {
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data() as EmailSettings;
            return {
                ...data,
                smtp_port: Number(data.smtp_port) || 587,
                smtp_password: data.smtp_password || '',
            };
        } else {
            const defaultData: EmailSettings = {
                smtp_host: 'smtp.example.com',
                smtp_port: 587,
                smtp_user: 'user@example.com',
                smtp_password: 'your-password',
                smtp_sender_email: 'noreply@example.com',
            };
            await setDoc(docRef, defaultData);
            return defaultData;
        }
    } catch (error) {
        console.error("Failed to fetch email settings:", error);
        throw error;
    }
}

export async function updateEmailSettings(settings: Omit<EmailSettings, 'smtp_password'> & { smtp_password?: string }): Promise<void> {
    try {
        const currentSettings = await getEmailSettings();
        const dataToUpdate: any = { ...settings };
        
        // If the password field is blank, it means the user might want to keep the old password.
        if (settings.smtp_password === '' || !settings.smtp_password) {
            dataToUpdate.smtp_password = currentSettings.smtp_password;
        }

        // However, if the user provides a new password, we update it.
        // The form passes the value, so if it's different from the current one, it will be updated.
        // If the user intentionally clears the field and wants to save it as empty, we should allow that.
        // So, we will just save what is in `settings`.

        const finalSettings: EmailSettings = {
            ...settings,
            smtp_password: settings.smtp_password || ''
        }

        await setDoc(docRef, finalSettings, { merge: true });
        revalidatePath('/admin/settings');
    } catch (error) {
        console.error("Failed to update email settings:", error);
        throw error;
    }
}
