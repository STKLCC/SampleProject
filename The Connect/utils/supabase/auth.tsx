import { supabase } from './client';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
  };
}

export interface AuthSession {
  access_token: string;
  user: AuthUser;
}

export async function signUp(email: string, password: string, name: string): Promise<{ data?: AuthSession; error?: string }> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/make-server-b30f3230/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Sign up failed');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('Sign up error:', error);
    return { error: error instanceof Error ? error.message : 'Sign up failed' };
  }
}

export async function signIn(email: string, password: string): Promise<{ data?: AuthSession; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.session) {
      throw new Error('No session returned');
    }

    return {
      data: {
        access_token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email!,
          user_metadata: data.user.user_metadata,
        },
      },
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { error: error instanceof Error ? error.message : 'Sign in failed' };
  }
}

export async function signOut(): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    return {};
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error instanceof Error ? error.message : 'Sign out failed' };
  }
}

export async function getSession(): Promise<{ data?: AuthSession; error?: string }> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    if (!data.session) {
      return {};
    }

    return {
      data: {
        access_token: data.session.access_token,
        user: {
          id: data.session.user.id,
          email: data.session.user.email!,
          user_metadata: data.session.user.user_metadata,
        },
      },
    };
  } catch (error) {
    console.error('Get session error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to get session' };
  }
}