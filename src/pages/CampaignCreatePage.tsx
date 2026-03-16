import { motion } from "framer-motion";
import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { generateCreatives } from "@/services/edge-functions";
import { useCreateCampaign, useAdAccounts } from "@/hooks/use-supabase-data";

const steps = [
  "Objetivo",
  "Orçamento",
  "Plataforma",
  "IA Gera Campanha",
  "Revisão",
];

// Fallback generated data (replaced by AI when edge function responds)
const fallbackAdGroups = [
  { name: "Brand - Exato", keywords: 12, ads: 2 },
  { name: "Produto - Frase", keywords: 18, ads: 2 },
  { name: "Long Tail - Ampla", keywords: 22, ads: 2 },
];

const fallbackKeywords = [
  "software gestão empresarial",
  "sistema erp online",
  "crm para empresas",
  "gestão financeira online",
  "automação comercial",
  "software nota fiscal eletrônica",
  "sistema controle estoque",
  "erp pequenas empresas",
  "plataforma gestão negócios",
  "software administrativo empresa",
];

const fallbackAds = [
  { headline: "Software de Gestão #1 do Brasil", description: "Experimente grátis por 14 dias. Automatize processos e aumente suas vendas. Sem cartão." },
  { headline: "Gestão Empresarial Completa", description: "CRM + ERP + Financeiro em uma única plataforma. Mais de 10.000 empresas confiam." },
  { headline: "Reduza Custos Operacionais em 40%", description: "Automatize tarefas manuais. Demonstração personalizada gratuita para sua empresa." },
  { headline: "Melhor Custo-Benefício do Mercado", description: "Planos a partir de R$ 99/mês. Suporte 24h incluso. Migração gratuita." },
];

