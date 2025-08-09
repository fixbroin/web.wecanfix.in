'use server';

import {
  generateMetaDescription,
  type GenerateMetaDescriptionInput,
  type GenerateMetaDescriptionOutput,
} from '@/ai/flows/generate-meta-description';

type SeoToolState = {
  success: boolean;
  data?: GenerateMetaDescriptionOutput;
  error?: string;
};

export async function runGenerateMetaDescription(
  input: GenerateMetaDescriptionInput
): Promise<SeoToolState> {
  try {
    const output = await generateMetaDescription(input);
    return { success: true, data: output };
  } catch (error) {
    console.error('Error generating meta description:', error);
    return { success: false, error: 'An unexpected error occurred while generating the description.' };
  }
}
