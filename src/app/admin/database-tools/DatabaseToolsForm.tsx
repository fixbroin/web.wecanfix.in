
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Download, Upload, Loader2, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportDatabase, importDatabase } from './actions';

export default function DatabaseToolsForm() {
  const { toast } = useToast();
  const [isExporting, startExportTransition] = useTransition();
  const [isImporting, startImportTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleExport = () => {
    startExportTransition(async () => {
      try {
        const data = await exportDatabase();
        if (data) {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `webandbro-export-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast({ title: 'Success', description: 'Database exported successfully.' });
        } else {
            throw new Error('Export returned no data.');
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Export Failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast({ variant: 'destructive', title: 'No file selected', description: 'Please select a JSON file to import.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content !== 'string') {
        toast({ variant: 'destructive', title: 'Error reading file', description: 'Could not read the selected file.' });
        return;
      }
      
      startImportTransition(async () => {
        try {
          const result = await importDatabase(content);
          if (result.success) {
            toast({ title: 'Import Successful', description: 'Database has been overwritten with the imported data.' });
            setSelectedFile(null);
            // Reset file input
            const fileInput = document.getElementById('json-file') as HTMLInputElement;
            if(fileInput) fileInput.value = '';

          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
          });
        }
      });
    };
    reader.onerror = () => {
         toast({ variant: 'destructive', title: 'File Read Error', description: 'There was an error reading your file.' });
    }
    reader.readAsText(selectedFile);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Export Database</CardTitle>
          <CardDescription>
            Download a complete snapshot of all specified collections as a single JSON file. This is useful for backups or migrating data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Note on Exporting</AlertTitle>
            <AlertDescription>
              This tool exports predefined top-level collections. It does not handle nested subcollections within documents (e.g., chat messages). For complete backups, use the official Google Cloud Platform (GCP) Firestore export feature.
            </AlertDescription>
          </Alert>
          <Button onClick={handleExport} disabled={isExporting} className="mt-6">
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export Database to JSON
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import Database</CardTitle>
          <CardDescription>Import data from a JSON file that was previously exported using this tool.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning: This is a Destructive Action</AlertTitle>
            <AlertDescription>
              Importing will <span className="font-bold">overwrite</span> any existing documents with the same ID in the target collections. There is no undo. It is highly recommended to perform an export first.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="json-file">Select JSON File</Label>
            <Input id="json-file" type="file" accept="application/json" onChange={handleFileChange} />
          </div>
          <Button onClick={handleImport} disabled={isImporting || !selectedFile} variant="destructive">
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Import and Overwrite Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
