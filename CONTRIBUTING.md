# Contributing to receiptAI

Thank you for your interest in contributing to receiptAI! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions. We welcome contributions from developers of all skill levels.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a new branch for your feature/fix
4. **Make** your changes
5. **Test** thoroughly
6. **Submit** a pull request

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Supabase account (for database)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file with Supabase credentials
npm run dev
```

### Frontend Setup

```bash
cd receipt-ai
npm install
npm run dev
```

## How to Contribute

### Reporting Bugs

Before creating bug reports, check existing issues. When creating a bug report, include:

- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, Node version)

### Suggesting Features

Feature suggestions are welcome! Please provide:

- Use case and problem it solves
- Proposed solution
- Alternative approaches considered
- Any relevant examples

### Code Contributions

1. **Find an issue** to work on or create one
2. **Comment** on the issue to claim it
3. **Fork** and create a feature branch (`feature/your-feature-name`)
4. **Write code** following our standards
5. **Add tests** if applicable
6. **Update documentation** as needed
7. **Submit** a pull request

## Pull Request Process

1. Ensure your code follows the project's coding standards
2. Update the README.md with details of changes if needed
3. The PR should work on both backend and frontend
4. Add screenshots for UI changes
5. Wait for review from maintainers
6. Address any feedback
7. Once approved, your PR will be merged

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Tests pass (if applicable)
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Works on mobile and desktop

## Coding Standards

### General

- Use meaningful variable and function names
- Keep functions small and focused
- Write comments for complex logic
- Follow DRY (Don't Repeat Yourself) principle
- Use TypeScript types/interfaces properly

### JavaScript/TypeScript

- Use ES6+ features
- Prefer `const` over `let`
- Use async/await for asynchronous code
- Handle errors gracefully
- Use proper TypeScript types

### React

- Use functional components with hooks
- Keep components small and reusable
- Use proper prop types/TypeScript interfaces
- Implement error boundaries where needed
- Optimize re-renders with React.memo, useMemo, useCallback

### CSS/Tailwind

- Use Tailwind utility classes
- Avoid custom CSS unless necessary
- Follow mobile-first approach
- Use semantic class names for custom styles

### Backend (Node.js/Express)

- Use async/await for route handlers
- Implement proper error handling middleware
- Validate all inputs
- Use environment variables for configuration
- Follow RESTful API conventions

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add camera capture for receipt scanning
fix: resolve OTP verification timeout issue
docs: update installation instructions
refactor: optimize category fetching queries
test: add unit tests for auth controller
```

Format: `type: description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

## Questions?

If you have questions, feel free to:
- Open an issue with the "question" label
- Email: swe.ebrahim@gmail.com
- Check existing documentation

## Recognition

Contributors will be acknowledged in:
- README.md contributors section
- Release notes
- GitHub contributors page

---

**Thank you for contributing to receiptAI!** 🚀
