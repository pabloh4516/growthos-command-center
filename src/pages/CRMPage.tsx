import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { User, Mail, Phone, MapPin, Calendar, Target, TrendingUp, Star, Plus } from "lucide-react";
import { formatBRL } from "@/components/shared/CurrencyDisplay";
import { useContacts, useDeals, usePipelines } from "@/hooks/use-supabase-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// --- Types ---
interface MappedContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  stage: string;
  score: number;
  ltv: number;
  lastActivity: string;
  owner: string;
}

const timeline = [
  { event: "Clicou anuncio Google Ads", type: "ad", time: "15/01 10:23", icon: Target },
  { event: "Visitou landing page /colageno", type: "page", time: "15/01 10:24", icon: MapPin },
  { event: "Preencheu formulario de contato", type: "form", time: "15/01 10:28", icon: Mail },
  { event: "Email de boas-vindas enviado", type: "email", time: "15/01 10:30", icon: Mail },
  { event: "Abriu email (taxa: 100%)", type: "email", time: "15/01 14:15", icon: Mail },
  { event: "Reuniao agendada via Calendly", type: "meeting", time: "16/01 09:00", icon: Calendar },
  { event: "Proposta enviada — R$4.500", type: "deal", time: "17/01 15:30", icon: TrendingUp },
  { event: "Venda fechada — R$4.500", type: "sale", time: "20/01 11:00", icon: Star },
];

const sourceColors: Record<string, string> = {
  "Google Ads": "bg-blue-500/20 text-blue-400",
  "google_ads": "bg-blue-500/20 text-blue-400",
  "Meta": "bg-indigo-500/20 text-indigo-400",
  "meta_ads": "bg-indigo-500/20 text-indigo-400",
  "Organico": "bg-green-500/20 text-green-400",
  "organic": "bg-green-500/20 text-green-400",
  "Indicacao": "bg-purple-500/20 text-purple-400",
  "referral": "bg-purple-500/20 text-purple-400",
};

const stageColors: Record<string, string> = {
  "Subscriber": "bg-secondary text-muted-foreground",
  "subscriber": "bg-secondary text-muted-foreground",
  "Lead": "bg-primary/20 text-primary",
  "lead": "bg-primary/20 text-primary",
  "MQL": "bg-warning/20 text-warning",
  "mql": "bg-warning/20 text-warning",
  "SQL": "bg-orange-500/20 text-orange-400",
  "sql": "bg-orange-500/20 text-orange-400",
  "Opportunity": "bg-success/20 text-success",
  "opportunity": "bg-success/20 text-success",
  "Customer": "bg-success text-success-foreground",
  "customer": "bg-success text-success-foreground",
};

function scoreColor(s: number) {
  if (s >= 70) return "text-success";
  if (s >= 30) return "text-warning";
  return "text-destructive";
}

function formatStage(stage: string): string {
  const map: Record<string, string> = {
    subscriber: "Subscriber", lead: "Lead", mql: "MQL", sql: "SQL", opportunity: "Opportunity", customer: "Customer",
  };
  return map[stage] ?? stage;
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}min atras`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atras`;
  const days = Math.floor(hours / 24);
  return `${days}d atras`;
}

const contactColumns: ColumnDef<MappedContact, any>[] = [
  {
    accessorKey: "name",
    header: "Contato",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
          {row.original.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
        </div>
        <div>
          <p className="font-medium text-sm">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  { accessorKey: "phone", header: "Telefone", cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{getValue() as string}</span> },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ getValue }) => {
      const v = getValue() as string;
      return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sourceColors[v] || "bg-secondary text-muted-foreground"}`}>{v}</span>;
    },
  },
  {
    accessorKey: "stage",
    header: "Stage",
    cell: ({ getValue }) => {
      const v = getValue() as string;
      return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${stageColors[v] || "bg-secondary text-muted-foreground"}`}>{v}</span>;
    },
  },
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ getValue }) => {
      const v = getValue() as number;
      return <span className={`font-mono tabular-nums font-semibold ${scoreColor(v)}`}>{v}</span>;
    },
  },
  {
    accessorKey: "ltv",
    header: "LTV Previsto",
    cell: ({ getValue }) => <span className="font-mono tabular-nums">{formatBRL(getValue() as number)}</span>,
  },
  { accessorKey: "lastActivity", header: "Ultima Atividade", cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{getValue() as string}</span> },
  {
    accessorKey: "owner",
    header: "Resp.",
    cell: ({ getValue }) => (
      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-medium">
        {((getValue() as string) || "?")[0]}
      </div>
    ),
  },
];

