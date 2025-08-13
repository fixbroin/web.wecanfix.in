
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
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { getHomePageContent, updateHomePageContent, HomePageContent } from './actions/home-actions';
import ImageUploadInput from './ImageUploadInput';

const formSchema = z.object({
  hero_image: z.string().optional(),
});

export default function HomePageSettings() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hero_image: '',
    },
  });

  useEffect(() => {
    startTransition(async () => {
        const data = await getHomePageContent();
        if (data) {
            form.reset({
                hero_image: data.hero_image || '',
            });
        }
    });
  }, [form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        try {
            await updateHomePageContent(values as HomePageContent);
            toast({
              title: 'Success!',
              description: 'Home page content has been updated.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update home page content.',
                variant: 'destructive'
            });
        }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Home Page Content</CardTitle>
        <CardDescription>Update the content for the different sections of your home page.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Hero Section */}
            <div className="space-y-4 rounded-lg border p-4">
                <h3 className="text-lg font-semibold">Hero Section</h3>
                <Separator />
                <FormField
                    control={form.control}
                    name="hero_image"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Image</FormLabel>
                        <FormControl>
                          <ImageUploadInput id="hero-image-upload" value={field.value || ''} onChange={field.onChange} />
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
