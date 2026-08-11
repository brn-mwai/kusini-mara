"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { useIsClient } from "@/lib/use-client";

// One Chart component applies the house theme; screens describe data only and
// never pick colours. All colour values come from the token block in
// console.css via computed styles.

type Tokens = {
  series: string[];
  gridLine: string;
  axisLabel: string;
  text: string;
  card: string;
  danger: string;
  success: string;
  warning: string;
  fontSans: string;
  fontMono: string;
};

let cachedTokens: Tokens | null = null;

const SSR_TOKENS: Tokens = {
  series: [],
  gridLine: "",
  axisLabel: "",
  text: "",
  card: "",
  danger: "",
  success: "",
  warning: "",
  fontSans: "",
  fontMono: "",
};

function readTokens(): Tokens {
  // Option builders may run during SSR; the Chart itself only mounts on the
  // client, where the options are rebuilt with the real token values.
  if (typeof window === "undefined") return SSR_TOKENS;
  if (cachedTokens) return cachedTokens;
  const s = getComputedStyle(document.documentElement);
  const get = (name: string) => s.getPropertyValue(name).trim();
  cachedTokens = {
    series: [
      get("--chart-1"),
      get("--chart-2"),
      get("--chart-3"),
      get("--chart-4"),
      get("--chart-5"),
    ],
    gridLine: get("--border-light"),
    axisLabel: get("--text-tertiary"),
    text: get("--text"),
    card: get("--card"),
    danger: get("--danger"),
    success: get("--success"),
    warning: get("--warning"),
    fontSans: "Inter Variable, Inter, sans-serif",
    fontMono: "DM Mono, monospace",
  };
  return cachedTokens;
}

function baseOption(t: Tokens): EChartsOption {
  return {
    color: t.series,
    animationDuration: 300,
    animationEasing: "cubicOut",
    textStyle: { fontFamily: t.fontSans },
    tooltip: {
      backgroundColor: t.card,
      borderWidth: 0,
      padding: 12,
      borderRadius: 8,
      extraCssText: "box-shadow: var(--shadow-md);",
      textStyle: { color: t.text, fontSize: 12, fontFamily: t.fontMono },
    },
  };
}

export function Chart({
  option,
  height = 240,
  ariaLabel,
}: {
  option: EChartsOption;
  height?: number;
  ariaLabel?: string;
}) {
  const ready = useIsClient();
  if (!ready) return <div style={{ height }} className="skeleton" />;
  const t = readTokens();
  return (
    <div role="img" aria-label={ariaLabel}>
      <ReactECharts
        option={{ ...baseOption(t), ...option }}
        style={{ height, width: "100%" }}
        notMerge
        lazyUpdate
      />
    </div>
  );
}

// ── option builders (data in, house style out) ──────────────────────────────

function valueAxis(t: Tokens): EChartsOption["yAxis"] {
  return {
    type: "value",
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { fontSize: 11, color: t.axisLabel },
    splitLine: { lineStyle: { color: t.gridLine, width: 1 } },
  };
}

function categoryAxis(t: Tokens, data: string[]): EChartsOption["xAxis"] {
  return {
    type: "category",
    data,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { fontSize: 11, color: t.axisLabel },
    splitLine: { show: false },
  };
}

export function barOption(
  labels: string[],
  values: number[],
  seriesName: string,
): EChartsOption {
  const t = readTokens();
  return {
    grid: { left: 36, right: 8, top: 16, bottom: 28 },
    xAxis: categoryAxis(t, labels),
    yAxis: valueAxis(t),
    tooltip: { trigger: "axis" },
    series: [
      {
        name: seriesName,
        type: "bar",
        data: values,
        barMaxWidth: 22,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
    ],
  };
}

export function donutOption(
  items: { name: string; value: number }[],
  centreLabel: string,
): EChartsOption {
  const total = items.reduce((s, i) => s + i.value, 0);
  return {
    tooltip: { trigger: "item" },
    legend: {
      bottom: 0,
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { fontSize: 12 },
    },
    title: {
      text: String(total),
      subtext: centreLabel,
      left: "center",
      top: "38%",
      textStyle: { fontSize: 24, fontWeight: 600, fontFamily: "DM Mono, monospace" },
      subtextStyle: { fontSize: 11 },
    },
    series: [
      {
        type: "pie",
        radius: ["58%", "78%"],
        center: ["50%", "44%"],
        avoidLabelOverlap: true,
        label: { show: false },
        data: items,
      },
    ],
  };
}

export function lineAreaOption(
  labels: string[],
  values: number[],
  seriesName: string,
): EChartsOption {
  const t = readTokens();
  return {
    grid: { left: 44, right: 8, top: 16, bottom: 28 },
    xAxis: categoryAxis(t, labels),
    yAxis: valueAxis(t),
    tooltip: { trigger: "axis" },
    series: [
      {
        name: seriesName,
        type: "line",
        data: values,
        symbol: "none",
        smooth: 0.2,
        lineStyle: { width: 2 },
        areaStyle: { opacity: 0.12 },
      },
    ],
  };
}

export function stackedHBarOption(
  categories: string[],
  series: { name: string; values: number[] }[],
): EChartsOption {
  const t = readTokens();
  return {
    grid: { left: 90, right: 16, top: 8, bottom: 44 },
    legend: {
      bottom: 0,
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { fontSize: 12 },
    },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    xAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 11, color: t.axisLabel },
      splitLine: { lineStyle: { color: t.gridLine, width: 1 } },
    },
    yAxis: {
      type: "category",
      data: categories,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 11, color: t.axisLabel },
      splitLine: { show: false },
    },
    series: series.map((s) => ({
      name: s.name,
      type: "bar",
      stack: "total",
      data: s.values,
      barMaxWidth: 20,
    })),
  };
}

export function Sparkline({ values }: { values: number[] }) {
  return (
    <Chart
      height={40}
      option={{
        grid: { left: 0, right: 0, top: 4, bottom: 0 },
        xAxis: {
          type: "category",
          show: false,
          data: values.map((_, i) => String(i)),
        },
        yAxis: { type: "value", show: false },
        tooltip: { show: false },
        series: [
          {
            type: "line",
            data: values,
            symbol: "none",
            smooth: 0.3,
            lineStyle: { width: 1.5 },
            areaStyle: { opacity: 0.12 },
          },
        ],
      }}
    />
  );
}
