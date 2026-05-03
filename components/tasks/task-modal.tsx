"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import {
  TaskResponse, TaskStatus, TaskPriority,
  CreateTaskRequest, UpdateTaskRequest,
} from "@/lib/api/types";
import { useProjectMembersQuery } from "@/lib/query/project-hooks";
import {
  AlignLeft, Calendar, ChevronDown, Flag, Layers,
  ListTodo, User, Zap, Hash
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTaskRequest | UpdateTaskRequest) => void;
  task?: TaskResponse | null;
  initialStatus?: TaskStatus;
  organizationId: string;
  projectSlug: string;
  loading?: boolean;
  tasks?: TaskResponse[]; // for parent task selector
};

const STATUS_CONFIG: { value: TaskStatus; label: string; color: string; bg: string }[] = [
  { value: "BACKLOG", label: "Backlog", color: "#94a3b8", bg: "#f8fafc" },
  { value: "TODO", label: "Todo", color: "#64748b", bg: "#f1f5f9" },
  { value: "IN_PROGRESS", label: "In Progress", color: "#2563eb", bg: "#eff6ff" },
  { value: "IN_REVIEW", label: "In Review", color: "#d97706", bg: "#fffbeb" },
  { value: "DONE", label: "Done", color: "#10b981", bg: "#ecfdf5" },
];

const PRIORITY_CONFIG: { value: TaskPriority; label: string; color: string; bg: string }[] = [
  { value: "NO_PRIORITY", label: "No Priority", color: "#94a3b8", bg: "#f8fafc" },
  { value: "LOW", label: "Low", color: "#22c55e", bg: "#f0fdf4" },
  { value: "MEDIUM", label: "Medium", color: "#f59e0b", bg: "#fffbeb" },
  { value: "HIGH", label: "High", color: "#f97316", bg: "#fff7ed" },
  { value: "URGENT", label: "URGENT", color: "#ef4444", bg: "#fef2f2" },
];

function PriorityDot({ priority }: { priority: TaskPriority }) {
  const cfg = PRIORITY_CONFIG.find(p => p.value === priority)!;
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: cfg.color, flexShrink: 0,
    }} />
  );
}

function StatusDot({ status }: { status: TaskStatus }) {
  const cfg = STATUS_CONFIG.find(s => s.value === status)!;
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: cfg.color, flexShrink: 0,
    }} />
  );
}

