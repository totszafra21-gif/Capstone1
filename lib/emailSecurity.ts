/**
 * Email Security Utilities
 * Provides validation, sanitization, and domain security features
 */

// Suspicious/disposable email domains to block
const BLOCKED_EMAIL_DOMAINS = [
  "tempmail.com",
  "throwaway.email",
  "guerrillamail.com",
  "mailinator.com",
  "10minutemail.com",
  "fakeinbox.com",
  "trashmail.com",
  "dispostable.com",
  "yopmail.com",
  "getnada.com",
  "maildrop.cc",
  "temp-mail.org",
  "fakeemail.com",
  "throwawaymail.com",
  "mintemail.com",
  "sharklasers.com",
  "spam4.me",
  "grr.la",
  "mailnesia.com",
  "tempail.com",
  "emailondeck.com",
  "dropmail.me",
  "spamgourmet.com",
  "mytemp.email",
  "tempemail.net",
  "discard.email",
  "burnermail.io",
  "emailfake.com",
  "tempmailaddress.com",
  "tempr.email",
];

// Suspicious TLDs often used in spam
const SUSPICIOUS_TLDS = [".xyz", ".top", ".click", ".link", ".work", ".date", ".racing"];

/**
 * Validate email format using RFC 5322 compliant regex
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  
  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  
  return emailRegex.test(email.trim().toLowerCase());
}

/**
 * Check if email uses a blocked/disposable domain
 */
export function isBlockedEmailDomain(email: string): boolean {
  if (!email) return false;
  
  const domain = email.toLowerCase().split("@")[1];
  if (!domain) return false;
  
  return BLOCKED_EMAIL_DOMAINS.some(blocked => 
    domain === blocked || domain.endsWith("." + blocked)
  );
}

/**
 * Check if email uses a suspicious TLD
 */
export function hasSuspiciousTLD(email: string): boolean {
  if (!email) return false;
  
  const domain = email.toLowerCase().split("@")[1];
  if (!domain) return false;
  
  return SUSPICIOUS_TLDS.some(tld => domain.endsWith(tld));
}

/**
 * Sanitize email input - remove potentially dangerous characters
 */
export function sanitizeEmailInput(email: string): string {
  if (!email) return "";
  
  return email
    .trim()
    .toLowerCase()
    // Remove null bytes and control characters
    .replace(/[\x00-\x1F\x7F]/g, "")
    // Remove extra whitespace
    .replace(/\s+/g, " ")
    // Encode HTML entities to prevent XSS
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    // Remove newlines to prevent header injection
    .replace(/[\r\n]/g, "");
}

/**
 * Comprehensive email security check
 * Returns object with validation results and error messages
 */
export function validateEmailSecurity(email: string): {
  isValid: boolean;
  errors: string[];
  sanitized: string;
} {
  const errors: string[] = [];
  const sanitized = sanitizeEmailInput(email);
  
  // Check if empty
  if (!email) {
    errors.push("Email is required");
    return { isValid: false, errors, sanitized };
  }
  
  // Check format
  if (!isValidEmailFormat(email)) {
    errors.push("Please enter a valid email address");
  }
  
  // Check blocked domains
  if (isBlockedEmailDomain(email)) {
    errors.push("Temporary/disposable email addresses are not allowed");
  }
  
  // Check suspicious TLDs
  if (hasSuspiciousTLD(email)) {
    errors.push("This email domain is not allowed");
  }
  
  // Check for potential email injection attempts
  if (email.includes("\n") || email.includes("\r") || email.includes("%0A") || email.includes("%0D")) {
    errors.push("Invalid characters in email address");
  }
  
  // Check email length
  if (email.length > 254) {
    errors.push("Email address is too long");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
}

/**
 * Get password strength score (0-4)
 */
export function getPasswordStrength(password: string): number {
  if (!password) return 0;
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 0.25;
  if (/[A-Z]/.test(password)) score += 0.25;
  if (/[0-9]/.test(password)) score += 0.25;
  if (/[^a-zA-Z0-9]/.test(password)) score += 0.25;
  
  return Math.min(4, Math.floor(score));
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(strength: number): string {
  switch (strength) {
    case 0:
    case 1:
      return "Weak";
    case 2:
      return "Fair";
    case 3:
      return "Good";
    case 4:
      return "Strong";
    default:
      return "Unknown";
  }
}

/**
 * Get password strength color
 */
export function getPasswordStrengthColor(strength: number): string {
  switch (strength) {
    case 0:
    case 1:
      return "text-red-500";
    case 2:
      return "text-yellow-500";
    case 3:
      return "text-blue-500";
    case 4:
      return "text-green-500";
    default:
      return "text-gray-500";
  }
}