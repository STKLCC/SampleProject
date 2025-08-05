import { useState, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { NewsPage } from './components/NewsPage';
import { supabase } from './utils/supabase/client';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'news'>('dashboard');
  const [selectedOutlet, setSelectedOutlet] = useState<{
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null>(null);

  // Check for existing session on app load
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking session:', error);
      } else if (session?.access_token && session?.user) {
        setIsLoggedIn(true);
        setUser(session.user);
        setAccessToken(session.access_token);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (userData: any, token: string) => {
    setIsLoggedIn(true);
    setUser(userData);
    setAccessToken(token);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setAccessToken('');
    setCurrentView('dashboard');
    setSelectedOutlet(null);
  };

  const handleViewNews = (outletId: string, outletName: string, outletIcon: string, outletColor: string) => {
    setSelectedOutlet({ id: outletId, name: outletName, icon: outletIcon, color: outletColor });
    setCurrentView('news');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedOutlet(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {isLoggedIn && user ? (
        currentView === 'dashboard' ? (
          <Dashboard 
            user={user} 
            accessToken={accessToken} 
            onLogout={handleLogout}
            onViewNews={handleViewNews}
          />
        ) : currentView === 'news' && selectedOutlet ? (
          <NewsPage
            outletId={selectedOutlet.id}
            outletName={selectedOutlet.name}
            outletIcon={selectedOutlet.icon}
            outletColor={selectedOutlet.color}
            accessToken={accessToken}
            onBack={handleBackToDashboard}
          />
        ) : null
      ) : (
        <AuthForm onLogin={handleLogin} />
      )}
    </div>
  );
}