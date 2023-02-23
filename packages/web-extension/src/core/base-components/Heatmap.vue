
<script lang='ts' setup>
import { use, time as chartTime, EChartsOption } from "echarts";
import { CanvasRenderer } from "echarts/renderers";
import { HeatmapChart, HeatmapSeriesOption } from "echarts/charts";
import {
    TooltipComponent,
    LegendComponent,
    TitleComponent
} from "echarts/components";
import colors from "tailwindcss/colors";
import { computed, ref, toRef, watch } from "vue";
import VChart from "vue-echarts";
import { ECharts } from "echarts/core";

type Option = EChartsOption & {
    series: HeatmapSeriesOption
};

use(() => [
    CanvasRenderer,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    HeatmapChart
]);
const chart = ref<ECharts>()

const props = defineProps<{
    data: Option["series"]["data"]
    range: string[]
}>();
const range = toRef(props, "range");

const emit = defineEmits<{
    (e: "select", index: number): void
}>()

const option = computed<Option>(() => ({
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
                return [posx, posy - 5];
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
        text: ['More', '参与度: Less'],
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
        range: props.range,
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
        data: props.data,
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
}));


const handleSelectChanged = (change: any) => {
    if (change.fromAction === "select") {
        emit("select", change.fromActionPayload.dataIndexInside);
    } else if (change.fromAction === "unselect") {
        emit("select", -1);
    }
}

watch(range, () => {
    chart.value?.dispatchAction({ type: 'unselect', seriesIndex: 0 })
})

</script>
<template>
    <v-chart class="h-36" :option="option" :onSelectchanged="handleSelectChanged" autoresize ref="chart" />
</template>