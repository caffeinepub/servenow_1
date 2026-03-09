import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Variant_customer_professional } from "./backend";
import Header from "./components/Header";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useCallerUserProfile, useIsAdmin } from "./hooks/useQueries";
import AdminPanel from "./pages/AdminPanel";
import CustomerDashboard from "./pages/CustomerDashboard";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import ProfilePage from "./pages/ProfilePage";

type Page =
  | "landing"
  | "login"
  | "onboarding"
  | "customer"
  | "professional"
  | "admin"
  | "profile";

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const { data: isAdmin } = useIsAdmin();
  const [page, setPage] = useState<Page>("landing");

  const isLoggedIn = !!identity && !isInitializing;

  // Auto-route once we know the user's state
  useEffect(() => {
    if (isInitializing || profileLoading) return;

    if (!isLoggedIn) {
      // Only redirect to landing if on a protected page
      if (
        page === "customer" ||
        page === "professional" ||
        page === "admin" ||
        page === "onboarding"
      ) {
        setPage("landing");
      }
      return;
    }

    // Logged in but no profile → onboarding
    if (!profile && page !== "onboarding") {
      setPage("onboarding");
      return;
    }

    // Logged in with profile → route to dashboard
    if (profile && (page === "login" || page === "landing")) {
      if (profile.role === Variant_customer_professional.customer) {
        setPage("customer");
      } else if (profile.role === Variant_customer_professional.professional) {
        setPage("professional");
      } else {
        setPage("customer");
      }
    }
  }, [isLoggedIn, isInitializing, profile, profileLoading, page]);

  const handleNavigate = (targetPage: string) => {
    setPage(targetPage as Page);
  };

  const handleGetStarted = () => {
    if (isLoggedIn) {
      if (!profile) {
        setPage("onboarding");
      } else if (profile.role === Variant_customer_professional.customer) {
        setPage("customer");
      } else {
        setPage("professional");
      }
    } else {
      setPage("login");
    }
  };

  if (isInitializing || (isLoggedIn && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading ServeNow...</p>
        </div>
      </div>
    );
  }

  const showHeader = page !== "onboarding" && page !== "login";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showHeader && <Header currentPage={page} onNavigate={handleNavigate} />}

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {page === "landing" && (
              <LandingPage onGetStarted={handleGetStarted} />
            )}
            {page === "login" && <LoginPage />}
            {page === "onboarding" && (
              <OnboardingPage
                onComplete={() => {
                  if (
                    profile?.role === Variant_customer_professional.professional
                  ) {
                    setPage("professional");
                  } else {
                    setPage("customer");
                  }
                }}
              />
            )}
            {page === "customer" && isLoggedIn && (
              <CustomerDashboard userName={profile?.name} />
            )}
            {page === "professional" && isLoggedIn && <ProfessionalDashboard />}
            {page === "admin" && isLoggedIn && isAdmin && <AdminPanel />}
            {page === "profile" && isLoggedIn && <ProfilePage />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      {page === "landing" && (
        <footer className="py-6 px-4 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()}. Built with{" "}
            <span className="text-red-500">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      )}

      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
