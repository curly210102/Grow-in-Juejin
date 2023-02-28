
<script lang='ts' setup>

import ActivityOngoing from "./ActivityOngoing.vue";
import ActivityJoined from "./ActivityJoined.vue";
import { getCurrent } from "../utils/date";
import { activityInjectionKey } from "../utils/injectionKeys";
import { computed, inject, ref, Ref } from "vue";
import { IActivity } from "../types";

const activities = inject<Ref<IActivity[]>>(activityInjectionKey, ref([]));

const ongoingActivities = computed(() => {
    return activities.value.filter(a => {
        const now = getCurrent();
        return !a.endTimeStamp || a.endTimeStamp >= now
    })
})


</script>
<template>
    <div class="space-y-10">
        <div>
            <ActivityOngoing :items="ongoingActivities" />
        </div>
        <div>
            <ActivityJoined :activities="activities" />
        </div>
    </div>
</template>