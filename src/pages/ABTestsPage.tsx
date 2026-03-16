import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressBarCustom } from "@/components/shared/ProgressBarCustom";
import { Trophy, Plus } from "lucide-react";
import { useABTests } from "@/hooks/use-supabase-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Variant = { name: string; impressions: number; clicks: number; conversions: number; cvr: number };
type Test = { id: string; name: string; tipo: string; status: string; significancia: number; sampleCurrent: number; sampleNeeded: number; variants: Variant[]; winner?: string };

const tipoBadge: Record<string, string> = {
  "Criativo": "bg-purple-500/20 text-purple-400",
  "Página": "bg-blue-500/20 text-blue-400",
  "Audiência": "bg-green-500/20 text-green-400",
  "Copy": "bg-orange-500/20 text-orange-400",
};

function TestCard({ test }: { test: Test }) {
  const bestCvr = Math.max(...test.variants.map(v => v.cvr));
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl surface-glow p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{test.name}</p>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tipoBadge[test.tipo] || ""}`}>{test.tipo}</span>
        </div>
        {test.winner && <Trophy className="h-4 w-4 text-warning" />}
      </div>

      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${test.variants.length}, 1fr)` }}>
        {test.variants.map((v) => (
          <div key={v.name} className={`bg-secondary/50 rounded-lg p-3 ${test.winner === v.name ? "ring-1 ring-success" : ""}`}>
            <p className="text-xs font-medium mb-2 truncate">{v.name}</p>
            <div className="space-y-1 text-[10px] text-muted-foreground">
              <div className="flex justify-between"><span>Impressões</span><span className="font-mono">{v.impressions.toLocaleString("pt-BR")}</span></div>
              <div className="flex justify-between"><span>Cliques</span><span className="font-mono">{v.clicks.toLocaleString("pt-BR")}</span></div>
              <div className="flex justify-between"><span>Conversões</span><span className="font-mono">{v.conversions}</span></div>
              <div className="flex justify-between"><span>CVR</span><span className={`font-mono font-semibold ${v.cvr === bestCvr && v.cvr > 0 ? "text-success" : ""}`}>{v.cvr.toFixed(1)}%</span></div>
            </div>
          </div>
        ))}
      </div>

      {test.status !== "draft" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Significância Estatística</span>
            <span className={`font-mono font-semibold ${test.significancia >= 95 ? "text-success" : test.significancia >= 70 ? "text-warning" : "text-muted-foreground"}`}>{test.significancia}%</span>
          </div>
          <ProgressBarCustom value={test.significancia} thresholds={{ green: 70, yellow: 90 }} showLabel={false} />
          <p className="text-[10px] text-muted-foreground">Amostra: {test.sampleCurrent.toLocaleString("pt-BR")} / {test.sampleNeeded.toLocaleString("pt-BR")}</p>
        </div>
      )}

      {test.significancia >= 95 && !test.winner && (
        <button className="w-full py-2 rounded-lg bg-success text-success-foreground text-xs font-medium hover:bg-success/90 transition-colors">
          Declarar Vencedor
        </button>
      )}
      {test.significancia > 0 && test.significancia < 95 && (
        <p className="text-[10px] text-muted-foreground text-center">Precisa de mais {(test.sampleNeeded - test.sampleCurrent).toLocaleString("pt-BR")} conversões para resultado confiável</p>
      )}
    </motion.div>
  );
}

