import { Metadata } from 'next';
import { Lightbulb } from 'lucide-react';
import SeoToolForm from './SeoToolForm';
import { APP_NAME } from '@/lib/config';

export const metadata: Metadata = {
  title: `SEO Meta Description Generator | ${APP_NAME} Tools`,
  description: 'Use our AI-powered tool to generate compelling meta descriptions for your web pages.',
  robots: {
    index: false, // Don't index this tool page
    follow: false,
  },
};

export default function SeoToolPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">AI Meta Description Generator</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Automatically generate SEO-friendly meta descriptions for your content.
        </p>
      </div>
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border bg-card text-card-foreground p-6 mb-8 flex items-start gap-4">
          <Lightbulb className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-headline text-lg font-semibold">How it works</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Simply paste your page title and the main content of your page below. Our AI will analyze the text and generate a concise and compelling meta description (under 160 characters) to improve your search engine click-through rates.
            </p>
          </div>
        </div>
        <SeoToolForm />
      </div>
    </div>
  );
}
