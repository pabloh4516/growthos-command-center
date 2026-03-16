import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { HeatmapGrid } from "@/components/shared/HeatmapGrid";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { formatBRL } from "@/components/shared/CurrencyDisplay";
import { useMetricsByHour } from "@/hooks/use-supabase-data";

const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}h`);
const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

// Fallback mock data
const mockHeatmapData = days.flatMap((_, ri) =>
  hours.map((_, ci) => {
    const isWeekday = ri < 5;
    const isPrime = ci >= 19 && ci <= 22;
    const base = isWeekday ? (isPrime ? 20 + Math.random() * 15 : 2 + Math.random() * 8) : (isPrime ? 8 + Math.random() * 6 : 1 + Math.random() * 3);
    return { row: ri, col: ci, value: Math.round(base), tooltip: `${days[ri]} ${hours[ci]}: ${Math.round(base)} conversões, CPA ${formatBRL(15 + Math.random() * 20)}` };
  })
);

const mockDevices = [
  { name: "Desktop", icon: Monitor, impressoes: 520000, cliques: 36400, conversoes: 680, cpa: 14.20, roas: 4.1 },
  { name: "Mobile", icon: Smartphone, impressoes: 680000, cliques: 47600, conversoes: 380, cpa: 42.50, roas: 1.4 },
  { name: "Tablet", icon: Tablet, impressoes: 50000, cliques: 2500, conversoes: 83, cpa: 18.10, roas: 3.2 },
];

const SchedulePage = () => {
  const { data: rawData, isLoading } = useMetricsByHour();

  // Map real data to heatmap format, or fallback
  const heatmapData = rawData && rawData.length > 0
    ? rawData.map((row: any) => ({
        row: row.day_of_week ?? 0,
        col: row.hour ?? 0,
        value: row.conversions || 0,
        tooltip: `${days[row.day_of_week ?? 0] || ""} ${hours[row.hour ?? 0] || ""}: ${row.conversions || 0} conversões, CPA ${formatBRL(row.cpa || 0)}`,
      }))
    : mockHeatmapData;

  const devices = mockDevices;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <PageHeader title="Horários e Dispositivos" subtitle="Performance por hora do dia e tipo de dispositivo" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="Horários e Dispositivos" subtitle="Performance por hora do dia e tipo de dispositivo" />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Heatmap de Conversões (Dia x Hora)</p>
        <HeatmapGrid data={heatmapData} rowLabels={days} colLabels={hours} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-primary/10 border border-primary/20 rounded-xl p-4">
        <p className="text-sm"><span className="font-medium">70% das conversões</span> acontecem entre 19h-22h em dias úteis. Considere concentrar budget nesse horário.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {devices.map((d, i) => {
          const Icon = d.icon;
          return (
            <motion.div key={d.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }} className="bg-card rounded-xl surface-glow p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="h-5 w-5 text-primary" /></div>
                <p className="font-medium">{d.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><p className="text-muted-foreground">Impressões</p><p className="font-mono tabular-nums mt-0.5">{d.impressoes.toLocaleString("pt-BR")}</p></div>
                <div><p className="text-muted-foreground">Cliques</p><p className="font-mono tabular-nums mt-0.5">{d.cliques.toLocaleString("pt-BR")}</p></div>
                <div><p className="text-muted-foreground">Conversões</p><p className="font-mono tabular-nums mt-0.5">{d.conversoes}</p></div>
                <div><p className="text-muted-foreground">CPA</p><p className={`font-mono tabular-nums mt-0.5 ${d.cpa > 30 ? "text-destructive" : "text-success"}`}>{formatBRL(d.cpa)}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground">ROAS</p><p className={`font-mono tabular-nums mt-0.5 font-semibold ${d.roas >= 3 ? "text-success" : d.roas >= 2 ? "text-warning" : "text-destructive"}`}>{d.roas.toFixed(1)}x</p></div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-warning/10 border border-warning/20 rounded-xl p-4">
        <p className="text-sm">No <span className="font-medium">mobile</span> CPA é <span className="font-semibold text-destructive">3x maior</span> — considere reduzir bid em 40% para dispositivos móveis.</p>
      </motion.div>
    </div>
  );
};

export default SchedulePage;
