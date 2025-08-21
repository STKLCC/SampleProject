// Application Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'vendor';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  vendorId: string;
  imageUrl?: string;
}

export interface Vendor {
  id: string;
  name: string;
  description: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  products: Product[];
}

export interface AppState {
  user: User | null;
  vendors: Vendor[];
  products: Product[];
  loading: boolean;
  error: string | null;
}

// Navigation Types
export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  children?: NavItem[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
