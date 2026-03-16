import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useChatMessages } from "@/hooks/use-supabase-data";
import { sendAIChatMessage } from "@/services/edge-functions";
import { useQueryClient } from "@tanstack/react-query";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const fallbackMessages: Message[] = [
  {
    role: "user",
    content: "Por que meu CPA subiu nos últimos 3 dias?",
  },
  {
    role: "assistant",
    content:
      "Analisei os dados das últimas 72h e identifiquei **3 fatores** principais:\n\n1. A keyword **'erp barato'** teve um aumento de **42% no CPC** devido a novos concorrentes no leilão — ela sozinha elevou o CPA geral em **R$ 3,20**.\n\n2. O grupo de anúncios **'Concorrentes'** está com taxa de conversão de apenas **3,7%** (era 6,2% na semana anterior), possivelmente por fadiga criativa.\n\n3. O volume de buscas para termos genéricos aumentou **18%**, trazendo tráfego de menor intenção.\n\n**Recomendação:** Pausar a keyword 'erp barato' e revisar os criativos do grupo 'Concorrentes'. Impacto estimado: redução de **R$ 8,50 no CPA médio**.",
  },
  {
    role: "user",
    content: "Qual anúncio está vendendo mais neste mês?",
  },
  {
    role: "assistant",
    content:
      'O anúncio com melhor desempenho em março é o **"Software de Gestão #1 do Brasil"** do grupo Brand - Exato:\n\n- **45 conversões** no Google (CTR de **8,2%**)\n- **38 vendas reais** confirmadas no CRM\n- CPA de **R$ 11,73** — **27% abaixo** da média da campanha\n- ROAS real de **4,12x**\n\nEm segundo lugar está o **"Melhor Custo-Benefício"** com **38 conversões** e CTR de **7,1%**.\n\nO anúncio **"Reduza Custos em 40%"** está com desempenho em queda — CTR caiu de 7,3% para **5,9%** nas últimas 2 semanas. Sugiro criar uma variação nova.',
  },
];

const quickActions = [
  "Por que meu CPA subiu?",
  "Onde está o gargalo?",
  "Qual anúncio vende mais?",
  "Resumo da semana",
];

function formatMessage(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-foreground font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function generateUUID() {
  return crypto.randomUUID();
}

const InsightsChatPage = () => {
  const { currentOrg } = useAuth();
  const orgId = currentOrg?.id;
  const queryClient = useQueryClient();

  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatData, isLoading: isLoadingMessages } = useChatMessages(conversationId);

  // Map Supabase messages to our Message interface
  const realMessages: Message[] = (chatData || []).map((msg: any) => ({
    role: msg.role === "user" ? "user" as const : "assistant" as const,
    content: msg.content,
  }));

  // Use real messages if we have a conversation, otherwise fallback
  const displayMessages: Message[] = conversationId
    ? [...realMessages, ...optimisticMessages]
    : fallbackMessages;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages.length]);

  // When real messages arrive that include the AI reply, clear optimistic messages
  useEffect(() => {
    if (optimisticMessages.length > 0 && realMessages.length > 0) {
      const lastReal = realMessages[realMessages.length - 1];
      if (lastReal.role === "assistant") {
        setOptimisticMessages([]);
        setIsSending(false);
      }
    }
  }, [realMessages, optimisticMessages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    if (!orgId) return;

    const userMessage = input.trim();
    setInput("");
    setIsSending(true);

    // Ensure we have a conversationId
    let convId = conversationId;
    if (!convId) {
      convId = generateUUID();
      setConversationId(convId);
    }

    // Optimistically show user message + loading indicator
    setOptimisticMessages([{ role: "user", content: userMessage }]);

    try {
      await sendAIChatMessage(orgId, userMessage, convId);
      // Invalidate queries to pick up the new messages (both user + assistant)
      queryClient.invalidateQueries({ queryKey: ["chat-messages", orgId, convId] });
    } catch (err) {
      console.error("Error sending chat message:", err);
      // Show error as assistant message
      setOptimisticMessages([
        { role: "user", content: userMessage },
        { role: "assistant", content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente." },
      ]);
      setIsSending(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">Assistente IA</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Converse com a IA sobre seus dados de campanhas
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {quickActions.map((action) => (
          <button
            key={action}
            onClick={() => handleQuickAction(action)}
            className="px-3 py-1.5 text-xs font-medium bg-card border border-border rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            {action}
          </button>
        ))}
      </motion.div>

      {/* Messages */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-card rounded-xl surface-glow overflow-hidden"
      >
        <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
          {isLoadingMessages && conversationId ? (
            <div className="h-32 bg-muted animate-pulse rounded-xl" />
          ) : (
            displayMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex gap-3"
              >
                <div className="shrink-0 mt-0.5">
                  {msg.role === "user" ? (
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-success/20 flex items-center justify-center">
                      <Bot className="h-3.5 w-3.5 text-success" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge
                      variant={msg.role === "user" ? "outline" : "secondary"}
                      className="text-[10px] px-2 py-0"
                    >
                      {msg.role === "user" ? "Você" : "IA Growth"}
                    </Badge>
                  </div>
                  <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {formatMessage(msg.content)}
                  </div>
                </div>
              </motion.div>
            ))
          )}

          {/* Loading indicator while AI responds */}
          {isSending && optimisticMessages.length > 0 && optimisticMessages[optimisticMessages.length - 1].role === "user" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex gap-3"
            >
              <div className="shrink-0 mt-0.5">
                <div className="w-7 h-7 rounded-full bg-success/20 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-success" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="secondary" className="text-[10px] px-2 py-0">
                    IA Growth
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analisando seus dados...
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Pergunte sobre seus dados..."
              disabled={isSending}
              className="flex-1 h-10 px-4 text-sm bg-secondary border-none rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            <Button onClick={handleSend} size="icon" className="shrink-0" disabled={isSending || !input.trim()}>
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InsightsChatPage;
