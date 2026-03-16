import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, ArrowUpCircle } from "lucide-react";
import { ProgressBarCustom } from "@/components/shared/ProgressBarCustom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const uploads = [
  { data: "18/01/2025", arquivo: "vendas_jan_semana3.csv", linhas: 120, matchRate: 87, syncGoogle: true, syncMeta: true },
  { data: "11/01/2025", arquivo: "vendas_jan_semana2.csv", linhas: 95, matchRate: 82, syncGoogle: true, syncMeta: false },
  { data: "04/01/2025", arquivo: "vendas_jan_semana1.csv", linhas: 110, matchRate: 91, syncGoogle: true, syncMeta: true },
  { data: "28/12/2024", arquivo: "vendas_dez_semana4.csv", linhas: 85, matchRate: 78, syncGoogle: true, syncMeta: true },
  { data: "21/12/2024", arquivo: "vendas_dez_semana3.xlsx", linhas: 140, matchRate: 84, syncGoogle: true, syncMeta: false },
];

type UploadRow = typeof uploads[0];

const columns: ColumnDef<UploadRow, any>[] = [
  { accessorKey: "data", header: "Data" },
  { accessorKey: "arquivo", header: "Arquivo", cell: ({ getValue }) => (
    <div className="flex items-center gap-2">
      <FileSpreadsheet className="h-4 w-4 text-success" />
      <span className="text-sm">{getValue() as string}</span>
    </div>
  )},
  { accessorKey: "linhas", header: "Linhas", cell: ({ getValue }) => <span className="font-mono tabular-nums">{getValue() as number}</span> },
  { accessorKey: "matchRate", header: "Match Rate", cell: ({ getValue }) => {
    const v = getValue() as number;
    return <span className={`font-mono tabular-nums font-semibold ${v >= 85 ? "text-success" : v >= 75 ? "text-warning" : "text-destructive"}`}>{v}%</span>;
  }},
  { accessorKey: "syncGoogle", header: "Google", cell: ({ getValue }) => getValue() ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" /> },
  { accessorKey: "syncMeta", header: "Meta", cell: ({ getValue }) => getValue() ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" /> },
];

const OfflineConversionsPage = () => {
  const { toast } = useToast();

  const handleUploadClick = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "O upload de conversoes offline estara disponivel em breve.",
    });
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      <PageHeader title="Conversoes Offline" subtitle="Upload de vendas offline e match com campanhas" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={handleUploadClick}
      >
        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-1">Arraste seu arquivo CSV ou XLSX aqui</h3>
        <p className="text-sm text-muted-foreground mb-4">Campos esperados: email ou telefone, valor, data, produto, gclid/fbclid (opcional)</p>
        <button
          onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Selecionar Arquivo
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl surface-glow p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Ultimo Upload --- Match Report</p>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Total de linhas</p>
            <p className="text-2xl font-mono font-bold mt-1">120</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Matched</p>
            <p className="text-2xl font-mono font-bold text-success mt-1">104 <span className="text-sm font-normal">(87%)</span></p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Unmatched</p>
            <p className="text-2xl font-mono font-bold text-destructive mt-1">16 <span className="text-sm font-normal">(13%)</span></p>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBarCustom value={87} thresholds={{ green: 80, yellow: 60 }} />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-success/10 border border-success/20 rounded-xl p-4">
        <p className="text-sm flex items-center gap-2"><ArrowUpCircle className="h-4 w-4 text-success" /> Com conversoes offline, seu ROAS real e <span className="font-semibold text-success">3.8x</span> (antes mostrava <span className="text-muted-foreground">2.1x</span>)</p>
      </motion.div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Historico de Uploads</p>
        <DataTable data={uploads} columns={columns} searchPlaceholder="Buscar arquivo..." />
      </div>
    </div>
  );
};

export default OfflineConversionsPage;
