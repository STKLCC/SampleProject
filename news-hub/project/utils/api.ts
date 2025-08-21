interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      // In a real app, this would make an actual API call
      // const response = await fetch(`${this.baseURL}${endpoint}`);
      // const data = await response.json();
      
      // For now, we'll simulate API calls and return hardcoded data
      console.log(`API GET request to: ${endpoint}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return this.getMockData<T>(endpoint);
    } catch (error) {
      console.error('API GET Error:', error);
      throw new Error('Failed to fetch data');
    }
  }

  async post<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      // In a real app, this would make an actual API call
      // const response = await fetch(`${this.baseURL}${endpoint}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // const responseData = await response.json();
      
      console.log(`API POST request to: ${endpoint}`, data);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return this.getMockData<T>(endpoint, data);
    } catch (error) {
      console.error('API POST Error:', error);
      throw new Error('Failed to post data');
    }
  }

  private getMockData<T>(endpoint: string, postData?: any): ApiResponse<T> {
    // Mock responses based on endpoint
    if (endpoint === '/auth/login') {
      return {
        data: {
          token: 'mock-jwt-token-12345',
          user: {
            id: 1,
            email: postData?.email || 'user@example.com',
            name: 'John Doe'
          }
        } as T,
        status: 200,
        message: 'Login successful'
      };
    }

    if (endpoint === '/media-platforms') {
      return {
        data: [
          {
            id: 1,
            name: 'CNN',
            description: 'Breaking news and analysis',
            logo: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=400',
            category: 'News'
          },
          {
            id: 2,
            name: 'BBC News',
            description: 'World news and current affairs',
            logo: 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&w=400',
            category: 'News'
          },
          {
            id: 3,
            name: 'TechCrunch',
            description: 'Technology and startup news',
            logo: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=400',
            category: 'Technology'
          },
          {
            id: 4,
            name: 'Reuters',
            description: 'International news and analysis',
            logo: 'https://images.pexels.com/photos/1591061/pexels-photo-1591061.jpeg?auto=compress&cs=tinysrgb&w=400',
            category: 'News'
          },
          {
            id: 5,
            name: 'The Guardian',
            description: 'Independent journalism',
            logo: 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=400',
            category: 'News'
          },
          {
            id: 6,
            name: 'Wired',
            description: 'Technology, science, and culture',
            logo: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400',
            category: 'Technology'
          }
        ] as T,
        status: 200
      };
    }

    if (endpoint.startsWith('/news/')) {
      const platformId = endpoint.split('/')[2];
      return {
        data: [
          {
            id: 1,
            headline: 'Breaking: Major Technology Breakthrough Announced',
            summary: 'Scientists have made a significant breakthrough in quantum computing that could revolutionize the tech industry. The new development promises faster processing speeds and enhanced security features.',
            image: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=600',
            originalUrl: 'https://example.com/news/tech-breakthrough',
            publishedAt: '2024-01-20T10:30:00Z',
            author: 'Tech Reporter'
          },
          {
            id: 2,
            headline: 'Global Climate Summit Reaches Historic Agreement',
            summary: 'World leaders have reached a unprecedented agreement on climate action during the latest global summit. The deal includes ambitious targets for carbon reduction and renewable energy adoption.',
            image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=600',
            originalUrl: 'https://example.com/news/climate-agreement',
            publishedAt: '2024-01-20T08:15:00Z',
            author: 'Environmental Correspondent'
          },
          {
            id: 3,
            headline: 'Economic Markets Show Strong Recovery Signs',
            summary: 'Financial markets are displaying robust recovery indicators following recent policy changes. Analysts predict continued growth in the coming quarters with increased investor confidence.',
            image: 'https://images.pexels.com/photos/1602726/pexels-photo-1602726.jpeg?auto=compress&cs=tinysrgb&w=600',
            originalUrl: 'https://example.com/news/market-recovery',
            publishedAt: '2024-01-20T06:45:00Z',
            author: 'Financial Analyst'
          },
          {
            id: 4,
            headline: 'Space Exploration Mission Achieves New Milestone',
            summary: 'The latest space mission has successfully achieved its primary objectives, marking a new chapter in space exploration. The mission collected valuable data that will advance our understanding of the universe.',
            image: 'https://images.pexels.com/photos/2159/flight-sky-earth-space.jpg?auto=compress&cs=tinysrgb&w=600',
            originalUrl: 'https://example.com/news/space-milestone',
            publishedAt: '2024-01-19T22:20:00Z',
            author: 'Space Correspondent'
          },
          {
            id: 5,
            headline: 'Healthcare Innovation Promises Better Patient Outcomes',
            summary: 'A revolutionary healthcare technology has been developed that could significantly improve patient care and treatment outcomes. The innovation combines AI with traditional medical practices.',
            image: 'https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=600',
            originalUrl: 'https://example.com/news/healthcare-innovation',
            publishedAt: '2024-01-19T18:30:00Z',
            author: 'Health Reporter'
          }
        ] as T,
        status: 200
      };
    }

    // Default response
    return {
      data: {} as T,
      status: 404,
      message: 'Endpoint not found'
    };
  }
}

export const apiClient = new ApiClient();