const CampaignCreatePage = () => {
  const { currentOrg } = useAuth();
  const orgId = currentOrg?.id;
  const navigate = useNavigate();
  const createCampaign = useCreateCampaign();
  const { data: adAccountsData } = useAdAccounts();
  const adAccounts = adAccountsData || [];

  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // AI-generated content state (populated by edge function or fallback)
  const [generatedAdGroups, setGeneratedAdGroups] = useState(fallbackAdGroups);
  const [generatedKeywords, setGeneratedKeywords] = useState(fallbackKeywords);
  const [generatedAds, setGeneratedAds] = useState(fallbackAds);

  const [formData, setFormData] = useState({
    nicho: "",
    objetivo: "Leads",
    publicoAlvo: "",
    localizacao: "",
    orcamentoDiario: "",
    periodoInicio: "",
    periodoFim: "",
    plataforma: "Google Ads",
    contaAnuncio: "",
  });

  const handleNext = async () => {
    if (currentStep === 3 && !generated) {
      setIsGenerating(true);
      setGenerateError(null);
      try {
        if (orgId) {
          const result = await generateCreatives({
            organizationId: orgId,
            platform: formData.plataforma,
            type: formData.objetivo,
            prompt: `Nicho: ${formData.nicho}. Público: ${formData.publicoAlvo}. Localização: ${formData.localizacao}.`,
          });
          // Use AI-generated data if available
          if (result?.adGroups) setGeneratedAdGroups(result.adGroups);
          if (result?.keywords) setGeneratedKeywords(result.keywords);
          if (result?.ads) setGeneratedAds(result.ads);
        }
      } catch (err: any) {
        console.error("Error generating creatives:", err);
        setGenerateError("Erro ao gerar com IA. Usando sugestões padrão.");
        // Keep fallback data
        setGeneratedAdGroups(fallbackAdGroups);
        setGeneratedKeywords(fallbackKeywords);
        setGeneratedAds(fallbackAds);
      } finally {
        setIsGenerating(false);
        setGenerated(true);
      }
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePublish = async () => {
    if (!orgId) return;
    setIsPublishing(true);
    try {
      // Find the selected ad account
      const selectedAccount = adAccounts.find((a: any) => a.name === formData.contaAnuncio || a.id === formData.contaAnuncio);
      const adAccountId = selectedAccount?.id || adAccounts[0]?.id || "";

      await createCampaign.mutateAsync({
        ad_account_id: adAccountId,
        platform: formData.plataforma === "Google Ads" ? "google" : formData.plataforma.toLowerCase().replace(" ", "_"),
        external_id: `new-${Date.now()}`,
        name: `${formData.nicho || "Nova Campanha"} - ${formData.objetivo}`,
        objective: formData.objetivo.toLowerCase(),
        status: "draft",
        daily_budget: formData.orcamentoDiario ? parseFloat(formData.orcamentoDiario) : undefined,
        start_date: formData.periodoInicio || undefined,
        end_date: formData.periodoFim || undefined,
      });
      navigate("/campaigns");
    } catch (err) {
      console.error("Error creating campaign:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <Link to="/campaigns" className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Criar Nova Campanha</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1 ml-7">Assistente de criação com IA</p>
      </motion.div>

      {/* Stepper */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-center gap-2"
      >
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-colors ${
                  i < currentStep
                    ? "bg-success text-white"
                    : i === currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {i < currentStep ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block truncate ${i === currentStep ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 min-w-4 ${i < currentStep ? "bg-success" : "bg-border"}`} />
            )}
          </div>
        ))}
      </motion.div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card rounded-xl surface-glow p-6 space-y-5"
      >
        {/* Step 1: Objetivo */}
        {currentStep === 0 && (
          <>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Passo 1 — Objetivo da Campanha</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nicho / Segmento</label>
                <Input
                  placeholder="Ex: SaaS de gestão empresarial"
                  value={formData.nicho}
                  onChange={(e) => setFormData({ ...formData, nicho: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Objetivo</label>
                <select
                  value={formData.objetivo}
                  onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="Leads">Leads</option>
                  <option value="Vendas">Vendas</option>
                  <option value="Tráfego">Tráfego</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Público-alvo</label>
                <textarea
                  placeholder="Descreva o perfil do seu público-alvo ideal..."
                  value={formData.publicoAlvo}
                  onChange={(e) => setFormData({ ...formData, publicoAlvo: e.target.value })}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Localização</label>
                <Input
                  placeholder="Ex: Brasil, São Paulo - SP"
                  value={formData.localizacao}
                  onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                />
              </div>
            </div>
          </>
        )}

        {/* Step 2: Orçamento */}
        {currentStep === 1 && (
          <>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Passo 2 — Orçamento e Período</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Orçamento Diário (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                  <Input
                    type="number"
                    placeholder="150,00"
                    className="pl-10"
                    value={formData.orcamentoDiario}
                    onChange={(e) => setFormData({ ...formData, orcamentoDiario: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Data de Início</label>
                  <Input
                    type="date"
                    value={formData.periodoInicio}
                    onChange={(e) => setFormData({ ...formData, periodoInicio: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Data de Término</label>
                  <Input
                    type="date"
                    value={formData.periodoFim}
                    onChange={(e) => setFormData({ ...formData, periodoFim: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Plataforma */}
        {currentStep === 2 && (
          <>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Passo 3 — Plataforma e Conta</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Plataforma</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["Google Ads", "Meta Ads", "TikTok Ads", "YouTube Ads"].map((p) => (
                    <button
                      key={p}
                      disabled={p !== "Google Ads"}
                      className={`p-4 rounded-lg border text-sm font-medium text-center transition-colors ${
                        p === "Google Ads"
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-secondary/50 text-muted-foreground opacity-50 cursor-not-allowed"
                      }`}
                    >
                      {p}
                      {p !== "Google Ads" && (
                        <span className="block text-[10px] mt-1 text-muted-foreground">Em breve</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Conta de Anúncio</label>
                <select
                  value={formData.contaAnuncio}
                  onChange={(e) => setFormData({ ...formData, contaAnuncio: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {adAccounts.length > 0 ? (
                    adAccounts.map((acc: any) => (
                      <option key={acc.id} value={acc.id}>{acc.name || acc.account_name || acc.id}</option>
                    ))
                  ) : (
                    <>
                      <option>Conta Principal - Google</option>
                      <option>Conta Secundária - Google</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Step 4: IA Gera Campanha */}
        {currentStep === 3 && (
          <>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Passo 4 — Geração com IA</p>

            {isGenerating && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">IA gerando estrutura da campanha...</p>
                <p className="text-xs text-muted-foreground">Criando grupos, keywords e anúncios</p>
              </div>
            )}

            {!isGenerating && !generated && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Sparkles className="h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground text-center">
                  Clique em "Gerar com IA" para a inteligência artificial criar<br />
                  a estrutura completa da sua campanha.
                </p>
              </div>
            )}

            {!isGenerating && generated && (
              <div className="space-y-6">
                {generateError && (
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                    <p className="text-xs text-warning">{generateError}</p>
                  </div>
                )}

                {/* Generated Ad Groups */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                    {generatedAdGroups.length} Grupos de Anúncios Gerados
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {generatedAdGroups.map((ag) => (
                      <div key={ag.name} className="p-3 rounded-lg border border-border bg-secondary/30">
                        <p className="text-sm font-medium">{ag.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{ag.keywords} keywords · {ag.ads} anúncios</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generated Keywords */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                    {generatedKeywords.length} Keywords Sugeridas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {generatedKeywords.map((kw) => (
                      <Badge key={kw} variant="outline" className="text-xs px-3 py-1">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Generated Ads */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                    {generatedAds.length} Variações de Anúncio
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {generatedAds.map((ad, i) => (
                      <div key={i} className="p-3 rounded-lg border border-border bg-secondary/30 space-y-1">
                        <p className="text-sm font-semibold text-primary">{ad.headline}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{ad.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Todos os itens acima são editáveis. Ajuste conforme necessário antes de publicar.
                </p>
              </div>
            )}
          </>
        )}

        {/* Step 5: Revisão */}
        {currentStep === 4 && (
          <>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Passo 5 — Revisão Final</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border border-border bg-secondary/30">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Nicho</p>
                  <p className="text-sm font-medium mt-1">{formData.nicho || "SaaS de gestão empresarial"}</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-secondary/30">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Objetivo</p>
                  <p className="text-sm font-medium mt-1">{formData.objetivo}</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-secondary/30">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Orçamento Diário</p>
                  <p className="text-sm font-medium mt-1">R$ {formData.orcamentoDiario || "150,00"}/dia</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-secondary/30">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Plataforma</p>
                  <p className="text-sm font-medium mt-1">{formData.plataforma}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-secondary/30">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Estrutura Gerada pela IA</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="font-mono tabular-nums">{generatedAdGroups.length} Ad Groups</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="font-mono tabular-nums">{generatedKeywords.length} Keywords</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="font-mono tabular-nums">{generatedAds.length} Anúncios</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-secondary/30">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Localização</p>
                <p className="text-sm font-medium mt-1">{formData.localizacao || "Brasil"}</p>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex items-center justify-between"
      >
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" /> Anterior
        </Button>

        {currentStep === 4 ? (
          <Button
            className="gap-2 bg-success hover:bg-success/90"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Publicando...</>
            ) : (
              <><Check className="h-4 w-4" /> Publicar Campanha</>
            )}
          </Button>
        ) : currentStep === 3 && !generated ? (
          <Button onClick={handleNext} className="gap-2" disabled={isGenerating}>
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Gerando...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Gerar com IA</>
            )}
          </Button>
        ) : (
          <Button onClick={handleNext} className="gap-2">
            Próximo <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </motion.div>
    </div>
  );
};

export default CampaignCreatePage;
