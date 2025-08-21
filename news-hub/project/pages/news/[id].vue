<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <header class="border-b-2 border-black bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <button @click="goBack" class="text-black hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 class="text-2xl font-bold text-black">{{ platformName || 'News' }}</h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">Welcome, {{ user?.name }}</span>
            <button @click="handleLogout" class="btn-secondary text-sm">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-black mb-2">Latest News</h2>
        <p class="text-gray-600">Stay updated with the latest stories from {{ platformName }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-lg text-gray-600">Loading news...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 mb-4">{{ error }}</div>
        <button @click="fetchNews" class="btn-primary">
          Try Again
        </button>
      </div>

      <!-- News List -->
      <div v-else class="space-y-6">
        <article
          v-for="article in news"
          :key="article.id"
          class="card flex flex-col md:flex-row gap-6"
        >
          <!-- Article Image -->
          <div class="md:w-1/3">
            <img
              :src="article.image"
              :alt="article.headline"
              class="w-full h-48 md:h-full object-cover rounded-lg border-2 border-gray-200"
            />
          </div>
          
          <!-- Article Content -->
          <div class="md:w-2/3 flex flex-col justify-between">
            <div>
              <h3 class="text-xl font-bold text-black mb-3 line-clamp-2">
                {{ article.headline }}
              </h3>
              
              <p class="text-gray-600 mb-4 line-clamp-3">
                {{ article.summary }}
              </p>
              
              <div class="flex items-center text-sm text-gray-500 mb-4">
                <span>By {{ article.author }}</span>
                <span class="mx-2">•</span>
                <span>{{ formatDate(article.publishedAt) }}</span>
              </div>
            </div>
            
            <div class="flex justify-end">
              <a
                :href="article.originalUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-primary inline-flex items-center space-x-2"
              >
                <span>Read Full Article</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});

interface NewsArticle {
  id: number;
  headline: string;
  summary: string;
  image: string;
  originalUrl: string;
  publishedAt: string;
  author: string;
}

const route = useRoute();
const { user, logout } = useAuth();

const platformId = route.params.id;
const platformName = route.query.name as string;

const news = ref<NewsArticle[]>([]);
const loading = ref(true);
const error = ref('');

const fetchNews = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const response = await apiClient.get<NewsArticle[]>(`/news/${platformId}`);
    
    if (response.status === 200) {
      news.value = response.data;
    } else {
      throw new Error('Failed to fetch news');
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load news';
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  navigateTo('/dashboard');
};

const handleLogout = () => {
  logout();
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Fetch news on mount
onMounted(() => {
  fetchNews();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>