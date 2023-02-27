<script lang="ts" setup>
const activities = await useFetchActivities()
</script>
<script lang='ts'>

import ActivityOngoing from "./ActivityOngoing.vue";
import ActivityJoined from "./ActivityJoined.vue";
import useFetchActivities from "../composables/useFetchActivities";
import { getCurrent } from "../utils/date";


export default {
    components: {
        ActivityOngoing,
        ActivityJoined
    },
    computed: {
        "onlineActivities"() {
            return activities.value.filter(a => {
                const now = getCurrent();
                return !a.endTimeStamp || a.endTimeStamp >= now
            })
        }
    }
}

</script>
<template>
    <div class="space-y-8">
        <div>
            <ActivityOngoing :items="activities" />
        </div>
        <div>
            <ActivityJoined :activities="activities" />
        </div>
    </div>
</template>