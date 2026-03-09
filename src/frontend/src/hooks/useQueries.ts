import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AvailabilityStatus,
  BookingStatus,
  ProfessionalStatus,
  ServiceCategory,
} from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// ─── Current User Profile ────────────────────────────────────────────────────

export function useCallerUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerUserProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Service Catalog ─────────────────────────────────────────────────────────

export function useServiceCatalog() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["serviceCatalog"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getServiceCatalog();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Customer ─────────────────────────────────────────────────────────────────

export function useCustomerProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["customerProfile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      return actor.getCustomerProfile(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useBookingsByCustomer(status: BookingStatus) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: [
      "bookingsByCustomer",
      identity?.getPrincipal().toString(),
      status,
    ],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getBookingsByCustomer(identity.getPrincipal(), status);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// ─── Professional ─────────────────────────────────────────────────────────────

export function useProfessionalProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["professionalProfile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      return actor.getProfessionalProfile(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useBookingsByProfessional(status: BookingStatus) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: [
      "bookingsByProfessional",
      identity?.getPrincipal().toString(),
      status,
    ],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getBookingsByProfessional(identity.getPrincipal(), status);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useProfessionalEarnings() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["professionalEarnings", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      return actor.getProfessionalEarnings(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAvailableProfessionals(category: ServiceCategory | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["availableProfessionals", category],
    queryFn: async () => {
      if (!actor || !category) return [];
      return actor.getAvailableProfessionalsByCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
  });
}

export function useAllProfessionals() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allProfessionals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfessionals();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useRegisterCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      phone: string;
      addresses: string[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerCustomer(data.name, data.phone, data.addresses);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["customerProfile"] });
    },
  });
}

export function useRegisterProfessional() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      phone: string;
      category: ServiceCategory;
      subSkills: string[];
      bio: string;
      workingRadius: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerProfessional(
        data.name,
        data.phone,
        data.category,
        data.subSkills,
        data.bio,
        data.workingRadius,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["professionalProfile"] });
    },
  });
}

export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      professional: Principal;
      category: ServiceCategory;
      subService: string;
      date: bigint;
      timeSlot: string;
      address: string;
      notes: string;
      amount: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createBooking(
        data.professional,
        data.category,
        data.subService,
        data.date,
        data.timeSlot,
        data.address,
        data.notes,
        data.amount,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookingsByCustomer"] });
    },
  });
}

export function useCancelBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.cancelBooking(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookingsByCustomer"] });
      queryClient.invalidateQueries({ queryKey: ["bookingsByProfessional"] });
    },
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { bookingId: bigint; status: BookingStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateBookingStatus(data.bookingId, data.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookingsByProfessional"] });
      queryClient.invalidateQueries({ queryKey: ["bookingsByCustomer"] });
    },
  });
}

export function useSubmitReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      bookingId: bigint;
      rating: number;
      comment: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitReview(data.bookingId, data.rating, data.comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookingsByCustomer"] });
    },
  });
}

export function useUpdateAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (availability: AvailabilityStatus) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProfessionalAvailability(availability);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionalProfile"] });
    },
  });
}

export function useUpdateProfessionalStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      professional: Principal;
      status: ProfessionalStatus;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProfessionalStatus(data.professional, data.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allProfessionals"] });
    },
  });
}
