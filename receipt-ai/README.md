# receiptAI Frontend

Modern, mobile-first React application for receiptAI - Smart Expense Tracker. Built with React 19, TypeScript, Vite, and Tailwind CSS v4. Features secure authentication, intuitive UI, and responsive design.

---

## 📅 Project Timeline

### Phase 1: Foundation & Authentication (April 14, 2026 - Morning)

#### Day 1: Project Setup & Welcome Page
- ✅ Initialized React 19 + TypeScript + Vite project
- ✅ Configured Tailwind CSS v4 with custom theme
- ✅ Created mobile-first responsive design system
- ✅ Built WelcomePage with hero section, features, and CTAs
- ✅ Implemented atomic component architecture
- ✅ Set up React Router for navigation

#### Day 2: Authentication System
- ✅ Created SignupPage with email/password validation
- ✅ Built VerifyOTPPage with 6-digit OTP input
- ✅ Implemented LoginPage with auto-logout functionality
- ✅ Added ForgotPasswordPage with 3-step reset flow
- ✅ Created DashboardPage for authenticated users
- ✅ Integrated with backend API endpoints
- ✅ Added comprehensive error handling
- ✅ Implemented loading states and user feedback

#### Day 3: Security & Optimization
- ✅ Added password show/hide toggle (eye icons)
- ✅ Implemented auto-logout after 1 hour inactivity
- ✅ Added activity tracking (mouse, keyboard, scroll, touch)
- ✅ Optimized event listeners with passive option
- ✅ Prevented memory leaks with proper cleanup
- ✅ Added comprehensive comments throughout codebase
- ✅ Organized components by feature (atomic design)
- ✅ Created reusable UI components

### Phase 2: Core Features Implementation (April 14, 2026 - Afternoon)

#### Receipt Scanning & Management
- ✅ Built ScanView with camera integration and file upload
- ✅ Implemented multi-engine OCR (Tesseract.js client-side + server fallback)
- ✅ Created PDF processor for receipt PDFs (first page extraction)
- ✅ Added receipt editing form with category selection
- ✅ Built receipt detail view with original image display
- ✅ Implemented receipt deletion with confirmation

#### Dashboard & Analytics
- ✅ Created HomeView with spending summary cards
- ✅ Built FlexSummaryCard with duration filtering (today, weekly, monthly, all, custom)
- ✅ Implemented RecentActivityList with transaction display
- ✅ Added CategoryBreakdownChart with Recharts visualization
- ✅ Created HistoryView with comprehensive transaction list
- ✅ Built FilterBar with custom date range modal
- ✅ Added SpendingSummaryCard with average per day calculation

#### Category Management
- ✅ Built GroupsView for category management
- ✅ Implemented category CRUD operations (create, edit, delete)
- ✅ Added color picker and icon selection for categories
- ✅ Created category usage statistics

#### Export & Reporting
- ✅ Implemented device-aware export (PDF for desktop, PNG for mobile)
- ✅ Built professional HTML report generation (Report.html template)
- ✅ Added backend PDF export integration
- ✅ Created print-friendly receipt templates
- ✅ Implemented transaction list PDF export

### Phase 3: Performance & Polish (April 14, 2026 - Evening)

#### Performance Analysis
- ✅ Conducted comprehensive frontend performance audit (20+ files reviewed)
- ✅ Identified critical bottlenecks (client-side PDF, no caching, OCR blocking)
- ✅ Documented optimization opportunities with priority levels
- ✅ Created PERFORMANCE-TEST.md with detailed recommendations

#### Code Quality
- ✅ Fixed timezone-safe date handling throughout app
- ✅ Added custom date range filtering to HistoryView
- ✅ Improved error handling and user feedback
- ✅ Optimized component re-renders
- ✅ Enhanced mobile responsiveness

**Status**: ✅ Complete and Production-Ready

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:5000`

### Installation

```bash
# Navigate to frontend directory
cd receipt-ai

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Application runs on `http://localhost:5173` by default.

---

## 🎨 Design System

### Color Palette
Built with Material Design 3 color system:

```css
/* Primary Colors */
--color-primary: #006c4a;
--color-primary-container: #3fb687;
--color-on-primary: #ffffff;

/* Surface Colors */
--color-surface: #f8faf9;
--color-surface-container: #eef4ff;
--color-on-surface: #191c1a;

/* Error Colors */
--color-error: #ba1a1a;
--color-error-container: #ffdad6;
```

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Brand Font**: Custom brand font for logo
- **Scale**: Responsive text sizes (text-xs to text-4xl)
- **Weights**: Regular (400), Semibold (600), Bold (700), Extrabold (800)

