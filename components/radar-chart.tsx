"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import type { AnalysisCategories } from "@/lib/types";

Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const RADAR_CATEGORIES = [
  { key: "logoCompliance", label: "Logo" },
  { key: "trademarkCompliance", label: "Trademark" },
  { key: "colorCompliance", label: "Màu sắc" },
  { key: "typographyCompliance", label: "Typography" },
  { key: "visualHierarchy", label: "Visual hierarchy" },
] as const;

interface RadarChartProps {
  categories: AnalysisCategories | null | undefined;
}

export function RadarChartComponent({ categories }: RadarChartProps) {
  if (!categories) {
    return (
      <div className="placeholder-text">
        Phân tích thiết kế để xem biểu đồ radar.
      </div>
    );
  }

  const scores = RADAR_CATEGORIES.map((c) => {
    const score = categories?.[c.key]?.score;
    return typeof score === "number" ? score : 0;
  });

  const data = {
    labels: RADAR_CATEGORIES.map((c) => c.label),
    datasets: [
      {
        label: "Điểm theo hạng mục",
        data: scores,
        backgroundColor: "var(--radar-fill)",
        borderColor: "var(--radar-border)",
        pointBackgroundColor: "var(--radar-point)",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
          color: getComputedStyle(document.documentElement)
            .getPropertyValue("--radar-ticks")
            .trim() || "#6b7280",
        },
        grid: {
          color: getComputedStyle(document.documentElement)
            .getPropertyValue("--radar-grid")
            .trim() || "#e0e3eb",
        },
        angleLines: {
          color: getComputedStyle(document.documentElement)
            .getPropertyValue("--radar-grid")
            .trim() || "#e0e3eb",
        },
        pointLabels: {
          color: getComputedStyle(document.documentElement)
            .getPropertyValue("--radar-label")
            .trim() || "#1a1d29",
          font: { size: 12 },
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: getComputedStyle(document.documentElement)
            .getPropertyValue("--radar-legend")
            .trim() || "#1a1d29",
        },
      },
    },
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "460px",
        margin: "0 auto",
        aspectRatio: "1 / 1",
      }}
    >
      <Radar data={data} options={options} />
      <style jsx>{`
        .placeholder-text {
          color: var(--muted);
          font-size: 14px;
          text-align: center;
          padding: 60px 20px;
        }
      `}</style>
    </div>
  );
}
