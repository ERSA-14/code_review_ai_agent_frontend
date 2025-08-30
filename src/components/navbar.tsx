"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

interface NavbarProps {
  variant?: "default" | "minimal";
}

export function Navbar({ variant = "default" }: NavbarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  if (variant === "minimal") {
    // For problem detail pages - minimal navbar with just logo and theme toggle
    return (
      <header className="bg-white dark:bg-custom-dark-secondary shadow-sm border-b border-gray-200 dark:border-custom-dark-primary">
        <div className="w-full px-4">
          <div className="flex justify-between items-center py-3">
            <Link href="/" className="text-xl font-bold text-custom-dark-primary dark:text-custom-light hover:text-custom-accent transition-colors">
              CodePlatform
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
    );
  }

  // Default navbar with full navigation
  return (
    <header className="bg-white dark:bg-custom-dark-secondary shadow-sm border-b border-gray-200 dark:border-custom-dark-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-custom-dark-primary dark:text-custom-light hover:text-custom-accent transition-colors">
            CodePlatform
          </Link>
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-4">
              <Link 
                href="/" 
                className={`transition-colors ${
                  isActive("/") 
                    ? "text-custom-accent dark:text-custom-accent font-medium" 
                    : "text-gray-600 dark:text-custom-light hover:text-custom-accent dark:hover:text-custom-accent"
                }`}
              >
                Home
              </Link>
              <Link 
                href="/problems" 
                className={`transition-colors ${
                  isActive("/problems") 
                    ? "text-custom-accent dark:text-custom-accent font-medium" 
                    : "text-gray-600 dark:text-custom-light hover:text-custom-accent dark:hover:text-custom-accent"
                }`}
              >
                Problems
              </Link>
              <Link 
                href="/upload" 
                className={`transition-colors ${
                  isActive("/upload") 
                    ? "text-custom-accent dark:text-custom-accent font-medium" 
                    : "text-gray-600 dark:text-custom-light hover:text-custom-accent dark:hover:text-custom-accent"
                }`}
              >
                Upload
              </Link>
              <Link 
                href="/files" 
                className={`transition-colors ${
                  isActive("/files") 
                    ? "text-custom-accent dark:text-custom-accent font-medium" 
                    : "text-gray-600 dark:text-custom-light hover:text-custom-accent dark:hover:text-custom-accent"
                }`}
              >
                Files
              </Link>
              <Link 
                href="/reports" 
                className={`transition-colors ${
                  isActive("/reports") 
                    ? "text-custom-accent dark:text-custom-accent font-medium" 
                    : "text-gray-600 dark:text-custom-light hover:text-custom-accent dark:hover:text-custom-accent"
                }`}
              >
                Reports
              </Link>
            </nav>
            {/* <ThemeToggle /> */}
          </div>
        </div>
      </div>
    </header>
  );
}
