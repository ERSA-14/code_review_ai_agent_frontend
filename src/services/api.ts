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
  async uploadFile(code: string, filename: string, language: string): Promise<UploadResponse> {
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

  async generateReport(
    filename: string, 
    problemStatement?: string, 
    additionalContext?: string
  ): Promise<GenerateReportResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/report/file/${filename}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
