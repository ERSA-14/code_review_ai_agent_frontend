"use client";

import Link from "next/link";
import { questions } from "@/data/questions";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ProblemsPage() {
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

  return (
    <div className="min-h-screen bg-custom-light dark:bg-custom-dark-primary">
      {/* Header */}
      <header className="bg-white dark:bg-custom-dark-secondary shadow-sm border-b border-gray-200 dark:border-custom-dark-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-custom-dark-primary dark:text-custom-light">CodePlatform</h1>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4">
                <Link href="/" className="text-gray-600 dark:text-custom-light hover:text-custom-accent dark:hover:text-custom-accent transition-colors">Home</Link>
                <Link href="/problems" className="text-custom-accent dark:text-custom-accent font-medium">Problems</Link>
                <a href="#" className="text-gray-600 dark:text-custom-light hover:text-custom-accent dark:hover:text-custom-accent transition-colors">Contest</a>
                <a href="#" className="text-gray-600 dark:text-custom-light hover:text-custom-accent dark:hover:text-custom-accent transition-colors">Discuss</a>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-custom-dark-primary dark:text-custom-light mb-2">Problems</h2>
          <p className="text-gray-600 dark:text-custom-light/80">Practice coding with our collection of algorithmic problems</p>
        </div>

        {/* Problems Table */}
        <div className="bg-white dark:bg-custom-dark-secondary shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-custom-dark-primary">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-custom-dark-primary">
              <thead className="bg-gray-50 dark:bg-custom-dark-primary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-custom-light uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-custom-light uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-custom-light uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-custom-light uppercase tracking-wider">
                    Tags
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-custom-dark-secondary divide-y divide-gray-200 dark:divide-custom-dark-primary">
                {questions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50 dark:hover:bg-custom-dark-primary/50 cursor-pointer transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-custom-accent"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        href={`/problem/${question.id}`}
                        className="text-custom-accent dark:text-custom-accent hover:text-custom-accent/80 dark:hover:text-custom-accent/80 font-medium transition-colors"
                      >
                        {question.id}. {question.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                          question.difficulty
                        )}`}
                      >
                        {question.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {question.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-custom-dark-primary text-gray-700 dark:text-custom-light rounded transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
