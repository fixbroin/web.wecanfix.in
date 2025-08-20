
'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HomePageContent } from '@/app/admin/settings/actions/home-actions';

interface HeroMediaProps {
  media: HomePageContent;
}

export default function HeroMedia({ media }: HeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFullscreen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    const video = videoRef.current;
    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if ((video as any).mozRequestFullScreen) { /* Firefox */
      (video as any).mozRequestFullScreen();
    } else if ((video as any).webkitRequestFullscreen) { /* Chrome, Safari & Opera */
      (video as any).webkitRequestFullscreen();
    } else if ((video as any).msRequestFullscreen) { /* IE/Edge */
      (video as any).msRequestFullscreen();
    }
  };
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onFullscreenChange = () => {
      if (document.fullscreenElement === video) {
        video.muted = false;
        video.controls = true;
        video.setAttribute('controlsList', 'nodownload');
      } else {
        video.muted = true;
        video.controls = false;
        video.removeAttribute('controlsList');
      }
    };
    
    document.addEventListener('fullscreenchange', onFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };

  }, []);

  return (
    <div className="relative aspect-video w-full rounded-lg object-cover shadow-lg overflow-hidden bg-muted/50">
        {media.hero_media_type === 'video' ? (
            <>
                <video
                    ref={videoRef}
                    src={media.hero_media_url || "https://placehold.co/800x600.png"}
                    className="h-full w-full object-contain"
                    autoPlay
                    loop
                    muted
                    playsInline
                />
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-2 right-2 h-8 w-8 opacity-70 transition-opacity hover:opacity-100"
                    onClick={handleFullscreen}
                    aria-label="Play video in fullscreen with sound"
                >
                    <Expand className="h-4 w-4" />
                </Button>
            </>
        ) : (
            <Image
                src={media.hero_media_url || "https://placehold.co/800x600.png"}
                alt="Modern website design on a laptop screen"
                fill
                priority={true}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-full w-full object-contain"
                data-ai-hint="website laptop"
            />
        )}
    </div>
  );
}
