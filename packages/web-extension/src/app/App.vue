
<script setup lang="ts">
import { onErrorCaptured, ref, Suspense } from 'vue';
import Main from "./Main.vue";

const errorInfo = ref<null | Error>(null);

onErrorCaptured((err) => {
  errorInfo.value = err
})
</script>

<template>
  <Suspense>
    <Main />
    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>

<style></style>
