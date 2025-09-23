import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Download, 
  Search, 
  Filter, 
  Grid, 
  List,
  FileVideo,
  FileAudio,
  FileText,
  Pause,
  Volume2,
  VolumeX,
  Eye,
  Trash2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFiles, CloudFile } from '@/contexts/FileContext';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'video' | 'audio' | 'pdf';

const FilesPage: React.FC = () => {
  const { files, removeFile } = useFiles();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedFile, setSelectedFile] = useState<CloudFile | null>(null);
  const [isPlaying, setIsPlaying] = useState<{ [key: string]: boolean }>({});
  const [isMuted, setIsMuted] = useState<{ [key: string]: boolean }>({});

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const downloadFile = (file: CloudFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: `Downloading ${file.name}`,
    });
  };

  const deleteFile = (file: CloudFile) => {
    removeFile(file.id);
    URL.revokeObjectURL(file.url); // Clean up blob URL
    toast({
      title: "File Deleted",
      description: `${file.name} has been removed`,
    });
  };

  const togglePlay = (fileId: string) => {
    setIsPlaying(prev => ({ ...prev, [fileId]: !prev[fileId] }));
  };

  const toggleMute = (fileId: string) => {
    setIsMuted(prev => ({ ...prev, [fileId]: !prev[fileId] }));
  };

  const getFileIcon = (type: CloudFile['type']) => {
    switch (type) {
      case 'video': return FileVideo;
      case 'audio': return FileAudio;
      case 'pdf': return FileText;
    }
  };

  const getTypeColor = (type: CloudFile['type']) => {
    switch (type) {
      case 'video': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'audio': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'pdf': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    }
  };

  const FilePreview: React.FC<{ file: CloudFile }> = ({ file }) => {
    const [isLoading, setIsLoading] = useState(true);

    switch (file.type) {
      case 'video':
        return (
          <div className="relative group">
            <video
              src={file.url}
              className="w-full h-48 object-cover rounded-lg"
              controls={viewMode === 'grid'}
              muted={isMuted[file.id]}
              onLoadedData={() => setIsLoading(false)}
              onPlay={() => setIsPlaying(prev => ({ ...prev, [file.id]: true }))}
              onPause={() => setIsPlaying(prev => ({ ...prev, [file.id]: false }))}
            />
            {isLoading && (
              <div className="absolute inset-0 bg-muted animate-pulse rounded-lg flex items-center justify-center">
                <FileVideo className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            {viewMode === 'list' && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <Button
                  size="sm"
                  variant="glass"
                  onClick={() => togglePlay(file.id)}
                >
                  {isPlaying[file.id] ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="glass"
                  onClick={() => toggleMute(file.id)}
                >
                  {isMuted[file.id] ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>
        );
        
      case 'audio':
        return (
          <div className="w-full h-48 bg-gradient-secondary rounded-lg flex flex-col items-center justify-center p-6">
            <FileAudio className="w-16 h-16 text-primary-foreground mb-4" />
            <audio
              src={file.url}
              controls
              className="w-full"
              onPlay={() => setIsPlaying(prev => ({ ...prev, [file.id]: true }))}
              onPause={() => setIsPlaying(prev => ({ ...prev, [file.id]: false }))}
            />
          </div>
        );
        
      case 'pdf':
        return (
          <div className="relative w-full h-48 bg-muted rounded-lg">
            <iframe
              src={`${file.url}#toolbar=0`}
              className="w-full h-full rounded-lg"
              title={file.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="glass"
                onClick={() => setSelectedFile(file)}
              >
                <Eye className="mr-2 w-4 h-4" />
                View Full
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                My Files
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                {filteredFiles.length} of {files.length} files
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  {(['all', 'video', 'audio', 'pdf'] as FilterType[]).map((type) => (
                    <Button
                      key={type}
                      variant={filterType === type ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilterType(type)}
                      className="capitalize"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Files Grid/List */}
        {filteredFiles.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No files found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Upload your first file to get started'
              }
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={viewMode === 'grid' ? 'file-grid' : 'space-y-4'}
          >
            <AnimatePresence>
              {filteredFiles.map((file, index) => {
                const FileIcon = getFileIcon(file.type);
                
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="card-premium overflow-hidden">
                      <CardContent className="p-0">
                        {viewMode === 'grid' ? (
                          <div>
                            <FilePreview file={file} />
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-sm truncate flex-1 mr-2">
                                  {file.name}
                                </h3>
                                <Badge className={getTypeColor(file.type)}>
                                  {file.type}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground mb-3 space-y-1">
                                <p>{formatBytes(file.size)}</p>
                                <p>{formatDate(file.uploadDate)}</p>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="glass"
                                  onClick={() => downloadFile(file)}
                                  className="flex-1"
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  Download
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteFile(file)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center p-4">
                            <div className="w-16 h-16 bg-gradient-secondary rounded-lg flex items-center justify-center mr-4">
                              <FileIcon className="w-8 h-8 text-primary-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold truncate mr-2">{file.name}</h3>
                                <Badge className={getTypeColor(file.type)}>
                                  {file.type}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatBytes(file.size)} • {formatDate(file.uploadDate)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <Button
                                size="sm"
                                variant="glass"
                                onClick={() => downloadFile(file)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteFile(file)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* PDF Modal */}
        <AnimatePresence>
          {selectedFile?.type === 'pdf' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelectedFile(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl h-[80vh] bg-background rounded-lg overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-semibold">{selectedFile.name}</h3>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <iframe
                  src={selectedFile.url}
                  className="w-full h-full"
                  title={selectedFile.name}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FilesPage;