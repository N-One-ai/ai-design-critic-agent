"use client";

import { Image, BarChart3, BadgeCheck, Clock3 } from "lucide-react";
import type { AnalysisStatus } from "@/lib/types";

interface StatsGridProps {
  designName: string;
  overallScore: number | null;
  status: AnalysisStatus;
  analysisTime: Date | null;
}

const STATUS_LABELS: Record<AnalysisStatus, string> = {
  idle: "Chưa phân tích",
  loading: "Đang phân tích...",
  done: "Hoàn thành",
  error: "Lỗi",
};

const STATUS_CLASSES: Record<AnalysisStatus, string> = {
  idle: "status-idle",
  loading: "status-loading",
  done: "status-done",
  error: "status-error",
};

export function StatsGrid({ designName, overallScore, status, analysisTime }: StatsGridProps) {
  const scorePercent =
    typeof overallScore === "number" ? (overallScore / 10) * 100 : 0;

  return (
    <div className="stats-grid-inner">
      {/* Design name */}
      <div className="stat-card">
        <div className="stat-label-row">
          <Image size={20} strokeWidth={2} className="stat-icon-svg" />
          Tên thiết kế
        </div>
        <div className="stat-value">{designName || "—"}</div>
      </div>

      {/* Overall score */}
      <div className="stat-card">
        <div className="stat-label-row">
          <BarChart3 size={20} strokeWidth={2} className="stat-icon-svg" />
          Điểm tổng thể
        </div>
        <div className="stat-value" style={{ color: "var(--accent)" }}>
          {typeof overallScore === "number" ? `${overallScore}/10` : "—"}
        </div>
        <div className="score-progress">
          <div
            className="score-progress-fill"
            style={{ width: `${scorePercent}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="stat-card">
        <div className="stat-label-row">
          <BadgeCheck size={20} strokeWidth={2} className="stat-icon-svg" />
          Trạng thái
        </div>
        <div>
          <span className={`status-badge ${STATUS_CLASSES[status]}`}>
            <BadgeCheck size={14} strokeWidth={2} />
            {STATUS_LABELS[status]}
          </span>
        </div>
      </div>

      {/* Time */}
      <div className="stat-card">
        <div className="stat-label-row">
          <Clock3 size={20} strokeWidth={2} className="stat-icon-svg" />
          Thời gian đánh giá
        </div>
        <div>
          <div className="stat-value">
            {analysisTime ? analysisTime.toLocaleTimeString("vi-VN") : "—"}
          </div>
          {analysisTime && (
            <div className="time-date">
              {analysisTime.toLocaleDateString("vi-VN")}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 20px 22px;
          box-shadow: 0 1px 2px rgba(16, 24, 40, 0.03);
        }
        .stat-label-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 10px;
        }
        .stat-icon-svg {
          color: var(--primary);
          flex-shrink: 0;
        }
        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--foreground);
          overflow-wrap: anywhere;
        }
        .score-progress {
          margin-top: 12px;
          height: 6px;
          border-radius: 999px;
          background: var(--score-progress-bg);
          overflow: hidden;
        }
        .score-progress-fill {
          height: 100%;
          border-radius: 999px;
          background: var(--score-fill);
          transition: width 0.4s ease;
        }
        .time-date {
          margin-top: 4px;
          font-size: 13px;
          color: var(--muted);
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
        }
        .status-idle {
          background: var(--status-idle-bg);
          color: var(--status-idle-text);
        }
        .status-loading {
          background: var(--status-loading-bg);
          color: var(--status-loading-text);
        }
        .status-done {
          background: var(--status-done-bg);
          color: var(--status-done-text);
        }
        .status-error {
          background: var(--status-error-bg);
          color: var(--status-error-text);
        }
        .stats-grid-inner {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        @media (max-width: 900px) {
          .stats-grid-inner {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .stats-grid-inner {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
