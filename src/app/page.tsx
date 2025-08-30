"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Code, Users, Trophy, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-custom-light dark:bg-custom-dark-primary">
      {/* Header */}
      <header className="bg-white dark:bg-custom-dark-secondary shadow-sm border-b border-gray-200 dark:border-custom-dark-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-custom-dark-primary dark:text-custom-light">CodePlatform</h1>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4">
                <Link href="/" className="text-custom-accent dark:text-custom-accent font-medium">Home</Link>
                <Link href="/problems" className="text-gray-600 dark:text-custom-light hover:text-custom-accent dark:hover:text-custom-accent transition-colors">Problems</Link>
                <a href="#" className="text-gray-600 dark:text-custom-light hover:text-custom-accent dark:hover:text-custom-accent transition-colors">Contest</a>
                <a href="#" className="text-gray-600 dark:text-custom-light hover:text-custom-accent dark:hover:text-custom-accent transition-colors">Discuss</a>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-custom-dark-primary dark:text-custom-light mb-6">
            Welcome to CodePlatform
          </h1>
          <p className="text-xl text-gray-600 dark:text-custom-light/80 mb-8 max-w-2xl mx-auto">
            Master your coding skills with our comprehensive collection of algorithmic challenges and real-time code review.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/problems"
              className="bg-custom-accent text-white px-8 py-3 rounded-lg font-medium hover:bg-custom-accent/80 transition-colors"
            >
              Start Solving
            </Link>
            <button className="border border-custom-accent text-custom-accent px-8 py-3 rounded-lg font-medium hover:bg-custom-accent/10 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-custom-accent/10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Code className="w-8 h-8 text-custom-accent" />
            </div>
            <h3 className="text-lg font-semibold text-custom-dark-primary dark:text-custom-light mb-2">
              Code Practice
            </h3>
            <p className="text-gray-600 dark:text-custom-light/70">
              Solve coding problems with multiple language support
            </p>
          </div>

          <div className="text-center">
            <div className="bg-custom-accent/10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-custom-accent" />
            </div>
            <h3 className="text-lg font-semibold text-custom-dark-primary dark:text-custom-light mb-2">
              AI Code Review
            </h3>
            <p className="text-gray-600 dark:text-custom-light/70">
              Get detailed feedback on your solutions
            </p>
          </div>

          <div className="text-center">
            <div className="bg-custom-accent/10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-custom-accent" />
            </div>
            <h3 className="text-lg font-semibold text-custom-dark-primary dark:text-custom-light mb-2">
              Contests
            </h3>
            <p className="text-gray-600 dark:text-custom-light/70">
              Compete with others in coding competitions
            </p>
          </div>

          <div className="text-center">
            <div className="bg-custom-accent/10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-custom-accent" />
            </div>
            <h3 className="text-lg font-semibold text-custom-dark-primary dark:text-custom-light mb-2">
              Community
            </h3>
            <p className="text-gray-600 dark:text-custom-light/70">
              Connect and learn with fellow developers
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
