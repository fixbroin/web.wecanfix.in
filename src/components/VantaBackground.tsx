
"use client";

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import type { SectionVantaConfig } from '@/types/firestore';

declare global {
  interface Window {
    VANTA: any;
  }
}

interface VantaBackgroundProps {
  sectionConfig: SectionVantaConfig | undefined;
  className?: string;
}

const VantaBackground = ({ sectionConfig, className }: VantaBackgroundProps) => {
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef(null);
  const { resolvedTheme } = useTheme();

  // Effect for creating and destroying the Vanta instance
  useEffect(() => {
    if (!sectionConfig?.enabled || !vantaRef.current || !window.VANTA) {
      return;
    }

    const effectName = sectionConfig.effect?.toUpperCase();
    if (!effectName || !window.VANTA[effectName]) {
      console.warn(`Vanta effect "${effectName}" not found.`);
      return;
    }
    
    const isDark = resolvedTheme === 'dark';
    const effect = window.VANTA[effectName]({
      el: vantaRef.current,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: isDark ? sectionConfig.color1 : sectionConfig.color2,
      backgroundColor: isDark ? sectionConfig.color2 : sectionConfig.color1,
      ...(sectionConfig.effect === 'BIRDS' && { birdSize: 1.5, speedLimit: 4, separation: 30, quantity: 3.0 }),
      ...(sectionConfig.effect === 'NET' && { maxDistance: 22.00, spacing: 18.00 }),
      ...(sectionConfig.effect === 'WAVES' && { waveHeight: 15.00, shininess: 40.00, waveSpeed: 0.5, zoom: 0.8 }),
    });

    setVantaEffect(effect);

    return () => {
      if (effect) {
        effect.destroy();
        setVantaEffect(null);
      }
    };
  }, [sectionConfig, resolvedTheme]); // Rerun if config or theme changes

  if (!sectionConfig?.enabled) {
    return null;
  }

  return <div ref={vantaRef} className={className || "absolute inset-0 -z-10"} />;
};

export default VantaBackground;
