import React from 'react';
import { motion } from 'framer-motion';
import { Upload, FolderOpen, Play, BarChart3, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useFiles } from '@/contexts/FileContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { files } = useFiles();
  const navigate = useNavigate();

  const getFileStats = () => {
    const videoFiles = files.filter(f => f.type === 'video').length;
    const audioFiles = files.filter(f => f.type === 'audio').length;
    const pdfFiles = files.filter(f => f.type === 'pdf').length;
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    
    return { videoFiles, audioFiles, pdfFiles, totalSize };
  };

  const { videoFiles, audioFiles, pdfFiles, totalSize } = getFileStats();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const quickActions = [
    {
      title: 'Upload Files',
      description: 'Add new videos, audio, or PDFs',
      icon: Upload,
      action: () => navigate('/upload'),
      variant: 'hero' as const,
    },
    {
      title: 'Browse Files',
      description: 'View and manage your content',
      icon: FolderOpen,
      action: () => navigate('/files'),
      variant: 'glass' as const,
    },
  ];

  const stats = [
    { title: 'Total Files', value: files.length, icon: FolderOpen, color: 'text-primary' },
    { title: 'Videos', value: videoFiles, icon: Play, color: 'text-green-500' },
    { title: 'Audio Files', value: audioFiles, icon: BarChart3, color: 'text-blue-500' },
    { title: 'PDFs', value: pdfFiles, icon: Clock, color: 'text-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage your cloud content and stream your media files
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="card-premium">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Storage Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Storage Usage</span>
              </CardTitle>
              <CardDescription>
                Total storage used: {formatBytes(totalSize)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-muted rounded-full h-3">
                <motion.div 
                  className="bg-gradient-primary h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totalSize / (1024 * 1024 * 100)) * 100, 100)}%` }}
                  transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {Math.min((totalSize / (1024 * 1024 * 100)) * 100, 100).toFixed(1)}% of 100MB used
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="card-premium cursor-pointer" onClick={action.action}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <action.icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <span>{action.title}</span>
                    </CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant={action.variant} className="w-full">
                      <action.icon className="mr-2 h-4 w-4" />
                      {action.title}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Files */}
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-semibold mb-6">Recent Files</h2>
            <Card className="card-glass">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {files.slice(0, 5).map((file, index) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-glass-surface transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-secondary rounded-lg flex items-center justify-center">
                          {file.type === 'video' && <Play className="h-4 w-4 text-primary-foreground" />}
                          {file.type === 'audio' && <BarChart3 className="h-4 w-4 text-primary-foreground" />}
                          {file.type === 'pdf' && <Clock className="h-4 w-4 text-primary-foreground" />}
                        </div>
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatBytes(file.size)} • {file.uploadDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="glass" size="sm" onClick={() => navigate('/files')}>
                        View
                      </Button>
                    </motion.div>
                  ))}
                </div>
                {files.length > 5 && (
                  <div className="text-center mt-4">
                    <Button variant="ghost" onClick={() => navigate('/files')}>
                      View All Files
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;