
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Save, Loader2, RefreshCw, XCircle, Sun, Moon } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { firestore } from '@/lib/firebase';
import { doc, getDoc } from "firebase/firestore";
import type { GlobalWebSettings, ThemeColors, ThemePalette } from '@/types/firestore';
import { hexToHslString, hslStringToHex, DEFAULT_LIGHT_THEME_COLORS_HSL, DEFAULT_DARK_THEME_COLORS_HSL } from '@/lib/colorUtils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateThemeSettings } from './actions/theme-actions';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

const WEB_SETTINGS_DOC_ID = "global";
const WEB_SETTINGS_COLLECTION = "webSettings";

interface ColorSettingConfig {
  id: keyof ThemePalette; 
  label: string;
}

const colorSettingsGroups: { group: string, settings: ColorSettingConfig[] }[] = [
    {
        group: 'Base Colors',
        settings: [
            { id: 'background', label: 'Page Background' },
            { id: 'foreground', label: 'Default Text' },
        ],
    },
    {
        group: 'Primary Colors (Buttons, Links)',
        settings: [
            { id: 'primary', label: 'Primary' },
            { id: 'primary-foreground', label: 'Text on Primary' },
        ],
    },
    {
        group: 'Secondary Colors',
        settings: [
            { id: 'secondary', label: 'Secondary Background' },
            { id: 'secondary-foreground', label: 'Text on Secondary' },
        ],
    },
    {
        group: 'Accent Colors (Highlights)',
        settings: [
            { id: 'accent', label: 'Accent' },
            { id: 'accent-foreground', label: 'Text on Accent' },
        ],
    },
    {
        group: 'Muted Colors',
        settings: [
            { id: 'muted', label: 'Muted Background' },
            { id: 'muted-foreground', label: 'Muted Text' },
        ],
    },
    {
        group: 'Destructive Colors (Errors)',
        settings: [
            { id: 'destructive', label: 'Destructive' },
            { id: 'destructive-foreground', label: 'Text on Destructive' },
        ],
    },
    {
        group: 'Component Colors',
        settings: [
            { id: 'card', label: 'Card Background' },
            { id: 'card-foreground', label: 'Card Text' },
            { id: 'popover', label: 'Popover Background' },
            { id: 'popover-foreground', label: 'Popover Text' },
            { id: 'border', label: 'Borders & Dividers' },
            { id: 'input', label: 'Input Field Background' },
            { id: 'ring', label: 'Focus Ring (Outlines)' },
        ],
    },
];

type ThemeMode = 'light' | 'dark';

