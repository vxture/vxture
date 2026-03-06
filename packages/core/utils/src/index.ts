/**
 * index.ts - Vxture Core Utilities Package
 * @package @vxture/core-utils
 *
 * Description: General-purpose utility functions for Vxture platform,
 * providing common helpers for development.
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Core
 * @category Utilities
 */

// ============================================
// String Utilities
// ============================================

/**
 * Check if string is empty
 * @param str String to check
 * @returns Boolean indicating if string is empty
 */
export function isEmpty(str: string | null | undefined): boolean {
  return str == null || str.trim().length === 0;
}

/**
 * Check if string contains substring
 * @param str Original string
 * @param substr Substring to check
 * @param caseInsensitive Case insensitive check
 * @returns Boolean indicating if substring exists
 */
export function contains(
  str: string,
  substr: string,
  caseInsensitive: boolean = false
): boolean {
  if (!str || !substr) {
    return false;
  }

  const searchStr = caseInsensitive ? str.toLowerCase() : str;
  const searchSubstr = caseInsensitive ? substr.toLowerCase() : substr;

  return searchStr.includes(searchSubstr);
}

/**
 * Truncate string with ellipsis
 * @param str String to truncate
 * @param length Maximum length
 * @param ellipsis Ellipsis character(s)
 * @returns Truncated string
 */
export function truncate(
  str: string,
  length: number,
  ellipsis: string = '...'
): string {
  if (str.length <= length) {
    return str;
  }

  return str.slice(0, length - ellipsis.length) + ellipsis;
}

/**
 * Capitalize first letter
 * @param str String to capitalize
 * @returns String with first letter capitalized
 */
export function capitalizeFirst(str: string): string {
  if (!str) {
    return str;
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to camelCase
 * @param str String to convert
 * @param separator Word separator
 * @returns camelCase string
 */
export function toCamelCase(str: string, separator: string = '-'): string {
  return str.split(separator).map((word, index) => {
    if (index === 0) {
      return word.toLowerCase();
    }

    return capitalizeFirst(word.toLowerCase());
  }).join('');
}

/**
 * Convert string to PascalCase
 * @param str String to convert
 * @param separator Word separator
 * @returns PascalCase string
 */
export function toPascalCase(str: string, separator: string = '-'): string {
  return str.split(separator).map((word) => {
    return capitalizeFirst(word.toLowerCase());
  }).join('');
}

/**
 * Convert string to kebab-case
 * @param str String to convert
 * @returns kebab-case string
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ============================================
// Number Utilities
// ============================================

/**
 * Check if value is a number
 * @param value Value to check
 * @returns Boolean indicating if value is a number
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Check if number is within range
 * @param num Number to check
 * @param min Minimum value
 * @param max Maximum value
 * @returns Boolean indicating if number is in range
 */
export function inRange(num: number, min: number, max: number): boolean {
  return num >= min && num <= max;
}

/**
 * Clamp number to range
 * @param num Number to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped number
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, num));
}

/**
 * Generate random number
 * @param min Minimum value
 * @param max Maximum value
 * @returns Random number
 */
export function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate random integer
 * @param min Minimum value
 * @param max Maximum value
 * @returns Random integer
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(random(min, max + 1));
}

// ============================================
// Array Utilities
// ============================================

/**
 * Check if array is empty
 * @param arr Array to check
 * @returns Boolean indicating if array is empty
 */
export function isArrayEmpty(arr: any[]): boolean {
  return !arr || arr.length === 0;
}

/**
 * Get intersection of two arrays
 * @param arr1 First array
 * @param arr2 Second array
 * @returns Intersection of arrays
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter((item) => arr2.includes(item));
}

/**
 * Get union of two arrays
 * @param arr1 First array
 * @param arr2 Second array
 * @returns Union of arrays
 */
export function union<T>(arr1: T[], arr2: T[]): T[] {
  return [...new Set([...arr1, ...arr2])];
}

/**
 * Get difference of two arrays
 * @param arr1 First array
 * @param arr2 Second array
 * @returns Difference of arrays
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter((item) => !arr2.includes(item));
}

/**
 * Remove duplicates from array
 * @param arr Array to process
 * @returns Array with duplicates removed
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Shuffle array
 * @param arr Array to shuffle
 * @returns Shuffled array
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Chunk array into smaller arrays
 * @param arr Array to chunk
 * @param size Chunk size
 * @returns Array of chunks
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }

  return result;
}

// ============================================
// Object Utilities
// ============================================

/**
 * Check if value is an object
 * @param value Value to check
 * @returns Boolean indicating if value is an object
 */
export function isObject(value: any): value is object {
  return value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Check if object is empty
 * @param obj Object to check
 * @returns Boolean indicating if object is empty
 */
export function isObjectEmpty(obj: object): boolean {
  return obj && Object.keys(obj).length === 0;
}

/**
 * Deep merge two objects
 * @param target Target object
 * @param source Source object
 * @returns Merged object
 */
export function deepMerge<T extends object>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key in source) {
    const targetValue = result[key as keyof T];
    const sourceValue = source[key as keyof T];

    if (
      isObject(targetValue) &&
      isObject(sourceValue) &&
      targetValue &&
      sourceValue
    ) {
      result[key as keyof T] = deepMerge(
        targetValue as unknown as object,
        sourceValue as unknown as object
      ) as unknown as T[keyof T];
    } else if (sourceValue !== undefined) {
      result[key as keyof T] = sourceValue as T[keyof T];
    }
  }

  return result;
}

