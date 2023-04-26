
<script setup lang="ts">
import { computed, provide, readonly, ref, shallowRef, toRef } from 'vue';
import GrowthTab from "@/core/components/GrowthTab.vue";
import ActivityTab from "@/core/components/ActivityTab.vue";
import NotFound from '@/core/components/NotFound.vue';
import UserProfile from "@/core/components/UserProfile.vue"
import { syncInjectionKey, userInjectionKey } from '@/core/utils/injectionKeys';
import Navigator from './Navigator.vue';
import CrossOriginHack from './CrossOriginHack.vue';
import { IUser } from '@/core/types';
import { ArrowPathIcon } from '@heroicons/vue/20/solid'
import generateUniqueId from '@/core/utils/uniqueId';


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

const props = defineProps<{
  user: IUser
}>();

const user = toRef(props, "user");
const activeSyncActions = ref<Set<Symbol | string>>(new Set());

const isDataLoading = computed(() => {
  return activeSyncActions.value.size
})


function sync() {
  const syncId = Symbol();
  activeSyncActions.value.add(syncId);
  return () => {
    completeSync(syncId);
  };
}

function startSyncWithStringId() {
  const syncId = generateUniqueId();
  activeSyncActions.value.add(syncId);
  return syncId;
}

function completeSync(syncId: string | Symbol) {
  activeSyncActions.value.delete(syncId);
}

provide(userInjectionKey, readonly(ref(user.value.userId)));
provide(syncInjectionKey, readonly({
  startSyncWithStringId,
  sync,
  completeSync
}))

const currentView = shallowRef();
const updateView = (route: string) => {
  currentView.value = route2Component[route as keyof typeof route2Component] ?? NotFound;
}

</script>

<template>
  <CrossOriginHack>
    <UserProfile :user="user">
      <template v-slot:status v-if="isDataLoading">
        <ArrowPathIcon class="gij-animate-spin-slow gij-w-4 gij-h-4 gij-text-slate-400 gij-mr-1">
        </ArrowPathIcon>
        <div class="gij-text-slate-400/60 gij-text-xs">数据加载中，请耐心等待</div>
      </template>
    </UserProfile>
    <div class="gij-mt-8 gij-relative gij-mb-20">
      <Navigator :routes="routes" @change="updateView" />
      <KeepAlive>
        <component :is="currentView" />
      </KeepAlive>
    </div>
  </CrossOriginHack>
</template>

