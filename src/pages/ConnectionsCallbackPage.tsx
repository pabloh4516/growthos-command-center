import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { exchangeGoogleAdsCode } from "@/services/edge-functions";
import { useAuth } from "@/contexts/AuthContext";

const ConnectionsCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentOrg } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setStatus("error");
      setErrorMessage(searchParams.get("error_description") || "Autorizacao negada pelo usuario.");
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMessage("Codigo de autorizacao nao encontrado na URL.");
      return;
    }

    const orgId = currentOrg?.id ?? localStorage.getItem("growthOS_current_org");
    if (!orgId) {
      setStatus("error");
      setErrorMessage("Nenhuma organizacao selecionada. Faca login novamente.");
      return;
    }

    const redirectUri = window.location.origin + "/connections/callback";

    exchangeGoogleAdsCode(orgId, code, redirectUri)
      .then(() => {
        setStatus("success");
        setTimeout(() => {
          navigate("/integrations", { replace: true });
        }, 2000);
      })
      .catch((err) => {
        console.error("OAuth callback error:", err);
        setStatus("error");
        setErrorMessage(err?.message || "Erro ao processar autorizacao. Tente novamente.");
      });
  }, [searchParams, currentOrg, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl surface-glow p-8 max-w-md w-full mx-4 text-center space-y-4"
      >
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <h2 className="text-lg font-semibold">Conectando conta...</h2>
            <p className="text-sm text-muted-foreground">Processando autorizacao do Google Ads. Aguarde um momento.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
            <h2 className="text-lg font-semibold">Conta conectada!</h2>
            <p className="text-sm text-muted-foreground">Sua conta Google Ads foi conectada com sucesso. Redirecionando para integracoes...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-lg font-semibold">Erro na conexao</h2>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            <button
              onClick={() => navigate("/integrations", { replace: true })}
              className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Voltar para Integracoes
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ConnectionsCallbackPage;
