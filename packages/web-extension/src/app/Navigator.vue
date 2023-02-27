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
    <div class="inline-block relative left-2/4 -translate-x-2/4 lg:absolute lg:left-0 lg:-translate-x-full lg:-ml-8 mb-8">
        <div
            class="flex space-x-1 p-1 text-center rounded-xl bg-blue-100/20 text-xs md:text-sm lg:flex-col shadow-inner lg:p-2">
            <a v-for="({ category, path }) in routes" :href="`#${path}`"
                :class="['rounded-xl px-6 py-1', path === currentRoute ? 'bg-white shadow' : 'text-slate-300 hover:bg-white/[0.12] hover:text-slate-400']">
                {{ category }}
            </a>
        </div>
    </div>
</template>