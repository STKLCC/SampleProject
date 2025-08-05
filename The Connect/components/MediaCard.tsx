import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ExternalLink, Heart, BookOpen } from 'lucide-react';
import { Button } from './ui/button';

interface MediaCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  icon: string;
  color: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onViewNews?: (outletId: string) => void;
}

export function MediaCard({ 
  id,
  name, 
  description, 
  category, 
  url, 
  icon, 
  color, 
  isFavorite = false,
  onToggleFavorite,
  onViewNews
}: MediaCardProps) {
  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.();
  };

  const handleViewNews = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewNews?.(id);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: color }}
            >
              <span className="text-xl">{icon}</span>
            </div>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <Badge variant="secondary" className="text-xs mt-1">
                {category}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteClick}
                className="p-2"
              >
                <Heart 
                  className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExternalClick}
              className="p-2"
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleViewNews}
            className="flex-1 flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            View News
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExternalClick}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Visit Site
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}