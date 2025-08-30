"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { X } from 'lucide-react';

interface MarkdownReportProps {
  content: string;
  filename: string;
  timestamp?: string;
  onClose: () => void;
}

export const MarkdownReport: React.FC<MarkdownReportProps> = ({ 
  content, 
  filename, 
  timestamp, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Code Review Report
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filename} {timestamp && `• Generated at ${new Date(timestamp).toLocaleString()}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-table:text-sm prose-th:bg-gray-50 dark:prose-th:bg-gray-800 prose-th:text-gray-900 dark:prose-th:text-white prose-td:text-gray-700 dark:prose-td:text-gray-300">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // Custom rendering for code blocks
                pre: ({ children, ...props }) => (
                  <pre 
                    {...props} 
                    className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto border border-gray-800"
                  >
                    {children}
                  </pre>
                ),
                code: ({ children, ...props }: any) => {
                  const isInline = !String(children).includes('\n');
                  if (isInline) {
                    return (
                      <code 
                        {...props}
                        className="bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-1 py-0.5 rounded text-sm font-mono"
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
                // Custom rendering for tables
                table: ({ children, ...props }) => (
                  <div className="overflow-x-auto my-4">
                    <table 
                      {...props}
                      className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children, ...props }) => (
                  <th 
                    {...props}
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700"
                  >
                    {children}
                  </th>
                ),
                td: ({ children, ...props }) => (
                  <td 
                    {...props}
                    className="px-4 py-2 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700"
                  >
                    {children}
                  </td>
                ),
                // Custom rendering for blockquotes
                blockquote: ({ children, ...props }) => (
                  <blockquote 
                    {...props}
                    className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 my-4 rounded-r-lg"
                  >
                    {children}
                  </blockquote>
                ),
                // Custom rendering for headings
                h1: ({ children, ...props }) => (
                  <h1 {...props} className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children, ...props }) => (
                  <h2 {...props} className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children, ...props }) => (
                  <h3 {...props} className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">
                    {children}
                  </h3>
                ),
                // Custom rendering for lists
                ul: ({ children, ...props }) => (
                  <ul {...props} className="list-disc list-inside space-y-1 my-4 text-gray-700 dark:text-gray-300">
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol {...props} className="list-decimal list-inside space-y-1 my-4 text-gray-700 dark:text-gray-300">
                    {children}
                  </ol>
                ),
                li: ({ children, ...props }) => (
                  <li {...props} className="ml-4">
                    {children}
                  </li>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
