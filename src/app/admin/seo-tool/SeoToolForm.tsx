'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useTransition } from 'react';
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
import { runGenerateMetaDescription } from './actions';
import { Wand2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  pageTitle: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  pageContent: z.string().min(50, { message: 'Content must be at least 50 characters.' }),
});

export default function SeoToolForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pageTitle: '',
      pageContent: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setResult(null);
    startTransition(async () => {
      const response = await runGenerateMetaDescription(values);
      if (response.success && response.data) {
        setResult(response.data.metaDescription);
        toast({
          title: 'Success!',
          description: 'Meta description generated.',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to generate description.',
          variant: 'destructive',
        });
      }
    });
  }

  return (
    <>
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Content Input</CardTitle>
          <CardDescription>Provide the title and content of your page.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="pageTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Our Web Design Services" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pageContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the main content of your webpage here..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                <Wand2 className="mr-2 h-4 w-4" />
                {isPending ? 'Generating...' : 'Generate Description'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {(isPending || result) && (
        <Card className="w-full shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Generated Meta Description</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
              </div>
            ) : (
                result && (
                <div className="relative">
                    <p className="text-muted-foreground pr-10">{result}</p>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="absolute top-0 right-0"
                        onClick={() => {
                            navigator.clipboard.writeText(result);
                            toast({ description: "Copied to clipboard!" });
                        }}
                    >
                        Copy
                    </Button>
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
