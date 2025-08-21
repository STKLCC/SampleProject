// Application Routes
export const ROUTES = {
  HOME: '/',
  VENDORS: '/vendors',
  PRODUCTS: '/products',
  ABOUT: '/about',
  CONTACT: '/contact',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  VENDOR_DETAILS: '/vendor/:id',
  PRODUCT_DETAILS: '/product/:id',
} as const;

// Navigation Items
export const NAV_ITEMS = [
  {
    label: 'Home',
    path: ROUTES.HOME,
  },
  {
    label: 'Vendors',
    path: ROUTES.VENDORS,
  },
  {
    label: 'Products',
    path: ROUTES.PRODUCTS,
  },
  {
    label: 'About',
    path: ROUTES.ABOUT,
  },
  {
    label: 'Contact',
    path: ROUTES.CONTACT,
  },
] as const;

// API Endpoints
export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  VENDORS: '/vendors',
  PRODUCTS: '/products',
  USERS: '/users',
  AUTH: '/auth',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
} as const;
