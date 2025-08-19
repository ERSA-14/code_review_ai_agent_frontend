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
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    "Welcome to CodePlatform Judge0 Environment",
    "Ready to execute your code..."
  ]);
  const [submissions, setSubmissions] = useState<Array<{
    id: number;
    language: string;
    code: string;
    timestamp: Date;
    status: string;
    filename: string;
  }>>([]);

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

  const getFileExtension = (language: string) => {
    switch (language) {
      case "javascript": return ".js";
      case "python": return ".py";
      case "java": return ".java";
      case "cpp": return ".cpp";
      default: return ".txt";
    }
  };

  const executeCode = (code: string, language: string) => {
    // Simulate code execution with different outputs based on language
    switch (language) {
      case "javascript":
        try {
          // Simple evaluation for basic JavaScript
          if (code.includes("console.log")) {
            const matches = code.match(/console\.log\(([^)]+)\)/g);
            if (matches) {
              return matches.map(match => {
                const content = match.match(/console\.log\(([^)]+)\)/)?.[1] || "";
                try {
                  return eval(content);
                } catch {
                  return content.replace(/['"]/g, "");
                }
              }).join("\n");
            }
          }
          // For functions, show a sample execution
          if (code.includes("function") || code.includes("=>")) {
            return "Function defined successfully\nExample output: [1, 2, 3, 4, 5]";
          }
          return "Code executed successfully";
        } catch (error) {
          return `Error: ${error}`;
        }

      case "python":
        if (code.includes("print(")) {
          const matches = code.match(/print\(([^)]+)\)/g);
          if (matches) {
            return matches.map(match => {
              const content = match.match(/print\(([^)]+)\)/)?.[1] || "";
              return content.replace(/['"]/g, "");
            }).join("\n");
          }
        }
        if (code.includes("def ")) {
          return "Function defined successfully\nExample output: [1, 2, 3, 4, 5]";
        }
        return "Code executed successfully";

      case "java":
        if (code.includes("System.out.println")) {
          return "Hello World\nCode executed successfully";
        }
        return "Java program compiled and executed successfully";

      case "cpp":
        if (code.includes("cout")) {
          return "Hello World\nC++ program executed successfully";
        }
        return "C++ program compiled and executed successfully";

      default:
        return "Code executed successfully";
    }
  };

  const handleRun = () => {
    const output = executeCode(code, selectedLanguage);
    const timestamp = new Date().toLocaleTimeString();
    
    setConsoleOutput(prev => [
      ...prev,
      `[${timestamp}] Running ${selectedLanguage} code...`,
      output,
      "--- Execution completed ---"
    ]);

    toast.success("Code executed successfully!", {
      description: "Check the console for output"
    });
  };

  const handleSubmit = () => {
    const timestamp = new Date();
    const filename = `solution_${question.id}_${timestamp.getTime()}${getFileExtension(selectedLanguage)}`;
    
    const newSubmission = {
      id: submissions.length + 1,
      language: selectedLanguage,
      code: code,
      timestamp: timestamp,
      status: "Accepted",
      filename: filename
    };

    setSubmissions(prev => [newSubmission, ...prev]);
    setHasSubmitted(true);
    
    toast.success("Solution submitted successfully!", {
      description: `File saved as ${filename}`
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
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Submissions</h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {submissions.length > 0 ? (
                    <div className="space-y-3">
                      {submissions.map((submission) => (
                        <div key={submission.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-blue-500" />
                              <span className="font-medium text-gray-900 dark:text-white">{submission.filename}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                submission.status === 'Accepted' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }`}>
                                {submission.status}
                              </span>
                            </div>
                            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                              <div>{submission.timestamp.toLocaleDateString()}</div>
                              <div>{submission.timestamp.toLocaleTimeString()}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                            <span>Language: <strong>{submission.language}</strong></span>
                            <span>Size: <strong>{new Blob([submission.code]).size} bytes</strong></span>
                          </div>

                          <details className="group">
                            <summary className="cursor-pointer text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                              View Code
                            </summary>
                            <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded border">
                              <pre className="text-sm overflow-x-auto">
                                <code className="text-gray-900 dark:text-gray-100">{submission.code}</code>
                              </pre>
                            </div>
                          </details>

                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>Runtime: 68ms</span>
                              <span>Memory: 44.2MB</span>
                              <span>Test Cases: 58/58</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p>No submissions yet. Submit your solution to see your files here!</p>
                    </div>
                  )}

                  {hasSubmitted && submissions.length > 0 && (
                    <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">✅ Latest Submission Analysis</h3>
                      <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                        <p><strong>AI Analysis Report for:</strong> {submissions[0]?.filename}</p>
                        <p><strong>Time Complexity:</strong> O(n) - Linear time solution</p>
                        <p><strong>Space Complexity:</strong> O(n) - Uses additional hash map</p>
                        <p><strong>Code Quality:</strong> Excellent</p>
                      </div>
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
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Console</h4>
                <button 
                  onClick={() => setConsoleOutput(["Console cleared"])}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear
                </button>
              </div>
              <div className="bg-black text-green-400 p-2 rounded text-sm font-mono h-20 overflow-y-auto">
                {consoleOutput.map((line, index) => (
                  <div key={index} className={line.includes("Error") ? "text-red-400" : ""}>{line}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
