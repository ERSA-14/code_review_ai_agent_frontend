import { Upload, File as FileIcon, X } from "lucide-react";
import { useRef } from "react";

interface FileUploadZoneProps {
  selectedFiles: File[];
  isDragOver: boolean;
  isUploading: boolean;
  onFileSelect: (files: File[]) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
  acceptedExtensions: string;
  supportedFormats: string;
  maxFileSize: string;
  title: string;
  description: string;
  buttonText: string;
  formatFileSize: (bytes: number) => string;
}

export function FileUploadZone({
  selectedFiles,
  isDragOver,
  isUploading,
  onFileSelect,
  onDrop,
  onDragOver,
  onDragLeave,
  onRemoveFile,
  onClearAll,
  acceptedExtensions,
  supportedFormats,
  maxFileSize,
  title,
  description,
  buttonText,
  formatFileSize
}: FileUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileSelect(files);
    }
  };

  if (selectedFiles.length === 0) {
    return (
      <>
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
            isDragOver 
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-custom-light mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {description}
          </p>
          <div className="space-y-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="bg-custom-accent hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors text-lg"
            >
              {buttonText}
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
            accept={acceptedExtensions}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            {supportedFormats}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {maxFileSize}
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-custom-light">
          Selected Files ({selectedFiles.length})
        </h3>
        <button
          onClick={onClearAll}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium flex items-center space-x-1"
        >
          <X className="h-4 w-4" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2">
        {selectedFiles.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileIcon className="h-6 w-6 text-custom-accent" />
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
              onClick={() => onRemoveFile(index)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
