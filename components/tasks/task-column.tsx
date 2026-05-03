"use client";

import { TaskResponse, TaskStatus } from "@/lib/api/types";
import { TaskCard } from "./task-card";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  status: TaskStatus;
  title: string;
  tasks: TaskResponse[];
  onTaskClick: (task: TaskResponse) => void;
  onAddTask: (status: TaskStatus) => void;
  onDrop: (e: React.DragEvent, status: TaskStatus) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, task: TaskResponse) => void;
  canAddTask?: boolean;
};

export function TaskColumn({ 
  status, 
  title, 
  tasks, 
  onTaskClick, 
  onAddTask, 
  onDrop, 
  onDragOver,
  onDragStart,
  canAddTask
}: Props) {
  return (
    <div 
      className="kanban-column"
      onDrop={(e) => onDrop(e, status)}
      onDragOver={onDragOver}
    >
      <div className="kanban-column-header">
        <div className="kanban-column-title">
          {title}
          <span className="kanban-column-count">{tasks.length}</span>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {canAddTask && (
            <button 
              className="icon-btn" 
              style={{ width: 28, height: 28, border: "none", background: "transparent" }}
              onClick={() => onAddTask(status)}
            >
              <Plus size={16} />
            </button>
          )}
          <button className="icon-btn" style={{ width: 28, height: 28, border: "none", background: "transparent" }}>
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="kanban-tasks-list">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onClick={() => onTaskClick(task)}
            draggable
            onDragStart={(e) => onDragStart(e, task)}
          />
        ))}
        
        {tasks.length === 0 && (
          <div style={{ 
            padding: "24px", 
            textAlign: "center", 
            color: "var(--text-muted)", 
            fontSize: 12,
            border: "1px dashed var(--border)",
            borderRadius: "var(--radius)",
            margin: "0 8px"
          }}>
            No tasks here
          </div>
        )}
      </div>

      <div style={{ padding: "8px 12px 12px" }} />
    </div>
  );
}
