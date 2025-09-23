import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileVideo, FileAudio, FileText, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useFiles, CloudFile } from '@/contexts/FileContext';
import { useToast } from '@/hooks/use-toast';

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  id: string;
}

const UploadPage: React.FC = () => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addFile } = useFiles();
  const { toast } = useToast();

  const acceptedTypes = {
    'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm'],
    'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.ogg'],
    'application/pdf': ['.pdf'],
  };

  const getFileType = (file: File): 'video' | 'audio' | 'pdf' | null => {
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type === 'application/pdf') return 'pdf';
    return null;
  };

  const getFileIcon = (type: 'video' | 'audio' | 'pdf') => {
    switch (type) {
      case 'video': return FileVideo;
      case 'audio': return FileAudio;
      case 'pdf': return FileText;
    }
  };

  const simulateUpload = (uploadingFile: UploadingFile) => {
    const interval = setInterval(() => {
      setUploadingFiles(prev => prev.map(uf => {
        if (uf.id === uploadingFile.id) {
          const newProgress = Math.min(uf.progress + Math.random() * 15, 100);
          
          if (newProgress >= 100) {
            clearInterval(interval);
            
            // Create file URL (in production, this would be from your backend)
            const fileUrl = URL.createObjectURL(uf.file);
            const fileType = getFileType(uf.file);
            
            if (fileType) {
              const cloudFile: CloudFile = {
                id: uf.id,
                name: uf.file.name,
                type: fileType,
                size: uf.file.size,
                url: fileUrl,
                uploadDate: new Date(),
              };
              
              addFile(cloudFile);
              
              toast({
                title: "Upload Complete",
                description: `${uf.file.name} has been uploaded successfully.`,
              });
            }
            
            return { ...uf, progress: 100, status: 'completed' as const };
          }
          
          return { ...uf, progress: newProgress };
        }
        return uf;
      }));
    }, 200 + Math.random() * 300);
  };

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const type = getFileType(file);
      if (!type) {
        toast({
          title: "Unsupported File Type",
          description: `${file.name} is not supported. Please upload video, audio, or PDF files.`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "File Too Large",
          description: `${file.name} is too large. Maximum file size is 50MB.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading',
      id: Math.random().toString(36).substr(2, 9),
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);
    
    // Start upload simulation for each file
    newUploadingFiles.forEach(simulateUpload);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const removeFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(uf => uf.id !== id));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Upload Files
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Upload your videos, audio files, and PDFs to the cloud
          </p>
        </motion.div>

        {/* Upload Zone */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card 
            className={`card-glass transition-all duration-300 ${
              isDragOver ? 'border-primary bg-primary/5 scale-[1.02]' : ''
            }`}
          >
            <CardContent className="p-8">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                className={`upload-zone ${isDragOver ? 'border-primary/50 bg-primary/5' : ''}`}
              >
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Drop files here or click to browse</h3>
                <p className="text-muted-foreground mb-4">
                  Support for videos, audio files, and PDFs up to 50MB each
                </p>
                <Button variant="premium" size="lg" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="video/*,audio/*,application/pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Supported Formats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="card-premium">
            <CardHeader>
              <CardTitle>Supported Formats</CardTitle>
              <CardDescription>File types and formats we support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <FileVideo className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-semibold">Video Files</h4>
                  <p className="text-sm text-muted-foreground">MP4, AVI, MOV, MKV, WebM</p>
                </div>
                <div className="text-center">
                  <FileAudio className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-semibold">Audio Files</h4>
                  <p className="text-sm text-muted-foreground">MP3, WAV, FLAC, AAC, OGG</p>
                </div>
                <div className="text-center">
                  <FileText className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <h4 className="font-semibold">Documents</h4>
                  <p className="text-sm text-muted-foreground">PDF</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload Progress */}
        {uploadingFiles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="card-glass">
              <CardHeader>
                <CardTitle>Upload Progress</CardTitle>
                <CardDescription>
                  {uploadingFiles.filter(f => f.status === 'completed').length} of {uploadingFiles.length} files completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploadingFiles.map((uploadingFile) => {
                    const fileType = getFileType(uploadingFile.file);
                    const FileIcon = fileType ? getFileIcon(fileType) : FileText;
                    
                    return (
                      <motion.div
                        key={uploadingFile.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center space-x-4 p-4 rounded-lg bg-glass-surface border border-glass-border"
                      >
                        <FileIcon className="w-8 h-8 text-primary" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{uploadingFile.file.name}</span>
                            <div className="flex items-center space-x-2">
                              {uploadingFile.status === 'completed' ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  {Math.round(uploadingFile.progress)}%
                                </span>
                              )}
                              <button
                                onClick={() => removeFile(uploadingFile.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Progress value={uploadingFile.progress} className="flex-1" />
                            <span className="text-xs text-muted-foreground">
                              {formatBytes(uploadingFile.file.size)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;