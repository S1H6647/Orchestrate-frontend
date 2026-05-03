"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Calendar, CheckCircle2, Flag, Plus, Trash2,
  User, Hash, Clock, X, AlertCircle, Zap,
  Layers, Edit2
} from "lucide-react";
import { TaskResponse, TaskPriority, TaskStatus } from "@/lib/api/types";
import { toDateLabel, cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Props = {
  open: boolean;
  onClose: () => void;
  task: TaskResponse;
  onUpdate: (payload: any) => void;
  onDelete: () => void;
  onEdit: () => void;
  canEditTask?: boolean;
  onAddSubTask: (title: string) => void;
  onToggleSubTask: (subTaskId: string, completed: boolean) => void;
  onDeleteSubTask: (subTaskId: string) => void;
  onAddLabel: (name: string) => void;
  onRemoveLabel: (labelId: string) => void;
  loading?: boolean;
};

const PRIORITY_META: Record<TaskPriority, { color: string; label: string; icon: React.ReactNode }> = {
  NO_PRIORITY: { color: "#94a3b8", label: "No Priority", icon: <Flag size={13} /> },
  LOW: { color: "#22c55e", label: "Low", icon: <Flag size={13} /> },
  MEDIUM: { color: "#f59e0b", label: "Medium", icon: <Flag size={13} /> },
  HIGH: { color: "#f97316", label: "High", icon: <Flag size={13} /> },
  URGENT: { color: "#ef4444", label: "URGENT", icon: <AlertCircle size={13} /> },
};

const STATUS_META: Record<TaskStatus, { color: string; bg: string; label: string }> = {
  BACKLOG: { color: "#94a3b8", bg: "#f8fafc", label: "Backlog" },
  TODO: { color: "#64748b", bg: "#f1f5f9", label: "Todo" },
  IN_PROGRESS: { color: "#2563eb", bg: "#eff6ff", label: "In Progress" },
  IN_REVIEW: { color: "#d97706", bg: "#fffbeb", label: "In Review" },
  DONE: { color: "#10b981", bg: "#ecfdf5", label: "Done" },
};

function PropRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0",
      borderBottom: "1px solid var(--border)"
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6, width: 120, flexShrink: 0,
        color: "var(--text-muted)", fontSize: 12, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.05em", paddingTop: 2
      }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 14, color: "var(--text-sub)", fontWeight: 500 }}>
        {children}
      </div>
    </div>
  );
}

function Avatar({ name, size = 24 }: { name: string; size?: number }) {
  const palettes = [
    "linear-gradient(135deg,#667eea,#764ba2)",
    "linear-gradient(135deg,#4facfe,#00f2fe)",
    "linear-gradient(135deg,#43e97b,#38f9d7)",
    "linear-gradient(135deg,#fa709a,#fee140)",
    "linear-gradient(135deg,#a18cd1,#fbc2eb)",
    "linear-gradient(135deg,#fda085,#f6d365)",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const gradient = palettes[Math.abs(hash) % palettes.length];
  const ini = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: gradient,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 800, color: "#fff", flexShrink: 0
    }}>
      {ini}
    </div>
  );
}

function SubtaskProgress({ completed, total }: { completed: number; total: number }) {
  if (total === 0) return null;
  const pct = Math.round((completed / total) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: pct === 100 ? "var(--success)" : "var(--primary)",
          borderRadius: 99, transition: "width 0.3s ease"
        }} />
      </div>
      <span style={{
        fontSize: 11, fontWeight: 700, color: pct === 100 ? "var(--success)" : "var(--text-muted)",
        whiteSpace: "nowrap"
      }}>{completed}/{total}</span>
    </div>
  );
}

