

## Diagnóstico

O arquivo `src/integrations/supabase/client.ts` lê `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` via `import.meta.env`. No preview funciona porque o `.env` é injetado automaticamente, mas no build publicado as variáveis não estão sendo incluídas.

## Solução

Adicionar valores de fallback diretamente no `vite.config.ts` usando a opção `define`, garantindo que as variáveis estejam disponíveis em qualquer ambiente de build:

**Arquivo: `vite.config.ts`**
- Adicionar `define` com fallbacks para `VITE_SUPABASE_URL` (= `https://ndtfmhuuzyzgmpizplhd.supabase.co`) e `VITE_SUPABASE_PUBLISHABLE_KEY` (= a anon key do projeto)
- Usar `process.env.VITE_SUPABASE_URL || "fallback"` para que variáveis de ambiente reais tenham prioridade

Após a alteração, basta republicar o app.

