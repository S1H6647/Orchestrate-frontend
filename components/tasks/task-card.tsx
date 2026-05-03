"use client";

import { TaskResponse, TaskPriority, TaskStatus } from "@/lib/api/types";
import {
  Calendar, CheckSquare, MoreHorizontal,
  AlertCircle, Flag, User as UserIcon, Zap
} from "lucide-react";
import { cn, toDateLabel } from "@/lib/utils";

type Props = {
  task: TaskResponse;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
};

const PRIORITY_META: Record<TaskPriority, { color: string; stripe: string; label: string; icon: React.ReactNode }> = {
  NO_PRIORITY: { color: "#94a3b8", stripe: "#e2e8f0", label: "No Priority", icon: <Flag size={11} /> },
  LOW: { color: "#22c55e", stripe: "#22c55e", label: "Low", icon: <Flag size={11} /> },
  MEDIUM: { color: "#f59e0b", stripe: "#f59e0b", label: "Medium", icon: <Flag size={11} /> },
  HIGH: { color: "#f97316", stripe: "#f97316", label: "High", icon: <Flag size={11} /> },
  URGENT: { color: "#ef4444", stripe: "#ef4444", label: "URGENT", icon: <AlertCircle size={11} /> },
};

const STATUS_META: Record<TaskStatus, { color: string; bg: string }> = {
  BACKLOG: { color: "#94a3b8", bg: "#f8fafc" },
  TODO: { color: "#64748b", bg: "#f1f5f9" },
  IN_PROGRESS: { color: "#2563eb", bg: "#eff6ff" },
  IN_REVIEW: { color: "#d97706", bg: "#fffbeb" },
  DONE: { color: "#10b981", bg: "#ecfdf5" },
};

export function TaskCard({ task, onClick, draggable, onDragStart, onDragEnd }: Props) {
  const subTasks = task.subTasks || [];
  const completedSubtasks = subTasks.filter(st => st.completed).length;
  const totalSubtasks = subTasks.length;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
  const pMeta = PRIORITY_META[task.priority];
  const sMeta = STATUS_META[task.status];

  return (
    <div
      className="task-card"
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      data-id={task.id}
      style={{ paddingLeft: 0, overflow: "hidden" }}
    >
      {/* Priority stripe */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
        background: pMeta.stripe, borderRadius: "var(--radius) 0 0 var(--radius)",
      }} />

      <div style={{ paddingLeft: 16 }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: "var(--text-muted)",
            letterSpacing: "0.05em", fontFamily: "monospace"
          }}>
            {task.identifier}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* Story points chip */}
            {task.storyPoints != null && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: 6, padding: "1px 6px", fontSize: 10, fontWeight: 700,
                color: "var(--text-sub)"
              }}>
                <Zap size={9} /> {task.storyPoints}
              </span>
            )}
            <button
              onClick={e => { e.stopPropagation(); }}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: "var(--text-muted)", borderRadius: 4, padding: 2,
                display: "flex", alignItems: "center"
              }}>
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>

        {/* Title */}
        <div style={{
          fontSize: 13.5, fontWeight: 600, color: "var(--text)",
          lineHeight: 1.45, marginBottom: 10
        }}>
          {task.title}
        </div>

        {/* Labels */}
        {(task.labels || []).length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
            {(task.labels || []).map(label => (
              <span key={label.id} style={{
                background: `${label.color}18`, color: label.color,
                border: `1px solid ${label.color}35`, borderRadius: 999,
                fontSize: 10, fontWeight: 700, padding: "1px 7px",
                letterSpacing: "0.03em",
              }}>
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Parent task indicator */}
        {task.parentTask && (
          <div style={{
            fontSize: 11, color: "var(--text-muted)", marginBottom: 8,
            display: "flex", alignItems: "center", gap: 4
          }}>
            <span style={{ opacity: 0.5 }}>↳</span>
            <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{task.parentTask.identifier}</span>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Priority badge */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 10, fontWeight: 700, color: pMeta.color,
              background: `${pMeta.color}14`, border: `1px solid ${pMeta.color}30`,
              borderRadius: 6, padding: "2px 7px", textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}>
              {pMeta.icon} {pMeta.label}
            </span>

            {/* Sub-tasks */}
            {totalSubtasks > 0 && (
              <span style={{
                display: "flex", alignItems: "center", gap: 3,
                fontSize: 11, color: completedSubtasks === totalSubtasks ? "var(--success)" : "var(--text-muted)",
                fontWeight: 600
              }}>
                <CheckSquare size={11} />
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}

            {/* Due date */}
            {task.dueDate && (
              <span style={{
                display: "flex", alignItems: "center", gap: 3,
                fontSize: 11, fontWeight: 600,
                color: isOverdue ? "var(--danger)" : "var(--text-muted)"
              }}>
                <Calendar size={11} />
                {toDateLabel(task.dueDate)}
              </span>
            )}
          </div>

          {/* Assignee avatar */}
          {task.assignee ? (
            task.assignee.avatarUrl ? (
              <img src={task.assignee.avatarUrl} alt={task.assignee.name}
                title={task.assignee.name}
                style={{
                  width: 22, height: 22, borderRadius: "50%",
                  border: "2px solid var(--surface)", objectFit: "cover"
                }} />
            ) : (
              <div title={task.assignee.name} style={{
                width: 22, height: 22, borderRadius: "50%",
                background: stringToGradient(task.assignee.name),
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 800, color: "#fff",
                border: "2px solid var(--surface)", flexShrink: 0,
              }}>
                {initials(task.assignee.name)}
              </div>
            )
          ) : (
            <div title="Unassigned" style={{
              width: 22, height: 22, borderRadius: "50%", background: "var(--surface-2)",
              border: "1px dashed var(--border)", display: "flex", alignItems: "center",
              justifyContent: "center", color: "var(--text-muted)", flexShrink: 0,
            }}>
              <UserIcon size={11} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function stringToGradient(str: string) {
  const palettes = [
    "linear-gradient(135deg,#667eea,#764ba2)",
    "linear-gradient(135deg,#4facfe,#00f2fe)",
    "linear-gradient(135deg,#43e97b,#38f9d7)",
    "linear-gradient(135deg,#fa709a,#fee140)",
    "linear-gradient(135deg,#a18cd1,#fbc2eb)",
    "linear-gradient(135deg,#fda085,#f6d365)",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palettes[Math.abs(hash) % palettes.length];
}
