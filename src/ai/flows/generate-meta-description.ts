'use server';

/**
 * @fileOverview A meta description generation AI agent.
 *
 * - generateMetaDescription - A function that generates a meta description for a given page.
 * - GenerateMetaDescriptionInput - The input type for the generateMetaDescription function.
 * - GenerateMetaDescriptionOutput - The return type for the generateMetaDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMetaDescriptionInputSchema = z.object({
  pageTitle: z.string().describe('The title of the page.'),
  pageContent: z.string().describe('The content of the page.'),
});
export type GenerateMetaDescriptionInput = z.infer<typeof GenerateMetaDescriptionInputSchema>;

const GenerateMetaDescriptionOutputSchema = z.object({
  metaDescription: z.string().describe('The generated meta description for the page.'),
});
export type GenerateMetaDescriptionOutput = z.infer<typeof GenerateMetaDescriptionOutputSchema>;

export async function generateMetaDescription(
  input: GenerateMetaDescriptionInput
): Promise<GenerateMetaDescriptionOutput> {
  return generateMetaDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMetaDescriptionPrompt',
  input: {schema: GenerateMetaDescriptionInputSchema},
  output: {schema: GenerateMetaDescriptionOutputSchema},
  prompt: `You are an expert SEO content writer. Your goal is to write a compelling and accurate meta description for a given web page.

  The meta description should be no more than 160 characters.

  Page Title: {{{pageTitle}}}
  Page Content: {{{pageContent}}}

  Write a meta description for the page.`,
});

const generateMetaDescriptionFlow = ai.defineFlow(
  {
    name: 'generateMetaDescriptionFlow',
    inputSchema: GenerateMetaDescriptionInputSchema,
    outputSchema: GenerateMetaDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