### Components
All components follow atomic design principles:
- **Atoms**: InputField, SocialButton, FeatureCard
- **Molecules**: LoginForm, SignupForm, OTPInput
- **Organisms**: HeaderComponent, FooterComponent
- **Pages**: LoginPage, SignupPage, DashboardPage

---

## 🗂️ Project Structure

```
receipt-ai/
├── public/
│   ├── favicon.svg              # App favicon
│   └── icons.svg                # Icon sprites
├── src/
│   ├── assets/                  # Images and static assets
│   │   ├── hero.png             # Hero section image
│   │   ├── react.svg            # React logo
│   │   └── vite.svg             # Vite logo
│   ├── components/              # Reusable components (atomic design)
│   │   ├── DashboardPage/       # Main dashboard after login
│   │   │   ├── DashboardComponent.tsx
│   │   │   ├── HomeView.tsx     # Landing dashboard view
│   │   │   ├── HomeViewComponents/
│   │   │   │   ├── FlexSummaryCard.tsx
│   │   │   │   ├── RecentActivityList.tsx
│   │   │   │   └── CategoryBreakdownChart.tsx
│   │   │   ├── HistoryView.tsx  # Transaction history
│   │   │   ├── HistoryViewComponents/
│   │   │   │   ├── FilterBar.tsx
│   │   │   │   ├── TransactionList.tsx
│   │   │   │   └── SpendingSummaryCard.tsx
│   │   │   ├── ScanView.tsx     # Receipt scanning
│   │   │   ├── ScanViewComponents/
│   │   │   │   ├── CameraCapture.tsx
│   │   │   │   ├── PDFUploader.tsx
│   │   │   │   ├── ImageUploader.tsx
│   │   │   │   └── ScanResultForm.tsx
│   │   │   ├── GroupsView.tsx   # Category management
│   │   │   ├── GroupsViewComponents/
│   │   │   │   ├── CategoryManager.tsx
│   │   │   │   └── CategoryForm.tsx
│   │   │   └── SettingsView.tsx # User settings
│   │   │   ├── SettingsViewComponents/
│   │   │   │   ├── ProfileSettings.tsx
│   │   │   │   ├── DeleteAllDataModal.tsx
│   │   │   │   └── HelpCenterModal.tsx
│   │   ├── ForgotPasswordPage/  # Password reset components
│   │   │   ├── ForgotPasswordComponent.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── LoginPage/           # Login components
│   │   │   ├── LoginComponent.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── InputField.tsx
│   │   ├── SignupPage/          # Signup components
│   │   │   ├── SignupComponent.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── LeftContent.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── InputField.tsx
│   │   │   └── SocialButton.tsx
│   │   ├── VerifyOTPPage/       # OTP verification components
│   │   │   ├── VerifyOTPComponent.tsx
│   │   │   ├── VerifyOTPForm.tsx
│   │   │   ├── OTPInput.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── WelcomePage/         # Landing page components
│   │   │   ├── WelcomeComponent.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── FeatureCard.tsx
│   │   │   ├── TimelineStep.tsx
│   │   │   ├── SecondaryCTA.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── ScrollToTop.tsx      # Navigation helper
│   ├── pages/                   # Page components (route handlers)
│   │   ├── WelcomePage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── VerifyOTPPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   └── DashboardPage.tsx
│   ├── services/                # API service layer
│   │   ├── api.ts               # Base API client
│   │   ├── receiptsApi.ts       # Receipt operations (1613 lines)
│   │   ├── scanApi.ts           # OCR scanning
│   │   ├── categoriesApi.ts     # Category management
│   │   ├── tesseractOcr.ts      # Client-side OCR
│   │   └── pdfProcessor.ts      # PDF handling
│   ├── hooks/                   # Custom React hooks
│   ├── App.tsx                  # Main app component & routing
│   ├── main.tsx                 # Application entry point
│   ├── index.css                # Global styles & Tailwind imports
│   └── theme.css                # Custom theme variables
├── index.html                   # HTML template
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── package.json                 # Dependencies
├── PERFORMANCE-TEST.md          # Frontend performance analysis
└── README.md                    # This file
```

