
<script setup lang="ts">
import { onErrorCaptured, ref, Suspense } from 'vue';
import Main from "./Main.vue";
import Warning from "@/core/components/Warning.vue"

const errorInfo = ref<null | Error>(null);

onErrorCaptured((err) => {
  errorInfo.value = err
})
</script>

<template>
  <div class="max-w-3xl mx-auto py-6 pl-6 pr-8">
    <Suspense>
      <Main />
      <template #fallback>
        <Warning v-if="errorInfo" :error-info="errorInfo" />
        <div v-else>
          Loading...
        </div>

      </template>
    </Suspense>

  </div>
</template>

<style></style>
