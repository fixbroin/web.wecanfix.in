
'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getTestimonials, Testimonial } from '@/app/admin/testimonials/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import VantaBackground from '../VantaBackground';
import { getVantaSettings } from '@/app/admin/settings/actions/vanta-actions';
import type { VantaSettings } from '@/types/firestore';
import ScrollAnimation from '../ScrollAnimation';
import { cn } from '@/lib/utils';
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"


function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
            <Star
            key={i}
            className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
        ))}
        </div>
    );
}

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
    <Card className="flex flex-col justify-between h-full shadow-lg">
        <CardContent className="flex flex-col items-start gap-4 p-6">
            <StarRating rating={testimonial.rating} />
            <p className="text-muted-foreground italic">&ldquo;{testimonial.description}&rdquo;</p>
            <div className="flex items-center gap-4 pt-4 mt-auto">
                <Avatar>
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{testimonial.name}</p>
                </div>
            </div>
        </CardContent>
    </Card>
)

export default function TestimonialSection() {
    const [testimonials, setTestimonials] = React.useState<Testimonial[]>([]);
    const [vantaSettings, setVantaSettings] = React.useState<VantaSettings | null>(null);

    const plugin = React.useRef(
        Autoplay({ delay: 2000, stopOnInteraction: true, stopOnMouseEnter: true })
    );

    React.useEffect(() => {
        async function fetchData() {
            const [testimonialsData, vantaData] = await Promise.all([
                getTestimonials(),
                getVantaSettings()
            ]);
            setTestimonials(testimonialsData);
            setVantaSettings(vantaData);
        }
        fetchData();
    }, []);

    const sectionVantaConfig = vantaSettings?.sections?.testimonials;
    const useVanta = vantaSettings?.globalEnable && sectionVantaConfig?.enabled;
    
    if (testimonials.length === 0) {
        return null; // Don't render the section if there are no testimonials
    }

  return (
    <section id="testimonials" className={cn("relative", !useVanta && 'bg-secondary')}>
       {useVanta && <VantaBackground sectionConfig={sectionVantaConfig} />}
      <div className="container">
        <ScrollAnimation as="div" variant="fadeInUp" className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl" style={useVanta ? { color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' } : {}}>What Our Clients Say</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground" style={useVanta ? { color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.4)' } : {}}>
                Real stories from satisfied partners who have achieved success with our services.
            </p>
        </ScrollAnimation>
      </div>
      
      <div className="mt-12">
        <Carousel
            opts={{
                align: "start",
                loop: true,
            }}
            plugins={[plugin.current]}
            className="w-full"
            >
            <CarouselContent>
                {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="basis-full md:basis-1/2 lg:basis-1/3">
                    <div className='p-2 h-full'>
                        <TestimonialCard testimonial={testimonial} />
                    </div>
                </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