---

## 🛠️ Technology Stack

### Core Framework
- **React 19**: Latest React with modern features
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **React Router 6**: Client-side routing

### Styling
- **Tailwind CSS v4**: Utility-first CSS framework
- **Custom Theme**: Material Design 3 inspired
- **Responsive Design**: Mobile-first approach
- **CSS Variables**: Dynamic theming support

### State Management
- **React Hooks**: useState, useEffect, useCallback
- **Local Storage**: Token and user data persistence
- **Context Ready**: Architecture supports Context API

### Development Tools
- **ESLint**: Code linting and quality
- **TypeScript Compiler**: Type checking
- **Vite HMR**: Hot module replacement
- **DevTools**: React Developer Tools compatible

---

## 🔐 Authentication Flow

### User Journey

#### 1. Welcome Page (`/`)
- Landing page with app introduction
- Call-to-action buttons for signup/login
- Feature highlights and benefits

#### 2. Signup (`/signup`)
```typescript
// User enters email, password, name
// Password validation (frontend):
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character

// On submit:
→ POST /api/auth/signup
→ Receives OTP via email
→ Redirects to /verify-otp
```

#### 3. Verify OTP (`/verify-otp`)
```typescript
// User enters 6-digit code from email
// On verify:
→ POST /api/auth/verify-otp
→ Account created in backend
→ Redirects to /login
```

#### 4. Login (`/login`)
```typescript
// User enters email and password
// Features:
- Password show/hide toggle (eye icon)
- Auto-logout after 1 hour inactivity
- Activity tracking (resets timer)
- Error handling with user-friendly messages

// On login:
→ POST /api/auth/login
→ Stores auth_token in localStorage
→ Stores user_data in localStorage
→ Redirects to /dashboard
```

#### 5. Dashboard (`/dashboard`)
```typescript
// Protected route (requires authentication)
// Features:
- Displays user information
- Shows session status
- Manual logout button
- Auto-redirect if not authenticated

// On logout:
→ Clears localStorage
→ Redirects to /login
```

#### 6. Forgot Password (`/forgot-password`)
```typescript
// 3-step process:
Step 1: Enter email → Send OTP
Step 2: Enter OTP → Verify code
Step 3: Set new password → Reset

// Features:
- Password strength indicator
- Confirm password validation
- Real-time feedback
- Success/error messages
```

---

## 🎯 Key Features

### Security Features
- ✅ **Password Strength Validation**: Enforced on frontend
- ✅ **Auto-Logout**: 1 hour of inactivity timeout
- ✅ **Activity Tracking**: Resets timer on user interaction
- ✅ **Secure Token Storage**: localStorage with cleanup
- ✅ **Protected Routes**: Authentication checks
- ✅ **Error Handling**: User-friendly messages

### Performance Optimizations
- ✅ **Passive Event Listeners**: Better scroll performance
- ✅ **Memory Leak Prevention**: Proper useEffect cleanup
- ✅ **Code Splitting Ready**: Component-based architecture
- ✅ **Lazy Loading Ready**: Route-based splitting possible
- ✅ **Optimized Re-renders**: React best practices

### User Experience
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Mobile-First**: Optimized for touch devices
- ✅ **Loading States**: Visual feedback during operations
- ✅ **Error Messages**: Clear, actionable feedback
- ✅ **Smooth Animations**: Transitions and hover effects
- ✅ **Accessibility**: Semantic HTML, ARIA labels

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
sm: 640px   /* Small devices (phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* Ultra wide screens */
```

### Design Principles
- **Touch-Friendly**: Minimum 44px tap targets
- **Readable Text**: Minimum 16px body text
- **Flexible Layouts**: Fluid grids and flexbox
- **Optimized Images**: Responsive image loading
- **Fast Loading**: Minimal bundle size

---

## 🧪 Testing

### Manual Testing Checklist

#### Authentication Flow
- [ ] Signup with valid credentials
- [ ] Signup with weak password (should fail)
- [ ] Verify OTP with correct code
- [ ] Verify OTP with expired code
- [ ] Login with correct credentials
- [ ] Login with wrong password
- [ ] Auto-logout after inactivity
- [ ] Manual logout functionality
- [ ] Forgot password flow
- [ ] Password reset with new credentials

#### UI/UX Testing
- [ ] Responsive on mobile (320px+)
- [ ] Responsive on tablet (768px+)
- [ ] Responsive on desktop (1024px+)
- [ ] All buttons are clickable
- [ ] Forms validate correctly
- [ ] Error messages display properly
- [ ] Loading states show during API calls
- [ ] Navigation works smoothly

#### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🚀 Deployment

### Build for Production

```bash
# Create optimized production build
npm run build

