<script lang='ts'>
import ActivityOngoing from "./ActivityOngoing.vue";
import ActivityJoined from "./ActivityJoined.vue";

export default {
    components: {
        ActivityOngoing,
        ActivityJoined
    }
}

</script>
<template>
    <div class="space-y-8">
        <div>
            <ActivityOngoing />
        </div>
        <div>
            <ActivityJoined />
        </div>
    </div>
</template>