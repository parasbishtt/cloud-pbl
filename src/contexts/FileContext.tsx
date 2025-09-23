import React, { createContext, useContext, useState } from 'react';

export interface CloudFile {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'pdf';
  size: number;
  url: string;
  uploadDate: Date;
  thumbnail?: string;
}

interface FileContextType {
  files: CloudFile[];
  addFile: (file: CloudFile) => void;
  removeFile: (id: string) => void;
  getFile: (id: string) => CloudFile | undefined;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const useFiles = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};

export const FileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<CloudFile[]>([]);

  const addFile = (file: CloudFile) => {
    setFiles(prev => [...prev, file]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const getFile = (id: string) => {
    return files.find(file => file.id === id);
  };

  const value = {
    files,
    addFile,
    removeFile,
    getFile,
  };

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
};