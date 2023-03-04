<script setup lang="ts">
import { IUser } from '../types';
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
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex items-center gap-4">
      <img :src="user.avatar" class="rounded-full w-14 h-14 sm:w-16 sm:h-16" :alt="user.userName"
        :title="user.userName" />
      <div class="py-2 space-y-2">
        <div class="flex items-center">
          <strong class="text-xl tracking-wide block mr-2"><a :href="`https://juejin.cn/user/${user.userId}`"
              target="_blank" class="text-slate-800">{{ user.userName }}</a></strong>
          <slot name="status"></slot>
        </div>
        <p v-if="user.description" class="describe before:content-['「'] after:content-['」']">{{ user.description }}</p>
      </div>
    </div>
    <div class="flex px-2 justify-between text-center gap-6">
      <div v-for="{ title, count } in summary">
        <strong class="text-xl font-mono tracking-wide sm:mb-1 sm:text-2xl">{{ count }}</strong>
        <div class="describe">{{ title }}</div>
      </div>
    </div>
  </div>
</template>

