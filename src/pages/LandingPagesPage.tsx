import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLandingPages } from "@/hooks/use-supabase-data";

const platBadge: Record<string, string> = {
  "WordPress": "bg-blue-500/20 text-blue-400",
  "Webflow": "bg-purple-500/20 text-purple-400",
  "Custom": "bg-orange-500/20 text-orange-400",
};

function statusDot(s: string) {
  const c = s === "green" ? "bg-success" : s === "yellow" ? "bg-warning" : "bg-destructive";
  return <span className={`w-2.5 h-2.5 rounded-full ${c}`} />;
}

function cvrColor(v: number) {
  if (v >= 5) return "text-success";
  if (v >= 3) return "text-warning";
  return "text-destructive";
}

function bounceColor(v: number) {
  if (v <= 30) return "text-success";
  if (v <= 40) return "text-warning";
  return "text-destructive";
}

const columns: ColumnDef<any, any>[] = [
  { accessorKey: "status", header: "", cell: ({ getValue }) => statusDot(getValue() as string), size: 30 },
  { accessorKey: "nome", header: "Nome", cell: ({ row }) => (
    <div>
      <p className="font-medium text-sm">{row.original.nome}</p>
      <p className="text-[10px] text-muted-foreground">{row.original.url}</p>
    </div>
  )},
  { accessorKey: "plataforma", header: "Plataforma", cell: ({ getValue }) => <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${platBadge[getValue() as string] || ""}`}>{getValue() as string}</span> },
  { accessorKey: "visitantes", header: "Visitantes", cell: ({ getValue }) => <span className="font-mono tabular-nums">{(getValue() as number).toLocaleString("pt-BR")}</span> },
  { accessorKey: "leads", header: "Leads", cell: ({ getValue }) => <span className="font-mono tabular-nums">{(getValue() as number).toLocaleString("pt-BR")}</span> },
  { accessorKey: "cvr", header: "CVR", cell: ({ getValue }) => <span className={`font-mono tabular-nums font-medium ${cvrColor(getValue() as number)}`}>{(getValue() as number).toFixed(1)}%</span> },
  { accessorKey: "bounce", header: "Bounce", cell: ({ getValue }) => <span className={`font-mono tabular-nums ${bounceColor(getValue() as number)}`}>{getValue() as number}%</span> },
  { accessorKey: "tempo", header: "Tempo Médio", cell: ({ getValue }) => <span className="font-mono tabular-nums text-muted-foreground">{getValue() as string}</span> },
];

const LandingPagesPage = () => {
  const [selected, setSelected] = useState<any | null>(null);
  const { data: lpData, isLoading } = useLandingPages();

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

  const rawPages = (lpData ?? []) as any[];

  if (rawPages.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <PageHeader title="Landing Pages" subtitle="0 páginas monitoradas" />
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Nenhum dado encontrado.
        </div>
      </div>
    );
  }

  const landingPages = rawPages.map((p: any) => {
    const cvr = p.conversion_rate ?? p.cvr ?? (p.visitors > 0 ? (p.leads / p.visitors) * 100 : 0);
    const bounce = p.bounce_rate ?? p.bounce ?? 0;
    let status = "green";
    if (cvr < 3 || bounce > 45) status = "red";
    else if (cvr < 5 || bounce > 35) status = "yellow";
    return {
      id: p.id,
      url: p.url ?? p.path ?? "—",
      nome: p.name ?? p.nome ?? "—",
      plataforma: p.platform ?? p.plataforma ?? "—",
      visitantes: p.visitors ?? p.visitantes ?? 0,
      leads: p.leads ?? 0,
      cvr: Number(cvr),
      bounce: Number(bounce),
      tempo: p.avg_time ?? p.tempo ?? "—",
      status: p.status ?? status,
    };
  });

  const convData = Array.from({ length: 30 }, (_, i) => ({ day: `${i + 1}/01`, taxa: 2.5 + Math.random() * 5 }));

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="Landing Pages" subtitle={`${landingPages.length} páginas monitoradas`} />
      <DataTable data={landingPages} columns={columns} searchPlaceholder="Buscar página..." onRowClick={(row: any) => setSelected(row)} />

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.nome}</SheetTitle>
                <p className="text-xs text-muted-foreground">{selected.url}</p>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="bg-card rounded-lg p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Taxa de Conversão (30d)</p>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={convData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,12%)" />
                        <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} interval={5} />
                        <YAxis tick={{ fontSize: 9, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                        <Tooltip contentStyle={{ background: "hsl(222,47%,7%)", border: "1px solid hsl(217,33%,12%)", borderRadius: 8, fontSize: 11 }} />
                        <Line type="monotone" dataKey="taxa" stroke="hsl(221,83%,53%)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Comparação com Benchmark</p>
                  <p className="text-sm">Sua taxa: <span className={`font-mono font-semibold ${cvrColor(selected.cvr)}`}>{selected.cvr}%</span></p>
                  <p className="text-sm">Média do setor: <span className="font-mono font-semibold">5.8%</span></p>
                  <p className="text-sm">Status: <span className={selected.cvr >= 5.8 ? "text-success font-medium" : "text-destructive font-medium"}>{selected.cvr >= 5.8 ? "Acima" : "Abaixo"}</span></p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Insights</p>
                  <p className="text-sm text-muted-foreground">Esta página tem bounce rate de <span className={`font-medium ${bounceColor(selected.bounce)}`}>{selected.bounce}%</span> — {selected.bounce > 35 ? "acima" : "abaixo"} da média de 30% do seu setor.</p>
                </div>
                <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                  Criar Teste A/B com esta Página
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default LandingPagesPage;
