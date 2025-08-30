"use client";

import { useState, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { Upload, File, X, CheckCircle } from "lucide-react";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    // Check file type (allow common code file extensions)
    const allowedExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', 
      '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.dart', '.vue', '.html', 
      '.css', '.scss', '.less', '.json', '.xml', '.yaml', '.yml', '.sql'
    ];
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      alert("Please select a valid code file");
      return;
    }

    setSelectedFile(file);
    setUploadSuccess(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
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
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    
    // Simulate upload delay for demo purposes
    // In real implementation, this would be an API call to the backend
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
    }, 2000);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    <div className="min-h-screen bg-custom-light dark:bg-custom-dark-primary">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-custom-dark-primary dark:text-custom-light mb-4">
            Upload Code for Review
          </h1>
          <p className="text-lg text-gray-600 dark:text-custom-light/80">
            Upload your code file to get detailed AI-powered feedback and suggestions
          </p>
        </div>

        <div className="bg-white dark:bg-custom-dark-secondary rounded-lg shadow-lg p-8">
          {!selectedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragOver
                  ? "border-custom-accent bg-custom-accent/10 dark:bg-custom-accent/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-custom-dark-primary dark:text-custom-light mb-2">
                Drop your code file here
              </h3>
              <p className="text-gray-600 dark:text-custom-light/80 mb-4">
                or click to browse
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-custom-accent hover:bg-custom-accent/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileInputChange}
                accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.dart,.vue,.html,.css,.scss,.less,.json,.xml,.yaml,.yml,.sql"
              />
              <p className="text-sm text-gray-500 dark:text-custom-light/60 mt-4">
                Supported formats: JavaScript, TypeScript, Python, Java, C++, C#, PHP, Ruby, Go, Rust, Swift, Kotlin, Dart, Vue, HTML, CSS, JSON, XML, YAML, SQL
              </p>
              <p className="text-sm text-gray-500 dark:text-custom-light/60">
                Maximum file size: 10MB
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-custom-dark-primary rounded-lg">
                <div className="flex items-center space-x-3">
                  <File className="h-8 w-8 text-custom-accent" />
                  <div>
                    <h3 className="font-medium text-custom-dark-primary dark:text-custom-light">
                      {selectedFile.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-custom-light/80">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-custom-light/80 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {uploadSuccess ? (
                <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">File uploaded successfully!</span>
                </div>
              ) : (
                <div className="flex justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      isUploading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-custom-accent hover:bg-custom-accent/90"
                    } text-white`}
                  >
                    {isUploading ? "Uploading..." : "Upload for Review"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 bg-custom-accent/10 border border-custom-accent/20 rounded-lg p-6">
          <h3 className="font-medium text-custom-dark-primary dark:text-custom-light mb-2">
            What happens next?
          </h3>
          <ul className="text-sm text-gray-600 dark:text-custom-light/80 space-y-1">
            <li>• Your code will be analyzed by our AI system</li>
            <li>• We'll check for potential bugs, security issues, and performance problems</li>
            <li>• You'll receive detailed feedback with suggestions for improvement</li>
            <li>• The review typically takes 1-2 minutes to complete</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
