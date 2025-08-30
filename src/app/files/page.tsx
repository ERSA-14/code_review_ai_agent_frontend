"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { File, Calendar, HardDrive, Loader2, AlertCircle } from "lucide-react";
import { apiService, SubmissionFile } from "@/services/api";

export default function FilesPage() {
  const [files, setFiles] = useState<SubmissionFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

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

  const handleGenerateReport = async (filename: string) => {
    setGeneratingReport(filename);
    
    try {
      console.log('Generating report for:', filename);
      
      // Call the actual API to generate the report
      const result = await apiService.generateReport(filename, "Code review analysis", "General review");
      
      if (result.success) {
        alert(`Report generated successfully for ${filename}! You can view it in the Reports page.`);
        // Optionally refresh the page or redirect to reports
        window.location.href = '/reports';
      } else {
        alert(`Failed to generate report: ${result.message}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(null);
    }
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getFileTypeColor = (filename: string) => {
    const ext = getFileExtension(filename);
    const colors: { [key: string]: string } = {
      js: 'bg-yellow-100 text-yellow-800',
      jsx: 'bg-blue-100 text-blue-800',
      ts: 'bg-blue-100 text-blue-800',
      tsx: 'bg-blue-100 text-blue-800',
      py: 'bg-green-100 text-green-800',
      java: 'bg-orange-100 text-orange-800',
      cpp: 'bg-purple-100 text-purple-800',
      c: 'bg-purple-100 text-purple-800',
      cs: 'bg-purple-100 text-purple-800',
      php: 'bg-indigo-100 text-indigo-800',
      rb: 'bg-red-100 text-red-800',
      go: 'bg-cyan-100 text-cyan-800',
      rs: 'bg-orange-100 text-orange-800',
      html: 'bg-red-100 text-red-800',
      css: 'bg-blue-100 text-blue-800',
      json: 'bg-gray-100 text-gray-800',
    };
    return colors[ext] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Uploaded Files
            </h1>
            <p className="text-gray-600">
              Manage your uploaded code files and view their details
            </p>
          </div>
          <button
            onClick={fetchFiles}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-lg p-12">
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading files...</span>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No files uploaded yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start by uploading your code files for review
            </p>
            <a
              href="/upload"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Upload Files
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Files ({files.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {files.map((file, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <File className="h-8 w-8 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {file.filename}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFileTypeColor(file.filename)}`}>
                            .{getFileExtension(file.filename)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                      <button 
                        onClick={() => handleGenerateReport(file.filename)}
                        disabled={generatingReport === file.filename}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          generatingReport === file.filename
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {generatingReport === file.filename ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Generating...</span>
                          </div>
                        ) : (
                          'Generate Report'
                        )}
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
