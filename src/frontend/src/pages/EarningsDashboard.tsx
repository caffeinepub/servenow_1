import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useProfessionalEarnings } from "../hooks/useQueries";

function EarningsCard({
  label,
  amount,
  icon,
  ocid,
  color,
  delay,
}: {
  label: string;
  amount: bigint | undefined;
  icon: React.ReactNode;
  ocid: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card
        data-ocid={ocid}
        className={`border border-border ${color} hover:shadow-card transition-shadow`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-medium">
              {label}
            </span>
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              {icon}
            </div>
          </div>
          <div className="text-2xl font-bold font-display">
            {amount !== undefined ? (
              `₹${Number(amount).toLocaleString("en-IN")}`
            ) : (
              <Skeleton className="h-8 w-24" />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function EarningsDashboard() {
  const { data: earnings, isLoading } = useProfessionalEarnings();

  if (isLoading) {
    return (
      <div
        data-ocid="earnings.loading_state"
        className="grid grid-cols-2 gap-3"
      >
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <EarningsCard
          label="Today"
          amount={earnings?.dailyEarnings}
          icon={<DollarSign className="w-4 h-4" />}
          ocid="earnings.daily.card"
          color="bg-card"
          delay={0}
        />
        <EarningsCard
          label="This Week"
          amount={earnings?.weeklyEarnings}
          icon={<Calendar className="w-4 h-4" />}
          ocid="earnings.weekly.card"
          color="bg-card"
          delay={0.08}
        />
        <EarningsCard
          label="This Month"
          amount={earnings?.monthlyEarnings}
          icon={<BarChart3 className="w-4 h-4" />}
          ocid="earnings.monthly.card"
          color="bg-card"
          delay={0.16}
        />
        <EarningsCard
          label="All Time"
          amount={earnings?.totalEarnings}
          icon={<TrendingUp className="w-4 h-4" />}
          ocid="earnings.total.card"
          color="bg-accent/40"
          delay={0.24}
        />
      </div>

      {!earnings || Number(earnings.totalEarnings) === 0 ? (
        <div data-ocid="earnings.empty_state" className="text-center py-8">
          <div className="text-4xl mb-3">💰</div>
          <p className="text-muted-foreground text-sm">
            Complete your first job to start earning!
          </p>
        </div>
      ) : (
        <div className="bg-accent/30 rounded-xl p-4">
          <h4 className="font-semibold font-display text-sm mb-2">
            Payout Information
          </h4>
          <p className="text-xs text-muted-foreground">
            Earnings are settled weekly to your registered bank account. For
            payout issues, contact support.
          </p>
        </div>
      )}
    </div>
  );
}
