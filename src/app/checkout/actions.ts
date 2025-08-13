
'use server';

import { collection, addDoc, getDocs, serverTimestamp, orderBy, query as firestoreQuery, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { getPaymentSettings } from '../admin/settings/actions/payment-actions';
import nodemailer from 'nodemailer';
import { getEmailSettings } from '../admin/settings/actions/email-actions';
import { getContactDetails } from '../admin/settings/actions/contact-actions';
import { APP_NAME } from '@/lib/config';

export interface SaveOrderPayload {
    customer_name: string;
    customer_email: string;
    plan_title: string;
    amount: number;
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    status: 'completed' | 'failed';
}

const orderSchema = z.object({
    customer_name: z.string(),
    customer_email: z.string().email(),
    plan_title: z.string(),
    amount: z.number(),
    razorpay_payment_id: z.string(),
    razorpay_order_id: z.string(),
    razorpay_signature: z.string().optional().nullable(),
    status: z.enum(['completed', 'failed']),
});


export async function saveOrder(payload: SaveOrderPayload): Promise<{success: boolean, error?: string}> {
    const validated = orderSchema.safeParse(payload);
    if (!validated.success) {
        console.error('Invalid order payload:', validated.error);
        return { success: false, error: 'Invalid data provided.' };
    }

    try {
        const { customer_name, customer_email, plan_title, amount, razorpay_payment_id, razorpay_order_id, razorpay_signature, status } = validated.data;
        
        // Security check for completed payments
        if (status === 'completed') {
            const paymentSettings = await getPaymentSettings();
            if (!paymentSettings?.razorpay_key_secret) {
                return { success: false, error: 'Payment secret not configured.' };
            }
            if (!razorpay_signature) {
                return { success: false, error: 'Payment verification failed. Missing signature.'}
            }
            
            const generated_signature = crypto
                .createHmac('sha256', paymentSettings.razorpay_key_secret)
                .update(razorpay_order_id + "|" + razorpay_payment_id)
                .digest('hex');

            if (generated_signature !== razorpay_signature) {
                 return { success: false, error: 'Payment verification failed. Signature mismatch.' };
            }
        }
        
        await addDoc(collection(firestore, 'orders'), {
            customer_name,
            customer_email,
            plan_title,
            amount,
            razorpay_payment_id,
            razorpay_order_id,
            status,
            createdAt: serverTimestamp(),
        });
        
        // Send emails only for completed orders
        if (status === 'completed') {
            await sendOrderConfirmationEmails({
                customer_name,
                customer_email,
                plan_title,
                amount,
                razorpay_order_id,
            });
        }

        revalidatePath('/admin/orders');
        revalidatePath('/admin/dashboard');

        return { success: true };
    } catch (error) {
        console.error('Failed to save order:', error);
        return { success: false, error: 'Could not save the order to the database.' };
    }
}

async function sendOrderConfirmationEmails(orderDetails: {
    customer_name: string;
    customer_email: string;
    plan_title: string;
    amount: number;
    razorpay_order_id: string;
}) {
    try {
        const emailSettings = await getEmailSettings();
        const contactDetails = await getContactDetails();

        if (!emailSettings.smtp_host || !emailSettings.smtp_user || !emailSettings.smtp_password || !emailSettings.smtp_sender_email) {
            console.warn("SMTP settings are not fully configured. Skipping order confirmation emails.");
            return;
        }

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
            subject: `New Order Received - ${orderDetails.plan_title}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="color: #333;">New Order Notification</h2>
                    <p>A new order has been placed on your website.</p>
                    <hr>
                    <p><strong>Customer Name:</strong> ${orderDetails.customer_name}</p>
                    <p><strong>Customer Email:</strong> <a href="mailto:${orderDetails.customer_email}">${orderDetails.customer_email}</a></p>
                    <p><strong>Plan Purchased:</strong> ${orderDetails.plan_title}</p>
                    <p><strong>Amount:</strong> ₹${orderDetails.amount.toLocaleString()}</p>
                    <p><strong>Razorpay Order ID:</strong> ${orderDetails.razorpay_order_id}</p>
                    <hr>
                    <p style="font-size: 0.9em; color: #888;">This email was sent from the automated system on ${APP_NAME}.</p>
                </div>
            `,
        });

        // Confirmation Email to Customer
        await transporter.sendMail({
            from: `"${APP_NAME}" <${emailSettings.smtp_sender_email}>`,
            to: orderDetails.customer_email,
            subject: `Your Order Confirmation from ${APP_NAME}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="color: #333;">Thank You For Your Order, ${orderDetails.customer_name}!</h2>
                    <p>We have successfully received your payment. Here are the details of your purchase:</p>
                    <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
                        <p><strong>Plan:</strong> ${orderDetails.plan_title}</p>
                        <p><strong>Amount Paid:</strong> ₹${orderDetails.amount.toLocaleString()}</p>
                        <p><strong>Order ID:</strong> ${orderDetails.razorpay_order_id}</p>
                    </div>
                    <hr style="margin: 20px 0;">
                    <p>We will get started on your project right away. If you have any questions, please feel free to contact us.</p>
                    <p>Best Regards,</p>
                    <p><strong>The ${APP_NAME} Team</strong></p>
                </div>
            `,
        });
    } catch (error) {
        console.error("Failed to send order confirmation emails:", error);
        // We don't throw an error here because the payment itself was successful.
        // We just log it.
    }
}


export interface Order {
    id: string;
    customer_name: string;
    customer_email: string;
    plan_title: string;
    amount: number;
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    status: 'completed' | 'failed';
    created_at: string;
}

export async function getOrders(): Promise<Order[]> {
    try {
        const q = firestoreQuery(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const { createdAt, ...restOfData } = data;
            const rawDate = data.createdAt;
            const createdAtDate = rawDate instanceof Timestamp ? rawDate.toDate() : new Date();
            return {
                id: doc.id,
                ...restOfData,
                amount: Number(data.amount),
                created_at: createdAtDate.toLocaleString(),
            } as Order;
        });
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return [];
    }
}

export async function createRazorpayOrder({ amount }: { amount: number }): Promise<{ success: boolean; order?: any; error?: string }> {
    try {
        const paymentSettings = await getPaymentSettings();
        if (!paymentSettings || !paymentSettings.razorpay_key_id || !paymentSettings.razorpay_key_secret) {
            return { success: false, error: "Razorpay credentials are not configured." };
        }

        const instance = new Razorpay({
            key_id: paymentSettings.razorpay_key_id,
            key_secret: paymentSettings.razorpay_key_secret,
        });

        const options = {
            amount: amount * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
            payment_capture: 1, // Enable auto-capture
        };

        const order = await instance.orders.create(options);

        if (!order) {
            return { success: false, error: "Failed to create Razorpay order." };
        }

        return { success: true, order };
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        return { success: false, error: "Could not initiate payment." };
    }
}

export async function deleteOrder(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await deleteDoc(doc(firestore, 'orders', id));
      revalidatePath('/admin/orders');
      revalidatePath('/admin/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Failed to delete order:', error);
      return { success: false, error: 'An unexpected error occurred.' };
    }
}
