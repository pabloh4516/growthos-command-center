import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, Calendar, User } from "lucide-react";
import { useTasks } from "@/hooks/use-supabase-data";

const taskCols = ["To Do", "In Progress", "Review", "Done"];
const priorityColors: Record<string, string> = { low: "bg-primary/20 text-primary", medium: "bg-warning/20 text-warning", high: "bg-orange-500/20 text-orange-400", urgent: "bg-destructive/20 text-destructive" };
const typeColors: Record<string, string> = { "Criar Criativo": "bg-purple-500/20 text-purple-400", "Lançar Campanha": "bg-blue-500/20 text-blue-400", "Revisar Performance": "bg-green-500/20 text-green-400", "Reunião Cliente": "bg-orange-500/20 text-orange-400" };

const TasksPage = () => {
  const { data: tasksData, isLoading } = useTasks();
  const [localTasks, setLocalTasks] = useState<Record<string, any[]> | null>(null);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </div>
    );
  }

  const rawTasks = (tasksData ?? []) as any[];

  if (rawTasks.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <PageHeader title="Equipe & Tarefas" subtitle="Gerencie tarefas e atividades da equipe"
          actions={<button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"><Plus className="h-4 w-4" /> Nova Tarefa</button>} />
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Nenhum dado encontrado.
        </div>
      </div>
    );
  }

  // Group tasks by status column
  const statusMap: Record<string, string> = {
    todo: "To Do", "to_do": "To Do", "To Do": "To Do",
    in_progress: "In Progress", "In Progress": "In Progress",
    review: "Review", "Review": "Review",
    done: "Done", "Done": "Done", completed: "Done",
  };

  const groupedFromData: Record<string, any[]> = { "To Do": [], "In Progress": [], "Review": [], "Done": [] };
  rawTasks.forEach((t: any) => {
    const col = statusMap[t.status ?? t.column ?? "todo"] ?? "To Do";
    groupedFromData[col].push({
      id: t.id,
      titulo: t.title ?? t.titulo ?? "—",
      tipo: t.type ?? t.tipo ?? "—",
      prioridade: t.priority ?? t.prioridade ?? "medium",
      responsavel: t.assignee_initials ?? t.responsavel ?? (t.assignee ? String(t.assignee).charAt(0).toUpperCase() : "?"),
      prazo: t.due_date ? new Date(t.due_date).toLocaleDateString("pt-BR") : (t.prazo ?? "—"),
      campanha: t.campaign ?? t.campanha ?? "—",
    });
  });

  const tasks = localTasks ?? groupedFromData;

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const current = localTasks ?? groupedFromData;
    const srcCol = [...(current[source.droppableId] ?? [])];
    const dstCol = source.droppableId === destination.droppableId ? srcCol : [...(current[destination.droppableId] ?? [])];
    const [moved] = srcCol.splice(source.index, 1);
    dstCol.splice(destination.index, 0, moved);
    setLocalTasks({ ...current, [source.droppableId]: srcCol, ...(source.droppableId !== destination.droppableId ? { [destination.droppableId]: dstCol } : {}) });
  };

  // Derive activities from tasks
  const activities = rawTasks
    .filter((t: any) => t.updated_at || t.created_at)
    .sort((a: any, b: any) => new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime())
    .slice(0, 5)
    .map((t: any) => ({
      text: `Tarefa "${t.title ?? t.titulo ?? '—'}" atualizada`,
      time: t.updated_at ? new Date(t.updated_at).toLocaleString("pt-BR") : "—",
    }));

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="Equipe & Tarefas" subtitle="Gerencie tarefas e atividades da equipe"
        actions={<button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"><Plus className="h-4 w-4" /> Nova Tarefa</button>} />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-3">
          {taskCols.map(col => (
            <Droppable key={col} droppableId={col}>
              {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className={`bg-card rounded-xl surface-glow p-3 min-h-[400px] ${snapshot.isDraggingOver ? "ring-1 ring-primary" : ""}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{col}</p>
                    <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-full">{tasks[col]?.length || 0}</span>
                  </div>
                  <div className="space-y-2">
                    {(tasks[col] || []).map((task: any, idx: number) => (
                      <Draggable key={task.id} draggableId={task.id} index={idx}>
                        {(prov, snap) => (
                          <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                            className={`bg-secondary/50 rounded-lg p-3 cursor-grab active:cursor-grabbing ${snap.isDragging ? "shadow-lg ring-1 ring-primary" : ""}`}>
                            <p className="text-xs font-medium">{task.titulo}</p>
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${typeColors[task.tipo] || "bg-secondary"}`}>{task.tipo}</span>
                              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${priorityColors[task.prioridade] || "bg-secondary"}`}>{task.prioridade}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{task.prazo}</span>
                              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-medium text-primary">{task.responsavel}</div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {activities.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Atividades Recentes</p>
          <div className="space-y-3">
            {activities.map((a: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
                <p className="text-muted-foreground">{a.text}</p>
                <span className="text-[10px] text-muted-foreground shrink-0 ml-4">{a.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
export default TasksPage;
