import { z } from 'zod';
import xss from 'xss';

// Input validation schemas
export const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
    'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
  )
});

export const productSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  price: z.number().positive(),
  category: z.enum(['automation', 'integration', 'workflow']),
  tags: z.array(z.string()),
  image: z.string().url()
});

// XSS Protection
export const sanitizeInput = (input: string): string => {
  return xss(input, {
    whiteList: {}, // No tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
  });
};

// CSRF Token
export const generateCSRFToken = (): string => {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
};

// Rate Limiting
const requestCounts = new Map<string, { count: number; timestamp: number }>();

export const checkRateLimit = (ip: string, limit: number = 100, windowMs: number = 15 * 60 * 1000): boolean => {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (now - record.timestamp > windowMs) {
    // Reset if window has passed
    requestCounts.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
};

// Password Hashing (for demo - in real app use bcrypt)
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Secure Session Management
export const createSecureSession = (userId: string): string => {
  const sessionId = crypto.randomUUID();
  // In a real app, store this in a secure session store
  return sessionId;
};

// Input Validation Helper
export const validateAndSanitizeInput = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; error?: string } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Invalid input' };
  }
};

// Security Headers Helper
export const getSecurityHeaders = () => ({
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' https://images.unsplash.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; connect-src 'self' https://api.stripe.com https://js.stripe.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com;"
});