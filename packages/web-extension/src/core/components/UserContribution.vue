<script lang='ts' setup>
import { use, time as chartTime, EChartsOption } from "echarts";
import { CanvasRenderer } from "echarts/renderers";
import { HeatmapChart, HeatmapSeriesOption } from "echarts/charts";
import {
    TooltipComponent,
    LegendComponent,
    TitleComponent
} from "echarts/components";
import { computed, ref, unref } from "vue";
import colors from 'tailwindcss/colors'
import VChart from "vue-echarts";
import { IDailyActions } from "@/types";
import calculateContribution from "../utils/calculateContribution";

type Option = EChartsOption & {
    series: HeatmapSeriesOption
};

const { actions } = defineProps<{
    "actions": IDailyActions
}>();

function getVirtualData(start: string, end: string) {
    const date = +chartTime.parse(start);
    const endDate = +chartTime.parse(end);
    const dayTime = 3600 * 24 * 1000;
    const data: [string, number][] = [];
    for (let time = date; time < endDate; time += dayTime) {
        data.push([
            chartTime.format(time, '{yyyy}-{MM}-{dd}', false),
            Math.floor(Math.random() * 100)
        ]);
    }
    return data;
}


const dailyContributions = computed(() => {
    return Object.keys(unref(actions)).map(time => [chartTime.format(time, '{yyyy}-{MM}-{dd}', false), calculateContribution(actions[+time])]);
})

const MS_OF_YEAR = 366 * 24 * 3600 * 1000;
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
            return `${params.marker} 参与度 <strong>${params.data[1]}</strong> <br/>${chartTime.format(params.data[0], "{yyyy}年{MM}月{dd}日, {eeee}", false, "ZH")}`
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
        data: getVirtualData(lastYear[0], lastYear[1]),
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

</script>
<template>
    <div class="p-3">
        <v-chart class="h-36" :option="option" :onSelectchanged="handleSelectChanged" autoresize />
    </div>
    <div class="bg-gray-100 border border-t-0 rounded-b-lg p-5 shadow-inner ">
        <p></p>
        <div class="grid grid-cols-3 gap-x-4 gap-y-2 px-8 text-sm">
            <div>
                🚀 发布 <strong>1</strong> 篇文章
            </div>
            <div>
                👀 阅读 <strong>1</strong> 篇文章
            </div>
            <div>
                👍 送出 <strong>2</strong> 个赞
            </div>
            <div>
                📣 发布 <strong>3</strong> 条沸点
            </div>
            <div>
                😀 关注 <strong>3</strong> 个掘友
            </div>
        </div>
    </div>
</template>