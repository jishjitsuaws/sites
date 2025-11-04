import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - Unsanitized HTML string
 * @param options - DOMPurify configuration options
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (
  dirty: string,
  options?: any
): string => {
  if (!dirty || typeof dirty !== 'string') return '';
  
  const defaultOptions = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'a', 'span', 
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  };

  return String(DOMPurify.sanitize(dirty, { ...defaultOptions, ...options }));
};

/**
 * Sanitize plain text content (strips all HTML tags)
 * @param dirty - Unsanitized text string
 * @returns Plain text without HTML tags
 */
export const sanitizeText = (dirty: string): string => {
  if (!dirty || typeof dirty !== 'string') return '';
  
  return String(DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }));
};

/**
 * Sanitize URL to prevent javascript: and data: URI attacks
 * @param url - Unsanitized URL
 * @returns Sanitized URL or empty string if invalid
 */
export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  
  const trimmedUrl = url.trim();
  
  // Block dangerous protocols
  if (
    trimmedUrl.startsWith('javascript:') ||
    trimmedUrl.startsWith('data:') ||
    trimmedUrl.startsWith('vbscript:') ||
    trimmedUrl.startsWith('file:')
  ) {
    return '';
  }
  
  return String(sanitizeHtml(trimmedUrl, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }));
};

/**
 * Sanitize component props to prevent XSS
 * @param props - Component properties object
 * @returns Sanitized props object
 */
export const sanitizeComponentProps = (props: Record<string, any>): Record<string, any> => {
  if (!props || typeof props !== 'object') return {};
  
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      // Sanitize string values
      if (key === 'url' || key === 'href' || key === 'link' || key === 'src') {
        sanitized[key] = sanitizeUrl(value);
      } else if (key.toLowerCase().includes('html') || key === 'content') {
        sanitized[key] = sanitizeHtml(value);
      } else {
        sanitized[key] = sanitizeText(value);
      }
    } else if (Array.isArray(value)) {
      // Sanitize array items
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeText(item) : item
      );
    } else if (value && typeof value === 'object') {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeComponentProps(value);
    } else {
      // Keep non-string values as-is (numbers, booleans, etc.)
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Escape HTML entities for safe display
 * @param text - Text to escape
 * @returns Escaped text
 */
export const escapeHtml = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
};