// Pipeline
const defaultPipelineColumns = ["Novo Lead", "Qualificado", "Proposta Enviada", "Negociacao", "Fechado Ganho", "Fechado Perdido"];

const scoringRules = [
  { action: "Abriu email", points: 10, type: "positive" },
  { action: "Visitou pagina de preco", points: 20, type: "positive" },
  { action: "Preencheu formulario", points: 30, type: "positive" },
  { action: "Solicitou demonstracao", points: 50, type: "positive" },
  { action: "Inativo ha 7 dias", points: -10, type: "negative" },
  { action: "Email bounce", points: -20, type: "negative" },
];

const LoadingSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="h-8 w-48 bg-muted animate-pulse rounded" />
    <div className="h-10 w-72 bg-muted animate-pulse rounded-lg" />
    <div className="h-[400px] bg-muted animate-pulse rounded-xl" />
  </div>
);

const CRMPage = () => {
  const { currentOrg } = useAuth();
  const [selectedContact, setSelectedContact] = useState<MappedContact | null>(null);
  const { data: contactsRaw, isLoading: contactsLoading } = useContacts();
  const [ctOpen, setCtOpen] = useState(false);
  const [ctNome, setCtNome] = useState("");
  const [ctEmail, setCtEmail] = useState("");
  const [ctTelefone, setCtTelefone] = useState("");
  const [ctSource, setCtSource] = useState("");

  async function handleCreateContact() {
    if (!ctNome && !ctEmail) { toast.error("Preencha nome ou email"); return; }
    const { error } = await supabase.from('contacts').insert({
      organization_id: currentOrg?.id,
      name: ctNome || null,
      email: ctEmail || null,
      phone: ctTelefone || null,
      source: ctSource || 'manual',
    } as any);
    if (error) { toast.error("Erro ao criar contato"); return; }
    toast.success("Contato criado com sucesso!");
    setCtOpen(false);
    setCtNome(""); setCtEmail(""); setCtTelefone(""); setCtSource("");
    window.location.reload();
  }
  const { data: dealsRaw, isLoading: dealsLoading } = useDeals();
  const { data: pipelinesRaw, isLoading: pipelinesLoading } = usePipelines();

  const isLoading = contactsLoading || dealsLoading || pipelinesLoading;

  // Map contacts from DB
  const contacts: MappedContact[] = useMemo(() => {
    return (contactsRaw ?? []).map((c: any) => ({
      id: c.id,
      name: c.name ?? c.email ?? '-',
      email: c.email ?? '-',
      phone: c.phone ?? '-',
      source: c.source ?? '-',
      stage: formatStage(c.lifecycle_stage ?? 'subscriber'),
      score: Number(c.lead_score ?? 0),
      ltv: Number(c.predicted_ltv ?? 0),
      lastActivity: timeAgo(c.last_activity_at),
      owner: '-', // assigned_to is a UUID, we'd need a join to get the name
    }));
  }, [contactsRaw]);

  // Determine pipeline columns from DB or use defaults
  const pipelineColumns = useMemo(() => {
    if (pipelinesRaw && pipelinesRaw.length > 0) {
      const stages = pipelinesRaw[0].stages;
      if (Array.isArray(stages) && stages.length > 0) {
        return stages.map((s: any) => typeof s === 'string' ? s : s.name ?? s.id ?? 'Unknown');
      }
    }
    return defaultPipelineColumns;
  }, [pipelinesRaw]);

  // Map deals into pipeline columns
  const initialDeals = useMemo(() => {
    const result: Record<string, any[]> = {};
    pipelineColumns.forEach(col => { result[col] = []; });

    (dealsRaw ?? []).forEach((d: any) => {
      const stageId = d.stage_id ?? '';
      // Try to match stage_id to a pipeline column
      const matchedCol = pipelineColumns.find(
        (col: string) => col.toLowerCase() === stageId.toLowerCase() || col === stageId
      ) ?? pipelineColumns[0];

      const daysSinceCreation = d.created_at ? Math.floor((Date.now() - new Date(d.created_at).getTime()) / 86400000) : 0;

      result[matchedCol]?.push({
        id: d.id,
        title: d.title ?? '-',
        contact: d.contacts?.name ?? d.contacts?.email ?? '-',
        value: Number(d.value ?? 0),
        prob: Number(d.probability ?? 0),
        days: daysSinceCreation,
        owner: '-',
      });
    });

    return result;
  }, [dealsRaw, pipelineColumns]);

  const [deals, setDeals] = useState<Record<string, any[]> | null>(null);

  // Use initialDeals when first loaded, then track local state for drag-drop
  const currentDeals = deals ?? initialDeals;

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const base = { ...currentDeals };
    const sourceCol = [...(base[source.droppableId] ?? [])];
    const destCol = source.droppableId === destination.droppableId ? sourceCol : [...(base[destination.droppableId] ?? [])];
    const [moved] = sourceCol.splice(source.index, 1);
    destCol.splice(destination.index, 0, moved);

    setDeals({
      ...base,
      [source.droppableId]: sourceCol,
      ...(source.droppableId !== destination.droppableId ? { [destination.droppableId]: destCol } : {}),
    });
  };

  function daysColor(d: number) {
    if (d <= 7) return "text-success";
    if (d <= 14) return "text-warning";
    return "text-destructive";
  }

  const totalPipeline = Object.entries(currentDeals)
    .filter(([k]) => !k.toLowerCase().includes("fechado") && !k.toLowerCase().includes("won") && !k.toLowerCase().includes("lost"))
    .flatMap(([, v]) => v)
    .reduce((s, d) => s + d.value * (d.prob / 100), 0);

  // Score distribution from real contacts
  const scoreDistribution = useMemo(() => {
    const ranges = [
      { range: "Frio (0-25)", min: 0, max: 25, count: 0 },
      { range: "Morno (26-50)", min: 26, max: 50, count: 0 },
      { range: "Quente (51-75)", min: 51, max: 75, count: 0 },
      { range: "Muito Quente (76-100)", min: 76, max: 100, count: 0 },
    ];
    contacts.forEach(c => {
      const r = ranges.find(r => c.score >= r.min && c.score <= r.max);
      if (r) r.count++;
    });
    return ranges;
  }, [contacts]);

  const topLeads = useMemo(() => {
    return contacts.filter(c => c.score >= 80).sort((a, b) => b.score - a.score).slice(0, 10);
  }, [contacts]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="CRM" subtitle="Contatos, pipeline de vendas e lead scoring" />

      <Tabs defaultValue="contatos">
        <TabsList>
          <TabsTrigger value="contatos">Contatos</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="scoring">Lead Scoring</TabsTrigger>
        </TabsList>

        {/* CONTATOS TAB */}
        <TabsContent value="contatos" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={ctOpen} onOpenChange={setCtOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2"><Plus className="h-4 w-4" /> Novo Contato</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Novo Contato</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Nome</Label><Input value={ctNome} onChange={e => setCtNome(e.target.value)} placeholder="Ex: Jo\u00e3o Silva" /></div>
                  <div><Label>Email</Label><Input type="email" value={ctEmail} onChange={e => setCtEmail(e.target.value)} placeholder="Ex: joao@email.com" /></div>
                  <div><Label>Telefone</Label><Input value={ctTelefone} onChange={e => setCtTelefone(e.target.value)} placeholder="Ex: (11) 99999-9999" /></div>
                  <div>
                    <Label>Source</Label>
                    <Select value={ctSource} onValueChange={setCtSource}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google_ads">Google Ads</SelectItem>
                        <SelectItem value="organic">Org\u00e2nico</SelectItem>
                        <SelectItem value="referral">Indica\u00e7\u00e3o</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={handleCreateContact}>Salvar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {contacts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhum contato encontrado. Conecte sua conta do Google Ads para comecar.</div>
          ) : (
            <DataTable
              data={contacts}
              columns={contactColumns}
              searchPlaceholder="Buscar por nome ou email..."
              pageSize={12}
              onRowClick={(row) => setSelectedContact(row)}
            />
          )}
        </TabsContent>

        {/* PIPELINE TAB */}
        <TabsContent value="pipeline" className="mt-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-card rounded-lg surface-glow px-4 py-2">
              <span className="text-xs text-muted-foreground">Previsao Ponderada: </span>
              <span className="font-mono tabular-nums font-semibold text-success">{formatBRL(totalPipeline)}</span>
            </div>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="overflow-x-auto pb-2">
            <div className={`grid gap-3 min-w-[900px]`} style={{ gridTemplateColumns: `repeat(${pipelineColumns.length}, minmax(0, 1fr))` }}>
              {pipelineColumns.map((col: string) => (
                <Droppable key={col} droppableId={col}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-card rounded-xl surface-glow p-3 min-h-[300px] ${snapshot.isDraggingOver ? "ring-1 ring-primary" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{col}</p>
                        <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-full">{currentDeals[col]?.length || 0}</span>
                      </div>
                      <div className="space-y-2">
                        {(currentDeals[col] || []).map((deal: any, idx: number) => (
                          <Draggable key={deal.id} draggableId={deal.id} index={idx}>
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                className={`bg-secondary/50 rounded-lg p-3 cursor-grab active:cursor-grabbing ${snap.isDragging ? "shadow-lg ring-1 ring-primary" : ""}`}
                              >
                                <p className="text-xs font-medium truncate">{deal.title}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">{deal.contact}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs font-mono tabular-nums">{formatBRL(deal.value)}</span>
                                  <span className={`text-[10px] font-medium ${daysColor(deal.days)}`}>
                                    {deal.days > 0 ? `${deal.days}d` : "\u2014"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-[10px] text-muted-foreground">{deal.prob}%</span>
                                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-medium text-primary">
                                    {deal.owner?.[0] ?? "?"}
                                  </div>
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
            </div>
          </DragDropContext>
        </TabsContent>

        {/* LEAD SCORING TAB */}
        <TabsContent value="scoring" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Regras */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Regras de Pontuacao</p>
              <div className="space-y-2">
                {scoringRules.map((rule) => (
                  <div key={rule.action} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm">{rule.action}</span>
                    <span className={`font-mono tabular-nums font-semibold ${rule.points > 0 ? "text-success" : "text-destructive"}`}>
                      {rule.points > 0 ? "+" : ""}{rule.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Histograma */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl surface-glow p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Distribuicao de Scores</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution}>
                    <XAxis dataKey="range" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(222,47%,7%)", border: "1px solid hsl(217,33%,12%)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" name="Leads" radius={[4, 4, 0, 0]} fill="hsl(221,83%,53%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Top leads */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl surface-glow p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Top 10 Leads por Score</p>
            {topLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Nenhum lead com score acima de 80.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Nome</th>
                    <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Source</th>
                    <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Stage</th>
                    <th className="text-right px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Score</th>
                    <th className="text-right px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">LTV</th>
                  </tr>
                </thead>
                <tbody>
                  {topLeads.map((l) => (
                    <tr key={l.id} className="border-b border-border">
                      <td className="px-3 py-2 font-medium">{l.name}</td>
                      <td className="px-3 py-2"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sourceColors[l.source] || "bg-secondary text-muted-foreground"}`}>{l.source}</span></td>
                      <td className="px-3 py-2"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${stageColors[l.stage] || "bg-secondary text-muted-foreground"}`}>{l.stage}</span></td>
                      <td className={`px-3 py-2 text-right font-mono tabular-nums font-semibold ${scoreColor(l.score)}`}>{l.score}</td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">{formatBRL(l.ltv)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Contact Detail Sheet */}
      <Sheet open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <SheetContent className="w-full sm:w-[480px] sm:max-w-[480px] overflow-y-auto">
          {selectedContact && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-lg font-semibold text-primary">
                    {selectedContact.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <SheetTitle className="text-lg">{selectedContact.name}</SheetTitle>
                    <p className="text-sm text-muted-foreground">{selectedContact.email}</p>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Info grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</p>
                    <p className={`text-2xl font-mono font-bold ${scoreColor(selectedContact.score)}`}>{selectedContact.score}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">LTV Previsto</p>
                    <p className="text-2xl font-mono font-bold">{formatBRL(selectedContact.ltv)}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Stage</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stageColors[selectedContact.stage] || "bg-secondary text-muted-foreground"}`}>{selectedContact.stage}</span>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Source</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sourceColors[selectedContact.source] || "bg-secondary text-muted-foreground"}`}>{selectedContact.source}</span>
                  </div>
                </div>

                {/* Attribution */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Atribuicao</p>
                  <div className="bg-secondary/50 rounded-lg p-3 space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Primeiro toque:</span> {selectedContact.source}</p>
                    <p><span className="text-muted-foreground">Ultimo toque:</span> {selectedContact.lastActivity}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Timeline</p>
                  <div className="space-y-0">
                    {timeline.map((ev, i) => (
                      <div key={i} className="flex gap-3 pb-4 relative">
                        {i < timeline.length - 1 && <div className="absolute left-[13px] top-7 w-px h-[calc(100%-12px)] bg-border" />}
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 z-10">
                          <ev.icon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm">{ev.event}</p>
                          <p className="text-[10px] text-muted-foreground">{ev.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CRMPage;
