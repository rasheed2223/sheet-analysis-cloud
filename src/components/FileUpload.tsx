import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  uploadedFile?: File;
}

export const FileUpload = ({ onFileUpload, uploadedFile }: FileUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  return (
    <Card className="p-8 border-dashed border-2 hover:border-primary/50 transition-colors shadow-card">
      <div
        {...getRootProps()}
        className={`
          flex flex-col items-center justify-center space-y-4 cursor-pointer
          ${isDragActive ? 'bg-primary/5' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {uploadedFile ? (
          <div className="flex items-center space-x-3 text-success">
            <FileSpreadsheet className="h-8 w-8" />
            <div>
              <p className="font-medium">{uploadedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {isDragActive ? 'Drop your file here' : 'Upload Excel File'}
              </h3>
              <p className="text-muted-foreground mb-4">
                Drag & drop your Excel file here, or click to browse
              </p>
              <Button variant="outline" className="pointer-events-none">
                Choose File
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};