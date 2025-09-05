<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
  <!-- force re-render on route change -->
  <router-view :key="$route.fullPath" />
</template>

<style scoped>

</style>
