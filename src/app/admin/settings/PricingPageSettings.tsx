
"use client";

import { useFieldArray, useForm } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Trash } from 'lucide-react';
import { getPricingPlans, updatePricingPlans, PricingPlan } from './actions/pricing-actions';

const planFeatureSchema = z.object({
  name: z.string().min(1, 'Feature name cannot be empty.'),
});

const planSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  price: z.string().min(1, 'Price is required.'),
  description: z.string().min(1, 'Description is required.'),
  is_featured: z.boolean(),
  features: z.array(planFeatureSchema),
});

const formSchema = z.object({
  plans: z.array(planSchema),
});

export default function PricingPageSettings() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plans: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "plans",
  });

   useEffect(() => {
    startTransition(async () => {
      const data = await getPricingPlans();
      if (data) {
        form.reset({ plans: data.map(p => ({...p, is_featured: !!p.is_featured})) });
      }
    });
  }, [form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        try {
            await updatePricingPlans(values.plans);
            toast({
              title: 'Success!',
              description: 'Pricing plans have been updated.',
            });
            // Refetch after saving
            const data = await getPricingPlans();
            if (data) {
               form.reset({ plans: data.map(p => ({...p, is_featured: !!p.is_featured})) });
            }
        } catch(error) {
             toast({
                title: 'Error',
                description: 'Failed to update pricing plans.',
                variant: 'destructive',
            })
        }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Page Settings</CardTitle>
        <CardDescription>Manage the pricing plans for your services.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 rounded-lg border p-4 relative">
                  <h3 className="text-lg font-semibold">Plan {index + 1}</h3>
                   <Button 
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                    className="absolute top-2 right-2"
                    >
                        <Trash />
                    </Button>
                  <Separator />
                  <FormField
                    control={form.control}
                    name={`plans.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Plan Title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`plans.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., $99 or Contact Us" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`plans.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Plan description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`plans.${index}.is_featured`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>Featured Plan</FormLabel>
                            <FormMessage />
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
                  <PlanFeatures control={form.control} planIndex={index} />
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" onClick={() => append({ title: '', price: '', description: '', is_featured: false, features: [] })}>
                Add Pricing Plan
            </Button>
            
            <Separator />

            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


function PlanFeatures({ control, planIndex }: { control: any, planIndex: number }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `plans.${planIndex}.features`,
    });

    return (
        <div className="space-y-4 rounded-lg border p-4">
            <FormLabel>Features</FormLabel>
            {fields.map((field, featureIndex) => (
                <div key={field.id} className="flex items-center gap-2">
                    <FormField
                        control={control}
                        name={`plans.${planIndex}.features.${featureIndex}.name`}
                        render={({ field }) => (
                            <FormItem className="flex-grow">
                                <FormControl>
                                    <Input placeholder="Feature description" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(featureIndex)}>
                        <Trash className="text-destructive" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '' })}>
                Add Feature
            </Button>
        </div>
    );
}
