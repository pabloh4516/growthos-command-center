import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { KPICard } from "@/components/KPICard";
import { ColumnDef } from "@tanstack/react-table";
import { formatBRL } from "@/components/shared/CurrencyDisplay";
import { Copy, Check } from "lucide-react";
import { useState, useMemo } from "react";
import { useUtmifySales, useUtmifyConfig, useCampaigns } from "@/hooks/use-supabase-data";

const statusMap: Record<string, string> = {
  paid: "Pago",
  waiting_payment: "Aguardando",
  refused: "Recusado",
  refunded: "Reembolsado",
  chargedback: "Chargeback",
};

const statusColors: Record<string, string> = {
  "Pago": "bg-success/20 text-success",
  "Aguardando": "bg-warning/20 text-warning",
  "Recusado": "bg-destructive/20 text-destructive",
  "Reembolsado": "bg-purple-500/20 text-purple-400",
  "Chargeback": "bg-red-800/30 text-red-400",
};

const confColors: Record<string, string> = { alta: "text-success", media: "text-warning", baixa: "text-destructive" };

function matchConfidenceLabel(conf: number | null | undefined): string {
  const v = Number(conf ?? 0);
  if (v >= 0.7) return "alta";
  if (v >= 0.4) return "media";
  return "baixa";
}

interface MappedVenda {
  order_id: string;
  status: string;
  valor: number;
  produto: string;
  cliente: string;
  utm_source: string;
  utm_campaign: string | null;
  campanha_mapeada: string | null;
  confianca: string;
  data: string;
}

