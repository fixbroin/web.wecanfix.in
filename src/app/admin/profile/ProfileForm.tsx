
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import ImageUploadInput from '../settings/ImageUploadInput';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email(),
  photoURL: z.string().url().optional().or(z.literal('')),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, { message: 'Current password is required.' }),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters.' }),
  confirmPassword: z.string().min(6, { message: 'Please confirm your new password.' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});


export default function ProfileForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isProfilePending, startProfileTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      photoURL: '',
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        profileForm.reset({
          name: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
        });
        setIsLoading(false);
      } else {
        router.push('/admin/login');
      }
    });
    return () => unsubscribe();
  }, [profileForm, router]);


  const onProfileSubmit = (values: z.infer<typeof profileFormSchema>) => {
    startProfileTransition(async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const profileUpdates: { displayName?: string; photoURL?: string } = {};
        if (user.displayName !== values.name) {
          profileUpdates.displayName = values.name;
        }
        if (user.photoURL !== values.photoURL) {
            profileUpdates.photoURL = values.photoURL;
        }
        if (Object.keys(profileUpdates).length > 0) {
            await updateProfile(user, profileUpdates);
        }

        if (user.email !== values.email) {
          // Re-authentication might be required for changing email
          await updateEmail(user, values.email);
        }
        toast({
          title: 'Success!',
          description: 'Your profile has been updated.',
        });
        // Force header re-render by re-fetching user
        router.refresh(); 
      } catch (error: any) {
        toast({
          title: 'Error updating profile',
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };

  const onPasswordSubmit = (values: z.infer<typeof passwordFormSchema>) => {
    startPasswordTransition(async () => {
        const user = auth.currentUser;
        if (!user || !user.email) return;

        const credential = EmailAuthProvider.credential(user.email, values.currentPassword);
        
        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, values.newPassword);
            
            toast({
                title: 'Success!',
                description: 'Your password has been changed successfully.',
            });
            passwordForm.reset();
        } catch (error: any) {
            toast({
                title: 'Password Change Failed',
                description: 'The current password you entered is incorrect. Please try again.',
                variant: 'destructive',
            });
        }
    });
  };

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-1/3" />
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your display name, email address, and profile picture.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <FormField
                  control={profileForm.control}
                  name="photoURL"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Profile Picture</FormLabel>
                      <FormControl>
                          <ImageUploadInput id="profile-photo-upload" value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
              />
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                     <FormDescription>
                        Changing your email may require you to re-login.
                    </FormDescription>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isProfilePending}>
                {isProfilePending ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Enter your current password and a new password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPasswordPending}>
                {isPasswordPending ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
