<template>
  <NuxtPage />
</template>

<script setup>
const { initAuth } = useAuth();

// Initialize auth on app start
onMounted(() => {
  initAuth();
});
</script>
