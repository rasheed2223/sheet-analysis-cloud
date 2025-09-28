import { useState } from 'react';
import * as XLSX from 'xlsx';
import { FileUpload } from '@/components/FileUpload';
import { DataTable } from '@/components/DataTable';
import { Analytics } from '@/components/Analytics';
import { ChatAnalysis } from '@/components/ChatAnalysis';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Upload, FileSpreadsheet, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-dashboard.jpg';

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [data, setData] = useState<any[][] | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      setUploadedFile(file);
      setData(jsonData as any[][]);
      
      toast({
        title: "File uploaded successfully!",
        description: `Loaded ${jsonData.length} rows from ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Error uploading file",
        description: "Please make sure you're uploading a valid Excel file.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetData = () => {
    setUploadedFile(null);
    setData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-primary">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Excel Analytics Platform
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8">
              Upload, analyze, and visualize your Excel data with powerful insights
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-primary-foreground/80">
              <div className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Easy Upload</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Smart Analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Visual Insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {!data ? (
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-elegant bg-gradient-card backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-2">
                  Get Started
                </CardTitle>
                <p className="text-muted-foreground">
                  Upload your Excel file to begin analyzing your data
                </p>
              </CardHeader>
              <CardContent>
                <FileUpload 
                  onFileUpload={handleFileUpload}
                  uploadedFile={uploadedFile || undefined}
                />
                {loading && (
                  <div className="text-center mt-4">
                    <p className="text-muted-foreground">Processing your file...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header with file info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">{uploadedFile?.name}</h2>
                  <p className="text-muted-foreground">
                    {data.length - 1} rows • {data[0]?.length || 0} columns
                  </p>
                </div>
              </div>
              <Button onClick={resetData} variant="outline">
                Upload New File
              </Button>
            </div>

            {/* Tabs for different views */}
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preview">Data Preview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="chat">Chat Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="space-y-4">
                <DataTable data={data} fileName={uploadedFile?.name || ''} />
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-4">
                <Analytics data={data} />
              </TabsContent>
              
              <TabsContent value="chat" className="space-y-4">
                <ChatAnalysis data={data} fileName={uploadedFile?.name || ''} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;