export default function ThemeSettings() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentColorsHex, setCurrentColorsHex] = useState<Record<ThemeMode, Partial<ThemePalette>>>({
    light: {},
    dark: {},
  });

  const loadThemeSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const settingsDocRef = doc(firestore, WEB_SETTINGS_COLLECTION, WEB_SETTINGS_DOC_ID);
      const docSnap = await getDoc(settingsDocRef);
      if (docSnap.exists()) {
        const globalSettings = docSnap.data() as GlobalWebSettings;
        const loadedLightHexColors: Partial<ThemePalette> = {};
        const loadedDarkHexColors: Partial<ThemePalette> = {};

        colorSettingsGroups.flatMap(g => g.settings).forEach(config => {
          const lightHslValue = globalSettings.themeColors?.light?.[config.id];
          loadedLightHexColors[config.id] = lightHslValue ? hslStringToHex(lightHslValue) : hslStringToHex(DEFAULT_LIGHT_THEME_COLORS_HSL[config.id]!);
          
          const darkHslValue = globalSettings.themeColors?.dark?.[config.id];
          loadedDarkHexColors[config.id] = darkHslValue ? hslStringToHex(darkHslValue) : hslStringToHex(DEFAULT_DARK_THEME_COLORS_HSL[config.id]!);
        });
        setCurrentColorsHex({
          light: loadedLightHexColors,
          dark: loadedDarkHexColors,
        });
      } else {
        resetToDefaultColorsState();
      }
    } catch (error) {
      console.error("Error loading theme settings:", error);
      toast({ title: "Error", description: "Could not load theme settings.", variant: "destructive" });
      resetToDefaultColorsState();
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadThemeSettings();
  }, [loadThemeSettings]);

  const resetToDefaultColorsState = (mode?: ThemeMode) => {
    const newColors = { ...currentColorsHex };
    if (mode === 'light' || !mode) {
      const defaultLightHex: Partial<ThemePalette> = {};
      colorSettingsGroups.flatMap(g => g.settings).forEach(config => {
        defaultLightHex[config.id] = hslStringToHex(DEFAULT_LIGHT_THEME_COLORS_HSL[config.id]!);
      });
      newColors.light = defaultLightHex;
    }
    if (mode === 'dark' || !mode) {
      const defaultDarkHex: Partial<ThemePalette> = {};
      colorSettingsGroups.flatMap(g => g.settings).forEach(config => {
        defaultDarkHex[config.id] = hslStringToHex(DEFAULT_DARK_THEME_COLORS_HSL[config.id]!);
      });
      newColors.dark = defaultDarkHex;
    }
    setCurrentColorsHex(newColors);
    updateLivePreview(newColors);
  };

  const handleColorChange = (mode: ThemeMode, id: keyof ThemePalette, hexValue: string) => {
    const newColors = {
      ...currentColorsHex,
      [mode]: {
        ...currentColorsHex[mode],
        [id]: hexValue,
      },
    };
    setCurrentColorsHex(newColors);
    updateLivePreview(newColors);
  };
  
  const updateLivePreview = (colors: typeof currentColorsHex) => {
     const mode = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
     const palette = colors[mode];
     Object.entries(palette).forEach(([key, value]) => {
         if(value) {
            const hsl = hexToHslString(value);
            document.documentElement.style.setProperty(`--${key}`, hsl);
         }
     });
  };

  const handleSaveTheme = async () => {
    setIsSaving(true);
    try {
      const themeColorsToSave: ThemeColors = {
        light: {},
        dark: {},
      };
      (Object.keys(currentColorsHex.light) as Array<keyof ThemePalette>).forEach(key => {
        if (currentColorsHex.light[key]) {
          themeColorsToSave.light![key] = hexToHslString(currentColorsHex.light[key]!);
        }
      });
      (Object.keys(currentColorsHex.dark) as Array<keyof ThemePalette>).forEach(key => {
        if (currentColorsHex.dark[key]) {
          themeColorsToSave.dark![key] = hexToHslString(currentColorsHex.dark[key]!);
        }
      });

      await updateThemeSettings(themeColorsToSave);

      toast({ title: "Success", description: "Theme settings saved successfully." });
      router.refresh();
    } catch (error) {
      console.error("Error saving theme settings:", error);
      toast({ title: "Error", description: "Could not save theme settings.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleResetThemeModeToDefault = (mode: ThemeMode) => {
    resetToDefaultColorsState(mode);
    toast({ title: `${mode.charAt(0).toUpperCase() + mode.slice(1)} Theme Reset`, description: `${mode.charAt(0).toUpperCase() + mode.slice(1)} theme has been reset to default colors.` });
  };

  const handleResetAllToDefault = () => {
    resetToDefaultColorsState();
    toast({ title: "All Themes Reset", description: "Both light and dark themes have been reset to default colors." });
  };
  
  const renderColorInputs = (mode: ThemeMode) => {
    const defaultPalette = mode === 'light' ? DEFAULT_LIGHT_THEME_COLORS_HSL : DEFAULT_DARK_THEME_COLORS_HSL;
    return colorSettingsGroups.map((group) => (
        <div key={group.group} className='space-y-4'>
            <h3 className='text-lg font-semibold mt-4'>{group.group}</h3>
            <Separator />
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {group.settings.map((setting) => (
                <div key={`${mode}-${setting.id}`} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                    <div style={{ backgroundColor: currentColorsHex[mode]?.[setting.id] || '#ffffff' }} className="w-8 h-8 rounded-md border" />
                    <Label htmlFor={`${mode}-${setting.id}`} className="text-base font-medium">{setting.label}</Label>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Input
                    id={`${mode}-${setting.id}`}
                    type="color"
                    value={currentColorsHex[mode]?.[setting.id] || hslStringToHex(defaultPalette[setting.id]!)}
                    onChange={(e) => handleColorChange(mode, setting.id, e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                    disabled={isSaving}
                    />
                    <Input
                    type="text"
                    value={(currentColorsHex[mode]?.[setting.id] || hslStringToHex(defaultPalette[setting.id]!)).toUpperCase()}
                    onChange={(e) => handleColorChange(mode, setting.id, e.target.value)}
                    className="w-28 h-10"
                    placeholder="#RRGGBB"
                    disabled={isSaving}
                    />
                    <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleColorChange(mode, setting.id, hslStringToHex(defaultPalette[setting.id]!))}
                    title={`Reset ${setting.label} to default for ${mode} theme`}
                    disabled={isSaving || currentColorsHex[mode]?.[setting.id] === hslStringToHex(defaultPalette[setting.id]!)}
                    className={currentColorsHex[mode]?.[setting.id] === hslStringToHex(defaultPalette[setting.id]!) ? "opacity-50" : ""}
                    >
                    <XCircle className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                </div>
                </div>
            ))}
            </div>
        </div>
      ));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-3">Loading theme settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Palette className="mr-2 h-6 w-6 text-primary" /> Theme Settings
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your website for both Light and Dark modes. Changes will be reflected live.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="light" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="light"><Sun className="mr-2 h-4 w-4" /> Light Theme</TabsTrigger>
          <TabsTrigger value="dark"><Moon className="mr-2 h-4 w-4" /> Dark Theme</TabsTrigger>
        </TabsList>
        <TabsContent value="light">
          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Light Theme Colors</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleResetThemeModeToDefault('light')} disabled={isSaving}>
                        <RefreshCw className="mr-2 h-3 w-3" /> Reset Light Theme
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderColorInputs('light')}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="dark">
          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Dark Theme Colors</CardTitle>
                     <Button variant="outline" size="sm" onClick={() => handleResetThemeModeToDefault('dark')} disabled={isSaving}>
                        <RefreshCw className="mr-2 h-3 w-3" /> Reset Dark Theme
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderColorInputs('dark')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-6 mt-6">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isSaving}>
              <RefreshCw className="mr-2 h-4 w-4" /> Reset All Themes to Defaults
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will reset ALL theme colors (Light and Dark) to their original defaults. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetAllToDefault} disabled={isSaving} className="bg-destructive hover:bg-destructive/90">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Reset All Themes and Save
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button onClick={handleSaveTheme} disabled={isSaving} size="lg">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save All Theme Settings
        </Button>
      </CardFooter>
    </div>
  );
}