/**
 * Deep clone object
 * @param obj Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const clonedObj: any = {};

    for (const key in obj) {
      if (obj[key] !== undefined) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }

    return clonedObj as T;
  }

  return obj;
}

/**
 * Pick properties from object
 * @param obj Object to pick from
 * @param keys Properties to pick
 * @returns Object with selected properties
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result: any = {};

  keys.forEach((key) => {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  });

  return result;
}

/**
 * Omit properties from object
 * @param obj Object to omit from
 * @param keys Properties to omit
 * @returns Object without selected properties
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result: any = {};

  Object.keys(obj).forEach((key) => {
    if (!keys.includes(key as unknown as K)) {
      result[key] = obj[key as keyof T];
    }
  });

  return result;
}

// ============================================
// Validation Utilities
// ============================================

/**
 * Validate email format
 * @param email Email to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 * @param url URL to validate
 * @returns Boolean indicating if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate phone number (simple check)
 * @param phone Phone number to validate
 * @returns Boolean indicating if phone number is valid
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+\d\s()-]+$/;
  return phoneRegex.test(phone) && phone.length > 5;
}

/**
 * Validate password strength
 * @param password Password to validate
 * @param options Validation options
 * @returns Password strength score (0-4)
 */
export function validatePassword(
  password: string,
  options: { minLength?: number; requireNumbers?: boolean; requireSymbols?: boolean } = {}
): number {
  const { minLength = 8, requireNumbers = true, requireSymbols = true } = options;

  let score = 0;

  if (password.length >= minLength) {
    score++;
  }

  if (password.length >= minLength + 4) {
    score++;
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  }

  if (requireNumbers && /\d/.test(password)) {
    score++;
  }

  if (requireSymbols && /[!@#$%^&*()_+{}\[\]:;"'<>,.?~\\/-]/.test(password)) {
    score++;
  }

  return Math.min(score, 4);
}

// ============================================
// Date Utilities
// ============================================

/**
 * Format date as ISO string
 * @param date Date to format
 * @returns ISO string
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Format date as local string
 * @param date Date to format
 * @param format Format string
 * @returns Formatted string
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Check if date is today
 * @param date Date to check
 * @returns Boolean indicating if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is yesterday
 * @param date Date to check
 * @returns Boolean indicating if date is yesterday
 */
export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Get time difference in milliseconds
 * @param date1 First date
 * @param date2 Second date
 * @returns Time difference in milliseconds
 */
export function getTimeDiff(date1: Date, date2: Date): number {
  return Math.abs(date1.getTime() - date2.getTime());
}

/**
 * Get formatted time duration
 * @param milliseconds Duration in milliseconds
 * @returns Formatted duration string
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }

  return `${seconds}s ${milliseconds % 1000}ms`;
}

// ============================================
// DOM Utilities
// ============================================

/**
 * Check if DOM element exists
 * @param selector CSS selector
 * @param context Context element
 * @returns Boolean indicating if element exists
 */
export function elementExists(
  selector: string,
  context: HTMLElement | Document = document
): boolean {
  return context.querySelector(selector) !== null;
}

/**
 * Get DOM element
 * @param selector CSS selector
 * @param context Context element
 * @returns DOM element or null
 */
export function getElement(
  selector: string,
  context: HTMLElement | Document = document
): HTMLElement | null {
  return context.querySelector(selector);
}

/**
 * Get all DOM elements matching selector
 * @param selector CSS selector
 * @param context Context element
 * @returns Array of DOM elements
 */
export function getElements(
  selector: string,
  context: HTMLElement | Document = document
): HTMLElement[] {
  return Array.from(context.querySelectorAll(selector));
}

/**
 * Create DOM element
 * @param tagName Tag name
 * @param attributes Attributes
 * @param children Children elements or text
 * @returns Created DOM element
 */
export function createElement(
  tagName: string,
  attributes: Record<string, string> = {},
  children: Array<HTMLElement | string> = []
): HTMLElement {
  const element = document.createElement(tagName);

  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key.startsWith('data-')) {
      element.setAttribute(key, value);
    } else if (key === 'className') {
      element.className = value;
    } else if (key === 'style') {
      element.style.cssText = value;
    } else {
      (element as any)[key] = value;
    }
  });

  // Add children
  children.forEach((child) => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child) {
      element.appendChild(child);
    }
  });

  return element;
}

