<template>
  <Modal title="文章检测结果" description="仅做基础检查，最终结果以掘金官方统计为准">
    <div class="gij-grid gij-grid-cols-[1fr,auto] gij-text-sm gij-mt-4 gij-gap-4">
      <template v-for="{ id, title, status } in summaries">
        <a class="gij-text-primary hover:gij-text-primary-hover active:gij-text-primary-active gij-cursor-pointer focus:gij-outline-0"
          :href="`https://juejin.cn/post/${id}`" target="_blank">{{
            title
          }}</a>
        <ul class="gij-space-y-1 gij-text-main-text/60">
          <ol v-for="invalidStatus in status">
            {{ InvalidStatus2Text[invalidStatus] }}
          </ol>
        </ul>
      </template>
    </div>
  </Modal>
</template>
  
<script setup lang="ts">
import { toRef } from "vue";
import Modal from "../base-components/Modal.vue"
import { TypeInvalidSummary } from "../types";

const props = defineProps<{
  invalidSummaries: TypeInvalidSummary[]
}>()

const summaries = toRef(props, "invalidSummaries");

const InvalidStatus2Text = {
  time_range: "不在活动时间内",
  category_range: "不在限定分类内",
  word_count: "未达字数",
  slogan_fit: "暗号文本不符",
  link_fit: "暗号链接不符",
  tag_fit: "未选择指定标签",
  theme_fit: "未添加指定话题"
};


</script>
