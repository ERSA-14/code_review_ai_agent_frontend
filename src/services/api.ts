// API service for communicating with the backend
const API_BASE_URL = 'http://localhost:3000/api'; // Updated to match backend port

export interface SubmissionFile {
  filename: string;
  size: number;
  uploadDate: string;
  modifiedDate: string;
  url: string;
}

export interface GenerateReportResponse {
  success: boolean;
  message: string;
  filename?: string;
  report?: string;
  timestamp?: string;
  metadata?: any;
  reportFilename?: string;
  cached?: boolean;
  generatedAt?: string;
  error?: string;
}

export interface ReportListItem {
  reportFile: string;
  originalFilename: string;
  timestamp: string;
  generatedAt: string;
  fileSize: number;
  hasReport: boolean;
  metadata: any;
}

export interface ListReportsResponse {
  success: boolean;
  count: number;
  reports: ReportListItem[];
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  file?: {
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    path: string;
  };
  error?: string;
}

export interface BulkUploadResponse {
  success: boolean;
  message: string;
  uploadedFiles: Array<{
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    path: string;
    uploadDate: string;
  }>;
  totalFiles: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    filename: string;
    error: string;
  }>;
}

export interface UploadStatsResponse {
  success: boolean;
  stats: {
    totalFiles: number;
    totalSize: number;
    totalSizeMB: string;
    fileTypes: { [key: string]: number };
    uploadTrends: Array<{ date: string; count: number }>;
  };
  error?: string;
}

export interface BulkDeleteResponse {
  success: boolean;
  message: string;
  deletedFiles: string[];
  totalRequested: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    filename: string;
    error: string;
  }>;
}

export interface BulkReportGenerationResponse {
  success: boolean;
  message: string;
  batchId: string;
  totalRequested: number;
  successCount: number;
  errorCount: number;
  processedFiles: Array<{
    filename: string;
    success: boolean;
    reportFilename?: string;
    cached?: boolean;
    generatedAt: string;
    error?: string;
  }>;
  summary: {
    totalFiles: number;
    successCount: number;
    errorCount: number;
    skippedCount: number;
    totalTimeMs: number;
    averageTimePerFile: number;
  };
  errors: Array<{
    filename: string;
    error: string;
  }>;
}

export interface ListFilesResponse {
  success: boolean;
  count: number;
  files: SubmissionFile[];
  error?: string;
}

