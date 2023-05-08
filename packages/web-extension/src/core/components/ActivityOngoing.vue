<script lang='ts'>
import SectionHeader from "../base-components/SectionHeader.vue"
import Slide from "../base-components/Slide.vue"
import { defineComponent, PropType } from "vue";
import { IActivity } from "../types"
import { getCurrent } from "../utils/date";

export default defineComponent({
    props: {
        activities: {
            type: Array as PropType<IActivity[]>,
            default: () => [],
            required: true
        },
        hideTitle: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    components: {
        SectionHeader,
        Slide
    },
    computed: {
        ongoingActivities: function () {
            return this.activities.filter(a => {
                const now = getCurrent();
                return (!a.endTimeStamp || a.endTimeStamp >= now) && a.figure
            }).sort((a, b) => a.startTimeStamp - b.startTimeStamp)
        }
    }
})



</script>
<template>
    <SectionHeader title="进行中的活动" v-if="!hideTitle">
    </SectionHeader>
    <Slide :items="ongoingActivities"></Slide>
</template>