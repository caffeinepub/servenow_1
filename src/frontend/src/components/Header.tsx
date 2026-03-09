import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Shield,
  User,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { Variant_customer_professional } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerUserProfile, useIsAdmin } from "../hooks/useQueries";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const { identity, clear, isInitializing } = useInternetIdentity();
  const { data: profile } = useCallerUserProfile();
  const { data: isAdmin } = useIsAdmin();

  const isCustomer = profile?.role === Variant_customer_professional.customer;
  const isProfessional =
    profile?.role === Variant_customer_professional.professional;
  const isLoggedIn = !!identity && !isInitializing;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-2 font-bold text-lg font-display"
        >
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-foreground">
            Serve<span className="text-primary">Now</span>
          </span>
        </motion.button>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {isLoggedIn && isCustomer && (
            <Button
              variant={currentPage === "customer" ? "default" : "ghost"}
              size="sm"
              data-ocid="nav.customer_dashboard.link"
              onClick={() => onNavigate("customer")}
              className={
                currentPage === "customer"
                  ? "bg-primary text-primary-foreground"
                  : ""
              }
            >
              <LayoutDashboard className="w-4 h-4 mr-1.5" />
              Dashboard
            </Button>
          )}
          {isLoggedIn && isProfessional && (
            <Button
              variant={currentPage === "professional" ? "default" : "ghost"}
              size="sm"
              data-ocid="nav.professional_dashboard.link"
              onClick={() => onNavigate("professional")}
              className={
                currentPage === "professional"
                  ? "bg-primary text-primary-foreground"
                  : ""
              }
            >
              <LayoutDashboard className="w-4 h-4 mr-1.5" />
              Dashboard
            </Button>
          )}
          {isLoggedIn && isAdmin && (
            <Button
              variant={currentPage === "admin" ? "default" : "ghost"}
              size="sm"
              onClick={() => onNavigate("admin")}
              className={
                currentPage === "admin"
                  ? "bg-primary text-primary-foreground"
                  : ""
              }
            >
              <Shield className="w-4 h-4 mr-1.5" />
              Admin
            </Button>
          )}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 font-medium"
                >
                  <div className="w-5 h-5 bg-primary/15 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-primary" />
                  </div>
                  <span className="hidden sm:block max-w-24 truncate text-xs">
                    {profile?.name ?? "Account"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {isCustomer && (
                  <DropdownMenuItem
                    data-ocid="nav.customer_dashboard.link"
                    onClick={() => onNavigate("customer")}
                    className="sm:hidden"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                )}
                {isProfessional && (
                  <DropdownMenuItem
                    data-ocid="nav.professional_dashboard.link"
                    onClick={() => onNavigate("professional")}
                    className="sm:hidden"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem
                    onClick={() => onNavigate("admin")}
                    className="sm:hidden"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  data-ocid="nav.profile.link"
                  onClick={() => onNavigate("profile")}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clear} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="text-xs text-muted-foreground">Not signed in</span>
          )}
        </div>
      </div>
    </header>
  );
}
