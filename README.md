# CodePlatform - A LeetCode-style Coding Platform

A modern coding platform built with Next.js 15, featuring a LeetCode-style interface with integrated code editor and judge system simulation.

## Features

### ✨ Core Features
- **Problem Table**: Browse coding problems with difficulty levels, tags, and status indicators
- **LeetCode-style Interface**: Split-screen layout with problem description on the left and code editor on the right
- **Monaco Editor Integration**: Full-featured code editor with syntax highlighting for multiple languages
- **Judge0 Integration Ready**: Prepared for backend integration with Judge0 API
- **Submission System**: Toast notifications and submission reports
- **AI-Generated Reports**: Mock submission analysis with detailed feedback

### 🚀 Technical Features
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Monaco Editor** for code editing
- **Lucide React** for icons
- **Sonner** for toast notifications
- **Responsive Design** optimized for coding

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd code_review
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and custom CSS
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page with problems table
│   └── problem/
│       └── [id]/
│           └── page.tsx     # Individual problem page
├── data/
│   └── questions.ts         # Mock problem data and types
```

## Available Problems

The platform includes 5 sample coding problems:

1. **Two Sum** (Easy) - Array, Hash Table
2. **Add Two Numbers** (Medium) - Linked List, Math, Recursion  
3. **Longest Substring Without Repeating Characters** (Medium) - Hash Table, String, Sliding Window
4. **Median of Two Sorted Arrays** (Hard) - Array, Binary Search, Divide and Conquer
5. **Valid Parentheses** (Easy) - String, Stack

## Supported Languages

- JavaScript
- Python
- Java
- C++

## Key Components

### Problem Table (`/`)
- Displays all available problems
- Shows difficulty levels with color coding
- Includes tags and status indicators
- Click any problem to open the coding interface

### Problem Interface (`/problem/[id]`)
- **Left Panel**: Problem description, examples, constraints, tags
- **Right Panel**: Code editor with language selection
- **Tabs**: Switch between Description and Submissions
- **Actions**: Run code and Submit solution
- **Console**: Output area for code execution

### Features Implemented

#### ✅ Completed
- [x] Next.js application setup with TypeScript
- [x] Problems table with dummy data
- [x] LeetCode-style problem interface
- [x] Monaco code editor integration
- [x] Multiple programming language support
- [x] Run and Submit functionality with toasts
- [x] Submission reports with AI analysis
- [x] Responsive design
- [x] Clean, modern UI

#### 🔄 Ready for Integration
- [ ] Judge0 API integration for code execution
- [ ] Real backend for problem storage
- [ ] User authentication and progress tracking
- [ ] Real submission history
- [ ] Test case execution and validation

## Customization

### Adding New Problems
Edit `src/data/questions.ts` to add new problems:

```typescript
{
  id: 6,
  title: "Your Problem Title",
  difficulty: "Easy" | "Medium" | "Hard",
  description: "Problem description...",
  examples: [{ input: "...", output: "...", explanation: "..." }],
  constraints: ["constraint1", "constraint2"],
  tags: ["Array", "String"],
  starterCode: {
    javascript: "function solution() {\n    // Your code here\n}",
    python: "def solution():\n    # Your code here\n    pass",
    // ... other languages
  }
}
```

### Styling
- Global styles in `src/app/globals.css`
- Tailwind CSS classes for component styling
- Custom scrollbar and Monaco editor theming included

## Integration Notes

### Judge0 Integration
The application is structured to easily integrate with Judge0:

1. Replace the mock `handleRun` and `handleSubmit` functions
2. Add API endpoints for code execution
3. Update the console output with real execution results
4. Implement real-time execution status

### Backend Integration
- Problem data can be moved to a database
- User authentication can be added
- Submission history can be tracked
- Progress and statistics can be implemented

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Dependencies

### Core
- `next` - React framework
- `react` - UI library
- `typescript` - Type safety

### UI & Styling
- `tailwindcss` - CSS framework
- `@monaco-editor/react` - Code editor
- `lucide-react` - Icons
- `sonner` - Toast notifications

## Browser Support

- Chrome (recommended for Monaco Editor)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

---

Built with ❤️ using Next.js and modern web technologies.
