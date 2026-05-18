const rawUrl = import.meta.env.VITE_API_BASE_URL;

let fallbackUrl = 'http://localhost:5000';
if (typeof window !== 'undefined' && window.location && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
  // If loaded on a live production domain (e.g. Netlify), auto-route to the live Render backend API
  fallbackUrl = 'https://vendorverse-marketplacevendorverse.onrender.com';
}

const API_BASE_URL = (rawUrl && rawUrl !== 'undefined' && rawUrl !== 'null' && rawUrl.trim() !== '') 
  ? rawUrl 
  : fallbackUrl;

console.log('[VendorVerse] API_BASE_URL is configured as:', API_BASE_URL);

export default API_BASE_URL;

