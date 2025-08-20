
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useTransition, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { getMarketingSettings, updateMarketingSettings, MarketingSettings } from './actions';
import { Skeleton } from '@/components/ui/skeleton';

const settingSchema = z.object({
  enabled: z.boolean(),
  value: z.string().optional(),
});

const formSchema = z.object({
  googleTagManagerId: settingSchema,
  googleAnalyticsId: settingSchema,
  googleAdsId: settingSchema,
  googleAdsLabel: settingSchema,
  googleRemarketing: settingSchema,
  googleOptimizeId: settingSchema,
  metaPixelId: settingSchema,
  metaPixelAccessToken: settingSchema,
  metaConversionsApiKey: settingSchema,
  bingUetTagId: settingSchema,
  pinterestTagId: settingSchema,
  customHeadScript: settingSchema,
  customBodyScript: settingSchema,
});

type MarketingFormData = z.infer<typeof formSchema>;

export default function MarketingSetupForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<MarketingFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      googleTagManagerId: { enabled: false, value: '' },
      googleAnalyticsId: { enabled: false, value: '' },
      googleAdsId: { enabled: false, value: '' },
      googleAdsLabel: { enabled: false, value: '' },
      googleRemarketing: { enabled: false, value: '' },
      googleOptimizeId: { enabled: false, value: '' },
      metaPixelId: { enabled: false, value: '' },
      metaPixelAccessToken: { enabled: false, value: '' },
      metaConversionsApiKey: { enabled: false, value: '' },
      bingUetTagId: { enabled: false, value: '' },
      pinterestTagId: { enabled: false, value: '' },
      customHeadScript: { enabled: false, value: '' },
      customBodyScript: { enabled: false, value: '' },
    },
  });

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      const data = await getMarketingSettings();
      if (data) {
        form.reset(data);
      }
      setIsLoading(false);
    }
    loadSettings();
  }, [form]);

  function onSubmit(values: MarketingFormData) {
    startTransition(async () => {
      try {
        await updateMarketingSettings(values);
        toast({
          title: 'Success!',
          description: 'Marketing settings have been updated.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update marketing settings.',
          variant: 'destructive',
        });
      }
    });
  }

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-1/3" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <Card>
            <CardHeader>
                <CardTitle>Google Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <SettingInput control={form.control} name="googleTagManagerId" label="Google Tag Manager ID" placeholder="GTM-XXXXXXX" />
                <SettingInput control={form.control} name="googleAnalyticsId" label="Google Analytics 4 Measurement ID" placeholder="G-XXXXXXXXXX" />
                <SettingInput control={form.control} name="googleAdsId" label="Google Ads Conversion ID" placeholder="AW-XXXXXXXXX" />
                <SettingInput control={form.control} name="googleAdsLabel" label="Google Ads Conversion Label" placeholder="Optional conversion label" />
                <SettingInput control={form.control} name="googleOptimizeId" label="Google Optimize Container ID" placeholder="GTM-XXXXXXX or OPT-XXXXXXX" />
                <SettingTextarea control={form.control} name="googleRemarketing" label="Google Remarketing Tag" description="Paste the full remarketing tag snippet here." />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Facebook / Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                 <SettingInput control={form.control} name="metaPixelId" label="Meta Pixel ID" placeholder="XXXXXXXXXXXXXXX" />
                 <SettingInput control={form.control} name="metaPixelAccessToken" label="Meta Pixel Access Token" description="For server-side events via Meta Conversions API." />
                 <SettingInput control={form.control} name="metaConversionsApiKey" label="Meta Conversions API Key (optional)" />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Other Platforms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <SettingInput control={form.control} name="bingUetTagId" label="Microsoft Bing Ads UET Tag ID" placeholder="XXXXXXXXX" />
                <SettingInput control={form.control} name="pinterestTagId" label="Pinterest Tag ID" />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Custom Scripts</CardTitle>
                <CardDescription>Use for any other scripts not listed above. Be careful, incorrect scripts can break your site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <SettingTextarea control={form.control} name="customHeadScript" label="Custom Head Script" description="This script will be injected before the closing </head> tag." />
                 <SettingTextarea control={form.control} name="customBodyScript" label="Custom Body Script" description="This script will be injected before the closing </body> tag." />
            </CardContent>
        </Card>
        

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save All Settings'}
        </Button>
      </form>
    </Form>
  );
}


// Helper components for consistent UI
type SettingInputProps = {
    control: any;
    name: keyof MarketingFormData;
    label: string;
    placeholder?: string;
    description?: string;
}

function SettingInput({ control, name, label, placeholder, description }: SettingInputProps) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <div className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                        <FormLabel>{label}</FormLabel>
                        <Switch
                            checked={field.value.enabled}
                            onCheckedChange={(checked) => field.onChange({ ...field.value, enabled: checked })}
                        />
                    </div>
                    {field.value.enabled && (
                        <>
                            <FormControl>
                                <Input placeholder={placeholder} value={field.value.value || ''} onChange={(e) => field.onChange({ ...field.value, value: e.target.value })} />
                            </FormControl>
                            {description && <FormDescription>{description}</FormDescription>}
                            <FormMessage />
                        </>
                    )}
                </div>
            )}
        />
    )
}

function SettingTextarea({ control, name, label, placeholder, description }: SettingInputProps) {
     return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <div className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                        <FormLabel>{label}</FormLabel>
                        <Switch
                            checked={field.value.enabled}
                            onCheckedChange={(checked) => field.onChange({ ...field.value, enabled: checked })}
                        />
                    </div>
                    {field.value.enabled && (
                        <>
                            <FormControl>
                                <Textarea
                                    placeholder={placeholder}
                                    className="min-h-32 font-mono text-xs"
                                    value={field.value.value || ''}
                                    onChange={(e) => field.onChange({ ...field.value, value: e.target.value })}
                                />
                            </FormControl>
                            {description && <FormDescription>{description}</FormDescription>}
                            <FormMessage />
                        </>
                    )}
                </div>
            )}
        />
    )
}
