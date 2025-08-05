import { useState, useEffect } from 'react';
import { MediaCard } from './MediaCard';
import { Button } from './ui/button';
import { LogOut, Search, Filter, Heart } from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DashboardProps {
  user: any;
  accessToken: string;
  onLogout: () => void;
  onViewNews: (outletId: string, outletName: string, outletIcon: string, outletColor: string) => void;
}

const mediaOutlets = [
  {
    id: 'cnn',
    name: 'CNN',
    description: 'Breaking news, latest news and current events',
    category: 'News',
    url: 'https://cnn.com',
    icon: '📺',
    color: '#CC0000'
  },
  {
    id: 'bbc',
    name: 'BBC News',
    description: 'Home of the BBC on the internet',
    category: 'News',
    url: 'https://bbc.com/news',
    icon: '🏢',
    color: '#BB1919'
  },
  {
    id: 'nyt',
    name: 'The New York Times',
    description: 'Breaking news, world news & multimedia',
    category: 'News',
    url: 'https://nytimes.com',
    icon: '📰',
    color: '#000000'
  },
  {
    id: 'reuters',
    name: 'Reuters',
    description: 'Latest international news and world events',
    category: 'News',
    url: 'https://reuters.com',
    icon: '🌍',
    color: '#FF6600'
  },
  {
    id: 'guardian',
    name: 'The Guardian',
    description: 'Latest US and world news, sport and comment',
    category: 'News',
    url: 'https://theguardian.com',
    icon: '🛡️',
    color: '#052962'
  },
  {
    id: 'fox',
    name: 'Fox News',
    description: 'Breaking news and opinion on politics, business, entertainment',
    category: 'News',
    url: 'https://foxnews.com',
    icon: '🦊',
    color: '#003366'
  },
  {
    id: 'ap',
    name: 'Associated Press',
    description: 'The definitive source for global and local news',
    category: 'News',
    url: 'https://apnews.com',
    icon: '⚡',
    color: '#D71920'
  },
  {
    id: 'nbc',
    name: 'NBC News',
    description: 'Breaking news, videos, and the latest top stories',
    category: 'News',
    url: 'https://nbcnews.com',
    icon: '🎭',
    color: '#0078D4'
  },
  {
    id: 'abc',
    name: 'ABC News',
    description: 'Your trusted source for breaking news, analysis',
    category: 'News',
    url: 'https://abcnews.go.com',
    icon: '🔤',
    color: '#FF2D00'
  },
  {
    id: 'cbs',
    name: 'CBS News',
    description: 'Breaking news, live video, traffic, weather and sports',
    category: 'News',
    url: 'https://cbsnews.com',
    icon: '👁️',
    color: '#00205B'
  },
  {
    id: 'espn',
    name: 'ESPN',
    description: 'The worldwide leader in sports',
    category: 'Sports',
    url: 'https://espn.com',
    icon: '⚽',
    color: '#FF0000'
  },
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    description: 'The latest technology news and information',
    category: 'Technology',
    url: 'https://techcrunch.com',
    icon: '💻',
    color: '#00D4AA'
  }
];

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export function Dashboard({ user, accessToken, onLogout, onViewNews }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteOutlets, setFavoriteOutlets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['all', ...new Set(mediaOutlets.map(outlet => outlet.category))];

  // Load user preferences on component mount
  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b30f3230/user-preferences`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavoriteOutlets(data.preferences.favoriteOutlets || []);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPreferences = async (newFavorites: string[]) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b30f3230/user-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          preferences: {
            favoriteOutlets: newFavorites,
            theme: 'light',
            notifications: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  };

  const toggleFavorite = async (outletId: string) => {
    const newFavorites = favoriteOutlets.includes(outletId)
      ? favoriteOutlets.filter(id => id !== outletId)
      : [...favoriteOutlets, outletId];
    
    setFavoriteOutlets(newFavorites);
    await updateUserPreferences(newFavorites);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const filteredOutlets = mediaOutlets.filter(outlet => {
    const matchesSearch = outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         outlet.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || outlet.category === selectedCategory;
    const matchesFavorites = !showFavoritesOnly || favoriteOutlets.includes(outlet.id);
    
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Media Hub</h1>
              <p className="text-muted-foreground">
                Welcome back, {user.user_metadata?.name || user.email}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search media outlets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Favorites
              {favoriteOutlets.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {favoriteOutlets.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOutlets.map((outlet) => (
            <MediaCard
              key={outlet.id}
              id={outlet.id}
              name={outlet.name}
              description={outlet.description}
              category={outlet.category}
              url={outlet.url}
              icon={outlet.icon}
              color={outlet.color}
              isFavorite={favoriteOutlets.includes(outlet.id)}
              onToggleFavorite={() => toggleFavorite(outlet.id)}
              onViewNews={() => onViewNews(outlet.id, outlet.name, outlet.icon, outlet.color)}
            />
          ))}
        </div>

        {filteredOutlets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {showFavoritesOnly 
                ? "No favorite outlets found. Start by adding some favorites!"
                : "No media outlets found matching your criteria."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}