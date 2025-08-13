
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Trash } from 'lucide-react';
import { getPortfolioItems, updatePortfolioItems, PortfolioItem } from './actions/portfolio-actions';
import ImageUploadInput from './ImageUploadInput';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const portfolioItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  mediaType: z.enum(['image', 'video']),
  mediaUrl: z.string().optional(),
  link: z.string().optional(),
});

const formSchema = z.object({
  items: z.array(portfolioItemSchema),
});

export default function PortfolioPageSettings() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    startTransition(async () => {
      const data = await getPortfolioItems();
      if (data) {
        form.reset({ items: data.map(item => ({...item, mediaType: item.mediaType || 'image'})) });
      }
    });
  }, [form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        try {
            await updatePortfolioItems(values.items as PortfolioItem[]);
            toast({
              title: 'Success!',
              description: 'Portfolio items have been updated.',
            });
            const data = await getPortfolioItems();
            if (data) {
                form.reset({ items: data.map(item => ({...item, mediaType: item.mediaType || 'image'})) });
            }
        } catch(error) {
            toast({
                title: 'Error',
                description: 'Failed to update portfolio items.',
                variant: 'destructive',
            })
        }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Page Settings</CardTitle>
        <CardDescription>Manage the projects displayed on your portfolio page.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 rounded-lg border p-4 relative">
                  <h3 className="text-lg font-semibold">Item {index + 1}</h3>
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
                    name={`items.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Project Title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.category`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Website" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.mediaType`}
                    render={({ field: mediaTypeField }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Media Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={mediaTypeField.onChange}
                            value={mediaTypeField.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="image" />
                              </FormControl>
                              <FormLabel className="font-normal">Image</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="video" />
                              </FormControl>
                              <FormLabel className="font-normal">Video</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`items.${index}.mediaUrl`}
                    render={({ field: { onChange, value } }) => (
                      <FormItem>
                        <FormLabel>{form.watch(`items.${index}.mediaType`) === 'video' ? 'Video' : 'Image'}</FormLabel>
                        <FormControl>
                           <ImageUploadInput 
                            id={`media-upload-${field.id}`} 
                            value={value} 
                            onChange={onChange}
                            accept={form.watch(`items.${index}.mediaType`) === 'video' ? "video/mp4,video/webm" : "image/png, image/jpeg, image/webp, image/svg+xml, image/ico, .ico"}
                           />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name={`items.${index}.link`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Link (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/project" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" onClick={() => append({ title: '', category: '', mediaType: 'image', mediaUrl: 'https://placehold.co/600x400.png', link: '#' })}>
                Add Portfolio Item
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
