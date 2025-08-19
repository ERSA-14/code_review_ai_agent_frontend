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
}

export const apiService = new ApiService();
