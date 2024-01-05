<script lang="ts">
import SectionHeader from "../base-components/SectionHeader.vue";
import Slide from "../base-components/Slide.vue";
import { defineComponent, PropType } from "vue";
import { IActivity } from "../types";
import { getCurrent, MS_OF_DAY } from "../utils/date";

export default defineComponent({
    props: {
        activities: {
            type: Array as PropType<IActivity[]>,
            default: () => [],
            required: true,
        },
        hideTitle: {
            type: Boolean,
            default: false,
            required: false,
        },
    },
    components: {
        SectionHeader,
        Slide,
    },
    computed: {
        ongoingActivities: function () {
            const now = getCurrent();
            return this.activities
                .filter((a) => {
                    return (!a.endTimeStamp || a.endTimeStamp >= now) && a.figure;
                })
                .sort((a, b) => {
                    const aIsRecent = Math.abs(a.startTimeStamp - now) <= MS_OF_DAY;
                    const bIsRecent = Math.abs(b.startTimeStamp - now) <= MS_OF_DAY;
                    const aIsRecentEnd = Math.abs(a.endTimeStamp - now) <= MS_OF_DAY;
                    const bIsRecentEnd = Math.abs(b.endTimeStamp - now) <= MS_OF_DAY;

                    if (aIsRecentEnd && !bIsRecentEnd) {
                        return -1;
                    } else if (!aIsRecentEnd && bIsRecentEnd) {
                        return 1;
                    } else if (aIsRecent && !bIsRecent) {
                        return -1;
                    } else if (!aIsRecent && bIsRecent) {
                        return 1;
                    } else if (aIsRecent && bIsRecent) {
                        return a.startTimeStamp - b.startTimeStamp;
                    } else {
                        return a.endTimeStamp - b.endTimeStamp;
                    }
                });
        },
    },
});
</script>
<template>
    <SectionHeader title="进行中的活动" v-if="!hideTitle"> </SectionHeader>
    <Slide :items="ongoingActivities"></Slide>
</template>
