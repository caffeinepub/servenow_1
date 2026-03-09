import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSubmitReview } from "../hooks/useQueries";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: bigint;
  serviceName: string;
}

export default function ReviewModal({
  open,
  onClose,
  bookingId,
  serviceName,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const submitReview = useSubmitReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    try {
      await submitReview.mutateAsync({ bookingId, rating, comment });
      toast.success("Thank you for your review!");
      setRating(0);
      setComment("");
      onClose();
    } catch {
      toast.error("Failed to submit review. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            Rate Your Experience
          </DialogTitle>
          <DialogDescription>{serviceName}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-2 justify-center py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  data-ocid="review.rating.input"
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      star <= (hovered || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-comment">Comments (optional)</Label>
            <Textarea
              id="review-comment"
              data-ocid="review.comment.textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this professional..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="review.submit_button"
              disabled={submitReview.isPending || rating === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {submitReview.isPending && (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              )}
              Submit Review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
