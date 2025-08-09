
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
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Trash } from 'lucide-react';
import { getServices, updateServices, Service } from './actions/services-actions';
import ImageUploadInput from './ImageUploadInput';

const serviceSchema = z.object({
  id: z.string().optional(),
  icon: z.string().min(1, "Icon name is required"),
  title: z.string().min(1),
  price: z.string().min(1),
  description: z.string().min(1),
  image: z.string().optional(),
  features: z.array(z.object({ name: z.string().min(1) })),
});

const formSchema = z.object({
  services: z.array(serviceSchema),
});

export default function ServicesPageSettings() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      services: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "services",
  });

  useEffect(() => {
    startTransition(async () => {
      const data = await getServices();
      if (data) {
        form.reset({ services: data });
      }
    });
  }, [form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        try {
            await updateServices(values.services);
            toast({
              title: 'Success!',
              description: 'Services page content has been updated.',
            });
            // Refetch data to get new IDs
            const data = await getServices();
            if (data) {
                form.reset({ services: data });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update services.',
                variant: 'destructive',
            })
        }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services Page Settings</CardTitle>
        <CardDescription>Manage the services you offer.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 rounded-lg border p-4 relative">
                  <h3 className="text-lg font-semibold">Service {index + 1}</h3>
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
                    name={`services.${index}.icon`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Briefcase (from lucide-react)" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter any valid icon name from the lucide-react library.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`services.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Service Title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`services.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Starting at $99" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`services.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Service description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`services.${index}.image`}
                    render={({ field: { onChange, value } }) => (
                      <FormItem>
                        <FormLabel>Image</FormLabel>
                        <FormControl>
                          <ImageUploadInput id={`service-image-upload-${field.id}`} value={value || ''} onChange={onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <ServiceFeatures control={form.control} serviceIndex={index} />
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" onClick={() => append({ icon: 'Briefcase', title: '', price: '', description: '', image: '', features: [] })}>
                Add Service
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


function ServiceFeatures({ control, serviceIndex }: { control: any, serviceIndex: number }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `services.${serviceIndex}.features`,
    });

    return (
        <div className="space-y-4 rounded-lg border p-4">
            <FormLabel>Features</FormLabel>
            {fields.map((field, featureIndex) => (
                <div key={field.id} className="flex items-center gap-2">
                    <FormField
                        control={control}
                        name={`services.${serviceIndex}.features.${featureIndex}.name`}
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
