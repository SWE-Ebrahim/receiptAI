# receiptAI - Smart Expense Tracker

## 🎯 What is receiptAI?

**receiptAI** is a free, mobile-friendly web app that helps you track expenses by scanning receipts with your phone's camera. Instead of manually typing receipt details, the app uses AI to read them automatically, organizes your spending by category, and generates professional PDF reports.

**Perfect for:**
- Freelancers tracking business expenses
- Employees submitting expense reports
- Anyone who wants to understand their spending habits
- Small business owners managing receipts

---

## 💡 Why This System?

### The Problem
- 📄 Physical receipts get lost, damaged, or fade over time
- ⏱️ Manually entering receipt data is slow and boring
- 📊 Hard to see where your money goes without organization
- 📑 Creating expense reports takes hours of work
- 🔍 No easy way to filter and analyze past expenses

### The Solution
receiptAI automates everything:
1. **Scan** → Point your camera at any receipt
2. **Extract** → AI reads merchant, date, amount automatically
3. **Organize** → Categorize expenses (Food, Transport, Office, etc.)
4. **Store** → Everything saved securely in the cloud
5. **Report** → Generate PDF summaries instantly
6. **Analyze** → See spending patterns with visual charts

---

## ✨ Key Features

### 1. **Smart Receipt Scanning**
- Take photos with your mobile camera
- Upload existing images or PDFs
- AI extracts all details automatically (merchant, date, total, items)
- Edit any extracted data if needed
- Works offline - scans now, syncs later

### 2. **Custom Categories**
- Create your own expense categories (e.g., "Client Meetings", "Software Tools")
- Choose colors and icons for each category
- Organize receipts exactly how you want
- Easy to add, edit, or remove categories anytime

### 3. **Professional PDF Reports**
- Clean, formatted PDF for each receipt
- Download to your device
- Share via email or messaging apps
- Both original receipt and summary PDF stored
- Perfect for expense reimbursements

### 4. **Expense Analytics**
- Filter receipts by date range
- See total spending for any period
- Visual charts show which categories cost the most
- Identify your biggest and smallest expense categories
- Track spending trends over time

### 5. **Mobile-First Design**
- Works perfectly on phones and tablets
- Install like a native app (PWA)
- Fast, smooth, touch-friendly interface
- No app store download needed
- Access from any device with a browser

---

## 🔐 Authentication System

### Secure Email-Based Authentication
receiptAI uses a **secure OTP-based authentication system** to protect your data:

#### Security Features
- ✅ **Password Strength Requirements**: 8+ characters, uppercase, number, special character
- ✅ **Email Verification Required**: Account only created after OTP confirmation
- ✅ **OTP Expiry**: Codes expire in 10 minutes for security
- ✅ **Auto-Logout**: Sessions expire after 1 hour of inactivity
- ✅ **Secure Password Reset**: OTP-based password recovery flow
- ✅ **No Unverified Accounts**: Database stays clean with verified users only

#### How It Works
1. **Signup** → Enter email + strong password → Receive 6-digit OTP via email
2. **Verify OTP** → Enter code from email → Account created automatically
3. **Login** → Email + password → Access dashboard
4. **Forgot Password** → Email → OTP → Set new password
5. **Auto-Logout** → No activity for 1 hour → Session expires

#### Email Delivery
- Uses **Nodemailer with Gmail SMTP** for reliable delivery
- Professional HTML emails with clear OTP display
- Works with any email provider (Gmail, Hotmail, Yahoo, etc.)
- No domain verification required

---

## 🛠️ Technology Stack

### Built With Free Tools
- **Frontend**: React + Vite (fast, modern web framework)
- **Database**: PostgreSQL via Supabase (free tier)
- **AI/OCR**: Tesseract.js (100% free, unlimited usage)
- **PDF Generation**: jsPDF (client-side PDF creation)
- **Charts**: Recharts (beautiful data visualizations)
- **Storage**: Supabase Storage (for receipts and PDFs)
- **Authentication**: Supabase Auth (secure login)
- **Hosting**: Vercel/Netlify (free deployment)

**Total Cost: $0** - All tools have generous free tiers perfect for personal use.

---

## 📱 How It Works

### Quick Start Flow
```
1. Sign Up → Create your free account
2. Create Categories → Set up your expense types (Food, Transport, etc.)
3. Scan Receipt → Take photo or upload image/PDF
4. Review → AI shows extracted data, you confirm/edit
5. Save → PDF generated, everything stored securely
6. Analyze → View spending reports and insights
```

### Main Screens

#### **Dashboard**
Your home screen with 3 simple buttons:
- 📸 **Scan Receipt** - Start scanning
- 📋 **View Receipts** - See past expenses
- 🏷️ **Categories** - Manage your categories

#### **Scan Receipt Screen**
1. Choose: Camera / Upload Image / Upload PDF
2. Capture or select your receipt
3. Wait for AI to read it (few seconds)
4. Select category from your list
5. Review and edit if needed
6. Generate PDF and save

#### **View Receipts Screen**
- Pick date range (e.g., "Last Month")
- See total spending amount
- Browse all receipts in that period
- View charts showing spending by category
- Click any receipt for full details

