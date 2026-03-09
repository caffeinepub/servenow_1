import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LoginPageProps {
  onLogin?: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { login, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();

  const handleLogin = () => {
    login();
    onLogin?.();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Zap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold font-display mb-2">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to access your ServeNow account
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Shield className="mr-2 w-4 h-4" />
                Sign in with Internet Identity
              </>
            )}
          </Button>

          {isLoginError && loginError && (
            <p className="text-sm text-destructive text-center">
              {loginError.message}
            </p>
          )}

          <div className="space-y-2 pt-2">
            {[
              "Secure, decentralized authentication",
              "No passwords required",
              "Privacy-first identity",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
