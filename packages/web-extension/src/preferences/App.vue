
<script setup lang="ts">
import { FunctionalComponent, onErrorCaptured, ref } from 'vue';
import { RectangleGroupIcon, UserCircleIcon } from '@heroicons/vue/24/outline'

import Warning from "@/core/components/Warning.vue"
import usePreferences from './usePreferences';

import Select from "@/core/base-components/Select.vue"
import { PreferenceKey, PreferenceValue } from '@/core/types';

const errorInfo = ref<null | Error>(null);

onErrorCaptured((err) => {
  errorInfo.value = err
})

const groups: Array<{
  title: string,
  icon: FunctionalComponent,
  sections: Array<Array<{
    label: string,
    options: { "text": string, key: PreferenceValue }[],
    key: PreferenceKey
  }>>
}> = [{
  title: "个人主页",
  icon: UserCircleIcon,
  sections: [
    [{
      label: "活跃度热力图（我的主页）",
      options: [{
        "text": "显示",
        "key": PreferenceValue.SHOW
      }, {
        "text": "隐藏",
        "key": PreferenceValue.HIDE
      }, {
        "text": "默认折叠",
        "key": PreferenceValue.COLLAPSE
      }],
      key: PreferenceKey.CONTRIBUTION_OF_MINE
    }, {
      label: "活跃度热力图（他人主页）",
      options: [{
        "text": "显示",
        "key": PreferenceValue.SHOW
      }, {
        "text": "隐藏",
        "key": PreferenceValue.HIDE
      }, {
        "text": "默认折叠",
        "key": PreferenceValue.COLLAPSE
      }],
      key: PreferenceKey.CONTRIBUTION_OF_OTHERS
    }],
    [{
      label: "成长趋势图（我的主页）",
      options: [{
        "text": "显示",
        "key": PreferenceValue.SHOW
      }, {
        "text": "隐藏",
        "key": PreferenceValue.HIDE
      }, {
        "text": "默认折叠",
        "key": PreferenceValue.COLLAPSE
      }],
      key: PreferenceKey.TRENDING_OF_MINE
    }, {
      label: "成长趋势图（他人主页）",
      options: [{
        "text": "显示",
        "key": PreferenceValue.SHOW
      }, {
        "text": "隐藏",
        "key": PreferenceValue.HIDE
      }, {
        "text": "默认折叠",
        "key": PreferenceValue.COLLAPSE
      }],
      key: PreferenceKey.TRENDING_OF_OTHERS
    }],
    [{
      label: "偏好分布（我的主页）",
      options: [{
        "text": "显示",
        "key": PreferenceValue.SHOW
      }, {
        "text": "隐藏",
        "key": PreferenceValue.HIDE
      }],
      key: PreferenceKey.TAG_RADAR_OF_MINE
    }, {
      label: "偏好分布（他人主页）",
      options: [{
        "text": "显示",
        "key": PreferenceValue.SHOW
      }, {
        "text": "隐藏",
        "key": PreferenceValue.HIDE
      }],
      key: PreferenceKey.TAG_RADAR_OF_OTHERS
    }],
    [{
      label: "我的活动进度",
      options: [{
        "text": "显示",
        "key": PreferenceValue.SHOW
      }, {
        "text": "隐藏",
        "key": PreferenceValue.HIDE
      }],
      key: PreferenceKey.ACTIVITIES_OF_MINE
    }]
  ]
}, {
  title: "全局组件",
  icon: RectangleGroupIcon,
  sections: [
    [{
      label: "有新活动浮标显示小红点",
      key: PreferenceKey.BADGE_OF_NEW_ACTIVITY,
      options: []
    }]
  ]
}]

const active = ref(0)

const [preferences, updatePreference] = usePreferences();


</script>

<template>
  <div class="gij-min-w-[512px] gij-divide-y">
    <div class="gij-text-center gij-p-2 gij-bg-slate-50/80">
      <div class="gij-font-semibold gij-pb-2">
        设置
      </div>
      <div class=" gij-inline-flex gij-space-x-2">
        <div v-for="(group, i) in groups"
          :class="['gij-px-2 gij-py-1 gij-text-center gij-rounded hover:gij-bg-gray-100 gij-cursor-pointer', active === i ? 'gij-text-blue-500 gij-bg-gray-100' : '']"
          @click="active = i">
          <component class="gij-w-6 gij-h-6 gij-mx-auto" :is="group.icon" />
          <div class="gij-text-xs gij-text-[10px]">{{ group.title }}</div>
        </div>
      </div>
    </div>
    <div class="gij-p-4 gij-pb-8">
      <Warning v-if="errorInfo" :error-info="errorInfo" />
      <div v-else class="gij-grid gij-grid-cols-2 gij-gap-3 gij-text-sm gij-text-slate-700 gij-items-center ">
        <template v-for="(section, i) in groups[active].sections">
          <div v-if="i !== 0" class="gij-col-span-2 gij-border-b"></div>
          <template v-for="item in section">
            <label class="gij-text-right" :for="`${item.key}`">{{ item.label }}</label>
            <div class="gij-text-left">
              <Select v-if="item.options.length" :items="item.options"
                :modelValue="(preferences[item.key] && item.options.find((o: any) => o.key === preferences[item.key])) || item.options[0]"
                @update:modelValue="(value: any) => updatePreference(item.key, value.key)" />
              <div v-else class=" gij-flex gij-items-center">
                <input type="checkbox" class="gij-accent-blue-500" v-model="preferences[item.key]" :id="`${item.key}`" />
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

