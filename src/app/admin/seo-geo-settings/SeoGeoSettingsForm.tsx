
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useTransition, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getSeoData, updateSeoData, PageSeoContent } from './actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  h1_title: z.string().min(5, { message: 'H1 Title must be at least 5 characters.' }),
  paragraph: z.string().min(10, { message: 'Paragraph must be at least 10 characters.' }),
  meta_title: z.string().min(5, { message: 'Meta Title must be at least 5 characters.' }),
  meta_description: z.string().min(10, { message: 'Meta Description must be at least 10 characters.' }),
  meta_keywords: z.string(),
});

const availablePages = [
  { value: 'home', label: 'Homepage' },
  { value: 'services', label: 'Services' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'about', label: 'About Us' },
  { value: 'contact', label: 'Contact' },
];

export default function SeoGeoSettingsForm() {
  const { toast } = useToast();
  const [isSaving, startSavingTransition] = useTransition();
  const [isLoading, startLoadingTransition] = useTransition();
  const [selectedPage, setSelectedPage] = useState<string>('home');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      h1_title: '',
      paragraph: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
    },
  });

  const fetchPageData = useCallback((page: string) => {
    startLoadingTransition(async () => {
      const data = await getSeoData(page);
      if (data) {
        form.reset(data);
      }
    });
  }, [form]);

  useEffect(() => {
    fetchPageData(selectedPage);
  }, [selectedPage, fetchPageData]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startSavingTransition(async () => {
      const response = await updateSeoData(selectedPage, values);
      if (response.success) {
        toast({
          title: 'Success!',
          description: `SEO settings for the ${availablePages.find(p => p.value === selectedPage)?.label} page have been updated.`,
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update settings.',
          variant: 'destructive',
        });
      }
    });
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Page SEO Content</CardTitle>
        <CardDescription>Select a page to manage its SEO and on-page content.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormItem>
              <FormLabel>Select Page</FormLabel>
              <Select onValueChange={setSelectedPage} defaultValue={selectedPage}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a page to edit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availablePages.map((page) => (
                    <SelectItem key={page.value} value={page.value}>
                      {page.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

            {isLoading ? (
              <div className="space-y-4 pt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="h1_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>H1 Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Main heading for the page" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paragraph"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paragraph</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Introductory paragraph for the page" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meta_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Title for browser tab and search results" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meta_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Description for search engine results" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meta_keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Keywords</FormLabel>
                      <FormControl>
                        <Input placeholder="Comma, separated, keywords" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button type="submit" className="w-full" disabled={isSaving || isLoading}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
