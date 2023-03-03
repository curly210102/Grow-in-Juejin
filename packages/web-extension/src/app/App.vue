
<script setup lang="ts">
import { onErrorCaptured, ref, Suspense } from 'vue';
import Main from "./Main.vue";
import Warning from "@/core/components/Warning.vue"
import initUserProfile from '@/core/clientRequests/initUserProfile';
import { IUser } from '@/core/types';

const errorInfo = ref<null | Error>(null);

onErrorCaptured((err) => {
  errorInfo.value = err
})

const user = ref<IUser | null>(null);

(async () => {
  const currentUser = await initUserProfile();
  user.value = currentUser;
})()
</script>

<template>
  <div class="max-w-3xl mx-auto py-6 pl-6 pr-8">
    <Warning v-if="errorInfo" :error-info="errorInfo" />
    <Main v-else-if="user" :user="user" />
    <div v-else>
      Loading...
    </div>
  </div>
</template>

<style></style>
