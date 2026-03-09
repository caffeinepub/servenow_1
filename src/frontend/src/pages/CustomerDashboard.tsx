import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Star,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { BookingStatus, type ServiceCategory } from "../backend";
import BookingFlow from "../components/BookingFlow";
import ReviewModal from "../components/ReviewModal";
import { StatusBadge } from "../components/StatusBadge";
import {
  useBookingsByCustomer,
  useCancelBooking,
  useCustomerProfile,
} from "../hooks/useQueries";
import { SERVICE_CATEGORIES } from "../lib/constants";

interface CustomerDashboardProps {
  userName?: string;
}

function BookingCard({
  booking,
  index,
  showCancel,
  showReview,
}: {
  booking: import("../backend").Booking;
  index: number;
  showCancel?: boolean;
  showReview?: boolean;
}) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const cancelBooking = useCancelBooking();

  const svcCategory = SERVICE_CATEGORIES.find((c) => c.id === booking.category);
  const bookingDate = booking.date
    ? new Date(Number(booking.date) / 1_000_000)
    : null;

  const handleCancel = async () => {
    try {
      await cancelBooking.mutateAsync(booking.id);
      toast.success("Booking cancelled successfully");
    } catch {
      toast.error("Failed to cancel booking");
    }
  };

  return (
    <>
      <Card
        data-ocid={`booking.item.${index}`}
        className="border border-border hover:shadow-card transition-shadow"
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${svcCategory?.iconBg}`}
              >
                {svcCategory?.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold font-display text-sm">
                    {svcCategory?.label} — {booking.subService}
                  </h4>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
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
                      <span className="truncate max-w-32">
                        {booking.address}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="font-semibold text-primary text-sm">
                ₹{Number(booking.amount).toLocaleString()}
              </div>
            </div>
          </div>

          {(showCancel || showReview) && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              {showReview && (
                <Button
                  size="sm"
                  variant="outline"
                  data-ocid={`booking.review.open_modal_button.${index}`}
                  onClick={() => setReviewOpen(true)}
                  className="flex-1 text-xs"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Rate & Review
                </Button>
              )}
              {showCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid={`booking.cancel_button.${index}`}
                      className="flex-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                      disabled={cancelBooking.isPending}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel this booking?
                        {booking.cancellationFee && (
                          <span className="block mt-1 text-amber-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />A cancellation
                            fee may apply.
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-ocid="booking.cancel_button.cancel">
                        Keep Booking
                      </AlertDialogCancel>
                      <AlertDialogAction
                        data-ocid="booking.cancel_button.confirm"
                        onClick={handleCancel}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, Cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        bookingId={booking.id}
        serviceName={`${svcCategory?.label} — ${booking.subService}`}
      />
    </>
  );
}

function BookingList({
  status,
  showCancel,
  showReview,
  emptyMessage,
}: {
  status: BookingStatus;
  showCancel?: boolean;
  showReview?: boolean;
  emptyMessage: string;
}) {
  const { data: bookings = [], isLoading } = useBookingsByCustomer(status);

  if (isLoading) {
    return (
      <div data-ocid="booking.loading_state" className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div data-ocid="booking.empty_state" className="text-center py-12">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking, i) => (
        <BookingCard
          key={booking.id.toString()}
          booking={booking}
          index={i + 1}
          showCancel={showCancel}
          showReview={showReview}
        />
      ))}
    </div>
  );
}

export default function CustomerDashboard({
  userName,
}: CustomerDashboardProps) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    ServiceCategory | undefined
  >();
  const { data: profile } = useCustomerProfile();

  const openBooking = (cat?: ServiceCategory) => {
    setSelectedCategory(cat);
    setBookingOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold font-display">
          Hello, {userName ?? profile?.name ?? "there"} 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          What service do you need today?
        </p>
      </motion.div>

      <Tabs defaultValue="home">
        <TabsList className="w-full mb-5">
          <TabsTrigger value="home" className="flex-1">
            Home
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex-1">
            My Bookings
          </TabsTrigger>
        </TabsList>

        {/* Home Tab */}
        <TabsContent value="home" className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {SERVICE_CATEGORIES.map((svc, index) => (
              <motion.button
                key={svc.id}
                data-ocid={`home.service.card.${index + 1}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openBooking(svc.id)}
                className={`${svc.colorClass} p-4 rounded-xl text-left shadow-card hover:shadow-glow transition-shadow`}
              >
                <div
                  className={`w-10 h-10 ${svc.iconBg} rounded-lg flex items-center justify-center text-xl mb-2`}
                >
                  {svc.icon}
                </div>
                <div className="font-semibold text-sm font-display">
                  {svc.label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {svc.description}
                </div>
              </motion.button>
            ))}
          </div>

          <Button
            data-ocid="home.booking.primary_button"
            onClick={() => openBooking()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Book Any Service
          </Button>
        </TabsContent>

        {/* My Bookings Tab */}
        <TabsContent value="bookings">
          <Tabs defaultValue="upcoming">
            <TabsList className="w-full mb-4 grid grid-cols-4">
              <TabsTrigger
                data-ocid="mybookings.upcoming.tab"
                value="upcoming"
                className="text-xs"
              >
                Upcoming
              </TabsTrigger>
              <TabsTrigger
                data-ocid="mybookings.ongoing.tab"
                value="ongoing"
                className="text-xs"
              >
                Ongoing
              </TabsTrigger>
              <TabsTrigger
                data-ocid="mybookings.completed.tab"
                value="completed"
                className="text-xs"
              >
                Done
              </TabsTrigger>
              <TabsTrigger
                data-ocid="mybookings.cancelled.tab"
                value="cancelled"
                className="text-xs"
              >
                Cancelled
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <BookingList
                status={BookingStatus.pending}
                showCancel
                emptyMessage="No upcoming bookings. Book a service to get started!"
              />
            </TabsContent>
            <TabsContent value="ongoing">
              <BookingList
                status={BookingStatus.inProgress}
                emptyMessage="No ongoing services right now."
              />
            </TabsContent>
            <TabsContent value="completed">
              <BookingList
                status={BookingStatus.completed}
                showReview
                emptyMessage="No completed bookings yet."
              />
            </TabsContent>
            <TabsContent value="cancelled">
              <BookingList
                status={BookingStatus.cancelled}
                emptyMessage="No cancelled bookings."
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <BookingFlow
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialCategory={selectedCategory}
        savedAddresses={profile?.addresses ?? []}
      />
    </div>
  );
}
