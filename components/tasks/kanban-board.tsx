"use client";

import { useEffect, useState, useMemo } from "react";
import { TaskColumn } from "./task-column";
import { TaskResponse, TaskStatus, CreateTaskRequest, UpdateTaskRequest, ProjectMember } from "@/lib/api/types";
import { 
  Search, 
  Filter, 
  Plus, 
  LayoutGrid, 
  List, 
  SortAsc,
  User as UserIcon,
  ArrowLeft
} from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskModal } from "./task-modal";
import { queryKeys } from "@/lib/query/keys";
import { TaskDetailDrawer } from "./task-detail-drawer";
import { 
  useCreateTaskMutation, 
  useUpdateTaskMutation, 
  useReorderTaskMutation,
  useDeleteTaskMutation,
  useCreateSubTaskMutation,
  useUpdateSubTaskMutation,
  useDeleteSubTaskMutation,
  useAddTaskLabelMutation,
  useRemoveTaskLabelMutation,
  useTaskCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation
} from "@/lib/query/task-hooks";
import { useProjectMembersQuery, useProjectQuery } from "@/lib/query/project-hooks";
import { useOrganizationBySlug } from "@/lib/query/organization-hooks";
import { useMeQuery } from "@/lib/query/auth-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { getStompClient, retainStompClient } from "@/lib/realtime/stomp-client";
import { isTaskMoveEvent, isTaskCreatedEvent } from "@/lib/realtime/task-events";
import type { TaskMoveEvent, TaskCreatedEvent } from "@/lib/realtime/task-events";

type Props = {
  organizationId: string;
  projectSlug: string;
  tasks: TaskResponse[];
  isLoading?: boolean;
};

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: "BACKLOG", title: "Backlog" },
  { status: "TODO", title: "Todo" },
  { status: "IN_PROGRESS", title: "In Progress" },
  { status: "IN_REVIEW", title: "In Review" },
  { status: "DONE", title: "Done" },
];

