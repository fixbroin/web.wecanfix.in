
'use server';

import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query as firestoreQuery, orderBy, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { notFound } from 'next/navigation';

// The schema is now defined in TestimonialForm.tsx
const testimonialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().min(10, 'Review must be at least 10 characters.'),
  rating: z.coerce.number().min(1).max(5),
  image: z.string().url().optional().or(z.literal('')),
});

export type Testimonial = z.infer<typeof testimonialSchema> & {
  id: string;
  createdAt: string;
};
export type TestimonialFormData = z.infer<typeof testimonialSchema>;

export async function addTestimonial(data: TestimonialFormData) {
  const validated = testimonialSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: 'Invalid data provided.' };
  }
  try {
    await addDoc(collection(firestore, 'testimonials'), {
      ...validated.data,
      createdAt: serverTimestamp(),
    });
    revalidatePath('/admin/testimonials');
    revalidatePath('/'); // For home page
    return { success: true };
  } catch (error) {
    console.error('Failed to add testimonial:', error);
    return { success: false, error: 'Failed to add testimonial.' };
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const q = firestoreQuery(collection(firestore, 'testimonials'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        const defaultTestimonial = {
            name: 'Jane Doe',
            description: 'This is a fantastic service! Highly recommended to everyone looking for a professional website.',
            rating: 5,
            image: '',
            createdAt: serverTimestamp()
        };
        await addDoc(collection(firestore, 'testimonials'), defaultTestimonial);
        const newSnapshot = await getDocs(q);
        return newSnapshot.docs.map(doc => {
            const data = doc.data();
            const rawDate = data.createdAt;
            const createdAt = rawDate instanceof Timestamp ? rawDate.toDate() : new Date();
            return {
                ...doc.data(),
                id: doc.id,
                createdAt: createdAt.toISOString(),
            } as Testimonial;
        });
    }
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const rawDate = data.createdAt;
        const createdAt = rawDate instanceof Timestamp ? rawDate.toDate() : new Date();
        return {
            id: doc.id,
            name: data.name,
            description: data.description,
            rating: Number(data.rating),
            image: data.image || '',
            createdAt: createdAt.toISOString(),
        } as Testimonial;
    });
  } catch (error) {
    console.error('Failed to fetch testimonials:', error);
    return [];
  }
}

export async function getTestimonial(id: string): Promise<TestimonialFormData | null> {
  try {
    const docRef = doc(firestore, 'testimonials', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      notFound();
    }
    const data = docSnap.data();
    return {
        name: data.name,
        description: data.description,
        rating: Number(data.rating),
        image: data.image || '',
    };
  } catch (error) {
    console.error('Failed to get testimonial:', error);
    return null;
  }
}

export async function updateTestimonial(id: string, data: TestimonialFormData) {
  const validated = testimonialSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: 'Invalid data provided.' };
  }
  try {
    const docRef = doc(firestore, 'testimonials', id);
    await updateDoc(docRef, validated.data);
    revalidatePath('/admin/testimonials');
    revalidatePath(`/admin/testimonials/edit/${id}`);
    revalidatePath('/'); // For home page
    return { success: true };
  } catch (error) {
    console.error('Failed to update testimonial:', error);
    return { success: false, error: 'Failed to update testimonial.' };
  }
}

export async function deleteTestimonial(id: string) {
  try {
    await deleteDoc(doc(firestore, 'testimonials', id));
    revalidatePath('/admin/testimonials');
    revalidatePath('/'); // For home page
    return { success: true };
  } catch (error) {
    console.error('Failed to delete testimonial:', error);
    return { success: false, error: 'Failed to delete testimonial.' };
  }
}
