"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { FileText, Calendar, Eye, Loader2, AlertCircle, Trash2, CheckSquare, Square } from "lucide-react";
import { apiService, ReportListItem } from "@/services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const [isDeletingReports, setIsDeletingReports] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [deleteStatus, setDeleteStatus] = useState<string>('');

  useEffect(() => {
    fetchReports();
  }, []);

  // Auto-open a report if ?file=<originalFilename> is present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filename = params.get('file');
    if (filename) {
      handleViewReport(filename);
    }
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiService.listAllReports();
      
      if (result.success) {
        // Sort reports by generated date in reverse chronological order (newest first)
        const sortedReports = result.reports.sort((a, b) => {
          const dateA = new Date(a.generatedAt).getTime();
          const dateB = new Date(b.generatedAt).getTime();
          return dateB - dateA; // Reverse order (newest first)
        });
        setReports(sortedReports);
      } else {
        setError(result.error || 'Failed to load reports');
      }
    } catch (err) {
      setError('Failed to load reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReport = async (originalFilename: string) => {
    setLoadingReport(originalFilename);
    setSelectedReport(originalFilename);
    
    try {
      const result = await apiService.getExistingReport(originalFilename);
      
      if (result.success && result.report) {
        setReportContent(result.report);
      } else {
        setError(result.message || 'Failed to load report content');
        setReportContent(null);
      }
    } catch (err) {
      setError('Failed to load report content. Please try again.');
      setReportContent(null);
    } finally {
      setLoadingReport(null);
    }
  };

  const handleSelectReport = (filename: string) => {
    const newSelected = new Set(selectedReports);
    if (newSelected.has(filename)) {
      newSelected.delete(filename);
    } else {
      newSelected.add(filename);
    }
    setSelectedReports(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedReports.size === reports.length) {
      setSelectedReports(new Set());
    } else {
      setSelectedReports(new Set(reports.map(report => report.originalFilename)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedReports.size === 0) return;
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    const filenames = Array.from(selectedReports);
    setShowDeleteConfirmation(false);
    setIsDeletingReports(true);
    setDeleteProgress(0);
    setDeleteStatus(`Preparing to delete ${filenames.length} report(s)...`);
    setError(null);

    try {
      // Simulate progress updates
      setDeleteProgress(25);
      setDeleteStatus('Sending delete request...');
      
      const result = await apiService.deleteReports(filenames);
      
      setDeleteProgress(75);
      setDeleteStatus('Processing results...');
      
      if (result.success) {
        // Remove deleted reports from the list
        setReports(prevReports => 
          prevReports.filter(report => !selectedReports.has(report.originalFilename))
        );
        setSelectedReports(new Set());
        
        setDeleteProgress(100);
        setDeleteStatus(`Successfully deleted ${result.successCount} report(s)!`);
        
        // Hide progress after success
        setTimeout(() => {
          setIsDeletingReports(false);
          setDeleteProgress(0);
          setDeleteStatus('');
        }, 2000);
      } else {
        setError(result.message || 'Failed to delete reports');
        setIsDeletingReports(false);
        setDeleteProgress(0);
        setDeleteStatus('');
      }
    } catch (err) {
      setError('Failed to delete reports. Please try again.');
      setIsDeletingReports(false);
      setDeleteProgress(0);
      setDeleteStatus('');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
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

  if (selectedReport && reportContent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Report: {selectedReport}
            </h1>
            <button
              onClick={() => {
                setSelectedReport(null);
                setReportContent(null);
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Back to Reports
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="prose max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  pre: ({ children, ...props }) => (
                    <pre
                      {...props}
                      className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto border border-gray-800"
                    >
                      {children}
                    </pre>
                  ),
          code: ({ children, ...props }: any) => {
                    const isInline = !String(children).includes("\n");
                    if (isInline) {
                      return (
                        <code
                          {...props}
                          className="bg-gray-100 text-blue-700 px-1 py-0.5 rounded text-sm font-mono"
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
            <code {...props} className="bg-transparent text-gray-100 font-mono text-sm">
                        {children}
                      </code>
                    );
                  },
                  table: ({ children, ...props }) => (
                    <div className="overflow-x-auto my-4">
                      <table
                        {...props}
                        className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg"
                      >
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children, ...props }) => (
                    <th
                      {...props}
                      className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200"
                    >
                      {children}
                    </th>
                  ),
                  td: ({ children, ...props }) => (
                    <td
                      {...props}
                      className="px-4 py-2 text-sm text-gray-900 border-b border-gray-200"
                    >
                      {children}
                    </td>
                  ),
                  blockquote: ({ children, ...props }) => (
                    <blockquote
                      {...props}
                      className="border-l-4 border-blue-500 bg-blue-50 p-4 my-4 rounded-r-lg text-gray-800"
                    >
                      {children}
                    </blockquote>
                  ),
                  h1: ({ children, ...props }) => (
                    <h1
                      {...props}
                      className="text-2xl font-bold text-gray-900 mt-6 mb-4 border-b border-gray-200 pb-2"
                    >
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2 {...props} className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3 {...props} className="text-lg font-medium text-gray-900 mt-4 mb-2">
                      {children}
                    </h3>
                  ),
                  ul: ({ children, ...props }) => (
                    <ul {...props} className="list-disc list-inside space-y-1 my-4 text-gray-800">
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol {...props} className="list-decimal list-inside space-y-1 my-4 text-gray-800">
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }) => (
                    <li {...props} className="ml-4">
                      {children}
                    </li>
                  ),
                  p: ({ children, ...props }) => (
                    <p {...props} className="text-gray-800 leading-relaxed my-3">
                      {children}
                    </p>
                  ),
                }}
              >
                {reportContent}
              </ReactMarkdown>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Code Review Reports
            </h1>
            <p className="text-gray-600">
              View all generated code review reports and their insights
            </p>
          </div>
          <button
            onClick={fetchReports}
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

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirmation && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="h-6 w-6 text-amber-600" />
              <h3 className="text-lg font-medium text-amber-900">Confirm Deletion</h3>
            </div>
            <p className="text-amber-800 mb-4">
              Are you sure you want to delete {selectedReports.size} report(s)? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Delete Reports
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Delete Progress */}
        {isDeletingReports && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              <h3 className="text-lg font-medium text-blue-900">Deleting Reports</h3>
            </div>
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-blue-800">{deleteStatus}</span>
                <span className="text-sm text-blue-600 font-medium">{deleteProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${deleteProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-lg p-12">
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading reports...</span>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reports generated yet
            </h3>
            <p className="text-gray-600 mb-4">
              Upload some code files and generate reports to see them here
            </p>
            <div className="flex justify-center space-x-3">
              <a
                href="/upload"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Upload Files
              </a>
              <a
                href="/files"
                className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                View Files
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Reports ({reports.length})
                </h2>
                
                {/* Selection controls */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {selectedReports.size === reports.length ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                    <span>
                      {selectedReports.size === reports.length ? 'Deselect All' : 'Select All'}
                    </span>
                  </button>
                  
                  {selectedReports.size > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      disabled={isDeletingReports}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeletingReports ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span>
                        Delete Selected ({selectedReports.size})
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {reports.map((report, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleSelectReport(report.originalFilename)}
                        className="flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors"
                      >
                        {selectedReports.has(report.originalFilename) ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      
                      <div className="flex-shrink-0">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {report.originalFilename}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFileTypeColor(report.originalFilename)}`}>
                            .{getFileExtension(report.originalFilename)}
                          </span>
                          {report.hasReport && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Report Ready
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>{formatFileSize(report.fileSize)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Generated: {formatDate(report.generatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewReport(report.originalFilename)}
                        disabled={loadingReport === report.originalFilename}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                          loadingReport === report.originalFilename
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {loadingReport === report.originalFilename ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading...</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            <span>View Report</span>
                          </>
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
