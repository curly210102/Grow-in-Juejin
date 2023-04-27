
<script lang='ts' setup>

import ActivityOngoing from "./ActivityOngoing.vue";
import ActivityJoined from "./ActivityJoined.vue";
import { activityInjectionKey } from "../utils/injectionKeys";
import { inject, ref, Ref } from "vue";
import { IActivity } from "../types";

const activities = inject<Ref<IActivity[]>>(activityInjectionKey, ref([]))

</script>
<template>
    <div class="gij-space-y-14">
        <div>
            <ActivityOngoing :activities="activities" />
        </div>
        <div>
            <ActivityJoined :activities="activities" />
        </div>
    </div>
</template>