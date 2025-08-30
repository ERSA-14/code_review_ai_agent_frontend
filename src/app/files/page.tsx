"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { File, Calendar, HardDrive, Loader2, AlertCircle } from "lucide-react";
import { apiService, SubmissionFile } from "@/services/api";

export default function FilesPage() {
  const [files, setFiles] = useState<SubmissionFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiService.listFiles();
      
      if (result.success) {
        // Sort files by upload date in reverse chronological order (newest first)
        const sortedFiles = result.files.sort((a, b) => {
          const dateA = new Date(a.uploadDate).getTime();
          const dateB = new Date(b.uploadDate).getTime();
          return dateB - dateA; // Reverse order (newest first)
        });
        setFiles(sortedFiles);
      } else {
        setError(result.error || 'Failed to load files');
      }
    } catch (err) {
      setError('Failed to load files. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getFileTypeColor = (filename: string) => {
    const ext = getFileExtension(filename);
    const colors: { [key: string]: string } = {
      js: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      jsx: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      ts: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      tsx: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      py: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      java: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      cpp: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      c: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      cs: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      php: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      rb: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      go: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
      rs: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      html: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      css: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      json: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    };
    return colors[ext] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  return (
    <div className="min-h-screen bg-custom-light dark:bg-custom-dark-primary">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-custom-dark-primary dark:text-custom-light mb-2">
              Uploaded Files
            </h1>
            <p className="text-gray-600 dark:text-custom-light/80">
              Manage your uploaded code files and view their details
            </p>
          </div>
          <button
            onClick={fetchFiles}
            disabled={isLoading}
            className="bg-custom-accent hover:bg-custom-accent/90 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white dark:bg-custom-dark-secondary rounded-lg shadow-lg p-12">
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-custom-accent" />
              <span className="text-gray-600 dark:text-custom-light/80">Loading files...</span>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="bg-white dark:bg-custom-dark-secondary rounded-lg shadow-lg p-12 text-center">
            <File className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-custom-dark-primary dark:text-custom-light mb-2">
              No files uploaded yet
            </h3>
            <p className="text-gray-600 dark:text-custom-light/80 mb-4">
              Start by uploading your code files for review
            </p>
            <a
              href="/upload"
              className="inline-flex items-center bg-custom-accent hover:bg-custom-accent/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Upload Files
            </a>
          </div>
        ) : (
          <div className="bg-white dark:bg-custom-dark-secondary rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-custom-dark-primary dark:text-custom-light">
                Files ({files.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {files.map((file, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-custom-dark-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <File className="h-8 w-8 text-custom-accent" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium text-custom-dark-primary dark:text-custom-light truncate">
                            {file.filename}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFileTypeColor(file.filename)}`}>
                            .{getFileExtension(file.filename)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-custom-light/80">
                          <div className="flex items-center space-x-1">
                            <HardDrive className="h-4 w-4" />
                            <span>{formatFileSize(file.size)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(file.uploadDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="text-custom-accent hover:text-custom-accent/80 text-sm font-medium transition-colors">
                        Generate Report
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
