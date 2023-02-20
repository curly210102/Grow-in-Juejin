
<script setup lang="ts">
import initUserProfile from '@/core/utils/initUserProfile';
import { computed, onMounted, ref } from 'vue';
import GrowthTab from "@/core/components/GrowthTab.vue";
import ActivityTab from "@/core/components/ActivityTab.vue";
import NotFound from '@/core/components/NotFound.vue';
import UserProfile from "@/core/components/UserProfile.vue"

const routes = {
  '/': GrowthTab,
  '/activity': ActivityTab
}

const user = await initUserProfile();

const currentRoute = ref("#");
onMounted(() => {
  window.addEventListener('hashchange', () => {
    currentRoute.value = window.location.hash.slice(1) || "/";
  })
})

const currentView = computed(() => {
  return (currentRoute.value in routes) ? routes[currentRoute.value as keyof typeof routes] : NotFound;
})

console.log(currentView)

</script>

<template>
  <div>
    <UserProfile :msg="user.userName" />
    <component :is="currentView" />
  </div>
</template>

<style></style>