export function TaskDetailDrawer({
  open, onClose, task, onUpdate, onDelete, onEdit,
  canEditTask = true,
  onAddSubTask, onToggleSubTask, onDeleteSubTask,
  onAddLabel, onRemoveLabel, loading,
}: Props) {
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [showAddLabelConfirm, setShowAddLabelConfirm] = useState(false);
  const [showRemoveLabelConfirm, setShowRemoveLabelConfirm] = useState(false);
  const [pendingLabelName, setPendingLabelName] = useState("");
  const [pendingLabelId, setPendingLabelId] = useState<string | null>(null);

  const pMeta = PRIORITY_META[task.priority];
  const sMeta = STATUS_META[task.status];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  const subTasks = task.subTasks || [];
  const labels = task.labels || [];
  const completedSubs = subTasks.filter(s => s.completed).length;

  const handleAddSubTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTaskTitle.trim()) return;
    onAddSubTask(newSubTaskTitle.trim());
    setNewSubTaskTitle("");
  };

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    setPendingLabelName(newLabelName.trim());
    setShowAddLabelConfirm(true);
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={task.identifier}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <Button variant="ghost" tone="danger" icon={<Trash2 size={15} />}
              onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </Button>
            <div style={{ display: "flex", gap: 8 }}>
              {canEditTask && (
                <Button variant="secondary" icon={<Edit2 size={15} />} onClick={onEdit}>Edit</Button>
              )}
              <Button variant="ghost" onClick={onClose}>Close</Button>
            </div>
          </div>
        }
      >
        <div className="stack" style={{ gap: 0 }}>

          {/* ── Title & badges ── */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{
              fontSize: 22, fontWeight: 700, color: "var(--text)",
              lineHeight: 1.35, marginBottom: 12
            }}>
              {task.title}
            </h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {/* Status */}
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: sMeta.bg, color: sMeta.color, border: `1px solid ${sMeta.color}30`,
                borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: sMeta.color, display: "inline-block"
                }} />
                {sMeta.label}
              </span>
              {/* Priority */}
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: `${pMeta.color}14`, color: pMeta.color,
                border: `1px solid ${pMeta.color}30`, borderRadius: 999,
                padding: "4px 12px", fontSize: 12, fontWeight: 700
              }}>
                {pMeta.icon} {pMeta.label}
              </span>
              {/* Story points */}
              {task.storyPoints != null && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: "var(--surface-2)", color: "var(--text-sub)",
                  border: "1px solid var(--border)", borderRadius: 999,
                  padding: "4px 12px", fontSize: 12, fontWeight: 700
                }}>
                  <Zap size={11} /> {task.storyPoints} pts
                </span>
              )}
            </div>
          </div>

          {/* ── Properties ── */}
          <div style={{ borderTop: "1px solid var(--border)", marginBottom: 24 }}>
            <PropRow icon={<User size={12} />} label="Assignee">
              {task.assignee ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar name={task.assignee.name} size={22} />
                  {task.assignee.name}
                </div>
              ) : (
                <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Unassigned</span>
              )}
            </PropRow>

            <PropRow icon={<User size={12} />} label="Reporter">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar name={task.reporter.name} size={22} />
                {task.reporter.name}
              </div>
            </PropRow>

            <PropRow icon={<Calendar size={12} />} label="Due Date">
              {task.dueDate ? (
                <span style={{
                  color: isOverdue ? "var(--danger)" : "inherit",
                  fontWeight: isOverdue ? 700 : 500
                }}>
                  {toDateLabel(task.dueDate)}{isOverdue && " · Overdue"}
                </span>
              ) : (
                <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No due date</span>
              )}
            </PropRow>

            {task.parentTask && (
              <PropRow icon={<Layers size={12} />} label="Parent">
                <span style={{
                  fontFamily: "monospace", fontWeight: 700,
                  color: "var(--primary)"
                }}>
                  {task.parentTask.identifier}
                </span>
                {" — "}{task.parentTask.title}
              </PropRow>
            )}

            <PropRow icon={<Clock size={12} />} label="Created">
              {toDateLabel(task.createdAt)}
            </PropRow>
          </div>

          {/* ── Description ── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: "var(--text)",
              textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10
            }}>
              Description
            </div>
            <div style={{
              fontSize: 14, lineHeight: 1.7, color: "var(--text-sub)",
              whiteSpace: "pre-wrap", background: "var(--surface-2)",
              border: "1px solid var(--border)", borderRadius: "var(--radius)",
              padding: "14px 16px", minHeight: 60
            }}>
              {task.description || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No description</span>}
            </div>
          </div>

          {/* ── Labels ── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: "var(--text)",
              textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10
            }}>
              Labels
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {labels.length === 0 && (
                <span style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>No labels</span>
              )}
              {labels.map(label => (
                <span key={label.id} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: `${label.color}18`, color: label.color,
                  border: `1px solid ${label.color}35`, borderRadius: 999,
                  padding: "3px 10px", fontSize: 12, fontWeight: 700,
                }}>
                  {label.name}
                  <button
                    onClick={() => {
                      setPendingLabelId(label.id);
                      setPendingLabelName(label.name);
                      setShowRemoveLabelConfirm(true);
                    }}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: label.color, display: "flex", padding: 0, opacity: 0.7
                    }}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddLabel} style={{ display: "flex", gap: 8 }}>
              <input className="input" placeholder="Add label…"
                style={{ flex: 1, fontSize: 13 }}
                value={newLabelName}
                onChange={e => setNewLabelName(e.target.value)} />
              <Button type="submit" size="sm" variant="secondary" icon={<Plus size={14} />}>Add</Button>
            </form>
          </div>

          {/* ── Sub-tasks ── */}
          <div>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 12
            }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: "var(--text)",
                textTransform: "uppercase", letterSpacing: "0.06em"
              }}>
                Sub-tasks
              </div>
            </div>

            {subTasks.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <SubtaskProgress completed={completedSubs} total={subTasks.length} />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 12 }}>
              {subTasks.length === 0 && (
                <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", padding: "4px 0" }}>
                  No sub-tasks yet
                </p>
              )}
              {subTasks.map(sub => (
                <div key={sub.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: "var(--radius-sm)",
                  background: sub.completed ? "var(--surface-2)" : "transparent",
                  border: "1px solid transparent",
                  transition: "all 0.15s",
                }}>
                  <button
                    onClick={() => onToggleSubTask(sub.id, !sub.completed)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      padding: 0, display: "flex", flexShrink: 0,
                      color: sub.completed ? "var(--success)" : "var(--border-strong)"
                    }}>
                    <CheckCircle2 size={18} fill={sub.completed ? "currentColor" : "none"} />
                  </button>
                  <span style={{
                    flex: 1, fontSize: 13.5, fontWeight: 500,
                    color: sub.completed ? "var(--text-muted)" : "var(--text-sub)",
                    textDecoration: sub.completed ? "line-through" : "none"
                  }}>
                    {sub.title}
                  </span>
                  <button onClick={() => onDeleteSubTask(sub.id)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--text-muted)", display: "flex", padding: 2,
                      borderRadius: 4, opacity: 0.6
                    }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSubTask} style={{ display: "flex", gap: 8 }}>
              <input className="input" placeholder="Add a sub-task…"
                style={{ flex: 1, fontSize: 13 }}
                value={newSubTaskTitle}
                onChange={e => setNewSubTaskTitle(e.target.value)} />
              <Button type="submit" size="sm" variant="secondary" icon={<Plus size={14} />}>Add</Button>
            </form>
          </div>

        </div>
      </Drawer>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Task"
        description={`Delete "${task.title}"? This cannot be undone.`}
        confirmLabel="Delete Task"
        tone="danger"
        onConfirm={() => { onDelete(); setShowDeleteConfirm(false); onClose(); }}
        onCancel={() => setShowDeleteConfirm(false)}
        loading={loading}
      />

      <ConfirmDialog
        open={showAddLabelConfirm}
        title="Add label"
        description={`Add label "${pendingLabelName}" to this task?`}
        confirmLabel="Add Label"
        tone="primary"
        onConfirm={() => {
          onAddLabel(pendingLabelName);
          setNewLabelName("");
          setPendingLabelName("");
          setShowAddLabelConfirm(false);
        }}
        onCancel={() => {
          setShowAddLabelConfirm(false);
          setPendingLabelName("");
        }}
        confirmDisabled={!pendingLabelName}
      />

      <ConfirmDialog
        open={showRemoveLabelConfirm}
        title="Remove label"
        description={`Remove label "${pendingLabelName}" from this task?`}
        confirmLabel="Remove Label"
        tone="danger"
        onConfirm={() => {
          if (pendingLabelId) {
            onRemoveLabel(pendingLabelId);
          }
          setPendingLabelId(null);
          setPendingLabelName("");
          setShowRemoveLabelConfirm(false);
        }}
        onCancel={() => {
          setPendingLabelId(null);
          setPendingLabelName("");
          setShowRemoveLabelConfirm(false);
        }}
        confirmDisabled={!pendingLabelId}
      />
    </>
  );
}
