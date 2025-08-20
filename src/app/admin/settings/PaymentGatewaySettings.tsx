
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
import { Switch } from '@/components/ui/switch';
import { getPaymentSettings, updatePaymentSettings, PaymentSettings } from './actions/payment-actions';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  enable_online_payments: z.boolean(),
  razorpay_key_id: z.string().optional(),
  razorpay_key_secret: z.string().optional(),
  enable_pay_later: z.boolean(),
});

export default function PaymentGatewaySettings() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enable_online_payments: true,
      razorpay_key_id: '',
      razorpay_key_secret: '',
      enable_pay_later: false,
    },
  });

  useEffect(() => {
    async function loadSettings() {
        const data = await getPaymentSettings();
        if (data) {
            form.reset(data);
        }
    }
    loadSettings();
  }, [form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        try {
            await updatePaymentSettings(values as PaymentSettings);
            toast({
              title: 'Success!',
              description: 'Payment settings have been updated.',
            });
            // Re-fetch to confirm the new values are displayed
            const data = await getPaymentSettings();
            if (data) {
                form.reset(data);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update payment settings.',
                variant: 'destructive',
            })
        }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Gateway Settings</CardTitle>
        <CardDescription>Configure payment methods and gateway credentials.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <FormField
              control={form.control}
              name="enable_online_payments"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Online Payments (Razorpay)</FormLabel>
                    <FormDescription>
                      Allow customers to pay using online methods like UPI, Cards, Netbanking.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4 rounded-lg border p-4">
                <FormField
                    control={form.control}
                    name="razorpay_key_id"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Razorpay Key ID</FormLabel>
                        <FormControl>
                            <Input placeholder="rzp_live_..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="razorpay_key_secret"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Razorpay Key Secret</FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="Enter your key secret" {...field} />
                        </FormControl>
                         <FormDescription>
                            Your saved key secret will always be displayed here.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
             <FormField
              control={form.control}
              name="enable_pay_later"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable "Pay After Service"</FormLabel>
                    <FormDescription>
                      Allow customers to opt for paying after the service is completed.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />


            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Payment Settings'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
