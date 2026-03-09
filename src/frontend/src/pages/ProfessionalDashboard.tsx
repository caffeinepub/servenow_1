import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Navigation,
  PlayCircle,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { AvailabilityStatus, BookingStatus } from "../backend";
import { StatusBadge } from "../components/StatusBadge";
import {
  useBookingsByProfessional,
  useProfessionalProfile,
  useUpdateAvailability,
  useUpdateBookingStatus,
} from "../hooks/useQueries";
import { SERVICE_CATEGORIES } from "../lib/constants";
import EarningsDashboard from "./EarningsDashboard";

interface JobCardProps {
  booking: import("../backend").Booking;
  index: number;
  showActions?: boolean;
  actionType?: "accept" | "status";
}

function JobCard({ booking, index, showActions, actionType }: JobCardProps) {
  const updateStatus = useUpdateBookingStatus();
  const svcCategory = SERVICE_CATEGORIES.find((c) => c.id === booking.category);
  const bookingDate = booking.date
    ? new Date(Number(booking.date) / 1_000_000)
    : null;

  const handleAccept = async () => {
    try {
      await updateStatus.mutateAsync({
        bookingId: booking.id,
        status: BookingStatus.accepted,
      });
      toast.success("Job accepted! Customer has been notified.");
    } catch {
      toast.error("Failed to accept job");
    }
  };

  const handleDecline = async () => {
    try {
      await updateStatus.mutateAsync({
        bookingId: booking.id,
        status: BookingStatus.cancelled,
      });
      toast.info("Job declined");
    } catch {
      toast.error("Failed to decline job");
    }
  };

  const getNextStatus = () => {
    if (booking.status === BookingStatus.accepted)
      return BookingStatus.onTheWay;
    if (booking.status === BookingStatus.onTheWay)
      return BookingStatus.inProgress;
    if (booking.status === BookingStatus.inProgress)
      return BookingStatus.completed;
    return null;
  };

  const getNextStatusLabel = () => {
    if (booking.status === BookingStatus.accepted) return "On the Way";
    if (booking.status === BookingStatus.onTheWay) return "Work Started";
    if (booking.status === BookingStatus.inProgress) return "Complete Job";
    return null;
  };

  const getNextStatusIcon = () => {
    if (booking.status === BookingStatus.accepted)
      return <Navigation className="w-3 h-3 mr-1" />;
    if (booking.status === BookingStatus.onTheWay)
      return <PlayCircle className="w-3 h-3 mr-1" />;
    if (booking.status === BookingStatus.inProgress)
      return <CheckCircle className="w-3 h-3 mr-1" />;
    return null;
  };

  const handleStatusUpdate = async () => {
    const next = getNextStatus();
    if (!next) return;
    try {
      await updateStatus.mutateAsync({ bookingId: booking.id, status: next });
      toast.success(`Status updated to: ${getNextStatusLabel()}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <Card
      data-ocid={`professional.request.item.${index}`}
      className="border border-border hover:shadow-card transition-shadow"
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${svcCategory?.iconBg}`}
          >
            {svcCategory?.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-semibold font-display text-sm">
                {svcCategory?.label} — {booking.subService}
              </h4>
              <StatusBadge status={booking.status} />
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {bookingDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {bookingDate.toLocaleDateString()}
                </span>
              )}
              {booking.timeSlot && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {booking.timeSlot}
                </span>
              )}
              {booking.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-36">{booking.address}</span>
                </span>
              )}
            </div>
            {booking.notes && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                📝 {booking.notes}
              </p>
            )}
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="font-semibold text-primary text-sm">
              ₹{Number(booking.amount).toLocaleString()}
            </div>
          </div>
        </div>

        {showActions && actionType === "accept" && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
            <Button
              size="sm"
              data-ocid={`professional.request.cancel_button.${index}`}
              variant="outline"
              onClick={handleDecline}
              disabled={updateStatus.isPending}
              className="flex-1 text-xs text-destructive border-destructive/30"
            >
              Decline
            </Button>
            <Button
              size="sm"
              data-ocid={`professional.request.accept_button.${index}`}
              onClick={handleAccept}
              disabled={updateStatus.isPending}
              className="flex-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Accept
            </Button>
          </div>
        )}

        {showActions && actionType === "status" && getNextStatus() && (
          <div className="mt-3 pt-3 border-t border-border">
            <Button
              size="sm"
              data-ocid={`professional.job.status.button.${index}`}
              onClick={handleStatusUpdate}
              disabled={updateStatus.isPending}
              className="w-full text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {getNextStatusIcon()}
              Mark as: {getNextStatusLabel()}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function JobList({
  status,
  showActions,
  actionType,
  emptyMessage,
}: {
  status: BookingStatus;
  showActions?: boolean;
  actionType?: "accept" | "status";
  emptyMessage: string;
}) {
  const { data: bookings = [], isLoading } = useBookingsByProfessional(status);

  if (isLoading) {
    return (
      <div data-ocid="professional.loading_state" className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div data-ocid="professional.empty_state" className="text-center py-12">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((b, i) => (
        <JobCard
          key={b.id.toString()}
          booking={b}
          index={i + 1}
          showActions={showActions}
          actionType={actionType}
        />
      ))}
    </div>
  );
}

export default function ProfessionalDashboard() {
  const { data: profile } = useProfessionalProfile();
  const updateAvailability = useUpdateAvailability();

  const isOnline = profile?.availability === AvailabilityStatus.online;

  const handleToggleAvailability = async (checked: boolean) => {
    const newStatus = checked
      ? AvailabilityStatus.online
      : AvailabilityStatus.offline;
    try {
      await updateAvailability.mutateAsync(newStatus);
      toast.success(
        checked
          ? "You're now online! Ready to accept jobs."
          : "You're now offline.",
      );
    } catch {
      toast.error("Failed to update availability");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display">
              {profile?.name ?? "Professional Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {
                SERVICE_CATEGORIES.find((c) => c.id === profile?.category)
                  ?.label
              }{" "}
              Professional
            </p>
          </div>
          {profile?.aggregateRating != null && (
            <div className="text-right">
              <div className="text-lg font-bold text-amber-500">
                ★ {profile.aggregateRating.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Availability Toggle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`rounded-xl p-4 mb-5 border-2 transition-all ${
          isOnline ? "border-green-300 bg-green-50" : "border-border bg-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div
              className={`font-semibold font-display ${isOnline ? "text-green-700" : "text-foreground"}`}
            >
              {isOnline ? "🟢 Online — Accepting Jobs" : "⚫ Offline"}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isOnline
                ? "Customers can find and book you"
                : "Toggle on to start receiving requests"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="availability-toggle" className="sr-only">
              Availability
            </Label>
            <Switch
              id="availability-toggle"
              data-ocid="professional.availability.toggle"
              checked={isOnline}
              onCheckedChange={handleToggleAvailability}
              disabled={updateAvailability.isPending}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Status alert for pending professionals */}
      {profile?.status === "pending" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-700">
          ⏳ Your profile is pending admin approval. You'll be notified once
          verified.
        </div>
      )}

      <Tabs defaultValue="requests">
        <TabsList className="w-full mb-5 grid grid-cols-4">
          <TabsTrigger value="requests" className="text-xs">
            Requests
          </TabsTrigger>
          <TabsTrigger value="active" className="text-xs">
            Active
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">
            Done
          </TabsTrigger>
          <TabsTrigger value="earnings" className="text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            Earnings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <JobList
            status={BookingStatus.pending}
            showActions
            actionType="accept"
            emptyMessage="No pending requests right now. Make sure you're online to receive jobs."
          />
        </TabsContent>

        <TabsContent value="active">
          <JobList
            status={BookingStatus.accepted}
            showActions
            actionType="status"
            emptyMessage="No active jobs right now."
          />
        </TabsContent>

        <TabsContent value="completed">
          <JobList
            status={BookingStatus.completed}
            emptyMessage="No completed jobs yet. Accept and complete jobs to see them here."
          />
        </TabsContent>

        <TabsContent value="earnings">
          <EarningsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