export function KanbanBoard({ organizationId, projectSlug, tasks, isLoading }: Props) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>("TODO");
  const { slug: orgSlug } = useParams<{ slug: string }>();
  const orgResolve = useOrganizationBySlug(orgSlug);
  const org = orgResolve.data;
  const projectQuery = useProjectQuery(organizationId, projectSlug);
  const project = projectQuery.data;

  const { data: members } = useProjectMembersQuery(organizationId, projectSlug);
  const meQuery = useMeQuery();
  
  const selectedTask = useMemo(() => 
    selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null,
    [selectedTaskId, tasks]
  );

  // Mutations
  const createTask = useCreateTaskMutation(organizationId, projectSlug);
  const updateTask = useUpdateTaskMutation(organizationId, projectSlug);
  const reorderTask = useReorderTaskMutation(organizationId, projectSlug);
  const deleteTask = useDeleteTaskMutation(organizationId, projectSlug);
  
  const createSubTask = useCreateSubTaskMutation(organizationId, projectSlug, selectedTask?.id || "");
  const updateSubTask = useUpdateSubTaskMutation(organizationId, projectSlug, selectedTask?.id || "");
  const deleteSubTask = useDeleteSubTaskMutation(organizationId, projectSlug, selectedTask?.id || "");
  
  const addLabel = useAddTaskLabelMutation(organizationId, projectSlug, selectedTask?.id || "");
  const removeLabel = useRemoveTaskLabelMutation(organizationId, projectSlug, selectedTask?.id || "");
  const commentsQuery = useTaskCommentsQuery(organizationId, projectSlug, selectedTask?.id || "", !!selectedTask?.id);
  const createComment = useCreateCommentMutation(organizationId, projectSlug, selectedTask?.id || "");
  const updateComment = useUpdateCommentMutation(organizationId, projectSlug, selectedTask?.id || "");

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                          task.identifier.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || task.status === statusFilter;
      const matchesAssignee = assigneeFilter === "ALL" || task.assignee?.id === assigneeFilter;
      
      return matchesSearch && matchesStatus && matchesAssignee;
    });
  }, [tasks, search, statusFilter, assigneeFilter]);

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, TaskResponse[]> = {
      BACKLOG: [],
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
    };
    filteredTasks.forEach(task => {
      map[task.status].push(task);
    });
    // Sort by position
    Object.keys(map).forEach(status => {
      map[status as TaskStatus].sort((a, b) => a.position - b.position);
    });
    return map;
  }, [filteredTasks]);

  // Drag and Drop
  const [draggedTask, setDraggedTask] = useState<TaskResponse | null>(null);

  const handleDragStart = (e: React.DragEvent, task: TaskResponse) => {
    setDraggedTask(task);
    e.dataTransfer.setData("taskId", task.id);
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("dragging");
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Find the task that we are dropping onto (if any)
    const targetElement = (e.target as HTMLElement).closest(".task-card");
    const columnTasks = tasksByStatus[status].filter(t => t.id !== taskId);

    let newPosition = 0;

    if (targetElement) {
      const targetId = (targetElement as any).getAttribute("data-id");
      const targetIndex = columnTasks.findIndex(t => t.id === targetId);
      
      if (targetIndex === 0) {
        newPosition = columnTasks[0].position / 2;
      } else if (targetIndex === -1) {
        newPosition = (columnTasks[columnTasks.length - 1]?.position || 0) + 1000;
      } else {
        newPosition = (columnTasks[targetIndex - 1].position + columnTasks[targetIndex].position) / 2;
      }
    } else {
      // Append to end
      newPosition = (columnTasks[columnTasks.length - 1]?.position || 0) + 1000;
    }

    if (task.status !== status || Math.abs(task.position - newPosition) > 0.1) {
      reorderTask.mutate({ 
        taskId, 
        payload: { status, position: newPosition } 
      });
    }
  };

  useEffect(() => {
    if (!project?.id) return;

    const client = getStompClient();
    const release = retainStompClient();
    let subscription: { unsubscribe: () => void } | null = null;

    const previousOnConnect = client.onConnect;
    const subscribe = () => {
      console.debug("[STOMP] Subscribing to project tasks", project.id);
      subscription = client.subscribe(`/topic/projects/${project.id}/tasks`, (message) => {
        if (!message.body) return;
        let payload: TaskMoveEvent | TaskCreatedEvent;
        try {
          payload = JSON.parse(message.body) as TaskMoveEvent | TaskCreatedEvent;
        } catch {
          console.debug("[STOMP] Invalid message body", message.body);
          return;
        }
        if (payload.projectId !== project.id) return;

        if (isTaskMoveEvent(payload)) {
          console.debug("[STOMP] Task move event", payload);

          queryClient.setQueriesData(
            { queryKey: queryKeys.tasks(organizationId, projectSlug) },
            (current: TaskResponse[] | undefined) => {
              if (!current) return current;
              return current.map(task =>
                task.id === payload.taskId
                  ? { ...task, status: payload.toStatus, position: payload.position }
                  : task
              );
            }
          );
          return;
        }

        if (isTaskCreatedEvent(payload)) {
          console.debug("[STOMP] Task created event", payload);

          queryClient.setQueriesData(
            { queryKey: queryKeys.tasks(organizationId, projectSlug) },
            (current: TaskResponse[] | undefined) => {
              if (!current) return [payload.task];
              if (current.some(task => task.id === payload.task.id)) return current;
              return [payload.task, ...current];
            }
          );
        }
      });
    };

    client.onConnect = (frame) => {
      previousOnConnect?.(frame);
      console.debug("[STOMP] Connected", frame?.headers);
      subscribe();
    };

    if (client.connected) {
      subscribe();
    }

    if (!client.active) {
      client.activate();
    }

    return () => {
      subscription?.unsubscribe();
      client.onConnect = previousOnConnect;
      release();
    };
  }, [project?.id, organizationId, projectSlug, queryClient]);

  const handleCreateTask = (payload: CreateTaskRequest | UpdateTaskRequest) => {
    if (selectedTask) {
      updateTask.mutate({ taskId: selectedTask.id, payload: payload as UpdateTaskRequest }, {
        onSuccess: () => {
          setIsModalOpen(false);
          setSelectedTaskId(null);
        }
      });
    } else {
      createTask.mutate(payload as CreateTaskRequest, {
        onSuccess: () => {
          setIsModalOpen(false);
        }
      });
    }
  };

  const myProjectRole = project?.myRole
    ?? members?.find(m => m.user.id === meQuery.data?.id)?.role;
  const canReorder = myProjectRole === "MANAGER"
    || myProjectRole === "CONTRIBUTOR"
    || org?.myRole === "OWNER"
    || org?.myRole === "ADMIN";
  const canCreate = myProjectRole === "MANAGER" || org?.myRole === "OWNER" || org?.myRole === "ADMIN";
  const canUpdate = canReorder;

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (!project?.id) return;
    console.debug("[Board permissions]", {
      projectId: project.id,
      myProjectRole,
      orgRole: org?.myRole,
      canReorder,
      canCreate,
      canUpdate,
      membersLoaded: Boolean(members?.length),
    });
  }, [project?.id, myProjectRole, org?.myRole, canReorder, canCreate, canUpdate, members?.length]);

  return (
    <div className="stack" style={{ gap: "24px", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "300px" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
                opacity: 0.9,
                pointerEvents: "none",
                zIndex: 2,
              }}
            />
            <Input 
              placeholder="Search tasks..." 
              style={{ paddingLeft: "40px" }} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select 
            value={statusFilter} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as any)}
            style={{ width: "140px" }}
          >
            <option value="ALL">All Statuses</option>
            {COLUMNS.map(c => <option key={c.status} value={c.status}>{c.title}</option>)}
          </Select>

          <Select 
            value={assigneeFilter} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAssigneeFilter(e.target.value)}
            style={{ width: "160px" }}
          >
            <option value="ALL">All Assignees</option>
            {members?.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
          </Select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", background: "var(--surface-2)", padding: "4px", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
            <button className="icon-btn" style={{ width: 32, height: 32, background: "var(--surface)", border: "none", boxShadow: "var(--shadow-xs)" }}><LayoutGrid size={16} /></button>
            <button className="icon-btn" style={{ width: 32, height: 32, background: "transparent", border: "none", color: "var(--text-muted)" }}><List size={16} /></button>
          </div>
          {canCreate && (
            <Button 
              variant="primary" 
              icon={<Plus size={18} />}
              onClick={() => {
                setSelectedTaskId(null);
                setInitialStatus("TODO");
                setIsModalOpen(true);
              }}
            >
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* Board */}
      <div className="kanban-board" style={{ flex: 1 }}>
        {COLUMNS.map(column => (
          <TaskColumn 
            key={column.status}
            status={column.status}
            title={column.title}
            tasks={tasksByStatus[column.status]}
            canAddTask={canCreate}
            onTaskClick={(task) => {
              setSelectedTaskId(task.id);
              setIsDrawerOpen(true);
            }}
            onAddTask={(status) => {
              if (!canCreate) return;
              setInitialStatus(status);
              setSelectedTaskId(null);
              setIsModalOpen(true);
            }}
            onDrop={canReorder ? handleDrop : () => {}}
            onDragOver={canReorder ? handleDragOver : () => {}}
            onDragStart={canReorder ? handleDragStart : (e) => e.preventDefault()}
          />
        ))}
      </div>

      {/* Modals & Drawers */}
      <TaskModal 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
        task={selectedTask}
        initialStatus={initialStatus}
        organizationId={organizationId}
        projectSlug={projectSlug}
        loading={createTask.isPending || updateTask.isPending}
        tasks={tasks}
      />

      {selectedTask && (
        <TaskDetailDrawer 
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          task={selectedTask}
          onUpdate={(payload) => updateTask.mutate({ taskId: selectedTask.id, payload })}
          onDelete={() => deleteTask.mutate(selectedTask.id)}
          onEdit={() => { setIsDrawerOpen(false); setIsModalOpen(true); }}
          canEditTask={canUpdate}
          onAddSubTask={(title) => createSubTask.mutate({ title })}
          onToggleSubTask={(subTaskId, completed) => updateSubTask.mutate({ subTaskId, payload: { completed } })}
          onDeleteSubTask={(subTaskId) => deleteSubTask.mutate(subTaskId)}
          onAddLabel={(name) => addLabel.mutate(name)}
          onRemoveLabel={(labelId) => removeLabel.mutate(labelId)}
          comments={commentsQuery.data || []}
          onAddComment={(content) => createComment.mutate({ content, taskId: selectedTask.id })}
          onUpdateComment={(commentId, content) => updateComment.mutate({ commentId, payload: { content } })}
          loading={deleteTask.isPending}
        />
      )}
    </div>
  );
}

function Select({ children, ...props }: any) {
  return (
    <div style={{ position: "relative" }}>
      <select 
        className="select" 
        style={{ fontSize: 13, fontWeight: 500 }}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
