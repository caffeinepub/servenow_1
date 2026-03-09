import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ServiceCategory } from "../backend";
import {
  useAvailableProfessionals,
  useCreateBooking,
  useServiceCatalog,
} from "../hooks/useQueries";
import { SERVICE_CATEGORIES, TIME_SLOTS } from "../lib/constants";

interface BookingFlowProps {
  open: boolean;
  onClose: () => void;
  initialCategory?: ServiceCategory;
  savedAddresses?: string[];
}

const STEPS = ["Service", "Schedule", "Details", "Confirm"];

export default function BookingFlow({
  open,
  onClose,
  initialCategory,
  savedAddresses = [],
}: BookingFlowProps) {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<ServiceCategory | "">(
    initialCategory ?? "",
  );
  const [subService, setSubService] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [address, setAddress] = useState(savedAddresses[0] ?? "");
  const [notes, setNotes] = useState("");

  const { data: catalog = [] } = useServiceCatalog();
  const { data: professionals = [] } = useAvailableProfessionals(
    category || null,
  );
  const createBooking = useCreateBooking();

  const selectedCategoryInfo = SERVICE_CATEGORIES.find(
    (c) => c.id === category,
  );
  const subServices = catalog.filter((s) => s.category === category);
  const selectedService = subServices.find((s) => s.subService === subService);
  const estimatedPrice = selectedService
    ? Number(selectedService.basePriceEstimate)
    : ((selectedCategoryInfo?.basePrices as Record<string, number>)?.[
        subService
      ] ?? 0);

  const canProceed = () => {
    if (step === 0) return !!category && !!subService;
    if (step === 1) return !!date && !!timeSlot;
    if (step === 2) return !!address;
    return true;
  };

  const handleNext = () => {
    if (canProceed()) setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleConfirm = async () => {
    if (!category) return;

    const professional = professionals[0];
    if (!professional) {
      toast.error(
        "No professionals available right now. Please try again later.",
      );
      return;
    }

    try {
      const dateMs = new Date(date).getTime();
      const professionalPrincipal =
        (professional as { principal?: Principal }).principal ??
        (professionals[0] as unknown as Principal);
      await createBooking.mutateAsync({
        professional: professionalPrincipal,
        category: category as ServiceCategory,
        subService,
        date: BigInt(dateMs * 1_000_000),
        timeSlot,
        address,
        notes,
        amount: BigInt(estimatedPrice),
      });
      toast.success("Booking confirmed! Finding a professional near you...");
      handleClose();
    } catch {
      toast.error("Failed to create booking. Please try again.");
    }
  };

  const handleClose = () => {
    setStep(0);
    setCategory(initialCategory ?? "");
    setSubService("");
    setDate("");
    setTimeSlot("");
    setAddress(savedAddresses[0] ?? "");
    setNotes("");
    onClose();
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Book a Service
          </DialogTitle>
          <DialogDescription>
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-1 mt-1 mb-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div
                className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Service Selection */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Service Category</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_CATEGORIES.map((svc) => (
                    <button
                      key={svc.id}
                      data-ocid="booking.category.select"
                      type="button"
                      onClick={() => {
                        setCategory(svc.id);
                        setSubService("");
                      }}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        category === svc.id
                          ? "border-primary bg-accent"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-2xl mb-1">{svc.icon}</div>
                      <div className="font-semibold text-sm">{svc.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {category && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <Label>Sub-Service</Label>
                  <Select value={subService} onValueChange={setSubService}>
                    <SelectTrigger data-ocid="booking.subservice.select">
                      <SelectValue placeholder="Select a specific service" />
                    </SelectTrigger>
                    <SelectContent>
                      {(selectedCategoryInfo?.subServices ?? []).map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 1: Schedule */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="booking-date">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </Label>
                <Input
                  id="booking-date"
                  data-ocid="booking.date.input"
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time Slot
                </Label>
                <div className="space-y-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot.value}
                      data-ocid="booking.timeslot.select"
                      type="button"
                      onClick={() => setTimeSlot(slot.value)}
                      className={`w-full p-3 rounded-lg border-2 text-left text-sm transition-all ${
                        timeSlot === slot.value
                          ? "border-primary bg-accent font-medium"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Address & Notes */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="booking-address">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Service Address *
                </Label>
                {savedAddresses.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr}
                        type="button"
                        onClick={() => setAddress(addr)}
                        className={`w-full p-2 rounded-lg border text-sm text-left transition-all ${
                          address === addr
                            ? "border-primary bg-accent"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        📍 {addr}
                      </button>
                    ))}
                    <div className="text-xs text-muted-foreground text-center py-1">
                      or enter a new address
                    </div>
                  </div>
                )}
                <Input
                  id="booking-address"
                  data-ocid="booking.address.input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter service address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-notes">
                  Special Instructions (optional)
                </Label>
                <Textarea
                  id="booking-notes"
                  data-ocid="booking.notes.textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g., Use back entrance, bring specific tools..."
                  rows={3}
                />
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="bg-accent/50 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold font-display">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium">
                      {selectedCategoryInfo?.label} — {subService}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium capitalize">{timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <span className="font-medium text-right max-w-48 truncate">
                      {address}
                    </span>
                  </div>
                  {notes && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Notes</span>
                      <span className="font-medium text-right max-w-48 text-xs">
                        {notes}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 flex justify-between font-semibold text-base">
                    <span>Estimated Price</span>
                    <span className="text-primary">
                      ₹{estimatedPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {professionals.length === 0 && (
                <div className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
                  ⚠️ No professionals currently available in this category. Your
                  booking will be assigned when one becomes available.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-2 mt-4">
          {step > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button
              data-ocid="booking.submit_button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              data-ocid="booking.confirm_button"
              onClick={handleConfirm}
              disabled={createBooking.isPending}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {createBooking.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {createBooking.isPending ? "Booking..." : "Confirm Booking"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
