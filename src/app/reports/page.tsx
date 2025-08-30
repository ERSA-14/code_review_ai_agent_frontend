"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { FileText, Calendar, Eye, Loader2, AlertCircle } from "lucide-react";
import { apiService, ReportListItem } from "@/services/api";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
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

  const handleViewReport = async (reportFile: string) => {
    setLoadingReport(reportFile);
    setSelectedReport(reportFile);
    
    try {
      const result = await apiService.getExistingReport(reportFile);
      
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
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {reportContent}
              </div>
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
              <h2 className="text-lg font-medium text-gray-900">
                Reports ({reports.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {reports.map((report, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
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
                        onClick={() => handleViewReport(report.reportFile)}
                        disabled={loadingReport === report.reportFile}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                          loadingReport === report.reportFile
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {loadingReport === report.reportFile ? (
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