# Output: dist/ folder
# Contains:
- Minified JavaScript
- Optimized CSS
- Compressed assets
- Hashed filenames for caching
```

### Deploy to Platform

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
- Link to existing project? No
- Project name: receiptai-frontend
- Directory: ./receipt-ai
- Override settings? No
```

#### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

#### Option 3: GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

### Environment Configuration

Create `.env.production` for production builds:

```env
VITE_API_URL=https://your-backend-api.com
VITE_APP_NAME=receiptAI
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 🐛 Troubleshooting

### Common Issues

**Error: Cannot connect to backend**
```
Solution:
1. Verify backend is running on http://localhost:5000
2. Check CORS configuration in backend
3. Update API URL in frontend components
4. Check browser console for CORS errors
```

**Error: Auto-logout not working**
```
Solution:
1. Check browser console for JavaScript errors
2. Verify localStorage is accessible (not blocked)
3. Test activity events (move mouse, type, scroll)
4. Check component lifecycle (useEffect cleanup)
```

**Error: Styles not loading**
```
Solution:
1. Verify Tailwind CSS is installed: npm install
2. Check index.css imports Tailwind directives
3. Clear browser cache and reload
4. Restart dev server: npm run dev
```

**Error: TypeScript errors**
```
Solution:
1. Run type check: npx tsc --noEmit
2. Install missing types: npm install --save-dev @types/react
3. Check tsconfig.json configuration
4. Restart TypeScript server in IDE
```

**Error: Build fails**
```
Solution:
1. Check for TypeScript errors: npm run build
2. Verify all imports are correct
3. Clear node_modules and reinstall: rm -rf node_modules && npm install
4. Check Vite configuration
```

---

## 📝 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React functional component patterns
- Use hooks for state management
- Implement proper error boundaries
- Add JSDoc comments to complex functions

### Component Structure
```typescript
/**
 * ComponentName
 * 
 * Description of what the component does
 * 
 * Props:
 * - prop1: description
 * - prop2: description
 */
const ComponentName = ({ prop1, prop2 }: ComponentProps) => {
  // State declarations
  const [state, setState] = useState(initialValue);
  
  // Effects
  useEffect(() => {
    // Side effects
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
  // Event handlers
  const handleEvent = () => {
    // Logic
  };
  
  // Render
  return (
    <div className="styles">
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### Best Practices
- Keep components small and focused
- Extract reusable logic to custom hooks
- Use meaningful variable and function names
- Handle all error cases
- Add loading states for async operations
- Write self-documenting code
- Follow DRY principle (Don't Repeat Yourself)

---

## 📈 Future Enhancements

### Planned Features
- [ ] Receipt scanning with camera
- [ ] AI-powered receipt data extraction
- [ ] Expense categorization
- [ ] PDF report generation
- [ ] Data visualization charts
- [ ] Export to CSV/Excel
- [ ] Multi-currency support
- [ ] Dark mode toggle
- [ ] Offline mode (PWA)
- [ ] Push notifications

### Performance Improvements
- [ ] Code splitting by route
- [ ] Image lazy loading
- [ ] Virtual scrolling for lists
- [ ] Service worker caching
- [ ] Bundle size optimization
- [ ] Progressive Web App (PWA)

### UX Enhancements
- [ ] Skeleton loaders
- [ ] Toast notifications
- [ ] Form auto-save
- [ ] Keyboard shortcuts
- [ ] Gesture support (swipe, pinch)
- [ ] Voice commands

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Guide](https://reactrouter.com/)
- [Material Design 3](https://m3.material.io/)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following code style guidelines
4. Test thoroughly on multiple devices
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open Pull Request with screenshots and description

---

## 📄 License

This project is part of receiptAI - Smart Expense Tracker.
All rights reserved.

---

**Created**: April 14, 2026  
**Last Updated**: April 14, 2026  
**Version**: 1.0.0  
**Maintainer**: Ebrahim Al Mahbosh  
**Status**: ✅ Production-Ready
