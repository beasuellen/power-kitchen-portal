// Mock data for development — replace with real API calls in production

export const mockCustomer = {
  id: "cust_001",
  firstName: "Sarah",
  lastName: "Johnson",
  email: "sarah@example.com",
  avatar: null,
  memberSince: "2023-10-01",
};

export const mockSubscription = {
  id: "sub_001",
  customerId: "cust_001",
  planName: "Performance Plan",
  planType: "performance",
  mealsPerWeek: 10,
  weeklyTotal: 149.90,
  status: "active" as const,
  startDate: "2023-10-01",
  nextBillingDate: "2026-04-23",
  deliveryDay: "Thursday",
  streak: 24,
  tier: "gold" as const,
  storeCredit: 12.50,
  points: 840,
};

export type OrderStatus =
  | "customizable"
  | "locked"
  | "skipped"
  | "processing"
  | "delivered";

export type MealCategory = "meals" | "breakfast" | "shakes" | "snacks";
export type DietaryTag = "GF" | "DF" | "NF" | "SF" | "H" | "SpF" | "V";

export interface Meal {
  id: string;
  name: string;
  planType: string;
  category: MealCategory;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  dietaryTags: DietaryTag[];
  imageUrl: string;
  isNew?: boolean;
  description?: string;
}

export interface OrderItem {
  id: string;
  meal: Meal;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  deliveryDate: string;
  cutoffDate: string;
  billingDate: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
}

const mealImages = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop",
];

export const mockMeals: Meal[] = [
  {
    id: "meal_001",
    name: "Teriyaki Chicken Bowl",
    planType: "Performance",
    category: "meals",
    price: 14.99,
    calories: 520,
    protein: 42,
    carbs: 48,
    fat: 12,
    dietaryTags: ["GF", "DF"],
    imageUrl: mealImages[0],
    description: "Grilled chicken thigh with teriyaki glaze, jasmine rice, and steamed broccoli.",
  },
  {
    id: "meal_002",
    name: "Grass-Fed Beef Stir Fry",
    planType: "Classic",
    category: "meals",
    price: 16.99,
    calories: 580,
    protein: 45,
    carbs: 35,
    fat: 18,
    dietaryTags: ["GF", "DF", "NF"],
    imageUrl: mealImages[1],
    description: "Lean beef strips with mixed vegetables and savory sauce over cauliflower rice.",
  },
  {
    id: "meal_003",
    name: "Salmon & Asparagus",
    planType: "Keto",
    category: "meals",
    price: 18.99,
    calories: 450,
    protein: 38,
    carbs: 8,
    fat: 28,
    dietaryTags: ["GF", "DF", "NF", "SF"],
    imageUrl: mealImages[2],
    isNew: true,
    description: "Wild Atlantic salmon fillet with roasted asparagus and lemon herb butter.",
  },
  {
    id: "meal_004",
    name: "Turkey Meatballs & Zoodles",
    planType: "GLP-1",
    category: "meals",
    price: 13.99,
    calories: 380,
    protein: 35,
    carbs: 18,
    fat: 14,
    dietaryTags: ["GF", "DF"],
    imageUrl: mealImages[3],
    description: "Lean turkey meatballs over zucchini noodles with marinara sauce.",
  },
  {
    id: "meal_005",
    name: "Overnight Oats Supreme",
    planType: "Classic",
    category: "breakfast",
    price: 9.99,
    calories: 340,
    protein: 18,
    carbs: 52,
    fat: 8,
    dietaryTags: ["GF", "V"],
    imageUrl: mealImages[4],
    description: "Rolled oats with chia seeds, almond milk, berries, and honey.",
  },
  {
    id: "meal_006",
    name: "Egg White Frittata",
    planType: "Performance",
    category: "breakfast",
    price: 10.99,
    calories: 280,
    protein: 28,
    carbs: 12,
    fat: 10,
    dietaryTags: ["GF", "DF", "NF", "SF"],
    imageUrl: mealImages[5],
    isNew: true,
    description: "Fluffy egg white frittata with spinach, mushrooms, and feta cheese.",
  },
  {
    id: "meal_007",
    name: "Chocolate Protein Shake",
    planType: "Performance",
    category: "shakes",
    price: 8.99,
    calories: 220,
    protein: 30,
    carbs: 18,
    fat: 4,
    dietaryTags: ["GF", "NF"],
    imageUrl: mealImages[6],
    description: "Rich chocolate whey protein shake with almond milk and banana.",
  },
  {
    id: "meal_008",
    name: "Mixed Nut & Date Bar",
    planType: "Classic",
    category: "snacks",
    price: 4.99,
    calories: 180,
    protein: 6,
    carbs: 22,
    fat: 9,
    dietaryTags: ["GF", "V"],
    imageUrl: mealImages[7],
    description: "Energy-packed bar with dates, almonds, cashews, and dark chocolate chips.",
  },
];

