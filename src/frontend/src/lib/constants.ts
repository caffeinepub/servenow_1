import { BookingStatus, ServiceCategory } from "../backend";

export const SERVICE_CATEGORIES = [
  {
    id: ServiceCategory.chef,
    label: "Chef",
    description: "Daily cook, party chef, meal prep",
    icon: "👨‍🍳",
    image: "/assets/generated/service-chef.dim_400x300.jpg",
    colorClass: "gradient-card-chef",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    subServices: ["Daily Cook", "Party Cook", "Meal Prep", "Tiffin Service"],
    basePrices: {
      "Daily Cook": 800,
      "Party Cook": 2500,
      "Meal Prep": 1200,
      "Tiffin Service": 1500,
    },
  },
  {
    id: ServiceCategory.plumber,
    label: "Plumber",
    description: "Leak repair, pipe fitting, drainage",
    icon: "🔧",
    image: "/assets/generated/service-plumber.dim_400x300.jpg",
    colorClass: "gradient-card-plumber",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    subServices: [
      "Leak Repair",
      "Pipe Fitting",
      "Drain Cleaning",
      "Tap Installation",
      "Water Heater",
    ],
    basePrices: {
      "Leak Repair": 500,
      "Pipe Fitting": 800,
      "Drain Cleaning": 600,
      "Tap Installation": 400,
      "Water Heater": 1200,
    },
  },
  {
    id: ServiceCategory.carpenter,
    label: "Carpenter",
    description: "Furniture repair, installation, custom work",
    icon: "🪚",
    image: "/assets/generated/service-carpenter.dim_400x300.jpg",
    colorClass: "gradient-card-carpenter",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    subServices: [
      "Furniture Repair",
      "Door/Window Fitting",
      "Cabinet Installation",
      "Custom Furniture",
      "Flooring",
    ],
    basePrices: {
      "Furniture Repair": 700,
      "Door/Window Fitting": 1000,
      "Cabinet Installation": 1500,
      "Custom Furniture": 3000,
      Flooring: 2000,
    },
  },
  {
    id: ServiceCategory.pestControl,
    label: "Pest Control",
    description: "Termite, cockroach, rodent treatment",
    icon: "🐛",
    image: "/assets/generated/service-pest-control.dim_400x300.jpg",
    colorClass: "gradient-card-pest",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    subServices: [
      "General Pest Control",
      "Termite Treatment",
      "Cockroach Control",
      "Rodent Control",
      "Bed Bug Treatment",
    ],
    basePrices: {
      "General Pest Control": 1000,
      "Termite Treatment": 3000,
      "Cockroach Control": 800,
      "Rodent Control": 1200,
      "Bed Bug Treatment": 2000,
    },
  },
] as const;

export const TIME_SLOTS = [
  { value: "morning", label: "Morning (8AM - 12PM)" },
  { value: "afternoon", label: "Afternoon (12PM - 5PM)" },
  { value: "evening", label: "Evening (5PM - 9PM)" },
];

export const BOOKING_STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; color: string; bgColor: string }
> = {
  [BookingStatus.pending]: {
    label: "Pending",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  [BookingStatus.accepted]: {
    label: "Accepted",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  [BookingStatus.onTheWay]: {
    label: "On the Way",
    color: "text-indigo-700",
    bgColor: "bg-indigo-100",
  },
  [BookingStatus.inProgress]: {
    label: "In Progress",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  [BookingStatus.completed]: {
    label: "Completed",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  [BookingStatus.cancelled]: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
};

export const PROFESSIONAL_SUB_SKILLS: Record<string, string[]> = {
  [ServiceCategory.chef]: [
    "North Indian",
    "South Indian",
    "Chinese",
    "Continental",
    "Baking",
    "Party Cooking",
    "Meal Prep",
  ],
  [ServiceCategory.plumber]: [
    "Pipe Fitting",
    "Leak Repair",
    "Drain Cleaning",
    "Water Heater",
    "Sanitary Fitting",
  ],
  [ServiceCategory.carpenter]: [
    "Furniture Making",
    "Door/Window",
    "Flooring",
    "Cabinet Work",
    "Interior Woodwork",
  ],
  [ServiceCategory.pestControl]: [
    "General Pest",
    "Termites",
    "Cockroaches",
    "Rodents",
    "Bed Bugs",
    "Mosquitoes",
  ],
};
