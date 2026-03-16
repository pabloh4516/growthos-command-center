import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { KPICard } from "@/components/KPICard";
import { ColumnDef } from "@tanstack/react-table";
import { Phone } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart, CartesianGrid } from "recharts";

const calls = [
  { dataHora: "20/01 14:32", numero: "(11) 98765-4321", duracao: "4:23", status: "Atendida", qualificacao: "Hot", campanha: "Google - Brand Search", contato: "Ana Carolina Silva" },
  { dataHora: "20/01 13:15", numero: "(21) 97654-3210", duracao: "0:00", status: "Perdida", qualificacao: "---", campanha: "Meta - Retargeting Q1", contato: "Desconhecido" },
  { dataHora: "20/01 12:45", numero: "(11) 91234-5678", duracao: "8:12", status: "Atendida", qualificacao: "Hot", campanha: "Google - Competitor KWs", contato: "Bruno Santos" },
  { dataHora: "20/01 11:00", numero: "(31) 99876-5432", duracao: "2:10", status: "Atendida", qualificacao: "Warm", campanha: "Google - Brand Search", contato: "Camila Rodrigues" },
  { dataHora: "20/01 10:30", numero: "(41) 98765-1234", duracao: "0:45", status: "Voicemail", qualificacao: "Cold", campanha: "Meta - LAL Purchasers", contato: "Desconhecido" },
  { dataHora: "19/01 17:20", numero: "(11) 97777-8888", duracao: "6:45", status: "Atendida", qualificacao: "Hot", campanha: "Google - Brand Search", contato: "Diego Ferreira" },
  { dataHora: "19/01 16:00", numero: "(85) 98888-9999", duracao: "0:00", status: "Perdida", qualificacao: "---", campanha: "TikTok - Gen Z Launch", contato: "Desconhecido" },
  { dataHora: "19/01 15:30", numero: "(11) 96666-5555", duracao: "3:50", status: "Atendida", qualificacao: "Warm", campanha: "Google - Competitor KWs", contato: "Eduarda Mendes" },
  { dataHora: "19/01 14:15", numero: "(21) 95555-4444", duracao: "12:30", status: "Atendida", qualificacao: "Hot", campanha: "Google - Brand Search", contato: "Felipe Almeida" },
  { dataHora: "19/01 12:00", numero: "(51) 94444-3333", duracao: "0:00", status: "Perdida", qualificacao: "Spam", campanha: "---", contato: "Desconhecido" },
  { dataHora: "18/01 18:00", numero: "(11) 93333-2222", duracao: "5:15", status: "Atendida", qualificacao: "Hot", campanha: "Meta - Retargeting Q1", contato: "Gabriela Martins" },
  { dataHora: "18/01 16:30", numero: "(62) 92222-1111", duracao: "1:20", status: "Atendida", qualificacao: "Cold", campanha: "Google - Brand Search", contato: "Henrique Barbosa" },
  { dataHora: "18/01 15:00", numero: "(11) 91111-0000", duracao: "7:00", status: "Atendida", qualificacao: "Hot", campanha: "Google - Competitor KWs", contato: "Isabela Nunes" },
  { dataHora: "18/01 13:45", numero: "(27) 99000-1111", duracao: "0:00", status: "Perdida", qualificacao: "---", campanha: "Meta - LAL Purchasers", contato: "Desconhecido" },
  { dataHora: "18/01 11:30", numero: "(11) 98000-2222", duracao: "4:00", status: "Atendida", qualificacao: "Warm", campanha: "Google - Brand Search", contato: "Jose Carlos" },
  { dataHora: "17/01 17:00", numero: "(48) 97000-3333", duracao: "9:20", status: "Atendida", qualificacao: "Hot", campanha: "Google - Brand Search", contato: "Karen Souza" },
  { dataHora: "17/01 15:30", numero: "(11) 96000-4444", duracao: "2:30", status: "Atendida", qualificacao: "Warm", campanha: "Meta - Retargeting Q1", contato: "Lucas Oliveira" },
  { dataHora: "17/01 14:00", numero: "(71) 95000-5555", duracao: "0:00", status: "Perdida", qualificacao: "---", campanha: "TikTok - Gen Z Launch", contato: "Desconhecido" },
  { dataHora: "17/01 12:30", numero: "(11) 94000-6666", duracao: "5:45", status: "Atendida", qualificacao: "Hot", campanha: "Google - Competitor KWs", contato: "Mariana Costa" },
  { dataHora: "17/01 10:00", numero: "(81) 93000-7777", duracao: "0:30", status: "Voicemail", qualificacao: "Cold", campanha: "Meta - LAL Purchasers", contato: "Desconhecido" },
];