class ApiService {
  async uploadFile(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Upload failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async uploadFiles(files: File[]): Promise<BulkUploadResponse> {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${API_BASE_URL}/upload/bulk`, {
        method: 'POST',
        body: formData,
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Bulk upload failed',
        uploadedFiles: [],
        totalFiles: files.length,
        successCount: 0,
        errorCount: files.length,
        errors: files.map(file => ({
          filename: file.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        }))
      };
    }
  }

  async getUploadStats(): Promise<UploadStatsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/upload/stats`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        stats: {
          totalFiles: 0,
          totalSize: 0,
          totalSizeMB: '0.00',
          fileTypes: {},
          uploadTrends: []
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async uploadFileFromCode(code: string, filename: string, language: string): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      const blob = new Blob([code], { type: 'text/plain' });
      formData.append('file', blob, filename);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Upload failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async listFiles(): Promise<ListFilesResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/upload/list`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        count: 0,
        files: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Helper function to detect language from filename
  private getLanguageFromFilename(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'py':
        return 'python';
      case 'cpp':
      case 'cxx':
      case 'cc':
        return 'cpp';
      case 'c':
        return 'c';
      case 'java':
        return 'java';
      case 'cs':
        return 'csharp';
      case 'php':
        return 'php';
      case 'rb':
        return 'ruby';
      case 'go':
        return 'go';
      case 'rs':
        return 'rust';
      case 'swift':
        return 'swift';
      case 'kt':
        return 'kotlin';
      default:
        return 'unknown';
    }
  }

  async generateReport(
    filename: string, 
    problemStatement?: string, 
    additionalContext?: string
  ): Promise<GenerateReportResponse> {
    try {
      const language = this.getLanguageFromFilename(filename);
      
      // Include language in additional context since backend doesn't use the language field
      const enhancedContext = `Language: ${language}\nFile Extension: .${filename.split('.').pop()}\n${additionalContext || ''}`;
      
      // Simple, clean request body
      const requestBody = {
        problemStatement: problemStatement || '',
        additionalContext: enhancedContext
      };
      
      const response = await fetch(`${API_BASE_URL}/report/file/${filename}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Always try to get the JSON response, even for errors
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Backend error response:', result);
        return {
          success: false,
          message: result.message || 'Report generation failed',
          error: result.error || `HTTP error! status: ${response.status}`
        };
      }

      return result;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        message: 'Report generation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async generateReportFromCode(
    code: string,
    filename: string,
    problemStatement?: string,
    additionalContext?: string
  ): Promise<GenerateReportResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/report/code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          filename,
          problemStatement,
          additionalContext,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Report generation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getExistingReport(filename: string): Promise<GenerateReportResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/report/file/${filename}`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve report',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async listAllReports(): Promise<ListReportsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/report/list`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        count: 0,
        reports: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getFilesWithReports(): Promise<{
    files: SubmissionFile[];
    reports: { [filename: string]: GenerateReportResponse };
  }> {
    try {
      const [filesResponse, reportsResponse] = await Promise.all([
        this.listFiles(),
        this.listAllReports()
      ]);

      const files = filesResponse.success ? filesResponse.files : [];
      const reports: { [filename: string]: GenerateReportResponse } = {};

      if (reportsResponse.success) {
        // For each file, check if it has a corresponding report
        for (const file of files) {
          const reportItem = reportsResponse.reports.find(
            r => r.originalFilename === file.filename
          );
          
          if (reportItem) {
            // Get the full report content
            const reportResponse = await this.getExistingReport(file.filename);
            if (reportResponse.success) {
              reports[file.filename] = reportResponse;
            }
          }
        }
      }

      return { files, reports };
    } catch (error) {
      console.error('Error getting files with reports:', error);
      return { files: [], reports: {} };
    }
  }

  async deleteFiles(filenames: string[]): Promise<BulkDeleteResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/upload/bulk`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filenames })
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Bulk delete failed',
        deletedFiles: [],
        totalRequested: filenames.length,
        successCount: 0,
        errorCount: filenames.length,
        errors: filenames.map(filename => ({
          filename,
          error: error instanceof Error ? error.message : 'Unknown error'
        }))
      };
    }
  }

  async deleteReports(filenames: string[]): Promise<BulkDeleteResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/report/bulk`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filenames })
      });

      const result = await response.json();
      
      // Transform backend response to match BulkDeleteResponse interface
      return {
        success: result.success,
        message: result.message,
        deletedFiles: result.deletedReports?.map((r: any) => r.filename) || [],
        totalRequested: result.totalRequested || filenames.length,
        successCount: result.successCount || 0,
        errorCount: result.errorCount || 0,
        errors: result.errors || []
      };
    } catch (error) {
      return {
        success: false,
        message: 'Bulk report delete failed',
        deletedFiles: [],
        totalRequested: filenames.length,
        successCount: 0,
        errorCount: filenames.length,
        errors: filenames.map(filename => ({
          filename,
          error: error instanceof Error ? error.message : 'Unknown error'
        }))
      };
    }
  }

  async generateBulkReports(
    filenames: string[],
    options: {
      problemStatement?: string;
      additionalContext?: string;
      maxConcurrent?: number;
      forceRegenerate?: boolean;
      skipExisting?: boolean;
    } = {}
  ): Promise<BulkReportGenerationResponse> {
    try {
      const requestBody = {
        filenames,
        options: {
          problemStatement: options.problemStatement || '',
          additionalContext: options.additionalContext || '',
          maxConcurrent: options.maxConcurrent || 3,
          forceRegenerate: options.forceRegenerate || false,
          skipExisting: options.skipExisting || true
        }
      };

      console.log('Bulk report request:', requestBody); // Debug log

      const response = await fetch(`${API_BASE_URL}/report/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('Bulk report response:', result); // Debug log

      if (!response.ok) {
        console.error('Backend error response:', result);
        return {
          success: false,
          message: result.message || 'Bulk report generation failed',
          batchId: '',
          totalRequested: filenames.length,
          successCount: 0,
          errorCount: filenames.length,
          processedFiles: [],
          summary: {
            totalFiles: filenames.length,
            successCount: 0,
            errorCount: filenames.length,
            skippedCount: 0,
            totalTimeMs: 0,
            averageTimePerFile: 0
          },
          errors: [{
            filename: 'request',
            error: result.error || `HTTP error! status: ${response.status}`
          }]
        };
      }

      // Transform backend response to match our interface
      return {
        success: result.success,
        message: result.message,
        batchId: result.batchId || '',
        totalRequested: result.summary?.totalRequested || filenames.length,
        successCount: result.summary?.successCount || 0,
        errorCount: result.summary?.errorCount || 0,
        processedFiles: (result.results || []).map((r: any) => ({
          filename: r.filename,
          success: r.status === 'success',
          reportFilename: r.reportFilename,
          cached: r.status === 'skipped',
          generatedAt: r.timestamp || new Date().toISOString(),
          error: r.status === 'error' ? r.message : undefined
        })),
        summary: {
          totalFiles: result.summary?.totalRequested || filenames.length,
          successCount: result.summary?.successCount || 0,
          errorCount: result.summary?.errorCount || 0,
          skippedCount: result.summary?.skippedCount || 0,
          totalTimeMs: result.summary?.processingTimeMs || 0,
          averageTimePerFile: result.summary?.processingTimeMs ? 
            (result.summary.processingTimeMs / filenames.length) / 1000 : 0
        },
        errors: result.errors || []
      };
    } catch (error) {
      console.error('Bulk report generation error:', error);
      return {
        success: false,
        message: 'Bulk report generation failed',
        batchId: '',
        totalRequested: filenames.length,
        successCount: 0,
        errorCount: filenames.length,
        processedFiles: [],
        summary: {
          totalFiles: filenames.length,
          successCount: 0,
          errorCount: filenames.length,
          skippedCount: 0,
          totalTimeMs: 0,
          averageTimePerFile: 0
        },
        errors: filenames.map(filename => ({
          filename,
          error: error instanceof Error ? error.message : 'Unknown error'
        }))
      };
    }
  }
}

export const apiService = new ApiService();
