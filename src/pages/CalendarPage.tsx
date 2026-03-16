import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCalendarEvents } from "@/hooks/use-supabase-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const eventTypes: Record<string, { label: string; color: string }> = {
  campanha: { label: "Lançamento Campanha", color: "bg-blue-500" },
  criativo: { label: "Deadline Criativo", color: "bg-purple-500" },
  reuniao: { label: "Reunião Cliente", color: "bg-success" },
  relatorio: { label: "Relatório", color: "bg-warning" },
  promocao: { label: "Promoção", color: "bg-destructive" },
  teste: { label: "Teste A/B", color: "bg-cyan-500" },
};

const CalendarPage = () => {
  const { currentOrg } = useAuth();
  const [selected, setSelected] = useState<any | null>(null);
  const { data: calendarData, isLoading } = useCalendarEvents();
  const [evtOpen, setEvtOpen] = useState(false);
  const [evtTitulo, setEvtTitulo] = useState("");
  const [evtTipo, setEvtTipo] = useState("");
  const [evtData, setEvtData] = useState("");
  const [evtCor, setEvtCor] = useState("");

  async function handleCreateEvent() {
    if (!evtTitulo || !evtTipo) { toast.error("Preencha t\u00edtulo e tipo"); return; }
    const { error } = await supabase.from('calendar_events').insert({
      organization_id: currentOrg?.id,
      title: evtTitulo,
      event_type: evtTipo,
      start_date: evtData || new Date().toISOString(),
      color: evtCor || null,
    } as any);
    if (error) { toast.error("Erro ao criar evento"); return; }
    toast.success("Evento criado com sucesso!");
    setEvtOpen(false);
    setEvtTitulo(""); setEvtTipo(""); setEvtData(""); setEvtCor("");
    window.location.reload();
  }

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

  const rawEvents = (calendarData ?? []) as any[];

  if (rawEvents.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <PageHeader title="Calendário de Marketing" subtitle="Planejamento de campanhas, criativos e eventos" actions={
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus className="h-4 w-4" /> Novo Evento
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Evento</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground">Formulário de criação de evento em desenvolvimento.</p>
            </DialogContent>
          </Dialog>
        } />
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Nenhum dado encontrado.
        </div>
      </div>
    );
  }

  const events = rawEvents.map((e: any) => ({
    dia: e.day ?? (e.date ? new Date(e.date).getDate() : (e.event_date ? new Date(e.event_date).getDate() : 1)),
    tipo: e.type ?? e.event_type ?? e.tipo ?? "campanha",
    titulo: e.title ?? e.titulo ?? "—",
    date: e.date ?? e.event_date ?? null,
  }));

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Determine month from first event with a date, fallback to current
  let monthLabel = "Janeiro 2025";
  let daysInMonth = 31;
  let startDay = 2;
  const firstEventWithDate = rawEvents.find((e: any) => e.date || e.event_date);
  if (firstEventWithDate) {
    const d = new Date(firstEventWithDate.date ?? firstEventWithDate.event_date);
    const year = d.getFullYear();
    const month = d.getMonth();
    monthLabel = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    monthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
    daysInMonth = new Date(year, month + 1, 0).getDate();
    startDay = new Date(year, month, 1).getDay();
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="Calendário de Marketing" subtitle="Planejamento de campanhas, criativos e eventos" actions={
        <Dialog open={evtOpen} onOpenChange={setEvtOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2"><Plus className="h-4 w-4" /> Novo Evento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Evento</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>T&#237;tulo</Label><Input value={evtTitulo} onChange={e => setEvtTitulo(e.target.value)} placeholder="Ex: Lan&#231;amento Black Friday" /></div>
              <div>
                <Label>Tipo</Label>
                <Select value={evtTipo} onValueChange={setEvtTipo}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="campaign_launch">Lan&#231;amento Campanha</SelectItem>
                    <SelectItem value="creative_deadline">Deadline Criativo</SelectItem>
                    <SelectItem value="client_meeting">Reuni&#227;o Cliente</SelectItem>
                    <SelectItem value="report_due">Relat&#243;rio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Data e Hora</Label><Input type="datetime-local" value={evtData} onChange={e => setEvtData(e.target.value)} /></div>
              <div>
                <Label>Cor</Label>
                <Select value={evtCor} onValueChange={setEvtCor}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Azul</SelectItem>
                    <SelectItem value="purple">Roxo</SelectItem>
                    <SelectItem value="green">Verde</SelectItem>
                    <SelectItem value="yellow">Amarelo</SelectItem>
                    <SelectItem value="red">Vermelho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleCreateEvent}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5">
        <div className="flex items-center justify-between mb-5">
          <button className="p-2 rounded-lg hover:bg-muted transition-colors"><ChevronLeft className="h-4 w-4" /></button>
          <h3 className="font-semibold">{monthLabel}</h3>
          <button className="p-2 rounded-lg hover:bg-muted transition-colors"><ChevronRight className="h-4 w-4" /></button>
        </div>

        <div className="grid grid-cols-7 gap-px">
          {dayNames.map(d => (
            <div key={d} className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest text-center py-2">{d}</div>
          ))}
          {cells.map((day, i) => {
            const dayEvents = day ? events.filter((e: any) => e.dia === day) : [];
            return (
              <div key={i} className={`min-h-[90px] p-1.5 border border-border/50 rounded-md ${day ? "bg-card hover:bg-muted/30 transition-colors" : "bg-transparent"}`}>
                {day && (
                  <>
                    <span className="text-xs font-mono text-muted-foreground">{day}</span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.map((ev: any, j: number) => {
                        const evType = eventTypes[ev.tipo] ?? { label: ev.tipo, color: "bg-secondary" };
                        return (
                          <button
                            key={j}
                            onClick={() => setSelected(ev)}
                            className={`w-full text-left text-[9px] px-1.5 py-0.5 rounded ${evType.color} text-white truncate`}
                          >
                            {ev.titulo}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          {Object.entries(eventTypes).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className={`w-2.5 h-2.5 rounded-sm ${val.color}`} />
              {val.label}
            </div>
          ))}
        </div>
      </motion.div>

      {selected && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-sm ${(eventTypes[selected.tipo] ?? { color: "bg-secondary" }).color}`} />
            <div>
              <h4 className="font-medium">{selected.titulo}</h4>
              <p className="text-xs text-muted-foreground">
                {selected.date ? new Date(selected.date).toLocaleDateString("pt-BR") : `${selected.dia}`}
                {" — "}
                {(eventTypes[selected.tipo] ?? { label: selected.tipo }).label}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CalendarPage;
