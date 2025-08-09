"use client";

import Link from 'next/link';

export default function Logo({ appName }: { appName?: string }) {
  const name = appName || 'WebDesignBro';
  return (
    <Link href="/" className="inline-block">
      <h1 className="text-2xl font-bold font-headline text-primary">
        {name}
      </h1>
    </Link>
  );
}
