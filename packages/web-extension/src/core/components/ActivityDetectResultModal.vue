<template>
  <Modal title="文章投稿状态" description="仅做基础检查，最终结果以掘金官方统计为准">
    <section>
      <h5>已参与活动({{ summaries['recommend'].length + summaries['valid'].length }})</h5>
      <div class="gij-grid gij-grid-cols-[1fr,auto] gij-text-sm gij-mt-4 gij-gap-4">
        <ActivitySummaryItem v-for="summary in summaries['recommend']" v-bind="summary">
          已被官方推荐
        </ActivitySummaryItem>
        <ActivitySummaryItem v-for="summary in summaries['valid']" v-bind="summary">
          未被官方推荐
        </ActivitySummaryItem>
      </div>
    </section>
    <section>
      <h5>未参与活动({{ summaries['invalid'].length }})</h5>
      <div class="gij-grid gij-grid-cols-[1fr,auto] gij-text-sm gij-mt-4 gij-gap-4">
        <ActivitySummaryItem v-for="summary in summaries['invalid']" :title="summary.title" :id="summary.id">
          <ul class="gij-space-y-1 ">
            <ol v-for="status in summary.invalid_status">
              {{ InvalidStatus2Text[status] }}
            </ol>
          </ul>
        </ActivitySummaryItem>
      </div>
    </section>

  </Modal>
</template>
  
<script setup lang="tsx">
import { toRef } from "vue";
import Modal from "../base-components/Modal.vue"
import { TypeArticleStatusSummaryGroup } from "../types";
import ActivitySummaryItem from "./ActivitySummaryItem.vue";

const props = defineProps<{
  summaries: TypeArticleStatusSummaryGroup
}>()

const summaries = toRef(props, "summaries");

const InvalidStatus2Text = {
  time_range: "不在活动时间内",
  category_range: "不在限定分类内",
  word_count: "未达字数",
  slogan_fit: "暗号文本不符",
  link_fit: "暗号链接不符",
  tag_fit: "未选择指定标签",
  theme_fit: "未添加指定话题",
  recommend_fit: "未被官方推荐"
};


</script>
