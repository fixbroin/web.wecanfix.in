
import { Metadata } from 'next';
import { APP_NAME } from '@/lib/config';
import { Megaphone } from 'lucide-react';
import MarketingSetupForm from './MarketingSetupForm';

export const metadata: Metadata = {
  title: `Marketing Setup | ${APP_NAME}`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function MarketingSetupPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Marketing Setup</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Manage marketing and tracking integrations for your website.
        </p>
      </div>
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border bg-card text-card-foreground p-6 mb-8 flex items-start gap-4">
          <Megaphone className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-headline text-lg font-semibold">How it works</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Enable the services you need, paste the corresponding IDs or scripts, and save your changes. The settings will be automatically applied to your live website.
            </p>
          </div>
        </div>
        <MarketingSetupForm />
      </div>
    </div>
  );
}
