<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <header class="border-b-2 border-black bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-black">News Hub</h1>
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
        <h2 class="text-3xl font-bold text-black mb-2">Media Platforms</h2>
        <p class="text-gray-600">Choose a news source to explore the latest stories</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-lg text-gray-600">Loading platforms...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 mb-4">{{ error }}</div>
        <button @click="fetchPlatforms" class="btn-primary">
          Try Again
        </button>
      </div>

      <!-- Platforms Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="platform in platforms"
          :key="platform.id"
          @click="goToPlatform(platform)"
          class="card cursor-pointer transform hover:scale-105 transition-transform duration-200"
        >
          <div class="flex items-center space-x-4 mb-4">
            <img
              :src="platform.logo"
              :alt="platform.name"
              class="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
            />
            <div>
              <h3 class="text-xl font-bold text-black">{{ platform.name }}</h3>
              <span class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {{ platform.category }}
              </span>
            </div>
          </div>
          
          <p class="text-gray-600 mb-4">{{ platform.description }}</p>
          
          <div class="flex justify-end">
            <span class="text-sm font-medium text-black">
              View News →
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});

interface Platform {
  id: number;
  name: string;
  description: string;
  logo: string;
  category: string;
}

const { user, logout } = useAuth();

const platforms = ref<Platform[]>([]);
const loading = ref(true);
const error = ref('');

const fetchPlatforms = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const response = await apiClient.get<Platform[]>('/media-platforms');
    
    if (response.status === 200) {
      platforms.value = response.data;
    } else {
      throw new Error('Failed to fetch platforms');
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load platforms';
  } finally {
    loading.value = false;
  }
};

const goToPlatform = (platform: Platform) => {
  navigateTo(`/news/${platform.id}?name=${encodeURIComponent(platform.name)}`);
};

const handleLogout = () => {
  logout();
};

// Fetch platforms on mount
onMounted(() => {
  fetchPlatforms();
});
</script>