
<script setup lang="ts">
import initUserProfile from '@/core/clientRequests/initUserProfile';
import { provide, ref, shallowRef } from 'vue';
import GrowthTab from "@/core/components/GrowthTab.vue";
import ActivityTab from "@/core/components/ActivityTab.vue";
import NotFound from '@/core/components/NotFound.vue';
import UserProfile from "@/core/components/UserProfile.vue"
import { userInjectionKey } from '@/core/utils/injectionKeys';
import Navigator from './Navigator.vue';
import CrossOriginHack from './CrossOriginHack.vue';

const routes = [{
  path: "/",
  category: "轨迹"
}, {
  path: "/activity",
  category: "活动"
}]
const route2Component = {
  '/': GrowthTab,
  '/activity': ActivityTab
}


const user = await initUserProfile();
provide(userInjectionKey, ref(user.userId));

const currentView = shallowRef();
const updateView = (route: string) => {
  currentView.value = route2Component[route as keyof typeof route2Component] ?? NotFound;
}

</script>

<template>
  <CrossOriginHack>
    <UserProfile :user="user" />
    <div class="mt-8 relative mb-20">
      <Navigator :routes="routes" @change="updateView" />
      <KeepAlive>
        <component :is="currentView" />
      </KeepAlive>

    </div>
  </CrossOriginHack>
</template>

<style></style>
