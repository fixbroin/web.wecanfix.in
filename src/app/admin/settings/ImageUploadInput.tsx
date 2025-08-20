
"use client";

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Upload, X } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Progress } from '@/components/ui/progress';

interface ImageUploadInputProps {
  id: string; 
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  accept?: string;
}

const MAX_FILE_SIZE_MB = 10; // Increased for video
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

async function deleteImageFromFirebase(url: string) {
    if (!url.includes('firebasestorage.googleapis.com')) {
        return;
    }
    try {
        const fileRef = ref(storage, url);
        await deleteObject(fileRef);
    } catch (error: any) {
        if (error.code === 'storage/object-not-found') {
            console.warn("Media not found in Firebase Storage, it might have been already deleted.");
        } else {
            console.error("Error deleting media from Firebase Storage:", error);
            throw error;
        }
    }
}


export default function ImageUploadInput({ id, value, onChange, className, accept = "image/png, image/jpeg, image/webp, image/svg+xml, image/ico, .ico" }: ImageUploadInputProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const isPending = isUploading || isDeleting;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
            variant: 'destructive',
            title: 'File Too Large',
            description: `The selected file must be less than ${MAX_FILE_SIZE_MB}MB.`,
        });
        return;
    }

    const acceptedTypes = accept.split(',').map(t => t.trim());
    const isFileTypeAcceptable = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isFileTypeAcceptable) {
         toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: `Please select a valid file type. Accepted: ${accept}`,
        });
        return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
        if (value) {
            await deleteImageFromFirebase(value);
        }

        const fileExtension = file.name.split('.').pop();
        const filename = `uploads/${Date.now()}.${fileExtension}`;
        const storageRef = ref(storage, filename);
        
        const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type });

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload error:", error);
                 toast({
                    variant: 'destructive',
                    title: 'Upload Failed',
                    description: 'An unexpected error occurred during the upload.',
                });
                setUploadProgress(null);
                setIsUploading(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                onChange(downloadURL);
                toast({ description: 'Media uploaded successfully!' });
                setUploadProgress(null);
                setIsUploading(false);
            }
        )

    } catch (error) {
        console.error("Upload setup error:", error);
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: 'Could not start the upload process.',
        });
        setUploadProgress(null);
        setIsUploading(false);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!value) return;

    setIsDeleting(true);
    deleteImageFromFirebase(value)
      .then(() => {
        onChange('');
        toast({ description: 'Media removed.' });
      })
      .catch((error: any) => {
        toast({ description: `Error removing media: ${error.message}`, variant: 'destructive' });
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };
  
  const isVideo = value?.includes('.mp4') || value?.includes('.webm');

  return (
    <div className={cn("space-y-4", className)}>
        {value && (
            <div className="relative w-full aspect-video rounded-md overflow-hidden border bg-muted">
                 {isVideo ? (
                    <video src={value} className="w-full h-full object-contain" autoPlay loop muted playsInline />
                 ) : (
                    <Image src={value} alt="Preview" fill className="object-contain" />
                 )}
                 <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={handleRemoveImage}
                    disabled={isPending}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        )}
        <div className="flex items-center gap-4">
            <Input id={id} type="file" onChange={handleFileChange} disabled={isPending} className="hidden" accept={accept} />
            <label htmlFor={id} className={cn(buttonVariants({ variant: 'outline' }), 'cursor-pointer w-full', isPending && 'pointer-events-none opacity-50')}>
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? `Uploading...` : 'Change Media'}
            </label>
        </div>
        {isUploading && uploadProgress !== null && (
          <Progress value={uploadProgress} className="w-full" />
        )}
        <div className="space-y-2">
            <label htmlFor={`${id}-url`} className="text-sm font-medium text-muted-foreground">Or paste media URL</label>
            <Input
                id={`${id}-url`}
                type="text"
                placeholder="https://example.com/media.png"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={isPending}
            />
        </div>
    </div>
  );
}
