"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { questions } from "@/data/questions";
import Editor from "@monaco-editor/react";
import { Play, Send, FileText, ArrowLeft } from "lucide-react";
import { toast, Toaster } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";

export default function ProblemPage() {
  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();
  
  const problemId = parseInt(params.id as string);
  const question = questions.find(q => q.id === problemId);

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(question?.starterCode[selectedLanguage] || "");
  const [activeTab, setActiveTab] = useState<"description" | "submissions">("description");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (question) {
      setCode(question.starterCode[selectedLanguage] || "");
    }
  }, [question, selectedLanguage]);

  if (!question) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Problem not found</h1>
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Back to problems
          </button>
        </div>
      </div>
    );
  }

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setCode(question.starterCode[language] || "");
  };

  const handleRun = () => {
    toast.success("Code executed successfully!", {
      description: "Check the console for output"
    });
  };

  const handleSubmit = () => {
    setHasSubmitted(true);
    toast.success("Solution submitted successfully!", {
      description: "Your submission is being processed"
    });
    
    // Automatically switch to submissions tab after a short delay
    setTimeout(() => {
      setActiveTab("submissions");
    }, 1000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20";
      case "Medium":
        return "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20";
      case "Hard":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800";
    }
  };

  const getEditorTheme = () => {
    if (theme === "dark") return "vs-dark";
    if (theme === "light") return "light";
    // For system theme, detect the actual applied theme
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "vs-dark" : "light";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-4">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/")}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {question.id}. {question.title}
              </h1>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                  question.difficulty
                )}`}
              >
                {question.difficulty}
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="w-full px-2 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 h-[calc(100vh-120px)]">
          {/* Left Panel - Problem Description */}
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "description"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab("submissions")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "submissions"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    Submissions
                    {hasSubmitted && (
                      <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>
                    )}
                  </div>
                </button>
              </nav>
            </div>

            <div className="p-6 overflow-y-auto h-full">
              {activeTab === "description" ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Problem Description</h2>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{question.description}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">Examples</h3>
                    {question.examples.map((example: any, index: number) => (
                      <div key={index} className="mb-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-1">Example {index + 1}:</p>
                        <div className="space-y-2">
                          <p className="text-gray-900 dark:text-white"><strong>Input:</strong> <code>{example.input}</code></p>
                          <p className="text-gray-900 dark:text-white"><strong>Output:</strong> <code>{example.output}</code></p>
                          {example.explanation && (
                            <p className="text-gray-900 dark:text-white"><strong>Explanation:</strong> {example.explanation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">Constraints</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {question.constraints.map((constraint: string, index: number) => (
                        <li key={index} className="text-gray-700 dark:text-gray-300 text-sm">
                          <code className="text-xs">{constraint}</code>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {question.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Submission Report</h2>
                  {hasSubmitted ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">✅ Submission Accepted</h3>
                      <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                        <p><strong>Runtime:</strong> 68 ms (Beats 85.23% of users)</p>
                        <p><strong>Memory:</strong> 44.2 MB (Beats 72.45% of users)</p>
                        <p><strong>Language:</strong> {selectedLanguage}</p>
                        <p><strong>Test Cases Passed:</strong> 58/58</p>
                      </div>
                      
                      <div className="mt-4 p-3 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded">
                        <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">AI Analysis Report</h4>
                        <div className="text-sm text-gray-900 dark:text-gray-100 space-y-2">
                          <p><strong>Code Quality:</strong> Excellent</p>
                          <p><strong>Time Complexity:</strong> O(n) - Linear time solution</p>
                          <p><strong>Space Complexity:</strong> O(n) - Uses additional hash map</p>
                          <p><strong>Strengths:</strong></p>
                          <ul className="list-disc list-inside ml-4">
                            <li>Clean and readable code structure</li>
                            <li>Efficient use of hash map for O(1) lookups</li>
                            <li>Handles edge cases properly</li>
                          </ul>
                          <p><strong>Suggestions:</strong></p>
                          <ul className="list-disc list-inside ml-4">
                            <li>Consider adding input validation</li>
                            <li>Variable names could be more descriptive</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p>No submissions yet. Submit your solution to see the report!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
            {/* Editor Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex justify-between items-center">
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleRun}
                    className="flex items-center px-3 py-1 bg-gray-600 dark:bg-gray-500 text-white rounded text-sm hover:bg-gray-700 dark:hover:bg-gray-400 transition-colors"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Run
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center px-3 py-1 bg-green-600 dark:bg-green-500 text-white rounded text-sm hover:bg-green-700 dark:hover:bg-green-400 transition-colors"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Submit
                  </button>
                </div>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1">
              <Editor
                height="100%"
                language={selectedLanguage === "cpp" ? "cpp" : selectedLanguage}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme={getEditorTheme()}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: "on",
                  fontFamily: "var(--font-geist-mono), Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
                }}
              />
            </div>

            {/* Console/Output Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 h-32">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Console</h4>
              <div className="bg-black text-green-400 p-2 rounded text-sm font-mono h-20 overflow-y-auto">
                <div>Welcome to CodePlatform Judge0 Environment</div>
                <div className="text-gray-400">Ready to execute your code...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
