"use client";

import { useState, useCallback, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { 
  Upload, 
  FileText, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download, 
  AlertCircle, 
  Loader2,
  RotateCcw,
  Play,
  GraduationCap,
  BarChart3
} from "lucide-react";
import { apiService, StudentEvaluation, EvaluationBatchResponse } from "@/services/api";

interface FileValidationResult {
  file: File;
  isValid: boolean;
  name?: string;
  regNo?: string;
  error?: string;
}

export default function EvaluationPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [problemStatement, setProblemStatement] = useState<string>("");
  const [additionalContext, setAdditionalContext] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [evaluationBatch, setEvaluationBatch] = useState<EvaluationBatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<FileValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation function
  const validateStudentFile = (file: File): Promise<FileValidationResult> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        
        if (lines.length < 3) {
          resolve({
            file,
            isValid: false,
            error: "File must have at least 3 lines (Name, Reg No, and code)"
          });
          return;
        }

        const nameLine = lines[0].trim();
        const regNoLine = lines[1].trim();

        if (!nameLine.toLowerCase().startsWith('name:')) {
          resolve({
            file,
            isValid: false,
            error: "First line must start with 'Name:'"
          });
          return;
        }

        if (!regNoLine.toLowerCase().startsWith('reg no:')) {
          resolve({
            file,
            isValid: false,
            error: "Second line must start with 'Reg No:'"
          });
          return;
        }

        const name = nameLine.substring(5).trim();
        const regNo = regNoLine.substring(7).trim();

        if (!name) {
          resolve({
            file,
            isValid: false,
            error: "Student name is required"
          });
          return;
        }

        if (!regNo) {
          resolve({
            file,
            isValid: false,
            error: "Registration number is required"
          });
          return;
        }

        resolve({
          file,
          isValid: true,
          name,
          regNo
        });
      };

      reader.onerror = () => {
        resolve({
          file,
          isValid: false,
          error: "Failed to read file"
        });
      };

      reader.readAsText(file);
    });
  };

  // Validate all selected files
  const validateFiles = async (files: File[]) => {
    setIsValidating(true);
    try {
      const results = await Promise.all(files.map(validateStudentFile));
      setValidationResults(results);
      return results;
    } finally {
      setIsValidating(false);
    }
  };

  // Handle file selection with validation similar to upload page
  const handleFileSelect = useCallback(async (files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name}: File size must be less than 5MB`);
        return;
      }

      // Check file type (allow common code file extensions)
      const allowedExtensions = [
        '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', 
        '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.dart'
      ];
      
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        errors.push(`${file.name}: Invalid file type for student evaluation`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(`Some files were rejected:\n${errors.join('\n')}`);
    } else {
      setError(null);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      await validateFiles(validFiles);
    }
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(Array.from(e.target.files));
    }
  };

  // Remove file from selection
  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    const newValidation = validationResults.filter((_, i) => i !== index);
    setValidationResults(newValidation);
  };

  // Clear all files
  const clearAllFiles = () => {
    setSelectedFiles([]);
    setValidationResults([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size utility
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Start evaluation
  const startEvaluation = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one file");
      return;
    }

    if (!problemStatement.trim()) {
      setError("Please provide a problem statement");
      return;
    }

    const validFiles = validationResults.filter(r => r.isValid);
    if (validFiles.length === 0) {
      setError("Please ensure all files have valid format");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await apiService.evaluateStudentBatch(
        validFiles.map(r => r.file),
        problemStatement,
        additionalContext || undefined
      );

      if (result.success) {
        setEvaluationBatch(result);
        // Start polling for status updates
        pollEvaluationStatus(result.batchId);
      } else {
        setError(result.message || "Failed to start evaluation");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start evaluation");
    } finally {
      setIsUploading(false);
    }
  };

  // Poll for evaluation status
  const pollEvaluationStatus = async (batchId: string) => {
    const poll = async () => {
      try {
        const status = await apiService.getEvaluationStatus(batchId);
        setEvaluationBatch(status);

        if (status.status === 'processing' && status.success) {
          setTimeout(poll, 2000); // Poll every 2 seconds
        }
      } catch (err) {
        console.error("Error polling status:", err);
        setError("Failed to get evaluation status");
      }
    };

    poll();
  };

  // Download CSV
  const downloadCSV = async () => {
    if (!evaluationBatch?.batchId) return;

    try {
      const blob = await apiService.downloadEvaluationCSV(evaluationBatch.batchId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluation_results_${evaluationBatch.batchId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download CSV");
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedFiles([]);
    setProblemStatement("");
    setAdditionalContext("");
    setEvaluationBatch(null);
    setError(null);
    setValidationResults([]);
  };

  const validFileCount = validationResults.filter(r => r.isValid).length;
  const invalidFileCount = validationResults.filter(r => !r.isValid).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-custom-dark-primary">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-custom-light mb-4">
            Student Code Evaluation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload student code files and provide a problem statement to generate batch evaluations with AI-powered scores
          </p>
        </div>

        {!evaluationBatch ? (
          <>
            {/* File Upload Section */}
            <div className="bg-white dark:bg-custom-dark-secondary rounded-lg shadow-lg p-8 mb-6">
              {selectedFiles.length === 0 ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                    isDragOver 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-custom-light mb-2">
                    Drop student code files here
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Each file must start with "Name: " and "Reg No: " headers
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="bg-custom-accent hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors text-lg"
                    >
                      Choose Student Files
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click the button above or drag & drop files
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileInputChange}
                    accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.dart"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Supported formats: JavaScript, TypeScript, Python, Java, C++, C#, PHP, Ruby, Go, Rust, Swift, Kotlin, Dart
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Maximum file size: 5MB per file. Each file must start with 'Name:' and 'Reg No:' headers
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-custom-light">
                      Selected Files ({selectedFiles.length})
                    </h3>
                    <button
                      onClick={clearAllFiles}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium flex items-center space-x-1"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Clear All</span>
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-6 w-6 text-custom-accent" />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-custom-light">
                              {file.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* File Validation Results */}
            {selectedFiles.length > 0 && (
              <div className="bg-white dark:bg-custom-dark-secondary rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-custom-light mb-4 flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  File Validation
                  {isValidating && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                </h3>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5 mr-1" />
                    <span className="font-medium">{validFileCount} Valid</span>
                  </div>
                  {invalidFileCount > 0 && (
                    <div className="flex items-center text-red-600 dark:text-red-400">
                      <XCircle className="h-5 w-5 mr-1" />
                      <span className="font-medium">{invalidFileCount} Invalid</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {validationResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        result.isValid
                          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                          : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {result.isValid ? (
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-custom-light">
                            {result.file.name}
                          </p>
                          {result.isValid ? (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {result.name} ({result.regNo})
                            </p>
                          ) : (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {result.error}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Problem Statement Section */}
            <div className="bg-white dark:bg-custom-dark-secondary rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-custom-light mb-4">
                Problem Statement *
              </h3>
              <textarea
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Describe the programming problem or assignment that students were asked to solve..."
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-custom-dark-primary text-gray-900 dark:text-custom-light placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-custom-accent focus:border-transparent"
                required
              />
              
              <h4 className="text-md font-medium text-gray-900 dark:text-custom-light mt-4 mb-2">
                Additional Context (Optional)
              </h4>
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Any additional context or specific evaluation criteria..."
                className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-custom-dark-primary text-gray-900 dark:text-custom-light placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-custom-accent focus:border-transparent"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Start Evaluation Button */}
            <div className="flex justify-center">
              <button
                onClick={startEvaluation}
                disabled={isUploading || validFileCount === 0 || !problemStatement.trim()}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  isUploading || validFileCount === 0 || !problemStatement.trim()
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-custom-accent hover:bg-blue-700 text-white"
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Starting Evaluation...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Start Evaluation ({validFileCount} files)
                  </>
                )}
              </button>
            </div>

            {/* Information Panel */}
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-custom-light mb-2">
                    How Student Evaluation Works
                  </h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Each file must start with "Name: " and "Reg No: " headers</li>
                    <li>• Files are evaluated based on code quality, logic, correctness, and best practices</li>
                    <li>• Scores are given out of 100 with letter grades (A+ to F)</li>
                    <li>• Evaluation typically takes 1-2 minutes per student file</li>
                    <li>• Results can be downloaded as CSV for easy grade book import</li>
                    <li>• Progress is tracked in real-time during batch processing</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-custom-dark-secondary rounded-lg shadow-lg p-6 mb-6">
            {/* Evaluation Results Section */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-custom-light flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Evaluation Results
              </h2>
              <div className="flex space-x-2">
                {evaluationBatch.status === 'completed' && (
                  <button
                    onClick={downloadCSV}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </button>
                )}
                <button
                  onClick={resetForm}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  New Evaluation
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Progress: {evaluationBatch.progress.processedFiles} / {evaluationBatch.progress.totalFiles}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {evaluationBatch.progress.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-custom-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${evaluationBatch.progress.percentage}%` }}
                />
              </div>
            </div>

            {/* Status Summary - Using upload page pattern */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Status</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-300 capitalize">
                      {evaluationBatch.status}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">Successful</p>
                    <p className="font-semibold text-green-900 dark:text-green-300">
                      {evaluationBatch.progress.successfulEvaluations}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400">Failed</p>
                    <p className="font-semibold text-red-900 dark:text-red-300">
                      {evaluationBatch.progress.failedEvaluations}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Table */}
            {evaluationBatch.students.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        File
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-custom-dark-secondary divide-y divide-gray-200 dark:divide-gray-700">
                    {evaluationBatch.students.map((student, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-custom-light">
                              {student.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {student.regNo}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-custom-light">
                          {student.filename}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.status === 'completed' && student.score !== null ? (
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-custom-light">
                                {student.score}/{student.maxScore}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {student.percentage}%
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.grade ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              student.grade.startsWith('A') ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                              student.grade.startsWith('B') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                              student.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {student.grade}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.status === 'completed' ? (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span className="text-sm">Completed</span>
                            </div>
                          ) : student.status === 'failed' ? (
                            <div className="flex items-center text-red-600 dark:text-red-400">
                              <XCircle className="h-4 w-4 mr-1" />
                              <span className="text-sm">Failed</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              <span className="text-sm">Processing</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Error Messages */}
            {evaluationBatch.errors.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-red-600 dark:text-red-400 mb-3">
                  Evaluation Errors
                </h4>
                <div className="space-y-2">
                  {evaluationBatch.errors.map((error, index) => (
                    <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        {error.filename}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {error.error}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