export function TaskModal({
  open, onClose, onSubmit, task, initialStatus,
  organizationId, projectSlug, loading, tasks = [],
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] = useState<TaskPriority>("NO_PRIORITY");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [storyPoints, setStoryPoints] = useState<number | "">("");
  const [parentTaskId, setParentTaskId] = useState("");

  const { data: members } = useProjectMembersQuery(organizationId, projectSlug);

  // Only top-level tasks can be parents
  const parentableTasks = tasks.filter(t => !t.parentTask && t.id !== task?.id);

  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || "");
        setStatus(task.status);
        setPriority(task.priority);
        setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
        setAssigneeId(task.assignee?.id || "");
        setStoryPoints(task.storyPoints ?? "");
        setParentTaskId(task.parentTask?.id || "");
      } else {
        setTitle(""); setDescription(""); setStatus(initialStatus || "TODO");
        setPriority("NO_PRIORITY"); setDueDate(""); setAssigneeId("");
        setStoryPoints(""); setParentTaskId("");
      }
    }
  }, [task, initialStatus, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      title, description, status, priority,
      dueDate: dueDate || undefined,
      assigneeId: assigneeId || undefined,
      storyPoints: storyPoints === "" ? undefined : Number(storyPoints),
      parentTaskId: parentTaskId || undefined,
      labelIds: task ? task.labels.map(l => l.id) : [],
    };
    onSubmit(payload);
  };

  const selectedStatus = STATUS_CONFIG.find(s => s.value === status)!;
  const selectedPriority = PRIORITY_CONFIG.find(p => p.value === priority)!;

  return (
    <Modal open={open} onClose={onClose} title={task ? "Edit Task" : "New Task"} size="lg">
      <form onSubmit={handleSubmit}>
        {/* ── Title ── */}
        <div style={{ marginBottom: 20 }}>
          <input
            className="input"
            style={{
              fontSize: 18, fontWeight: 600, padding: "10px 14px", border: "none",
              borderBottom: "2px solid var(--border)", borderRadius: 0, background: "transparent",
              width: "100%", outline: "none"
            }}
            placeholder="Task title…"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* ── Pill selectors row ── */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {/* Status pill */}
          <div style={{ position: "relative" }}>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as TaskStatus)}
              style={{
                appearance: "none", border: `1px solid ${selectedStatus.color}40`,
                background: selectedStatus.bg, color: selectedStatus.color,
                padding: "5px 28px 5px 10px", borderRadius: 999, fontSize: 12,
                fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
              }}
            >
              {STATUS_CONFIG.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <ChevronDown size={12} style={{
              position: "absolute", right: 8, top: "50%",
              transform: "translateY(-50%)", pointerEvents: "none", color: selectedStatus.color
            }} />
          </div>

          {/* Priority pill */}
          <div style={{ position: "relative" }}>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as TaskPriority)}
              style={{
                appearance: "none", border: `1px solid ${selectedPriority.color}40`,
                background: selectedPriority.bg, color: selectedPriority.color,
                padding: "5px 28px 5px 10px", borderRadius: 999, fontSize: 12,
                fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
              }}
            >
              {PRIORITY_CONFIG.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <ChevronDown size={12} style={{
              position: "absolute", right: 8, top: "50%",
              transform: "translateY(-50%)", pointerEvents: "none", color: selectedPriority.color
            }} />
          </div>

          {/* Assignee pill */}
          <div style={{ position: "relative" }}>
            <select
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              style={{
                appearance: "none", border: "1px solid var(--border)",
                background: "var(--surface-2)", color: "var(--text-sub)",
                padding: "5px 28px 5px 10px", borderRadius: 999, fontSize: 12,
                fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
              }}
            >
              <option value="">Unassigned</option>
              {members?.map(m => (
                <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
              ))}
            </select>
            <ChevronDown size={12} style={{
              position: "absolute", right: 8, top: "50%",
              transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)"
            }} />
          </div>
        </div>

        {/* ── Description ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6, marginBottom: 6,
            color: "var(--text-muted)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em"
          }}>
            <AlignLeft size={13} /> Description
          </div>
          <textarea
            className="input"
            style={{
              minHeight: 100, resize: "vertical", padding: "10px 14px",
              fontFamily: "inherit", fontSize: 14, lineHeight: 1.6
            }}
            placeholder="Add details, acceptance criteria, notes… (Markdown supported)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* ── Properties grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px", marginBottom: 20 }}>
          {/* Due Date */}
          <div>
            <label style={{
              display: "flex", alignItems: "center", gap: 5, marginBottom: 6,
              color: "var(--text-muted)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em"
            }}>
              <Calendar size={13} /> Due Date
            </label>
            <input type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>

          {/* Story Points */}
          <div>
            <label style={{
              display: "flex", alignItems: "center", gap: 5, marginBottom: 6,
              color: "var(--text-muted)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em"
            }}>
              <Zap size={13} /> Story Points
            </label>
            <input
              type="number" min={0} max={999} className="input"
              placeholder="0"
              value={storyPoints}
              onChange={e => setStoryPoints(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>

          {/* Parent Task */}
          {parentableTasks.length > 0 && (
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{
                display: "flex", alignItems: "center", gap: 5, marginBottom: 6,
                color: "var(--text-muted)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em"
              }}>
                <Layers size={13} /> Parent Task
              </label>
              <div style={{ position: "relative" }}>
                <select
                  className="input"
                  value={parentTaskId}
                  onChange={e => setParentTaskId(e.target.value)}
                  style={{ paddingRight: 32, appearance: "none" }}
                >
                  <option value="">None (top-level task)</option>
                  {parentableTasks.map(t => (
                    <option key={t.id} value={t.id}>{t.identifier} — {t.title}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{
                  position: "absolute", right: 10, top: "50%",
                  transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)"
                }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div style={{
          display: "flex", justifyContent: "flex-end", gap: 10,
          paddingTop: 16, borderTop: "1px solid var(--border)"
        }}>
          <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" loading={loading}>
            {task ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
