interface User {
  id: number;
  email: string;
  name: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export const useAuth = () => {
  const user = useState<User | null>('auth.user', () => null);
  const token = useState<string | null>('auth.token', () => null);
  const isLoggedIn = computed(() => !!user.value && !!token.value);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.status === 200) {
        user.value = response.data.user;
        token.value = response.data.token;
        
        // In a real app, you'd store the token securely
        if (process.client) {
          localStorage.setItem('auth_token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return { success: true };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    
    if (process.client) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
    
    navigateTo('/login');
  };

  const initAuth = () => {
    if (process.client) {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        token.value = storedToken;
        user.value = JSON.parse(storedUser);
      }
    }
  };

  return {
    user: readonly(user),
    token: readonly(token),
    isLoggedIn,
    login,
    logout,
    initAuth
  };
};