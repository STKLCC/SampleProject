<template>
  <div></div>
</template>

<script setup>
// Redirect to dashboard if logged in, otherwise to login
const { isLoggedIn } = useAuth();

watchEffect(() => {
  if (isLoggedIn.value) {
    navigateTo('/dashboard');
  } else {
    navigateTo('/login');
  }
});
</script>