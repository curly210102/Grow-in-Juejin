<script lang='ts' setup>
import { IActivity } from '@/core/types';
import { ref, Ref } from 'vue';
import { extCode } from '@/constant';
import ActivityOngoing from '@/core/components/ActivityOngoing.vue';
import Modal from "@/core/base-components/Modal.vue"

const activitiesRef: Ref<IActivity[]> = ref([])

chrome.runtime.sendMessage({
    to: "Grow in Juejin Background",
    code: extCode,
    content: "requestActivities"
}).then((data) => {
    activitiesRef.value = data;
})

const open = ref(false);

</script>
<template>
    <Modal :show="open" :customPanel="true" @close="open = false">
        <ActivityOngoing :hide-title="true" :activities="activitiesRef" />
    </Modal>
    <div class="gij-fixed gij-right-0 gij-bg-white gij-px-3 gij-py-3 gij-rounded-l-[4px] gij-border gij-border-r-0 gij-cursor-pointer gij-text-slate-500 hover:gij-text-[#1e80ff] gij-box-border"
        style="writing-mode:vertical-lr;text-orientation:upright;letter-spacing:0.2em;box-shadow:0 2px 8px rgba(50,50,50,.04);top:190px"
        @click="open = true">
        进行中的活动
    </div>
</template>

<style>
@import url("@/style.css");
</style>