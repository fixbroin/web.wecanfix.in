
'use client';

import { useLoading } from '@/context/LoadingContext';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function GlobalLoader() {
  const { isLoading, hideLoader } = useLoading();
  const pathname = usePathname();

  useEffect(() => {
    hideLoader();
  }, [pathname, hideLoader]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    </div>
  );
}
