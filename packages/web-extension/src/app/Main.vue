
<script setup lang="ts">
import initUserProfile from '@/core/utils/initUserProfile';
import { computed, onMounted, provide, ref } from 'vue';
import GrowthTab from "@/core/components/GrowthTab.vue";
import ActivityTab from "@/core/components/ActivityTab.vue";
import NotFound from '@/core/components/NotFound.vue';
import UserProfile from "@/core/components/UserProfile.vue"
import { userInjectionKey } from '@/core/utils/injectionKeys';

const routes = {
  '/': {
    category: "统计",
    component: GrowthTab
  },
  '/activity': {
    category: "活动",
    component: ActivityTab
  }
}

const user = await initUserProfile();
provide(userInjectionKey, ref(user.userId));

const currentRoute = ref("/");
onMounted(() => {
  window.addEventListener('hashchange', () => {
    currentRoute.value = window.location.hash.slice(1) || "/";
  })
  currentRoute.value = window.location.hash.slice(1) || "/";
})
const currentView = computed(() => {
  return routes[currentRoute.value as keyof typeof routes]?.component ?? NotFound;
})

</script>

<template>
  <UserProfile :user="user" />
  <div class="mt-8 relative mb-12">
    <div class="inline-block relative left-2/4 -translate-x-2/4 lg:absolute lg:left-0 lg:-translate-x-full lg:-ml-8 mb-8">
      <div
        class="flex space-x-1 p-1 text-center rounded-xl bg-blue-100/20 text-xs md:text-sm lg:flex-col shadow-inner lg:p-2">
        <a v-for="({ category }, path) in routes" :href="`#${path}`"
          :class="['rounded-xl px-6 py-1', path === currentRoute ? 'bg-white shadow' : 'text-slate-300 hover:bg-white/[0.12] hover:text-slate-400']">
          {{ category }}
        </a>
      </div>
    </div>
    <KeepAlive>
      <component :is="currentView" />
    </KeepAlive>
  </div>
</template>

<style></style>
