<script lang='ts' setup>
import { onMounted, ref, watch } from 'vue';

const currentRoute = ref("");
onMounted(() => {
    const onHashChange = () => {
        currentRoute.value = window.location.hash.slice(1) || "/";
    }
    window.addEventListener('hashchange', onHashChange)
    onHashChange();
});

const { routes = [] } = defineProps<{
    routes: {
        path: string,
        category: string
    }[]
}>()

const emit = defineEmits<{
    (e: "change", currentRoute: string): void
}>()

watch(currentRoute, (v) => {
    emit("change", v)
})
</script>
<template>
    <div
        class="gij-inline-block gij-relative gij-left-2/4 -gij-translate-x-2/4 lg:gij-absolute lg:gij-left-0 lg:-gij-translate-x-full lg:-gij-ml-8 gij-mb-8">
        <div
            class="gij-flex gij-space-x-1 gij-p-1 gij-text-center gij-rounded-xl gij-bg-blue-100/20 gij-text-xs md:gij-text-sm lg:gij-flex-col gij-shadow-inner lg:gij-p-2">
            <a v-for="({ category, path }) in routes" :href="`#${path}`"
                :class="['gij-rounded-xl gij-px-6 gij-py-1', path === currentRoute ? 'gij-bg-white gij-shadow' : 'gij-text-slate-300 hover:gij-bg-white/[0.12] hover:gij-text-slate-400']">
                {{ category }}
            </a>
        </div>
    </div>
</template>