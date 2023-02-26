<script lang='ts'>
import SectionHeader from "../base-components/SectionHeader.vue"
import Slide from "../base-components/Slide.vue"
import { defineComponent, PropType } from "vue";
import { IActivity } from "../types"

export default defineComponent({
    props: {
        items: {
            type: Array as PropType<IActivity[]>,
            default: () => [],
            required: true
        }
    },
    components: {
        SectionHeader,
        Slide
    }
})

</script>
<template>
    <SectionHeader title="进行中的活动">
    </SectionHeader>
    <Slide :items="items"></Slide>
</template>