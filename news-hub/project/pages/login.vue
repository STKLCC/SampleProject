<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-8">
      <div class="text-center">
        <h2 class="text-4xl font-bold text-black mb-2">News Hub</h2>
        <p class="text-gray-600">Sign in to access your news feed</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-black mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="credentials.email"
              type="email"
              required
              class="input-field"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-black mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="credentials.password"
              type="password"
              required
              class="input-field"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="btn-primary w-full"
        >
          <span v-if="loading">Signing in...</span>
          <span v-else>Sign In</span>
        </button>
      </form>
      
      <div class="text-center text-sm text-gray-600">
        <p>Demo credentials: any email and password will work</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
});

const { login, isLoggedIn } = useAuth();
const router = useRouter();

const credentials = ref({
  email: '',
  password: ''
});

const loading = ref(false);
const error = ref('');

// Redirect if already logged in
watchEffect(() => {
  if (isLoggedIn.value) {
    navigateTo('/dashboard');
  }
});

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  
  const result = await login(credentials.value);
  
  if (result.success) {
    await navigateTo('/dashboard');
  } else {
    error.value = result.error || 'Login failed';
  }
  
  loading.value = false;
};
</script>