const columns: ColumnDef<MappedVenda, any>[] = [
  { accessorKey: "order_id", header: "Order ID", cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() as string}</span> },
  { accessorKey: "status", header: "Status", cell: ({ getValue }) => <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[getValue() as string] || ""}`}>{getValue() as string}</span> },
  { accessorKey: "valor", header: "Valor", cell: ({ getValue }) => <span className="font-mono tabular-nums">{formatBRL(getValue() as number)}</span> },
  { accessorKey: "produto", header: "Produto", cell: ({ getValue }) => <span className="text-xs">{getValue() as string}</span> },
  { accessorKey: "cliente", header: "Cliente" },
  { accessorKey: "utm_source", header: "Source", cell: ({ getValue }) => <span className="text-[10px] bg-secondary px-2 py-0.5 rounded">{getValue() as string}</span> },
  { accessorKey: "campanha_mapeada", header: "Campanha", cell: ({ getValue }) => {
    const v = getValue() as string | null;
    return v ? <span className="text-xs text-primary">{v}</span> : <span className="text-xs text-destructive">Nao mapeada</span>;
  }},
  { accessorKey: "confianca", header: "Match", cell: ({ getValue }) => <span className={`text-[10px] font-medium ${confColors[getValue() as string] || ""}`}>{getValue() as string}</span> },
  { accessorKey: "data", header: "Data", cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{getValue() as string}</span> },
];

const LoadingSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="h-8 w-64 bg-muted animate-pulse rounded" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
    </div>
    <div className="h-[400px] bg-muted animate-pulse rounded-xl" />
  </div>
);

const SalesPage = () => {
  const [copied, setCopied] = useState(false);
  const { data: salesRaw, isLoading: salesLoading } = useUtmifySales();
  const { data: utmifyConfig, isLoading: configLoading } = useUtmifyConfig();
  const { data: campaignsRaw, isLoading: campaignsLoading } = useCampaigns();

  const isLoading = salesLoading || configLoading || campaignsLoading;

  // Map sales from DB to display format
  const vendas: MappedVenda[] = useMemo(() => {
    return (salesRaw ?? []).map((s: any) => ({
      order_id: s.order_id ?? '',
      status: statusMap[s.status] ?? s.status ?? '',
      valor: Number(s.revenue ?? 0),
      produto: s.product_name ?? '-',
      cliente: s.customer_name ?? s.customer_email ?? '-',
      utm_source: s.utm_source ?? '-',
      utm_campaign: s.utm_campaign ?? null,
      campanha_mapeada: s.campaigns?.name ?? null,
      confianca: matchConfidenceLabel(s.match_confidence),
      data: s.sale_date ? new Date(s.sale_date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-',
    }));
  }, [salesRaw]);

  // Build gap data: compare Google conversions vs Utmify real sales per campaign
  const gapData = useMemo(() => {
    if (!campaignsRaw || campaignsRaw.length === 0) return [];
    return (campaignsRaw ?? [])
      .filter((c: any) => Number(c.google_conversions ?? 0) > 0 || Number(c.real_sales_count ?? 0) > 0)
      .slice(0, 10)
      .map((c: any) => {
        const convGoogle = Number(c.google_conversions ?? 0);
        const vendasUtmify = Number(c.real_sales_count ?? 0);
        const cost = Number(c.cost ?? 0);
        const googleRevenue = Number(c.google_conversion_value ?? 0);
        const realRevenue = Number(c.real_revenue ?? 0);
        const roasGoogle = cost > 0 ? (googleRevenue / cost).toFixed(2) + "x" : "0.00x";
        const roasReal = cost > 0 ? (realRevenue / cost).toFixed(2) + "x" : "0.00x";
        const diff = convGoogle > 0 ? (((vendasUtmify - convGoogle) / convGoogle) * 100).toFixed(1) + "%" : "N/A";
        return {
          campanha: c.name ?? '',
          convGoogle,
          vendasUtmify,
          roasGoogle,
          roasReal,
          diff,
        };
      });
  }, [campaignsRaw]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const pagas = vendas.filter(v => v.status === "Pago");
  const totalReceita = pagas.reduce((s, v) => s + v.valor, 0);
  const ticketMedio = pagas.length > 0 ? totalReceita / pagas.length : 0;
  const matchRate = vendas.length > 0 ? vendas.filter(v => v.campanha_mapeada).length / vendas.length * 100 : 0;

  const webhookUrl = utmifyConfig?.webhook_url_generated ?? 'https://api.growthOS.app/webhook/utmify/...';
  const isConnected = utmifyConfig?.is_active ?? false;

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="Vendas Reais — Utmify" subtitle="Dados reais de vendas mapeadas por UTM" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Vendas Pagas" value={String(pagas.length)} change={0} sparkData={[0, 0, 0, 0, 0, 0, pagas.length]} />
        <KPICard title="Receita Total" value={formatBRL(totalReceita)} change={0} sparkData={[0, 0, 0, 0, 0, 0, totalReceita / 100]} delay={0.05} />
        <KPICard title="Ticket Medio" value={formatBRL(ticketMedio)} change={0} sparkData={[0, 0, 0, 0, 0, 0, ticketMedio]} delay={0.1} />
        <KPICard title="Match Rate" value={`${matchRate.toFixed(0)}%`} change={0} sparkData={[0, 0, 0, 0, 0, 0, matchRate]} delay={0.15} />
      </div>

      {vendas.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhuma venda encontrada. Configure o webhook Utmify para receber vendas.</div>
      ) : (
        <DataTable data={vendas} columns={columns} searchPlaceholder="Buscar venda..." pageSize={12} />
      )}

      {/* Gap Google vs Real */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow overflow-hidden">
        <div className="p-5 pb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Gap Google vs Real (Utmify)</p>
        </div>
        {gapData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Nenhum dado de comparacao disponivel.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-border">
                  {["Campanha", "Conv. Google", "Vendas Utmify", "ROAS Google", "ROAS Real", "Diferenca"].map(h => (
                    <th key={h} className="text-left px-3 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gapData.map((g: any) => (
                  <tr key={g.campanha} className="border-t border-border">
                    <td className="px-3 py-3 pl-5 font-medium">{g.campanha}</td>
                    <td className="px-3 py-3 font-mono tabular-nums">{g.convGoogle}</td>
                    <td className="px-3 py-3 font-mono tabular-nums">{g.vendasUtmify}</td>
                    <td className="px-3 py-3 font-mono tabular-nums text-success">{g.roasGoogle}</td>
                    <td className="px-3 py-3 font-mono tabular-nums text-warning">{g.roasReal}</td>
                    <td className="px-3 py-3 font-mono tabular-nums text-destructive pr-5">{g.diff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Webhook Config */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Configuracao Webhook</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-secondary rounded-lg px-3 py-2 font-mono text-xs text-muted-foreground truncate">
            {webhookUrl}
          </div>
          <button onClick={() => { navigator.clipboard.writeText(webhookUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </button>
          <span className="flex items-center gap-1.5 text-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-destructive'}`} />
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          {vendas.length > 0 ? `Ultimo recebimento: ${vendas[0]?.data ?? '-'}` : 'Nenhum recebimento ainda'}
        </p>
      </motion.div>
    </div>
  );
};

export default SalesPage;
