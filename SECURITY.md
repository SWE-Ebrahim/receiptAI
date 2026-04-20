# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in receiptAI, please report it responsibly.

### How to Report

**Email**: swe.ebrahim@gmail.com  
**Subject**: [SECURITY] Vulnerability Report - [Brief Description]

Please include the following information:
- Type of vulnerability (e.g., XSS, SQL injection, authentication bypass)
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)

### What to Expect

- **Initial Response**: Within 48 hours
- **Status Update**: Within 5 business days
- **Resolution Timeline**: Depends on severity (critical issues prioritized)

### Responsible Disclosure

We ask that you:
1. Do not publicly disclose the vulnerability until we've had a chance to address it
2. Provide reasonable time for us to fix the issue before any public disclosure
3. Make a good faith effort to avoid privacy violations and service disruption

### Scope

This policy covers:
- Backend API endpoints
- Authentication and authorization mechanisms
- Data storage and transmission
- File upload functionality
- OCR processing pipeline

Out of scope:
- Third-party dependencies (report to maintainers directly)
- Social engineering attacks
- Physical security issues

## Security Best Practices

receiptAI implements several security measures:

### Authentication
- OTP-based email verification
- Password strength requirements (8+ chars, uppercase, number, special char)
- Auto-logout after 1 hour of inactivity
- Secure session management

### Data Protection
- Encrypted data transmission (HTTPS)
- Secure password hashing via Supabase Auth
- No sensitive data stored client-side
- Input validation and sanitization

### Infrastructure
- Environment variables for sensitive configuration
- CORS protection
- Rate limiting on API endpoints
- SQL injection prevention via parameterized queries

## Known Limitations

- Client-side OCR (Tesseract.js) processes images locally - ensure device security
- Email delivery relies on third-party SMTP (Gmail)
- Database hosted on Supabase (shared infrastructure on free tier)

## Updates

Security updates will be:
- Announced via GitHub releases
- Documented in release notes
- Applied to the latest version

---

**Last Updated**: April 20, 2026
