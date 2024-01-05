
<script lang='ts' setup>

import ActivityOngoing from "./ActivityOngoing.vue";
import ActivityJoined from "./ActivityJoined.vue";
import { IActivityInjectContentType, activityInjectionKey } from "../utils/injectionKeys";
import { computed, inject } from "vue";

const activities = inject<IActivityInjectContentType>(activityInjectionKey, {
    article: [],
    pin: [],
    other: []
})

const allActivities = computed(() => [...activities.article, ...activities.pin, ...activities.other]);

</script>
<template>
    <div class="gij-space-y-14">
        <div>
            <ActivityOngoing :activities="allActivities" />
        </div>
        <div>
            <ActivityJoined :activities="activities.article" :pin-activities="activities.pin" />
        </div>
    </div>
</template>