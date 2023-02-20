<script setup lang="ts">
import { IUser } from '@/types';
import { computed } from 'vue';

const { user } = defineProps<{ user: IUser }>();

const summary = computed(() => ([
  {
    "title": "文章",
    "count": user.postCount
  },
  {
    "title": "点赞",
    "count": user.likeCount
  }, {
    title: "关注",
    "count": user.followerCount
  }
]))

</script>

<template>
  <div class="flex justify-between items-stretch py-4 gap-4 flex-wrap">
    <div class="flex items-center gap-4">
      <img :src="user.avatar" class="rounded-full w-24 h-24" :alt="user.userName" :title="user.userName" />
      <div class="py-2">
        <strong class="text-2xl tracking-wide mb-3 block">{{ user.userName }}</strong>
        <p class="text-sm font-light text-stone-600 before:content-['「'] after:content-['」']">{{ user.description }}</p>
      </div>
    </div>
    <div class="flex items-center gap-6 text-center pt-2">
      <div v-for="{ title, count } in summary">
        <strong class="text-2xl font-mono tracking-wide mb-1 block">{{ count }}</strong>
        <div class="text-sm font-light text-stone-600">{{ title }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