/**
 * Add class to DOM element
 * @param element DOM element
 * @param className Class name
 */
export function addClass(element: HTMLElement, className: string): void {
  if (element && className) {
    element.classList.add(className);
  }
}

/**
 * Remove class from DOM element
 * @param element DOM element
 * @param className Class name
 */
export function removeClass(element: HTMLElement, className: string): void {
  if (element && className) {
    element.classList.remove(className);
  }
}

/**
 * Toggle class on DOM element
 * @param element DOM element
 * @param className Class name
 * @param force Force toggle
 */
export function toggleClass(
  element: HTMLElement,
  className: string,
  force?: boolean
): boolean {
  if (!element || !className) {
    return false;
  }

  return element.classList.toggle(className, force);
}

/**
 * Check if DOM element has class
 * @param element DOM element
 * @param className Class name
 * @returns Boolean indicating if element has class
 */
export function hasClass(element: HTMLElement, className: string): boolean {
  if (!element || !className) {
    return false;
  }

  return element.classList.contains(className);
}

// ============================================
// Storage Utilities
// ============================================

/**
 * Check if storage is available
 * @param type Storage type (localStorage or sessionStorage)
 * @returns Boolean indicating if storage is available
 */
export function isStorageAvailable(type: 'local' | 'session' = 'local'): boolean {
  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    const x = '__storage_test__';

    storage.setItem(x, x);
    storage.removeItem(x);

    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get item from storage
 * @param key Storage key
 * @param type Storage type
 * @returns Stored value or null
 */
export function getStorageItem(
  key: string,
  type: 'local' | 'session' = 'local'
): string | null {
  if (!isStorageAvailable(type)) {
    return null;
  }

  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    return storage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Set item in storage
 * @param key Storage key
 * @param value Stored value
 * @param type Storage type
 * @returns Boolean indicating if operation succeeded
 */
export function setStorageItem(
  key: string,
  value: string,
  type: 'local' | 'session' = 'local'
): boolean {
  if (!isStorageAvailable(type)) {
    return false;
  }

  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove item from storage
 * @param key Storage key
 * @param type Storage type
 * @returns Boolean indicating if operation succeeded
 */
export function removeStorageItem(
  key: string,
  type: 'local' | 'session' = 'local'
): boolean {
  if (!isStorageAvailable(type)) {
    return false;
  }

  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear storage
 * @param type Storage type
 * @returns Boolean indicating if operation succeeded
 */
export function clearStorage(type: 'local' | 'session' = 'local'): boolean {
  if (!isStorageAvailable(type)) {
    return false;
  }

  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    storage.clear();
    return true;
  } catch {
    return false;
  }
}

// ============================================
// Debounce & Throttle
// ============================================

/**
 * Debounce function
 * @param func Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>): void => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function
 * @param func Function to throttle
 * @param delay Delay in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>): void => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

// ============================================
// Event Utilities
// ============================================

/**
 * Add event listener
 * @param target Event target
 * @param type Event type
 * @param listener Event listener
 * @param options Event options
 * @returns Unsubscribe function
 */
export function addEventListener(
  target: EventTarget,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions
): () => void {
  target.addEventListener(type, listener, options);

  return () => {
    target.removeEventListener(type, listener, options);
  };
}

/**
 * Add multiple event listeners
 * @param target Event target
 * @param events Events to listen for
 * @param listener Event listener
 * @param options Event options
 * @returns Unsubscribe function
 */
export function addEventListeners(
  target: EventTarget,
  events: string[],
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions
): () => void {
  events.forEach((event) => {
    target.addEventListener(event, listener, options);
  });

  return () => {
    events.forEach((event) => {
      target.removeEventListener(event, listener, options);
    });
  };
}

/**
 * Trigger event
 * @param target Event target
 * @param type Event type
 * @param detail Event detail
 */
export function triggerEvent(
  target: EventTarget,
  type: string,
  detail?: any
): void {
  const event = new CustomEvent(type, {
    detail,
    bubbles: true,
    cancelable: true,
  });

  target.dispatchEvent(event);
}

// ============================================
// Performance Utilities
// ============================================

/**
 * Measure function performance
 * @param func Function to measure
 * @param iterations Number of iterations
 * @returns Average time per call in milliseconds
 */
export function measurePerformance(
  func: () => any,
  iterations: number = 1000
): number {
  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    func();
  }

  const endTime = performance.now();
  return (endTime - startTime) / iterations;
}

// ============================================
// Environment Utilities
// ============================================

/**
 * Check if running in browser
 * @returns Boolean indicating if running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Check if running in Node.js
 * @returns Boolean indicating if running in Node.js
 */
export function isNode(): boolean {
  return typeof process !== 'undefined' && process.versions?.node;
}

/**
 * Check if running in development mode
 * @returns Boolean indicating if running in development mode
 */
export function isDevelopment(): boolean {
  if (isNode()) {
    return process.env.NODE_ENV === 'development';
  }

  if (isBrowser()) {
    return window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }

  return false;
}

/**
 * Check if running in production mode
 * @returns Boolean indicating if running in production mode
 */
export function isProduction(): boolean {
  if (isNode()) {
    return process.env.NODE_ENV === 'production';
  }

  return !isDevelopment();
}

// ============================================
// Security Utilities
// ============================================

/**
 * Sanitize HTML string
 * @param html HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(html: string): string {
  if (isBrowser()) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  }

  // Simple sanitization for Node.js (more complex in real implementation)
  return html.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate random string
 * @param length Length of random string
 * @param characters Characters to use
 * @returns Random string
 */
export function randomString(
  length: number,
  characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = '';

  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * characters.length);
    result += characters.charAt(index);
  }

  return result;
}

/**
 * Generate unique ID
 * @param prefix ID prefix
 * @returns Unique ID
 */
export function uniqueId(prefix: string = ''): string {
  return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
}