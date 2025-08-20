
"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function Logo({ appName, logoUrl }: { appName?: string, logoUrl?: string }) {
  const name = appName || 'WebDesignBro';
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      {logoUrl && (
        <div className="relative h-10 w-10">
          <Image 
            src={logoUrl} 
            alt={`${name} Logo`}
            fill
            className="object-contain"
          />
        </div>
      )}
      <h1 className="text-2xl font-bold font-headline text-primary">
        {name}
      </h1>
    </Link>
  );
}
