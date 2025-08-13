
"use server";

import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, orderBy, query as firestoreQuery, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import * as z from "zod";
import nodemailer from "nodemailer";
import { getEmailSettings } from "@/app/admin/settings/actions/email-actions";
import { getContactDetails } from "../admin/settings/actions/contact-actions";
import { APP_NAME } from "@/lib/config";
import { revalidatePath } from "next/cache";

const formSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  budget: z.string().optional(),
  message: z.string(),
});

type ContactFormState = {
  success: boolean;
  error?: string;
};

export async function submitContactForm(
  values: z.infer<typeof formSchema>
): Promise<ContactFormState> {
  const parsed = formSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: "Invalid form data." };
  }

  try {
    const { name, email, phone, budget, message } = parsed.data;
    
    // 1. Save to database
    await addDoc(collection(firestore, 'contact_submissions'), {
        name,
        email,
        phone: phone || null,
        budget: budget || null,
        message,
        createdAt: serverTimestamp(),
    });

    // 2. Send email notifications
    const emailSettings = await getEmailSettings();
    const contactDetails = await getContactDetails();

    if (emailSettings.smtp_host && emailSettings.smtp_user && emailSettings.smtp_password && emailSettings.smtp_sender_email) {
        const transporter = nodemailer.createTransport({
            host: emailSettings.smtp_host,
            port: emailSettings.smtp_port,
            secure: emailSettings.smtp_port === 465,
            auth: {
                user: emailSettings.smtp_user,
                pass: emailSettings.smtp_password,
            },
        });

        // Email to Admin
        await transporter.sendMail({
            from: `"${APP_NAME}" <${emailSettings.smtp_sender_email}>`,
            to: contactDetails.email,
            subject: `New Contact Form Submission from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="color: #333;">New Contact Form Submission</h2>
                    <p>You have received a new message from your website's contact form.</p>
                    <hr>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                    <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                    <p><strong>Budget:</strong> ${budget || 'Not provided'}</p>
                    <h3 style="color: #555;">Message:</h3>
                    <p style="padding: 10px; border-left: 4px solid #ccc; background-color: #f9f9f9;">
                        ${message}
                    </p>
                    <hr>
                    <p style="font-size: 0.9em; color: #888;">This email was sent from the contact form on ${APP_NAME}.</p>
                </div>
            `,
        });

        // Confirmation Email to User
        await transporter.sendMail({
            from: `"${APP_NAME}" <${emailSettings.smtp_sender_email}>`,
            to: email,
            subject: `Thank you for contacting ${APP_NAME}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="color: #333;">Thank You For Your Message, ${name}!</h2>
                    <p>We have successfully received your message and appreciate you reaching out to us.</p>
                    <p>One of our team members will review your inquiry and get back to you as soon as possible, typically within 24-48 hours.</p>
                    <h3 style="color: #555;">Here is a copy of your message:</h3>
                    <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                        <p><strong>Budget:</strong> ${budget || 'Not provided'}</p>
                        <p><strong>Message:</strong></p>
                        <p><em>${message}</em></p>
                    </div>
                    <hr style="margin: 20px 0;">
                    <p>If your matter is urgent, please feel free to call us directly at ${contactDetails.phone}.</p>
                    <p>Best Regards,</p>
                    <p><strong>The ${APP_NAME} Team</strong></p>
                </div>
            `,
        });
    } else {
        console.warn("SMTP settings are not fully configured. Skipping email notifications.");
    }
    
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/submissions');

    return { success: true };

  } catch (error) {
    console.error("Failed to process contact form:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export interface Submission {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    budget: string | null;
    message: string;
    created_at: string;
}

export async function getSubmissions(): Promise<Submission[]> {
    try {
        const q = firestoreQuery(collection(firestore, 'contact_submissions'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const rawDate = data.createdAt;
            const createdAtDate = rawDate instanceof Timestamp ? rawDate.toDate() : new Date();
            return {
                id: doc.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                budget: data.budget,
                message: data.message,
                created_at: createdAtDate.toLocaleString(),
            }
        });
    } catch (error) {
        console.error('Failed to fetch submissions:', error);
        return [];
    }
}

export async function deleteSubmission(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(firestore, 'contact_submissions', id));
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/submissions');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete submission:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
