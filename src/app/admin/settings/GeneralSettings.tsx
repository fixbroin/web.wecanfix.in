
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useTransition } from 'react';
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
import { getGeneralSettings, updateGeneralSettings } from './actions/general-actions';
import ImageUploadInput from './ImageUploadInput';
import { Separator } from '@/components/ui/separator';
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  website_name: z.string().min(1, 'Website name is required'),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  footer_description: z.string().min(1, 'Footer description is required'),
  facebook_url: z.string().url().optional().or(z.literal('')),
  instagram_url: z.string().url().optional().or(z.literal('')),
  twitter_url: z.string().url().optional().or(z.literal('')),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  youtube_url: z.string().url().optional().or(z.literal('')),
});

export default function GeneralSettings() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      website_name: '',
      logo: '',
      favicon: '',
      footer_description: '',
      facebook_url: '',
      instagram_url: '',
      twitter_url: '',
      linkedin_url: '',
      youtube_url: '',
    },
  });

  useEffect(() => {
    startTransition(async () => {
      const data = await getGeneralSettings();
      if (data) {
        form.reset(data);
      }
    });
  }, [form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        try {
            await updateGeneralSettings(values);
            toast({
              title: 'Success!',
              description: 'General settings have been updated.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update general settings.',
                variant: 'destructive',
            })
        }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Manage your website's public identity and branding.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4 rounded-lg border p-4">
                <h3 className="text-lg font-semibold">Branding</h3>
                <Separator />
                <FormField
                    control={form.control}
                    name="website_name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Website Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Your Company Name" {...field} />
                        </FormControl>
                         <FormDescription>This name will appear in the site title and logo.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Logo</FormLabel>
                        <FormControl>
                           <ImageUploadInput id="logo-upload" value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormDescription>Recommended: transparent PNG, max height 40px.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="favicon"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Favicon</FormLabel>
                        <FormControl>
                           <ImageUploadInput id="favicon-upload" value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormDescription>Recommended size: 32x32px. Should be .ico, .png, or .svg</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="footer_description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Footer Description</FormLabel>
                        <FormControl>
                            <Textarea placeholder="A short description for the footer" {...field} />
                        </FormControl>
                         <FormDescription>This text appears in your website's footer.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
             <div className="space-y-4 rounded-lg border p-4">
                <h3 className="text-lg font-semibold">Social Media Links</h3>
                <Separator />
                 <FormField
                    control={form.control}
                    name="facebook_url"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className='flex items-center gap-2'><Facebook size={16}/> Facebook URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://facebook.com/yourpage" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="instagram_url"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className='flex items-center gap-2'><Instagram size={16}/> Instagram URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://instagram.com/yourhandle" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="twitter_url"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className='flex items-center gap-2'><Twitter size={16}/> Twitter (X) URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://twitter.com/yourhandle" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="linkedin_url"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className='flex items-center gap-2'><Linkedin size={16}/> LinkedIn URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://linkedin.com/company/yourcompany" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="youtube_url"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className='flex items-center gap-2'><Youtube size={16}/> YouTube URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://youtube.com/c/yourchannel" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
