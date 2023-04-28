<script lang='ts' setup>
import { IActivity, PreferenceKey } from '@/core/types';
import { computed, ref, Ref, watch } from 'vue';
import { extCode } from '@/constant';
import ActivityOngoing from '@/core/components/ActivityOngoing.vue';
import Modal from "@/core/base-components/Modal.vue"
import usePersistenceState from '../usePersisitenceState';
import useClientPreferences from '@/content-scripts/useClientPreferences';

const activitiesRef: Ref<IActivity[]> = ref([])

chrome.runtime.sendMessage({
    to: "Grow in Juejin Background",
    code: extCode,
    content: "requestActivities"
}).then((data) => {
    activitiesRef.value = data;
})

const open = ref(false);

const preferences = useClientPreferences();
const { state, setState } = usePersistenceState();

const activityLastModifiedTime = computed(() => Math.max(...activitiesRef.value.map(a => a.lastModifiedTime)))

watch(open, (opened) => {
    if (opened) {
        setState("lastVisitedActivityTime", activityLastModifiedTime.value)
    }
})

</script>
<template>
    <Modal :show="open" :customPanel="true" @close="open = false" panel-class="gij-max-w-[712px]">
        <ActivityOngoing :hide-title="true" :activities="activitiesRef" />
    </Modal>
    <div :class="['gij-bg-white gij-px-3 gij-py-3 gij-pr-7 gij-font-medium gij-rounded-l-[4px] gij-border gij-border-l-2 gij-border-r-0 gij-cursor-pointer gij-box-border hover:gij-text-[#1e80ff] hover:gij-translate-x-0 gij-transition-transform gij-border-l-[#7cb8ff]', open ? 'gij-translate-x-0 gij-text-[#1e80ff]' : 'gij-translate-x-2 gij-text-slate-500']"
        style="writing-mode:vertical-lr;text-orientation:upright;letter-spacing:0.2em;box-shadow:0 2px 8px rgba(50,50,50,.04);"
        @click="open = true" v-if="activitiesRef.length">
        <div class="gij-relative">
            <div class="gij-w-[6px] gij-h-[6px] gij-rounded-full gij-bg-[#f64242] gij-absolute gij-left-[-5px] gij-top-[-5px]"
                v-if="preferences[PreferenceKey.BADGE_OF_NEW_ACTIVITY] && state['lastVisitedActivityTime'] < activityLastModifiedTime">
            </div>
            进行中的活动
        </div>
    </div>
</template>

<style>
@import url("@/style.css");
</style>