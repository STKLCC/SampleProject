import { useState, useCallback } from 'react';
import { api } from '../utils/api';
import { ApiResponse } from '../types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  initialData: T | null = null
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const response = await apiFunction(...args);
        setState(prev => ({
          ...prev,
          data: response.data,
          loading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'An error occurred',
          loading: false,
        }));
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
    });
  }, [initialData]);

  return {
    ...state,
    execute,
    reset,
  };
}

// Specific API hooks
export function useGet<T>(endpoint: string) {
  return useApi(() => api.get<ApiResponse<T>>(endpoint));
}

export function usePost<T>(endpoint: string) {
  return useApi((data: any) => api.post<ApiResponse<T>>(endpoint, data));
}

export function usePut<T>(endpoint: string) {
  return useApi((data: any) => api.put<ApiResponse<T>>(endpoint, data));
}

export function useDelete<T>(endpoint: string) {
  return useApi(() => api.delete<ApiResponse<T>>(endpoint));
}
