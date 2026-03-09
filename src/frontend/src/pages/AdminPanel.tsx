import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { CheckCircle, Star, Users, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ProfessionalStatus } from "../backend";
import { StatusBadge } from "../components/StatusBadge";
import {
  useAllProfessionals,
  useUpdateProfessionalStatus,
} from "../hooks/useQueries";
import { SERVICE_CATEGORIES } from "../lib/constants";

export default function AdminPanel() {
  const { data: professionals = [], isLoading } = useAllProfessionals();
  const updateStatus = useUpdateProfessionalStatus();

  const handleApprove = async (principal: Principal) => {
    try {
      await updateStatus.mutateAsync({
        professional: principal,
        status: ProfessionalStatus.approved,
      });
      toast.success("Professional approved");
    } catch {
      toast.error("Failed to approve professional");
    }
  };

  const handleSuspend = async (principal: Principal) => {
    try {
      await updateStatus.mutateAsync({
        professional: principal,
        status: ProfessionalStatus.suspended,
      });
      toast.success("Professional suspended");
    } catch {
      toast.error("Failed to suspend professional");
    }
  };

  const pending = professionals.filter(
    (p) => p.status === ProfessionalStatus.pending,
  );
  const approved = professionals.filter(
    (p) => p.status === ProfessionalStatus.approved,
  );
  const suspended = professionals.filter(
    (p) => p.status === ProfessionalStatus.suspended,
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold font-display mb-1">Admin Panel</h1>
        <p className="text-muted-foreground text-sm">
          Manage professional verifications
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {
            label: "Pending",
            count: pending.length,
            icon: <Users className="w-4 h-4" />,
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Approved",
            count: approved.length,
            icon: <CheckCircle className="w-4 h-4" />,
            color: "text-green-600 bg-green-50",
          },
          {
            label: "Suspended",
            count: suspended.length,
            icon: <XCircle className="w-4 h-4" />,
            color: "text-red-600 bg-red-50",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border border-border">
            <CardContent className="p-3">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}
              >
                {stat.icon}
              </div>
              <div className="text-xl font-bold font-display">{stat.count}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div data-ocid="admin.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : professionals.length === 0 ? (
        <div data-ocid="admin.empty_state" className="text-center py-12">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-muted-foreground text-sm">
            No professionals registered yet.
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">
              All Professionals ({professionals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {professionals.map((prof, i) => {
                const svcInfo = SERVICE_CATEGORIES.find(
                  (c) => c.id === prof.category,
                );
                const principal = (prof as { principal?: Principal }).principal;

                return (
                  <motion.div
                    key={prof.name + prof.phone}
                    data-ocid={`admin.professional.item.${i + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 flex items-center gap-3"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${svcInfo?.iconBg}`}
                    >
                      {svcInfo?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm font-display">
                          {prof.name}
                        </span>
                        <StatusBadge status={prof.status} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {svcInfo?.label} • Radius: {Number(prof.workingRadius)}
                        km
                        {prof.aggregateRating != null && (
                          <span className="ml-2">
                            <Star className="w-3 h-3 inline text-amber-400" />{" "}
                            {prof.aggregateRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      {prof.subSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {prof.subSkills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="text-xs bg-muted rounded px-1.5 py-0.5"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {prof.status !== ProfessionalStatus.approved &&
                        principal && (
                          <Button
                            size="sm"
                            data-ocid={`admin.approve_button.${i + 1}`}
                            onClick={() => handleApprove(principal)}
                            disabled={updateStatus.isPending}
                            className="text-xs h-7 bg-green-600 hover:bg-green-700 text-white px-2"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                        )}
                      {prof.status !== ProfessionalStatus.suspended &&
                        principal && (
                          <Button
                            size="sm"
                            data-ocid={`admin.suspend_button.${i + 1}`}
                            variant="outline"
                            onClick={() => handleSuspend(principal)}
                            disabled={updateStatus.isPending}
                            className="text-xs h-7 text-destructive border-destructive/30 hover:bg-destructive/10 px-2"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Suspend
                          </Button>
                        )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