export const mockOrders: Order[] = [
  {
    id: "ord_001",
    deliveryDate: "2026-04-24",
    cutoffDate: "2026-04-21",
    billingDate: "2026-04-22",
    status: "customizable",
    items: [
      { id: "oi_001", meal: mockMeals[0], quantity: 2, unitPrice: 14.99 },
      { id: "oi_002", meal: mockMeals[1], quantity: 1, unitPrice: 16.99 },
      { id: "oi_003", meal: mockMeals[2], quantity: 2, unitPrice: 18.99 },
      { id: "oi_004", meal: mockMeals[3], quantity: 1, unitPrice: 13.99 },
    ],
    total: 98.94,
  },
  {
    id: "ord_002",
    deliveryDate: "2026-05-01",
    cutoffDate: "2026-04-28",
    billingDate: "2026-04-29",
    status: "locked",
    items: [
      { id: "oi_005", meal: mockMeals[0], quantity: 2, unitPrice: 14.99 },
      { id: "oi_006", meal: mockMeals[2], quantity: 3, unitPrice: 18.99 },
      { id: "oi_007", meal: mockMeals[4], quantity: 2, unitPrice: 9.99 },
    ],
    total: 106.93,
  },
  {
    id: "ord_003",
    deliveryDate: "2026-05-08",
    cutoffDate: "2026-05-05",
    billingDate: "2026-05-06",
    status: "locked",
    items: [
      { id: "oi_008", meal: mockMeals[1], quantity: 3, unitPrice: 16.99 },
      { id: "oi_009", meal: mockMeals[3], quantity: 2, unitPrice: 13.99 },
      { id: "oi_010", meal: mockMeals[5], quantity: 2, unitPrice: 10.99 },
    ],
    total: 99.93,
  },
  {
    id: "ord_004",
    deliveryDate: "2026-05-15",
    cutoffDate: "2026-05-12",
    billingDate: "2026-05-13",
    status: "skipped",
    items: [],
    total: 0,
  },
  {
    id: "ord_005",
    deliveryDate: "2026-04-17",
    cutoffDate: "2026-04-14",
    billingDate: "2026-04-15",
    status: "delivered",
    items: [
      { id: "oi_011", meal: mockMeals[0], quantity: 2, unitPrice: 14.99 },
      { id: "oi_012", meal: mockMeals[2], quantity: 2, unitPrice: 18.99 },
      { id: "oi_013", meal: mockMeals[6], quantity: 1, unitPrice: 8.99 },
    ],
    total: 77.95,
  },
];

export const mockChallenges = [
  {
    id: "ch_001",
    name: "Consistency King",
    description: "Complete 8 weeks without skipping or pausing",
    type: "streak",
    current: 6,
    target: 8,
    reward: "$15 store credit",
    rewardValue: 15,
    daysLeft: null,
  },
  {
    id: "ch_002",
    name: "Breakfast Explorer",
    description: "Add breakfast to 3 consecutive orders",
    type: "order",
    current: 1,
    target: 3,
    reward: "$5 store credit",
    rewardValue: 5,
    daysLeft: 14,
  },
  {
    id: "ch_003",
    name: "Spread the Word",
    description: "Refer 5 friends who subscribe",
    type: "referral",
    current: 2,
    target: 5,
    reward: "$100 store credit",
    rewardValue: 100,
    daysLeft: null,
  },
];

export const mockBillingHistory = [
  {
    id: "bill_001",
    date: "2026-04-15",
    orderNumber: "#10423",
    amount: 149.90,
    status: "paid" as const,
  },
  {
    id: "bill_002",
    date: "2026-04-08",
    orderNumber: "#10387",
    amount: 149.90,
    status: "paid" as const,
  },
  {
    id: "bill_003",
    date: "2026-04-01",
    orderNumber: "#10352",
    amount: 149.90,
    status: "paid" as const,
  },
  {
    id: "bill_004",
    date: "2026-03-25",
    orderNumber: "#10318",
    amount: 149.90,
    status: "paid" as const,
  },
];

export const mockReferralStats = {
  referralLink: "https://powerkitchen.ca/ref/sarah-j-2024",
  totalSent: 8,
  successful: 2,
  pending: 1,
  totalEarned: 40,
};

export const mockRecentActivity = [
  { id: "act_001", message: "You customized your Apr 24 order", date: "2026-04-16", icon: "edit" },
  { id: "act_002", message: "You added Salmon & Asparagus", date: "2026-04-15", icon: "plus" },
  { id: "act_003", message: 'You earned $5 for completing "Big Order" challenge', date: "2026-04-14", icon: "star" },
];

export const tierColors = {
  bronze: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  silver: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
  gold: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  platinum: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
};

export const dietaryTagColors: Record<DietaryTag, { bg: string; text: string; label: string }> = {
  GF: { bg: "bg-green-100", text: "text-green-800", label: "GF" },
  DF: { bg: "bg-blue-100", text: "text-blue-800", label: "DF" },
  NF: { bg: "bg-yellow-100", text: "text-yellow-800", label: "NF" },
  SF: { bg: "bg-orange-100", text: "text-orange-800", label: "SF" },
  H:  { bg: "bg-teal-100",  text: "text-teal-800",  label: "H"  },
  SpF:{ bg: "bg-red-100",   text: "text-red-800",   label: "SpF"},
  V:  { bg: "bg-emerald-100", text: "text-emerald-800", label: "V" },
};
