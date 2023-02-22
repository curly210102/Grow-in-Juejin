<script lang='ts' setup>
import { use, time as chartTime, EChartsOption } from "echarts";
import { CanvasRenderer } from "echarts/renderers";
import { HeatmapChart, HeatmapSeriesOption } from "echarts/charts";
import {
    TooltipComponent,
    LegendComponent,
    TitleComponent
} from "echarts/components";
import { computed, ref, toRefs, unref, watch, watchEffect } from "vue";
import colors from 'tailwindcss/colors'
import VChart from "vue-echarts";
import { ActionType, IDailyActions } from "@/types";
import calculateContribution from "../utils/calculateContribution";
import { MS_OF_YEAR } from "../utils/date";

type Option = EChartsOption & {
    series: HeatmapSeriesOption
};

const props = defineProps<{
    actions: IDailyActions
}>();
const { actions } = toRefs(props);


const current = new Date();
const lastYear = [chartTime.format(current.valueOf() - MS_OF_YEAR, "{yyyy}-{MM}-{dd}", false), chartTime.format(current, "{yyyy}-{MM}-{dd}", false)]


use(() => [
    CanvasRenderer,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    HeatmapChart
]);

const option = ref<Option>({
    tooltip: {
        enterable: true,
        confine: true,
        padding: [4, 4, 2],
        textStyle: {
            fontSize: 10
        },
        position(pos, _$1, _$2, rect, size) {
            if (rect) {
                const posx = rect.x + rect.width / 2 - size.contentSize[0] / 2;
                const posy = rect.y - size.contentSize[1];
                return [posx, posy];
            } else {
                return pos
            }

        },
        formatter(params: any) {
            return `${params.marker} 参与度 <strong>${params.data[1]}</strong>｜${chartTime.format(params.data[0], "{yyyy}年{MM}月{dd}日, {eeee}", false, "ZH")}`
        }
    },
    visualMap: {
        type: "piecewise",
        min: 0,
        max: 100,
        orient: 'horizontal',
        left: 'right',
        bottom: 0,
        inRange: {
            color: [colors.slate[100], colors.blue[300], colors.blue[600]],
        },
        controller: {
            inRange: {
                symbolSize: [10, 100]
            }
        },
        pieces: [
            { lt: 1, },
            {
                gte: 1, lt: 20
            },
            {
                gte: 20, lt: 60
            },
            {
                gte: 60, lt: 80
            },
            {
                gte: 80
            }
        ],
        text: ['More', 'Less'],
        itemGap: 5,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: {
            fontSize: 10,
            color: colors.slate[300]
        },
        selectedMode: false
    },
    calendar: {
        top: 30,
        left: 30,
        right: 10,
        cellSize: ['auto', 12],
        range: lastYear,
        splitLine: {
            show: false
        },
        itemStyle: {
            borderWidth: 2,
            borderColor: "transparent",
        },
        dayLabel: {
            show: true,
            nameMap: "ZH",
            color: colors.slate[400],
            fontSize: 10,

        },
        monthLabel: {
            show: true,
            nameMap: 'ZH',
            color: colors.slate[400],
            align: "left",
            fontSize: 10
        },
        yearLabel: { show: false }
    },
    series: {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: [],
        emphasis: {
            itemStyle: {
                borderColor: colors.sky[200],
                borderWidth: 3
            }
        },
        itemStyle: {
            borderRadius: 2,
        },
        select: {
            itemStyle: {
                borderColor: colors.sky[300],
                borderWidth: 3
            }
        },
        selectedMode: "single"
    }
});
const selectedIndex = ref<number>(-1);
const handleSelectChanged = (change: any) => {
    if (change.fromAction === "select") {
        selectedIndex.value = change.fromActionPayload.dataIndexInside;
    } else if (change.fromAction === "unselect") {
        selectedIndex.value = -1;
    }
}

const dailyContribution = computed(() => {
    const date = +chartTime.parse(lastYear[0]);
    const endDate = +chartTime.parse(lastYear[1]);

    const dailyActions = unref(actions);
    const dayTime = 3600 * 24 * 1000;
    const data: [string, number][] = [];
    for (let time = date; time <= endDate; time += dayTime) {
        if (dailyActions[time]) {
            data.push([
                chartTime.format(time, '{yyyy}-{MM}-{dd}', false),
                calculateContribution(dailyActions[time])
            ]);
        } else {
            data.push([chartTime.format(time, '{yyyy}-{MM}-{dd}', false), 0]);
        }
    }
    return data;
})
const selectedDailyAction = computed(() => {
    const selectedItem = dailyContribution.value[selectedIndex.value];
    if (selectedItem) {
        const time = chartTime.parse(selectedItem[0]).valueOf();
        const actionOfDay = actions.value;
        return {
            date: chartTime.format(time, "{yyyy}-{MM}-{dd}，{eeee}", false, "ZH"),
            actions: actionOfDay[time] ?? {},
            total: Object.values(actionOfDay[time] ?? {}).reduce((sum, num) => sum + num, 0),
            score: selectedItem[1]
        };
    }
    return null;
})

watch(dailyContribution, (value) => {
    option.value.series.data = value;
})

</script>
<template>
    <div class="p-3">
        <v-chart class="h-36" :option="option" :onSelectchanged="handleSelectChanged" autoresize />
    </div>
    <div class="bg-gray-100 border border-t-0 rounded-b-lg shadow-inner pb-5 pt-4 px-8" v-if="selectedDailyAction">
        <p class="text-sm text-slate-500">
            {{ selectedDailyAction.date }}，有 {{ selectedDailyAction.total }} 个贡献，参与度 {{ selectedDailyAction.score }}
        </p>
        <hr class="divider mt-2 mb-3" />
        <div class="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
            <div>
                🚀 发布 <strong>{{ selectedDailyAction.actions[ActionType.POST] ?? 0 }}</strong> 篇文章
            </div>
            <div>
                👍 送出 <strong>{{ (selectedDailyAction.actions[ActionType.LKPOST] ?? 0) +
                    (selectedDailyAction.actions[ActionType.LKPIN] ?? 0) }}</strong> 个赞
            </div>
            <div>
                📣 发布 <strong>{{ selectedDailyAction.actions[ActionType.PIN] ?? 0 }}</strong> 条沸点
            </div>
            <div>
                😀 关注 <strong>{{ selectedDailyAction.actions[ActionType.FOLLOW] ?? 0 }}</strong> 个掘友
            </div>
        </div>
    </div>
</template>