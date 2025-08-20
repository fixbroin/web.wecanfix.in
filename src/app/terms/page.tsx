
import { Metadata } from 'next';
import { getLegalPageContent } from '@/app/admin/settings/actions/legal-actions';
import { APP_NAME, WEBSITE_URL } from '@/lib/config';

export async function generateMetadata(): Promise<Metadata> {
    const page = await getLegalPageContent('terms');
    return {
        title: `${page?.title || 'Terms and Conditions'} | ${APP_NAME}`,
        description: `Read the Terms and Conditions for using the ${APP_NAME} website and services.`,
        alternates: {
          canonical: `${WEBSITE_URL}/terms`,
        },
    };
}

export default async function TermsPage() {
  const page = await getLegalPageContent('terms');

  if (!page) {
    return <p className="text-center py-20">Could not load page content.</p>;
  }

  return (
    <div className="container py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-center">
          {page.title}
        </h1>
        <div 
          className="prose prose-lg dark:prose-invert mt-12 mx-auto"
          dangerouslySetInnerHTML={{ __html: page.content.replace(/\n/g, '<br />') }}
        />
      </div>
    </div>
  );
}
