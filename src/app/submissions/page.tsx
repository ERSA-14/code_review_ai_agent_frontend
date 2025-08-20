"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, ArrowLeft, Bot, Eye, CheckCircle, Loader2, Clock } from "lucide-react";
import { toast, Toaster } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiService, type SubmissionFile } from "@/services/api";
import { MarkdownReport } from "@/components/markdown-report";

type ExtendedSubmission = SubmissionFile & {
  language: string;
  status: string;
  hasReport?: boolean;
  reportContent?: string;
  reportTimestamp?: string;
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<ExtendedSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<{
    content: string;
    filename: string;
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const { files, reports } = await apiService.getFilesWithReports();
      
      const submissionsWithMetadata = files.map(file => ({
        ...file,
        language: getLanguageFromFilename(file.filename),
        status: "Accepted",
        hasReport: !!reports[file.filename],
        reportContent: reports[file.filename]?.report,
        reportTimestamp: reports[file.filename]?.timestamp
      }));
      
      setSubmissions(submissionsWithMetadata);
    } catch (error) {
      toast.error("Failed to load submissions", {
        description: "Network error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  const getLanguageFromFilename = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'javascript';
      case 'py': return 'python';
      case 'java': return 'java';
      case 'cpp': case 'cc': case 'cxx': return 'cpp';
      default: return 'javascript';
    }
  };

  const getProblemFromFilename = (filename: string): string => {
    // Extract problem number from filename like "solution_1_1234567890.js"
    const match = filename.match(/solution_(\d+)_/);
    return match ? `Problem ${match[1]}` : 'Unknown Problem';
  };

  const handleGenerateReport = async (filename: string) => {
    setIsGeneratingReport(filename);
    
    try {
      const response = await apiService.generateReport(
        filename,
        "General code review",
        "Comprehensive analysis of the submitted code"
      );
      
      if (response.success && response.report) {
        // Update the submission with the report
        setSubmissions(prev => prev.map(sub => 
          sub.filename === filename 
            ? { 
                ...sub, 
                hasReport: true, 
                reportContent: response.report,
                reportTimestamp: response.timestamp 
              }
            : sub
        ));
        
        toast.success("AI report generated successfully!");
      } else {
        toast.error("Report generation failed", {
          description: response.message || "Unknown error occurred"
        });
      }
    } catch (error) {
      toast.error("Report generation failed", {
        description: "Network error occurred"
      });
    } finally {
      setIsGeneratingReport(null);
    }
  };

  const handleViewReport = (submission: ExtendedSubmission) => {
    if (submission.hasReport && submission.reportContent) {
      setSelectedReport({
        content: submission.reportContent,
        filename: submission.filename,
        timestamp: submission.reportTimestamp || 'Unknown'
      });
    }
  };

  const getDifficultyColor = (filename: string) => {
    // This is a simple heuristic - in real app you'd store this info
    const random = filename.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % 3;
    switch (random) {
      case 0: return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20";
      case 1: return "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20";
      case 2: return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20";
      default: return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800";
    }
  };

  const getDifficultyText = (filename: string) => {
    const random = filename.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % 3;
    return ["Easy", "Medium", "Hard"][random];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Toaster position="top-right" />
        
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-1" />
                  Back to Problems
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Submissions</h1>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading submissions...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back to Problems
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Submissions</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.map((submission, index) => (
              <div key={submission.filename} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{submission.filename}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{getProblemFromFilename(submission.filename)}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(submission.filename)}`}
                    >
                      {getDifficultyText(submission.filename)}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      submission.status === 'Accepted' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {submission.status}
                    </span>
                  </div>
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    <div>{new Date(submission.uploadDate).toLocaleDateString()}</div>
                    <div>{new Date(submission.uploadDate).toLocaleTimeString()}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                    <span>Language: <strong>{submission.language}</strong></span>
                    <span>Size: <strong>{submission.size} bytes</strong></span>
                    <span>Runtime: <strong>68ms</strong></span>
                    <span>Memory: <strong>44.2MB</strong></span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {!submission.hasReport ? (
                      <button
                        onClick={() => handleGenerateReport(submission.filename)}
                        disabled={isGeneratingReport === submission.filename}
                        className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingReport === submission.filename ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Bot className="w-4 h-4 mr-2" />
                            Generate AI Report
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center text-green-600 dark:text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Report Ready
                          {submission.reportTimestamp && (
                            <span className="ml-2 flex items-center text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(submission.reportTimestamp).toLocaleString()}
                            </span>
                          )}
                        </span>
                        <button
                          onClick={() => handleViewReport(submission)}
                          className="flex items-center px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg text-sm hover:bg-green-700 dark:hover:bg-green-400 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Report
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No submissions found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Start by solving some problems and submitting your solutions!
            </p>
            <Link
              href="/"
              className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
            >
              Browse Problems
            </Link>
          </div>
        )}
      </main>

      {/* Report Modal */}
      {selectedReport && (
        <MarkdownReport
          content={selectedReport.content}
          filename={selectedReport.filename}
          timestamp={selectedReport.timestamp}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
