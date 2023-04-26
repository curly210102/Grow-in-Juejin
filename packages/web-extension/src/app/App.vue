
<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue';
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
  try {
    const currentUser = await initUserProfile("852876722177533");
    user.value = currentUser;
  } catch (error: any) {
    errorInfo.value = error
  }

})()
</script>

<template>
  <div class="gij-max-w-3xl gij-mx-auto gij-py-6 gij-pl-6 gij-pr-8">
    <Warning v-if="errorInfo" :error-info="errorInfo" />
    <Main v-else-if="user" :user="user" />
    <div v-else>
      Loading...
    </div>
  </div>
</template>

