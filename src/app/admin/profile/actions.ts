
'use server';

import { revalidatePath } from 'next/cache';

export async function logout(): Promise<{ success: boolean }> {
  try {
    // This server action is now primarily for revalidating paths if necessary after logout.
    // The client-side handles the actual Firebase sign-out.
    revalidatePath('/admin', 'layout');
    return { success: true };
  } catch (error) {
    console.error("Logout path revalidation error:", error);
    return { success: false };
  }
}
