
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CircleUser, Menu } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { logout } from "./profile/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export default function AdminHeader() {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            await logout(); // Call server action to revalidate if needed
            toast({
                title: 'Logged Out',
                description: 'You have been successfully logged out.',
            });
            router.push('/admin/login');
        } catch (error) {
            console.error('Logout Error:', error);
            toast({
                title: 'Logout Failed',
                description: 'An error occurred while logging out.',
                variant: 'destructive',
            });
        }
    }

    const closeSheet = () => setIsSheetOpen(false);

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0">
                   <SheetHeader className="sr-only">
                        <SheetTitle>Admin Menu</SheetTitle>
                   </SheetHeader>
                   <AdminSidebar onLinkClick={closeSheet} />
                </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
                {/* Can add search or other header items here */}
            </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                        <Avatar>
                            <AvatarImage src={user?.photoURL || undefined} alt="Admin" />
                            <AvatarFallback>
                                {user?.email?.charAt(0).toUpperCase() || <CircleUser className="h-5 w-5" />}
                            </AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/admin/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}
