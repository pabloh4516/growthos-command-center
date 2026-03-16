

## Gerador de Públicos-Alvo com IA + Criação no Google Ads

### O que será construído

Uma nova página "Públicos-Alvo" com duas funcionalidades integradas:

1. **Gerador de Audiências com IA** — formulário onde você descreve seu produto/nicho e a IA gera públicos-alvo detalhados (interesses, demografia, keywords, afinidades) formatados para Google Ads
2. **Criação direta no Google Ads** — botão "Criar no Google Ads" que envia a audiência gerada para sua conta via API

### Pré-requisitos

- **Lovable Cloud** precisa ser habilitado (para edge functions)
- **Google Ads API** requer uma conta de desenvolvedor Google Ads com token aprovado + OAuth configurado. Como o Lovable não tem um conector nativo para Google Ads, será necessário configurar as credenciais manualmente (Client ID, Client Secret, Developer Token, Refresh Token)

### Implementação

**1. Nova página: `src/pages/AudiencesPage.tsx`**
- Formulário com campos: nicho/produto, objetivo (leads/vendas/tráfego), localização, faixa etária, gênero, orçamento estimado, URL do site
- Botão "Gerar Públicos com IA"
- Cards de resultado mostrando cada audiência sugerida com: nome, tipo (afinidade/intenção/custom/remarketing), targeting detalhado, tamanho estimado, justificativa da IA
- Botão "Criar no Google Ads" em cada card

**2. Edge Function: `supabase/functions/generate-audiences/index.ts`**
- Recebe os parâmetros do formulário
- Chama Lovable AI (Gemini) com prompt especializado em Google Ads audience targeting
- Retorna 4-6 sugestões de públicos estruturados via tool calling (JSON tipado)
- Cada sugestão inclui: nome, tipo de audiência, critérios de segmentação, keywords sugeridas, interesses, dados demográficos

**3. Edge Function: `supabase/functions/create-google-audience/index.ts`**
- Recebe a audiência aprovada pelo usuário
- Usa Google Ads API (v18) para criar a audiência na conta
- Endpoints: Customer Match, Custom Audiences, ou Combined Audiences dependendo do tipo
- Retorna confirmação com ID da audiência criada

**4. Rota e navegação**
- Adicionar rota `/audiences` no `App.tsx`
- Adicionar item "Públicos-Alvo" no sidebar com ícone `Users`

### Fluxo do Usuário

```text
Formulário (nicho, objetivo, etc.)
        ↓
  IA gera 4-6 públicos
        ↓
  Cards com detalhes de cada público
        ↓
  Selecionar → "Criar no Google Ads"
        ↓
  Confirmação com ID da audiência
```

### Etapas de implementação

1. Habilitar Lovable Cloud
2. Criar edge function de geração de audiências com Lovable AI
3. Criar a página `AudiencesPage` com formulário e exibição de resultados
4. Configurar secrets para Google Ads API (Developer Token, OAuth credentials)
5. Criar edge function de criação de audiência no Google Ads
6. Integrar botão de criação com feedback de sucesso/erro
7. Adicionar rota e link no sidebar

### Observação importante

A integração real com Google Ads API requer credenciais específicas (Developer Token com acesso aprovado pelo Google). Inicialmente posso implementar o gerador de audiências com IA funcionando 100%, e a parte de criação no Google Ads preparada para receber as credenciais quando você as tiver.

