
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <AdminSidebar className="hidden border-r bg-muted/40 md:flex" />
      <div className="flex flex-col">
        <AdminHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-secondary/40">
          {children}
        </main>
      </div>
    </div>
  );
}

function FullScreenLoader() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-md p-6 space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            </div>
        </div>
    );
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthStatus(user ? 'authenticated' : 'unauthenticated');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authStatus === 'unauthenticated' && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
    if (authStatus === 'authenticated' && pathname === '/admin/login') {
      router.push('/admin/dashboard');
    }
  }, [authStatus, pathname, router]);

  if (authStatus === 'loading') {
    return <FullScreenLoader />;
  }

  if (authStatus === 'authenticated') {
    if (pathname === '/admin/login') {
        // Still loading the dashboard, show a loader to prevent flicker
        return <FullScreenLoader />;
    }
    return <AdminLayoutContent>{children}</AdminLayoutContent>;
  }
  
  // Unauthenticated
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Unauthenticated and not on login page, show loader while redirecting
  return <FullScreenLoader />;
}