#### **Categories Screen**
- See all your expense categories
- Add new ones with custom colors/icons
- Edit or delete existing categories
- Changes apply immediately everywhere

---

## 🎨 Design Principles

### Mobile-First Experience
- Large, easy-to-tap buttons (perfect for thumbs)
- Bottom navigation for one-handed use
- Clear, readable text (no squinting!)
- Fast loading, even on slow connections
- Works great on phones AND tablets

### Simple & Clean
- No clutter - only what you need
- Intuitive icons and labels
- Consistent colors throughout
- Smooth animations and transitions
- Helpful error messages

### Privacy & Security
- Your data is yours alone
- Encrypted storage and transmission
- Secure authentication
- No data sharing with third parties

---

## 🚀 What's Next?

### Future Enhancements (Coming Soon)
- **Multi-currency support** - Track expenses in different currencies
- **Team features** - Share receipts with colleagues
- **Budget alerts** - Get notified when approaching spending limits
- **Export to Excel/CSV** - For accounting software integration
- **Email forwarding** - Forward email receipts directly
- **Auto-categorization** - AI suggests categories automatically
- **Tax insights** - Identify potential tax deductions
- **Dark mode** - Easier on the eyes at night

---

## ❓ FAQ

**Q: Is it really free?**  
A: Yes! All tools used have generous free tiers. You won't pay anything for personal use.

**Q: Do I need to install an app?**  
A: No! It works in your mobile browser. You can optionally "Add to Home Screen" for app-like experience.

**Q: What if the AI misreads my receipt?**  
A: You can review and edit all extracted data before saving. The AI gets better with good quality photos.

**Q: Can I use it offline?**  
A: Yes! Scan receipts offline, they'll sync when you're back online.

**Q: Is my data secure?**  
A: Absolutely. All data is encrypted, and only you can access your receipts.

**Q: What receipt formats are supported?**  
A: Photos (JPG, PNG) and PDFs. Works with printed and handwritten receipts (printed works better).

**Q: Can I export my data?**  
A: Yes! Download individual PDF reports. CSV export coming soon.

---

## 👤 About the Developer

**Ebrahim Al Mahbosh**  
Software Engineer specializing in full-stack development

- 📧 Email: swe.ebrahim@gmail.com
- 💻 GitHub: [SWE-Ebrahim](https://github.com/SWE-Ebrahim)
- 🎯 Focus: PERN & MERN stack development

---

## 📄 License

This project is built for personal and educational use. All technologies used are open-source with their respective licenses.

---

## ✅ Project Goals

receiptAI will be successful when:

- ✅ Anyone can easily scan and track their receipts
- ✅ No manual data entry required - AI does the work
- ✅ Beautiful PDF reports ready to share
- ✅ Clear insights into spending patterns
- ✅ Works flawlessly on mobile devices
- ✅ Completely free to use
- ✅ Your data stays private and secure

---

**Last Updated**: April 14, 2026  
**Version**: 1.0.0  
**Status**: In Development

---

## 📂 Project Structure

```
receiptAI/
├── backend/                 # Node.js/Express API server
│   ├── src/                # Source code
│   ├── scripts/            # Development/test scripts (git ignored)
│   ├── database/           # SQL migrations (git ignored)
│   ├── .env.example        # Environment template
│   └── README.md           # Backend documentation
├── receipt-ai/             # React frontend application
│   ├── src/                # Source code
│   ├── public/             # Static assets
│   └── README.md           # Frontend documentation
├── doc/                    # Project documentation
└── README.md               # This file (project overview)
```

### 📖 Documentation
- **[Backend README](backend/README.md)** - API endpoints, authentication, deployment
- **[Frontend README](receipt-ai/README.md)** - UI components, styling, build process
- **[Security Audit](backend/SECURITY_AUDIT.md)** - Security review (internal use)

---

## 📅 Development Timeline

### April 14, 2026 - Authentication System Complete ✅

#### Morning Session: Email Service & Security
- Switched from Resend to Nodemailer with Gmail SMTP
- Fixed OTP email delivery issues
- Implemented secure pending registration flow
- Created `pending_registrations` table in Supabase
- Added password strength validation

#### Afternoon Session: Login & Dashboard
- Built complete login page with eye icons for password visibility
- Removed "Remember me" checkbox (security best practice)
- Implemented auto-logout after 1 hour of inactivity
- Added activity tracking (mouse, keyboard, scroll, touch)
- Created dashboard page with user information display
- Built forgot password flow with OTP verification

#### Evening Session: Code Quality & Organization
- Added comprehensive comments throughout codebase
- Organized development scripts in `backend/scripts/` folder
- Updated `.gitignore` to protect sensitive files
- Created security audit documentation
- Optimized performance (passive event listeners, memory cleanup)
- Created detailed README files for backend and frontend

**Result**: Production-ready authentication system with:
- ✅ Secure email-based signup with OTP
- ✅ Login with session management
- ✅ Password reset via OTP
- ✅ Auto-logout functionality
- ✅ Clean, documented code
- ✅ Comprehensive documentation