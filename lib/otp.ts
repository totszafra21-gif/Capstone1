/**
 * OTP Utility Functions
 * Generate, validate, and manage 6-digit verification codes
 */

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Check if OTP is expired (10 minutes)
export function isOTPExpired(createdAt: string): boolean {
  const otpCreated = new Date(createdAt).getTime();
  const now = new Date().getTime();
  const tenMinutes = 10 * 60 * 1000;
  return now - otpCreated > tenMinutes;
}

// Mask email for display (e.g., j***@gmail.com)
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (local.length <= 3) {
    return `${local[0]}***@${domain}`;
  }
  return `${local.slice(0, 2)}***@${domain}`;
}

// Validate OTP format (6 digits)
export function isValidOTPFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}