type Call = typeof calls[0];

const statusBadge: Record<string, string> = {
  Atendida: "bg-success/20 text-success",
  Perdida: "bg-destructive/20 text-destructive",
  Voicemail: "bg-warning/20 text-warning",
};

const qualBadge: Record<string, string> = {
  Hot: "bg-destructive/20 text-destructive",
  Warm: "bg-warning/20 text-warning",
  Cold: "bg-blue-500/20 text-blue-400",
  Spam: "bg-muted text-muted-foreground",
  "---": "",
};

const columns: ColumnDef<Call, any>[] = [
  { accessorKey: "dataHora", header: "Data/Hora" },
  { accessorKey: "numero", header: "Numero", cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() as string}</span> },
  { accessorKey: "duracao", header: "Duracao", cell: ({ getValue }) => <span className="font-mono tabular-nums">{getValue() as string}</span> },
  { accessorKey: "status", header: "Status", cell: ({ getValue }) => <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge[getValue() as string] || ""}`}>{getValue() as string}</span> },
  { accessorKey: "qualificacao", header: "Qualificacao", cell: ({ getValue }) => {
    const v = getValue() as string;
    return v !== "---" ? <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${qualBadge[v] || ""}`}>{v}</span> : <span className="text-muted-foreground">---</span>;
  }},
  { accessorKey: "campanha", header: "Campanha", cell: ({ getValue }) => <span className="text-xs">{getValue() as string}</span> },
  { accessorKey: "contato", header: "Contato" },
];

const chartData = Array.from({ length: 30 }, (_, i) => ({
  dia: `${i + 1}/01`,
  calls: 3 + Math.floor(Math.random() * 8),
  qualificadas: 1 + Math.floor(Math.random() * 4),
}));

const atendidas = calls.filter(c => c.status === "Atendida").length;
const perdidas = calls.filter(c => c.status === "Perdida").length;
const hot = calls.filter(c => c.qualificacao === "Hot").length;

const CallTrackingPage = () => (
  <div className="space-y-6 max-w-[1600px]">
    <PageHeader title="Call Tracking" subtitle="Monitoramento de ligacoes e atribuicao a campanhas" />

    {/* Twilio integration banner */}
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3"
    >
      <Phone className="h-5 w-5 text-primary" />
      <p className="text-sm text-foreground">
        <span className="font-semibold">Integracao com Twilio em breve.</span>{" "}
        Os dados abaixo sao de demonstracao. Em breve voce podera conectar sua conta Twilio para rastreamento automatico.
      </p>
    </motion.div>

    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <KPICard title="Total Calls Hoje" value="8" change={0} sparkData={[5,7,6,8,9,7,8]} />
      <KPICard title="Atendidas" value={String(atendidas)} change={5.2} sparkData={[8,9,10,11,10,12,13]} />
      <KPICard title="Perdidas" value={String(perdidas)} change={-12} sparkData={[6,5,7,4,5,4,5]} />
      <KPICard title="Duracao Media" value="4:52" change={3.1} sparkData={[3,4,3,5,4,5,5]} />
      <KPICard title="Leads Qualificados" value={String(hot)} change={8.3} sparkData={[4,5,5,6,7,6,7]} />
    </div>

    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Ligacoes nos ultimos 30 dias</p>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="dia" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="calls" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.7} />
          <Line type="monotone" dataKey="qualificadas" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>

    <DataTable data={calls} columns={columns} searchPlaceholder="Buscar por numero ou contato..." />
  </div>
);

export default CallTrackingPage;
