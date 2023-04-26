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
  <div class="gij-flex gij-flex-col gij-gap-4 gij-flex-row gij-items-center gij-justify-between">
    <div class="gij-flex gij-items-center gij-gap-4">
      <img :src="user.avatar" class="gij-rounded-full gij-w-14 gij-h-14 gij-w-16 gij-h-16" :alt="user.userName"
        :title="user.userName" />
      <div class="gij-py-2 gij-space-y-2">
        <div class="gij-flex gij-items-center">
          <strong class="gij-text-xl gij-tracking-wide gij-block gij-mr-2"><a
              :href="`https://juejin.cn/user/${user.userId}`" target="_blank" class="gij-text-slate-800">{{ user.userName
              }}</a></strong>
          <slot name="status"></slot>
        </div>
        <p v-if="user.description" class="gij-describe gij-content-['「'] gij-content-['」']">{{ user.description }}</p>
      </div>
    </div>
    <div class="gij-flex gij-px-2 gij-justify-between gij-text-center gij-gap-6">
      <div v-for="{ title, count } in summary">
        <strong class="gij-text-xl gij-font-mono gij-tracking-wide gij-mb-1 gij-text-2xl">{{ count }}</strong>
        <div class="gij-describe">{{ title }}</div>
      </div>
    </div>
  </div>
</template>