const ABTestsPage = () => {
  const { currentOrg } = useAuth();
  const { data: abTestsData, isLoading } = useABTests();
  const [abOpen, setAbOpen] = useState(false);
  const [abNome, setAbNome] = useState("");
  const [abTipo, setAbTipo] = useState("");
  const [abMetrica, setAbMetrica] = useState("");

  async function handleCreateABTest() {
    if (!abNome || !abTipo) { toast.error("Preencha nome e tipo"); return; }
    const { error } = await supabase.from('ab_tests').insert({
      organization_id: currentOrg?.id,
      name: abNome,
      test_type: abTipo,
      primary_metric: abMetrica || 'conversion_rate',
      status: 'draft',
    } as any);
    if (error) { toast.error("Erro ao criar teste"); return; }
    toast.success("Teste A/B criado com sucesso!");
    setAbOpen(false);
    setAbNome(""); setAbTipo(""); setAbMetrica("");
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

  const rawTests = (abTestsData ?? []) as any[];

  if (rawTests.length === 0) {
    return (
      <div className="space-y-6 max-w-[1400px]">
        <PageHeader title="Testes A/B" subtitle="Crie e gerencie testes para criativos, páginas e audiências"
          actions={
          <Dialog open={abOpen} onOpenChange={setAbOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2"><Plus className="h-4 w-4" /> Novo Teste</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Teste A/B</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Nome</Label><Input value={abNome} onChange={e => setAbNome(e.target.value)} placeholder="Ex: Teste CTA vermelho vs azul" /></div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={abTipo} onValueChange={setAbTipo}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="creative">Criativo</SelectItem>
                      <SelectItem value="page">P&#225;gina</SelectItem>
                      <SelectItem value="audience">Audi&#234;ncia</SelectItem>
                      <SelectItem value="copy">Copy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>M&#233;trica Principal</Label>
                  <Select value={abMetrica} onValueChange={setAbMetrica}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversion_rate">Taxa de Convers&#227;o</SelectItem>
                      <SelectItem value="ctr">CTR</SelectItem>
                      <SelectItem value="cpa">CPA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleCreateABTest}>Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        } />
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Nenhum dado encontrado.
        </div>
      </div>
    );
  }

  const tests: Test[] = rawTests.map((t: any) => ({
    id: t.id,
    name: t.name ?? "—",
    tipo: t.test_type ?? t.tipo ?? "—",
    status: t.status ?? "draft",
    significancia: t.statistical_significance ?? t.significancia ?? 0,
    sampleCurrent: t.sample_current ?? t.sampleCurrent ?? 0,
    sampleNeeded: t.sample_needed ?? t.sampleNeeded ?? 0,
    variants: (t.variants ?? []).map((v: any) => ({
      name: v.name ?? "—",
      impressions: v.impressions ?? 0,
      clicks: v.clicks ?? 0,
      conversions: v.conversions ?? 0,
      cvr: v.cvr ?? (v.impressions > 0 ? (v.conversions / v.impressions) * 100 : 0),
    })),
    winner: t.winner ?? t.winner_variant ?? undefined,
  }));

  const active = tests.filter(t => t.status === "active");
  const completed = tests.filter(t => t.status === "completed");
  const drafts = tests.filter(t => t.status === "draft");

  return (
    <div className="space-y-6 max-w-[1400px]">
      <PageHeader title="Testes A/B" subtitle="Crie e gerencie testes para criativos, páginas e audiências"
        actions={
          <Dialog open={abOpen} onOpenChange={setAbOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2"><Plus className="h-4 w-4" /> Novo Teste</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Teste A/B</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Nome</Label><Input value={abNome} onChange={e => setAbNome(e.target.value)} placeholder="Ex: Teste CTA vermelho vs azul" /></div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={abTipo} onValueChange={setAbTipo}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="creative">Criativo</SelectItem>
                      <SelectItem value="page">P&#225;gina</SelectItem>
                      <SelectItem value="audience">Audi&#234;ncia</SelectItem>
                      <SelectItem value="copy">Copy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>M&#233;trica Principal</Label>
                  <Select value={abMetrica} onValueChange={setAbMetrica}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversion_rate">Taxa de Convers&#227;o</SelectItem>
                      <SelectItem value="ctr">CTR</SelectItem>
                      <SelectItem value="cpa">CPA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleCreateABTest}>Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        } />

      <Tabs defaultValue="ativos">
        <TabsList>
          <TabsTrigger value="ativos">Ativos ({active.length})</TabsTrigger>
          <TabsTrigger value="concluidos">Concluídos ({completed.length})</TabsTrigger>
          <TabsTrigger value="rascunhos">Rascunhos ({drafts.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="ativos" className="mt-4">
          {active.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{active.map(t => <TestCard key={t.id} test={t} />)}</div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Nenhum teste ativo.</div>
          )}
        </TabsContent>
        <TabsContent value="concluidos" className="mt-4">
          {completed.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{completed.map(t => <TestCard key={t.id} test={t} />)}</div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Nenhum teste concluído.</div>
          )}
        </TabsContent>
        <TabsContent value="rascunhos" className="mt-4">
          {drafts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{drafts.map(t => <TestCard key={t.id} test={t} />)}</div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Nenhum rascunho.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ABTestsPage;
