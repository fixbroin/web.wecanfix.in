
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
import { Trash } from 'lucide-react';
import { getWhyChooseUsContent, updateWhyChooseUsContent, WhyChooseUsContent } from './actions/why-choose-us-actions';
import ImageUploadInput from './ImageUploadInput';

const featureSchema = z.object({
  icon: z.string().min(1, 'Icon name is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
});

const formSchema = z.object({
  title: z.string().min(5),
  subtitle: z.string().min(10),
  image: z.string().optional(),
  features: z.array(featureSchema),
});

export default function WhyChooseUsSettings() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      image: '',
      features: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  });

  useEffect(() => {
    startTransition(async () => {
        try {
            const data = await getWhyChooseUsContent();
            if (data) {
                form.reset(data);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load Why Choose Us content.',
                variant: 'destructive',
            });
        }
    });
  }, [form, toast]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        try {
            await updateWhyChooseUsContent(values as Omit<WhyChooseUsContent, 'features'> & { features: Omit<any, 'id' | 'createdAt'>[] });
            toast({
              title: 'Success!',
              description: 'Why Choose Us section has been updated.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update section.',
                variant: 'destructive',
            })
        }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Why Choose Us Section</CardTitle>
        <CardDescription>Update the content for the "Why Choose Us" section on your homepage.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="space-y-4 rounded-lg border p-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Section Title</FormLabel>
                        <FormControl>
                            <Input placeholder="Section title" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Section Subtitle</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Section subtitle" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Image</FormLabel>
                        <FormControl>
                           <ImageUploadInput id="why-choose-us-image-upload" value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="space-y-4 rounded-lg border p-4">
                <h3 className="text-lg font-semibold">Features</h3>
                <Separator />
                {fields.map((field, index) => (
                    <div key={field.id} className="space-y-4 rounded-lg border p-4 relative">
                        <h4 className='font-medium'>Feature {index + 1}</h4>
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => remove(index)}
                            className="absolute top-2 right-2"
                        >
                            <Trash />
                        </Button>
                        <FormField
                            control={form.control}
                            name={`features.${index}.icon`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Icon Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Zap (from lucide-react)" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`features.${index}.title`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Feature Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Feature title" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`features.${index}.description`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Feature Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Feature description" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => append({ icon: 'CircleCheckBig', title: '', description: '' })}>
                    Add Feature
                </Button>
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
