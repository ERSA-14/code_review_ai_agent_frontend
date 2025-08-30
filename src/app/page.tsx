"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Code, Users, Trophy, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-custom-light dark:bg-custom-dark-primary">
      <Navbar />

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
              className="bg-custom-accent/10 border border-custom-accent text-custom-accent px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Start Solving
            </Link>
            <Link 
              href="/upload"
              className="bg-custom-accent text-white px-8 py-3 rounded-lg font-medium hover:bg-custom-accent/90 transition-colors"
            >
              Upload Code
            </Link>
            <Link 
              href="/files"
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-8 py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              View Files
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
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
        </div>
      </main>
    </div>
  );
}
