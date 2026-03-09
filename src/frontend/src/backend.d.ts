import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Booking {
    id: bigint;
    status: BookingStatus;
    customer: Principal;
    date: Time;
    cancellationFee: boolean;
    subService: string;
    professional: Principal;
    address: string;
    notes: string;
    category: ServiceCategory;
    amount: bigint;
    timeSlot: string;
}
export type Time = bigint;
export interface Service {
    basePriceEstimate: bigint;
    subService: string;
    category: ServiceCategory;
}
export interface ProfessionalProfile {
    bio: string;
    status: ProfessionalStatus;
    name: string;
    workingRadius: bigint;
    availability: AvailabilityStatus;
    aggregateRating?: number;
    category: ServiceCategory;
    phone: string;
    subSkills: Array<string>;
}
export interface ProfessionalEarnings {
    weeklyEarnings: bigint;
    monthlyEarnings: bigint;
    dailyEarnings: bigint;
    totalEarnings: bigint;
}
export interface CustomerProfile {
    name: string;
    addresses: Array<string>;
    phone: string;
}
export interface Review {
    bookingId: bigint;
    customer: Principal;
    comment: string;
    professional: Principal;
    timestamp: Time;
    rating: number;
}
export interface UserProfile {
    name: string;
    role: Variant_customer_professional;
    phone: string;
}
export enum AvailabilityStatus {
    offline = "offline",
    online = "online"
}
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    onTheWay = "onTheWay",
    accepted = "accepted",
    inProgress = "inProgress"
}
export enum ProfessionalStatus {
    pending = "pending",
    approved = "approved",
    suspended = "suspended"
}
export enum ServiceCategory {
    plumber = "plumber",
    chef = "chef",
    pestControl = "pestControl",
    carpenter = "carpenter"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_customer_professional {
    customer = "customer",
    professional = "professional"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelBooking(bookingId: bigint): Promise<void>;
    createBooking(professional: Principal, category: ServiceCategory, subService: string, date: Time, timeSlot: string, address: string, notes: string, amount: bigint): Promise<bigint>;
    getAllProfessionals(): Promise<Array<ProfessionalProfile>>;
    getAvailableProfessionalsByCategory(category: ServiceCategory): Promise<Array<ProfessionalProfile>>;
    getBookingsByCustomer(customer: Principal, status: BookingStatus): Promise<Array<Booking>>;
    getBookingsByProfessional(professional: Principal, status: BookingStatus): Promise<Array<Booking>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomerProfile(user: Principal): Promise<CustomerProfile | null>;
    getProfessionalEarnings(professional: Principal): Promise<ProfessionalEarnings>;
    getProfessionalProfile(user: Principal): Promise<ProfessionalProfile | null>;
    getReviewsByProfessional(professional: Principal): Promise<Array<Review>>;
    getServiceCatalog(): Promise<Array<Service>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerCustomer(name: string, phone: string, addresses: Array<string>): Promise<void>;
    registerProfessional(name: string, phone: string, category: ServiceCategory, subSkills: Array<string>, bio: string, workingRadius: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitReview(bookingId: bigint, rating: number, comment: string): Promise<void>;
    updateBookingStatus(bookingId: bigint, status: BookingStatus): Promise<void>;
    updateCustomerProfile(addresses: Array<string>): Promise<void>;
    updateProfessionalAvailability(availability: AvailabilityStatus): Promise<void>;
    updateProfessionalStatus(professional: Principal, status: ProfessionalStatus): Promise<void>;
}
