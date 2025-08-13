
import { Metadata } from 'next';
import { APP_NAME } from '@/lib/config';
import { Database } from 'lucide-react';
import DatabaseToolsForm from './DatabaseToolsForm';

export const metadata: Metadata = {
  title: `Database Tools | ${APP_NAME}`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function DatabaseToolsPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Database Tools</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Perform database operations like exporting for backups or importing to restore data.
        </p>
      </div>
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border bg-card text-card-foreground p-6 mb-8 flex items-start gap-4">
          <Database className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-headline text-lg font-semibold">Firestore Database Tools</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Export your entire Firestore database to a JSON file or import a previously exported file.
            </p>
          </div>
        </div>
        <DatabaseToolsForm />
      </div>
    </div>
  );
}
