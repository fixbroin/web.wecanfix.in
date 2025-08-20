
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getContactDetails, updateContactDetails, ContactDetails } from './actions/contact-actions';

const formSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(1),
  location: z.string().min(1),
  whatsAppNumber: z.string().min(10).describe("Include country code, e.g., 91..."),
});

export default function ContactPageSettings() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      phone: '',
      location: '',
      whatsAppNumber: '',
    },
  });

  useEffect(() => {
    startTransition(async () => {
      const data = await getContactDetails();
      if (data) {
        form.reset(data);
      }
    });
  }, [form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        await updateContactDetails(values);
        toast({
          title: 'Success!',
          description: 'Contact details have been updated.',
        });
      } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to update contact details.',
            variant: 'destructive',
        });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Page Settings</CardTitle>
        <CardDescription>Update your public contact information and form settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your-email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234 567 890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="City, Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="whatsAppNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Number</FormLabel>
                  <FormControl>
                    <Input placeholder="910000000000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
