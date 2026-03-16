import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import {
  Users, Sparkles, Target, TrendingUp, Loader2, ExternalLink,
  Tag, MapPin, DollarSign, Globe, ChevronDown, ChevronUp, Zap
} from "lucide-react";

interface AudienceDemographics {
  age_range: string;
  gender: string;
  household_income: string;
  parental_status: string;
}

interface GoogleAdsConfig {
  campaign_type: string;
  bid_strategy: string;
  targeting_expansion: boolean;
}

interface Audience {
  name: string;
  type: string;
  description: string;
  interests: string[];
  keywords: string[];
  demographics: AudienceDemographics;
  estimated_size: string;
  rationale: string;
  google_ads_config: GoogleAdsConfig;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  affinity: { label: "Afinidade", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  in_market: { label: "No Mercado", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  custom_intent: { label: "Intenção Personalizada", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  custom_affinity: { label: "Afinidade Personalizada", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  remarketing: { label: "Remarketing", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  combined: { label: "Combinado", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  similar: { label: "Semelhante", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

const sizeLabels: Record<string, string> = {
  small: "Pequeno (10K-100K)",
  medium: "Médio (100K-500K)",
  large: "Grande (500K-1M)",
  very_large: "Muito Grande (1M+)",
};

export default function AudiencesPage() {
  const [niche, setNiche] = useState("");
  const [objective, setObjective] = useState("leads");
  const [location, setLocation] = useState("Brasil");
  const [ageRange, setAgeRange] = useState("18-65");
  const [gender, setGender] = useState("all");
  const [budget, setBudget] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [creatingAudience, setCreatingAudience] = useState<number | null>(null);

  const toggleExpanded = (index: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!niche.trim()) {
      toast.error("Preencha o nicho/produto para gerar públicos-alvo.");
      return;
    }

    setLoading(true);
    setAudiences([]);
    setExpandedCards(new Set());

    try {
      const { data, error } = await supabase.functions.invoke("generate-audiences", {
        body: {
          niche,
          objective,
          location,
          ageRange,
          gender: gender === "all" ? "Todos" : gender === "male" ? "Masculino" : "Feminino",
          budget,
          websiteUrl,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAudiences(data.audiences || []);
      toast.success(`${(data.audiences || []).length} públicos-alvo gerados com sucesso!`);
    } catch (e: any) {
      console.error("Error generating audiences:", e);
      toast.error(e.message || "Erro ao gerar públicos-alvo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInGoogleAds = async (audience: Audience, index: number) => {
    setCreatingAudience(index);
    try {
      const { data, error } = await supabase.functions.invoke("create-google-audience", {
        body: { audience },
      });

      if (error) throw error;
      if (data?.missing_credentials) {
        toast.error("Credenciais do Google Ads não configuradas. Configure nas settings do projeto.");
        return;
      }
      if (data?.error) throw new Error(data.error);

      toast.success(data.message || `Audiência "${audience.name}" criada no Google Ads!`);
    } catch (e: any) {
      console.error("Error creating audience:", e);
      toast.error(e.message || "Erro ao criar audiência no Google Ads.");
    } finally {
      setCreatingAudience(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Gerador de Públicos-Alvo
        </h1>
        <p className="text-muted-foreground mt-1">
          Use IA para gerar públicos-alvo otimizados e crie diretamente no Google Ads
        </p>
      </div>

      {/* Form */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Configuração
          </CardTitle>
          <CardDescription>Descreva seu produto e objetivo para a IA gerar públicos-alvo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="niche">Nicho / Produto *</Label>
              <Textarea
                id="niche"
                placeholder="Ex: Curso online de marketing digital para empreendedores que querem escalar seus negócios..."
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective">Objetivo</Label>
              <Select value={objective} onValueChange={setObjective}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leads">Geração de Leads</SelectItem>
                  <SelectItem value="sales">Vendas Diretas</SelectItem>
                  <SelectItem value="traffic">Tráfego</SelectItem>
                  <SelectItem value="awareness">Reconhecimento de Marca</SelectItem>
                  <SelectItem value="app_installs">Instalação de App</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="h-3.5 w-3.5 inline mr-1" />
                Localização
              </Label>
              <Input
                id="location"
                placeholder="Brasil, São Paulo, etc."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageRange">Faixa Etária</Label>
              <Select value={ageRange} onValueChange={setAgeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="18-24">18-24 anos</SelectItem>
                  <SelectItem value="25-34">25-34 anos</SelectItem>
                  <SelectItem value="35-44">35-44 anos</SelectItem>
                  <SelectItem value="45-54">45-54 anos</SelectItem>
                  <SelectItem value="55-64">55-64 anos</SelectItem>
                  <SelectItem value="65+">65+ anos</SelectItem>
                  <SelectItem value="18-65">Todas (18-65+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gênero</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">
                <DollarSign className="h-3.5 w-3.5 inline mr-1" />
                Orçamento Estimado
              </Label>
              <Input
                id="budget"
                placeholder="R$ 5.000/mês"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">
                <Globe className="h-3.5 w-3.5 inline mr-1" />
                URL do Site
              </Label>
              <Input
                id="websiteUrl"
                placeholder="https://seusite.com.br"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full md:w-auto" size="lg">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando públicos...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Gerar Públicos com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {audiences.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {audiences.length} Públicos-Alvo Sugeridos
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {audiences.map((audience, index) => {
              const typeInfo = typeLabels[audience.type] || { label: audience.type, color: "bg-muted text-muted-foreground" };
              const isExpanded = expandedCards.has(index);

              return (
                <Card key={index} className="border-border bg-card hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1.5">
                        <CardTitle className="text-base">{audience.name}</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                          <Badge variant="outline" className="text-muted-foreground">
                            {sizeLabels[audience.estimated_size] || audience.estimated_size}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => toggleExpanded(index)}>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{audience.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Keywords */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                        <Tag className="h-3 w-3" /> Keywords
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {audience.keywords.slice(0, isExpanded ? undefined : 5).map((kw, i) => (
                          <Badge key={i} variant="secondary" className="text-xs font-normal">
                            {kw}
                          </Badge>
                        ))}
                        {!isExpanded && audience.keywords.length > 5 && (
                          <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                            +{audience.keywords.length - 5}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Interests */}
                    {audience.interests.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Interesses</p>
                        <div className="flex flex-wrap gap-1.5">
                          {audience.interests.slice(0, isExpanded ? undefined : 4).map((int, i) => (
                            <Badge key={i} variant="outline" className="text-xs font-normal">
                              {int}
                            </Badge>
                          ))}
                          {!isExpanded && audience.interests.length > 4 && (
                            <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                              +{audience.interests.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {isExpanded && (
                      <>
                        {/* Demographics */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">Demografia</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-muted/50 rounded px-2 py-1.5">
                              <span className="text-muted-foreground">Idade:</span>{" "}
                              <span className="text-foreground">{audience.demographics.age_range}</span>
                            </div>
                            <div className="bg-muted/50 rounded px-2 py-1.5">
                              <span className="text-muted-foreground">Gênero:</span>{" "}
                              <span className="text-foreground">{audience.demographics.gender}</span>
                            </div>
                            {audience.demographics.household_income && (
                              <div className="bg-muted/50 rounded px-2 py-1.5">
                                <span className="text-muted-foreground">Renda:</span>{" "}
                                <span className="text-foreground">{audience.demographics.household_income}</span>
                              </div>
                            )}
                            {audience.demographics.parental_status && (
                              <div className="bg-muted/50 rounded px-2 py-1.5">
                                <span className="text-muted-foreground">Pais:</span>{" "}
                                <span className="text-foreground">{audience.demographics.parental_status}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Google Ads Config */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                            <Zap className="h-3 w-3" /> Config Google Ads
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-muted/50 rounded px-2 py-1.5">
                              <span className="text-muted-foreground">Campanha:</span>{" "}
                              <span className="text-foreground capitalize">{audience.google_ads_config.campaign_type}</span>
                            </div>
                            <div className="bg-muted/50 rounded px-2 py-1.5">
                              <span className="text-muted-foreground">Bid:</span>{" "}
                              <span className="text-foreground">{audience.google_ads_config.bid_strategy}</span>
                            </div>
                          </div>
                        </div>

                        {/* Rationale */}
                        <div className="bg-primary/5 border border-primary/10 rounded-md p-3">
                          <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> Justificativa Estratégica
                          </p>
                          <p className="text-xs text-muted-foreground">{audience.rationale}</p>
                        </div>
                      </>
                    )}

                    {/* Create Button */}
                    <Button
                      variant="outline"
                      className="w-full border-primary/30 hover:bg-primary/10 hover:text-primary"
                      onClick={() => handleCreateInGoogleAds(audience, index)}
                      disabled={creatingAudience === index}
                    >
                      {creatingAudience === index ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Criando no Google Ads...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          Criar no Google Ads
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && audiences.length === 0 && (
        <Card className="border-dashed border-border bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">Nenhum público gerado ainda</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Preencha o formulário acima com informações sobre seu nicho e objetivo, e a IA irá sugerir os melhores públicos-alvo para suas campanhas no Google Ads.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
