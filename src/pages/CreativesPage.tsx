import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingDown, Image, Video, Type, Plus } from "lucide-react";
import { useCreatives } from "@/hooks/use-supabase-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const typeIcon: Record<string, any> = { video: Video, image: Image, carousel: Image, text: Type };

const CreativesPage = () => {
  const { currentOrg } = useAuth();
  const { data: creativesData, isLoading } = useCreatives();
  const [crOpen, setCrOpen] = useState(false);
  const [crNome, setCrNome] = useState("");
  const [crTipo, setCrTipo] = useState("");
  const [crPlataforma, setCrPlataforma] = useState("");
  const [crTags, setCrTags] = useState("");

  async function handleCreateCreative() {
    if (!crNome || !crTipo) { toast.error("Preencha nome e tipo"); return; }
    const { error } = await supabase.from('creative_library').insert({
      organization_id: currentOrg?.id,
      name: crNome,
      type: crTipo,
      platform: crPlataforma || 'google_ads',
      tags: crTags ? crTags.split(',').map(t => t.trim()) : [],
    } as any);
    if (error) { toast.error("Erro ao criar criativo"); return; }
    toast.success("Criativo criado com sucesso!");
    setCrOpen(false);
    setCrNome(""); setCrTipo(""); setCrPlataforma(""); setCrTags("");
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

  const rawCreatives = (creativesData ?? []) as any[];

  if (rawCreatives.length === 0) {
    return (
      <div className="space-y-6 max-w-[1400px]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Biblioteca de Criativos</h1>
            <p className="text-sm text-muted-foreground mt-1">0 criativos</p>
          </div>
          <Dialog open={crOpen} onOpenChange={setCrOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2"><Plus className="h-4 w-4" /> Novo Criativo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Criativo</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Nome</Label><Input value={crNome} onChange={e => setCrNome(e.target.value)} placeholder="Ex: Banner Black Friday" /></div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={crTipo} onValueChange={setCrTipo}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Imagem</SelectItem>
                      <SelectItem value="video">V\u00eddeo</SelectItem>
                      <SelectItem value="carousel">Carrossel</SelectItem>
                      <SelectItem value="text">Texto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Plataforma</Label>
                  <Select value={crPlataforma} onValueChange={setCrPlataforma}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google_ads">Google Ads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Tags (separadas por v\u00edrgula)</Label><Input value={crTags} onChange={e => setCrTags(e.target.value)} placeholder="Ex: promo, verao, desconto" /></div>
                <Button className="w-full" onClick={handleCreateCreative}>Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Nenhum dado encontrado.
        </div>
      </div>
    );
  }

  const creatives = rawCreatives.map((c: any) => ({
    name: c.name ?? c.title ?? "—",
    type: c.type ?? c.creative_type ?? "image",
    platform: c.platform ?? "—",
    ctr: c.ctr ? (typeof c.ctr === "number" ? `${c.ctr.toFixed(1)}%` : c.ctr) : "0.0%",
    conversions: c.conversions ?? 0,
    status: c.status ?? "normal",
    fatigue: c.fatigue ?? c.is_fatigued ?? false,
  }));

  // Count unique platforms
  const platforms = new Set(creatives.map((c: any) => c.platform));

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Biblioteca de Criativos</h1>
          <p className="text-sm text-muted-foreground mt-1">{creatives.length} criativos · {platforms.size} plataformas</p>
        </div>
        <Dialog open={crOpen} onOpenChange={setCrOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2"><Plus className="h-4 w-4" /> Novo Criativo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Criativo</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome</Label><Input value={crNome} onChange={e => setCrNome(e.target.value)} placeholder="Ex: Banner Black Friday" /></div>
              <div>
                <Label>Tipo</Label>
                <Select value={crTipo} onValueChange={setCrTipo}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Imagem</SelectItem>
                    <SelectItem value="video">V\u00eddeo</SelectItem>
                    <SelectItem value="carousel">Carrossel</SelectItem>
                    <SelectItem value="text">Texto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Plataforma</Label>
                <Select value={crPlataforma} onValueChange={setCrPlataforma}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google_ads">Google Ads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Tags (separadas por v\u00edrgula)</Label><Input value={crTags} onChange={e => setCrTags(e.target.value)} placeholder="Ex: promo, verao, desconto" /></div>
              <Button className="w-full" onClick={handleCreateCreative}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {creatives.map((c: any, i: number) => {
          const Icon = typeIcon[c.type as keyof typeof typeIcon] || Image;
          return (
            <motion.div
              key={c.name + i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-card rounded-xl surface-glow hover:surface-glow-hover transition-shadow cursor-pointer overflow-hidden"
            >
              {/* Thumbnail placeholder */}
              <div className="h-40 bg-secondary/50 flex items-center justify-center">
                <Icon className="h-10 w-10 text-muted-foreground/30" />
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium truncate">{c.name}</h3>
                  {c.status === "winner" && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                      <Trophy className="h-3 w-3" /> Vencedor
                    </span>
                  )}
                  {c.fatigue && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                      <TrendingDown className="h-3 w-3" /> Fadiga
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{c.platform}</span>
                  <span className="capitalize">{c.type}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">CTR</p>
                    <p className="font-mono tabular-nums text-sm font-medium">{c.ctr}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Conv.</p>
                    <p className="font-mono tabular-nums text-sm font-medium">{c.conversions}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CreativesPage;
