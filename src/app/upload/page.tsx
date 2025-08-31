"use client";

import { useState, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { Upload, File, X, CheckCircle, AlertCircle, ChevronDown, ChevronUp, BarChart3, Trash2 } from "lucide-react";
import { apiService } from "@/services/api";

interface UploadedFile {
  filename: string;
  originalname: string;
  size: number;
  status: 'success' | 'error';
  error?: string;
}

interface UploadStats {
  totalFiles: number;
  totalSize: number;
  totalSizeMB: string;
  fileTypes: { [key: string]: number };
  uploadTrends: Array<{ date: string; count: number }>;
}

export default function UploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadedFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      // Check file size (5MB limit for bulk upload)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name}: File size must be less than 5MB`);
        return;
      }

      // Check file type (allow common code file extensions)
      const allowedExtensions = [
        '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', 
        '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.dart', '.vue', '.html', 
        '.css', '.scss', '.sass', '.less', '.json', '.xml', '.yaml', '.yml', '.sql',
        '.md', '.txt', '.sh', '.bat', '.ps1', '.dockerfile', '.gitignore'
      ];
      
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        errors.push(`${file.name}: Invalid file type`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert(`Some files were rejected:\n${errors.join('\n')}`);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setUploadResults([]);
      setUploadError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadResults([]);
    
    try {
      const result = await apiService.uploadFiles(selectedFiles);
      
      if (result.success) {
        setUploadResults(result.uploadedFiles.map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          size: file.size,
          status: 'success' as const
        })));
        
        // Add any errors from partial failures
        if (result.errors && result.errors.length > 0) {
          const errorFiles = result.errors.map(error => ({
            filename: error.filename,
            originalname: error.filename,
            size: 0,
            status: 'error' as const,
            error: error.error
          }));
          setUploadResults(prev => [...prev, ...errorFiles]);
        }
      } else {
        setUploadError(result.message || 'Upload failed');
      }
    } catch (error) {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (selectedFiles.length === 1) {
      setUploadResults([]);
      setUploadError(null);
    }
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setUploadResults([]);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadUploadStats = async () => {
    setIsLoadingStats(true);
    try {
      const stats = await apiService.getUploadStats();
      if (stats.success) {
        setUploadStats(stats.stats);
      }
    } catch (error) {
      console.error('Failed to load upload stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const toggleStats = () => {
    setShowStats(!showStats);
    if (!showStats && !uploadStats) {
      loadUploadStats();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Upload Code for Review
          </h1>
          <p className="text-lg text-gray-600">
            Upload your code files to get detailed AI-powered feedback and suggestions
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {selectedFiles.length === 0 ? (
            <>
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                isDragOver 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-300 hover:border-gray-400"
                }`}

                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drop your code files here
              </h3>
              <p className="text-gray-600 mb-4">
                or click anywhere in this area to browse (supports multiple files)
              </p>
              <div className="space-y-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors text-lg"
                >
                  Choose Files
                </button>
                <p className="text-sm text-gray-500">
                  Click the button above or drag & drop files
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileInputChange}
                accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.dart,.vue,.html,.css,.scss,.sass,.less,.json,.xml,.yaml,.yml,.sql,.md,.txt,.sh,.bat,.ps1,.dockerfile,.gitignore"
              />
              <p className="text-sm text-gray-500 mt-4">
                Supported formats: JavaScript, TypeScript, Python, Java, C++, C#, PHP, Ruby, Go, Rust, Swift, Kotlin, Dart, Vue, HTML, CSS, JSON, XML, YAML, SQL, Markdown, Scripts, Config files
              </p>
              <p className="text-sm text-gray-500">
                Maximum file size: 5MB per file, up to 50 files (50MB total)
              </p>
            </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Selected Files ({selectedFiles.length})
                </h3>
                <button
                  onClick={clearAllFiles}
                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear All</span>
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <File className="h-6 w-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {file.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>

              {uploadResults.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Upload Results</h4>
                    <div className="space-y-2">
                      {uploadResults.map((result, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {result.status === 'success' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm text-gray-900">{result.originalname}</span>
                          </div>
                          {result.status === 'error' && result.error && (
                            <span className="text-sm text-red-600">{result.error}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={clearAllFiles}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Upload More
                    </button>
                    <a
                      href="/files"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      View All Files
                    </a>
                  </div>
                </div>
              ) : uploadError ? (
                <div className="flex items-center justify-center space-x-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">{uploadError}</span>
                </div>
              ) : (
                <div className="flex justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      isUploading
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {isUploading ? "Uploading..." : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''} for Review`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upload Statistics Dropdown */}
        <div className="mt-8 bg-white rounded-lg shadow-lg">
          <button
            onClick={toggleStats}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">Upload Statistics</span>
            </div>
            {showStats ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {showStats && (
            <div className="px-6 pb-6 border-t border-gray-200">
              {isLoadingStats ? (
                <div className="text-center py-8 text-gray-500">Loading statistics...</div>
              ) : uploadStats ? (
                <div className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900">Total Files</h4>
                      <p className="text-2xl font-bold text-blue-700">{uploadStats.totalFiles}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900">Total Size</h4>
                      <p className="text-2xl font-bold text-green-700">{uploadStats.totalSizeMB} MB</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900">File Types</h4>
                      <p className="text-2xl font-bold text-purple-700">{Object.keys(uploadStats.fileTypes).length}</p>
                    </div>
                  </div>
                  
                  {Object.keys(uploadStats.fileTypes).length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">File Types Breakdown</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(uploadStats.fileTypes).map(([type, count]) => (
                          <div key={type} className="bg-gray-50 p-2 rounded text-sm">
                            <span className="font-medium">{type}:</span> {count}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {uploadStats.uploadTrends.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Recent Upload Activity</h4>
                      <div className="space-y-1">
                        {uploadStats.uploadTrends.slice(-5).map((trend, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{trend.date}</span>
                            <span className="font-medium">{trend.count} files</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">Failed to load statistics</div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-2">
            What happens next?
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Your code files will be analyzed by our AI system</li>
            <li>• We'll check for potential bugs, security issues, and performance problems</li>
            <li>• You'll receive detailed feedback with suggestions for improvement</li>
            <li>• Bulk uploads are processed efficiently with progress tracking</li>
            <li>• The review typically takes 1-2 minutes per file to complete</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
