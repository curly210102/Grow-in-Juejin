<script lang='ts' setup>
import { IArticleActivity, IPinActivity } from '@/core/types';
import { ref, toRefs } from 'vue';
import Modal from "@/core/base-components/Modal.vue"
import ActivityJoined from '@/core/components/ActivityJoined.vue';

const open = ref(false);

const props = defineProps<{
    userId: string,
    activities: IArticleActivity[]
    pinActivities: IPinActivity[]
}>()

const { userId, activities, pinActivities } = toRefs(props);




</script>
<template>
    <template v-if="userId">
        <Modal :show="open" @close="open = false" panel-class="!gij-bg-[#f2f3f5] !gij-w-[712px] !gij-p-12">
            <ActivityJoined :hide-title="true" :activities="activities" :pinActivities="pinActivities" />
        </Modal>
        <div :class="['gij-bg-white gij-px-3 gij-py-3 gij-pr-7 gij-font-medium gij-rounded-l-[4px] gij-border gij-border-l-2 gij-border-r-0 gij-cursor-pointer gij-box-border hover:gij-text-[#ffac0c] hover:gij-translate-x-0 gij-transition-transform gij-border-l-[#ffac0c]', open ? 'gij-translate-x-0 gij-text-[#ffac0c]' : 'gij-translate-x-2 gij-text-slate-500', $attrs.class]"
            :style="['writing-mode:vertical-lr;text-orientation:upright;letter-spacing:0.2em;box-shadow:0 2px 8px rgba(50,50,50,.04);']"
            @click="open = true">
            我的活动进度
        </div>
    </template>
</template>

