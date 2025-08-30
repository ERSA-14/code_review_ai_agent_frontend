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
}

export const apiService = new ApiService();
