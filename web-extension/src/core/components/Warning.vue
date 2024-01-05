<script lang="ts" setup>
import { ref, toRefs, watch } from 'vue';
import Button from "../base-components/Button.vue"

const props = defineProps<{
    errorInfo: null | Error
}>();
const { errorInfo } = toRefs(props);

const errorStack = ref<HTMLDivElement | null>(null);

const copyResult = ref<"success" | "fail" | null>(null);

const copyErrorMessage = () => {
    if (errorStack.value) {
        const content = errorStack.value.innerText;
        navigator.clipboard.writeText(content).then(() => {
            copyResult.value = "success";
        }).catch(() => {
            copyResult.value = "fail";
        });
    }
}

watch(copyResult, (value) => {
    if (value === "success" || value === "fail") {
        const timer = setTimeout(() => {
            copyResult.value = null;
        }, 2000);

        return () => {
            clearTimeout(timer);
        }
    }
})


</script>
<template>
    <div
        class="gij-absolute gij-top-1/2 gij-left-1/2 -gij-translate-x-1/2 -gij-translate-y-1/2 gij-p-8 gij-min-w-[360px] gij-max-w-full gij-border gij-rounded-md gij-max-h-screen gij-overflow-auto gij-bg-layer-bg gij-border-gray-1-1  gij-text-main-text">
        <h1 class="gij-text-lg gij-mb-2">
            呀！出错了
        </h1>
        <div v-if="errorInfo?.message === 'User Login'" class="gij-space-y-4">
            <p>
                要先去掘金登录哦～
            </p>
            <Button class="w-full">
                <a href="https://juejin.cn" class="gij-block">
                    去登录
                </a>
            </Button>
        </div>
        <div v-else class="gij-space-y-4 gij-space-x-4">
            <p>是一只没有被捕捉的错误，快去反馈吧！</p>
            <Button class="w-full">
                <a href="https://github.com/curly210102/grow-in-juejin/issues/new" class="block" target="_blank">
                    去 Github 提 Issue
                </a>
            </Button>
            <Button class="w-full">
                <a href="https://juejin.cn" class="block" target="_blank">
                    去掘金发评论
                </a>
            </Button>
            <p class="gij-relative">
                <Button class="gij-absolute gij-top-2 gij-right-2 gij-text-xs" @click="copyErrorMessage">
                    {{ copyResult === "success" ? "✅ 复制成功" : copyResult === "fail" ? "❌ 复制失败" : "复制错误信息" }}
                </Button>
            <div ref="errorStack">
                <div>Message: {{ errorInfo?.message }}</div>
                <div>Stack: {{ errorInfo?.stack }}</div>
            </div>
            </p>
        </div>
    </div>
</template>
<style></style>