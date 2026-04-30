// Mock data for development — replace with real API calls in production

export const mockCustomer = {
  id: "cust_001",
  firstName: "Sarah",
  lastName: "Johnson",
  email: "sarah@example.com",
  avatar: null,
  memberSince: "2023-10-01",
};

// ─── Subscription plan options ────────────────────────────────────
export const mockSubscriptionPlans = [
  {
    id: "plan_chefs_sample",
    name: "Chef's Sample",
    tagline: "Bundle with 5 meals",
    description: "Test our menu with no commitment. Get 5 hand-picked meals to experience the Power Kitchen difference.",
    mealsIncluded: 5,
    perks: [
      "Bundle with 5 meals",
      "Test our menu with no commitment",
      "See exactly what you'll receive",
    ],
    pricePerMeal: 17.99,
    weeklyTotal: 89.95,
    popular: false,
  },
  {
    id: "plan_custom",
    name: "Custom Meal Plan",
    tagline: "Choose your meals",
    description: "Full control over your selections. Personalize every order to match your goals and preferences.",
    mealsIncluded: 10,
    perks: [
      "Personalize your meals as you please",
      "Set dietary restrictions and preferences",
      "Smart Ordering to save time",
      "Full control over your selections",
    ],
    pricePerMeal: 14.99,
    weeklyTotal: 149.90,
    popular: true,
  },
  {
    id: "plan_1month_trial",
    name: "1 Month Trial",
    tagline: "Get 20 meals",
    description: "Experience our full menu rotation for a full month. Includes free delivery and a free breakfast every week.",
    mealsIncluded: 20,
    perks: [
      "Get 5 meals per week for 1 month",
      "Free delivery & Free breakfast",
      "Experience our menu rotation",
    ],
    pricePerMeal: 13.99,
    weeklyTotal: 279.80,
    popular: false,
  },
];

// ─── Meal plan types (as shown on powerkitchen.ca) ─────────────────
export const mockMealPlanTypes = [
  { id: "power",        name: "Power",         description: "Balanced meals for people who just want to eat right", emoji: "⚡" },
  { id: "pro_athlete",  name: "Pro Athlete",    description: "High protein meals for performance and recovery", emoji: "🏃" },
  { id: "lean_muscle",  name: "Lean Muscle",    description: "Athletes' choice for gaining muscle and losing fat", emoji: "💪" },
  { id: "low_carb",     name: "Low Carb",       description: "Low-calorie meals to help you on your journey", emoji: "🥗" },
  { id: "clean_bulk",   name: "Clean Bulking",  description: "High-protein, high-carb meals to help you build muscle", emoji: "🏋️" },
  { id: "vegan",        name: "Vegan",          description: "Wholesome and delicious plant-based meals", emoji: "🌱" },
  { id: "keto",         name: "Keto",           description: "Low-carb, high-fat meals that help you stay in ketosis", emoji: "🥑" },
  { id: "glp1",         name: "GLP-1 Support",  description: "Meals specially crafted for those on GLP-1 medications", emoji: "💊" },
];

export const mockSubscription = {
  id: "sub_001",
  customerId: "cust_001",
  planName: "Custom Meal Plan",
  planType: "custom",
  mealsPerWeek: 10,
  weeklyTotal: 149.90,
  status: "active" as const,
  startDate: "2023-10-01",
  nextBillingDate: "2026-04-23",
  deliveryDay: "Thursday",
  deliveryMethod: "delivery" as "delivery" | "pickup",
  streak: 24,
  tier: "gold" as const,
  storeCredit: 12.50,
  points: 840,
  dietaryRestrictions: ["GF", "DF"] as Array<"GF" | "DF" | "NF" | "SF" | "H" | "SpF" | "V">,
};

export type OrderStatus =
  | "customizable"
  | "locked"
  | "skipped"
  | "processing"
  | "delivered";

export type MealCategory = "meals" | "breakfast" | "shakes" | "snacks";
export type DietaryTag = "GF" | "DF" | "NF" | "SF" | "H" | "SpF" | "V";

export interface PrepMethod { method: string; instructions: string; }

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
  // Extended detail fields
  ingredients?: string[];
  allergens?: string[];
  saturatedFat?: number;
  polyUnsaturatedFat?: number;
  fiber?: number;
  sugar?: number;
  cholesterol?: number;
  sodium?: number;
  netCarbs?: number;
  prepMethods?: PrepMethod[];
  spiceLevel?: string[];
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
    planType: "Pro Athlete",
    category: "meals",
    price: 14.99,
    calories: 520,
    protein: 42,
    carbs: 48,
    fat: 12,
    saturatedFat: 2.8,
    polyUnsaturatedFat: 2.1,
    fiber: 4.5,
    sugar: 9.2,
    cholesterol: 118,
    sodium: 742,
    netCarbs: 43.5,
    dietaryTags: ["GF", "DF"],
    imageUrl: mealImages[0],
    description: "Grilled chicken thigh with teriyaki glaze, jasmine rice, and steamed broccoli.",
    ingredients: ["Chicken Thigh", "Jasmine Rice", "Broccoli", "Teriyaki Glaze", "Sesame Oil", "Garlic", "Ginger", "Soy Sauce (GF)", "Honey", "Green Onion", "Sesame Seeds"],
    allergens: ["Soya", "Sesame"],
    prepMethods: [
      { method: "Microwave", instructions: "Heat for 3 min" },
      { method: "Oven bake", instructions: "350°F for 10–12 min" },
      { method: "Storage", instructions: "Keep refrigerated" },
    ],
  },
  {
    id: "meal_002",
    name: "Grass-Fed Beef Stir Fry",
    planType: "Lean Muscle",
    category: "meals",
    price: 16.99,
    calories: 580,
    protein: 45,
    carbs: 35,
    fat: 18,
    saturatedFat: 6.1,
    polyUnsaturatedFat: 1.8,
    fiber: 5.2,
    sugar: 7.4,
    cholesterol: 145,
    sodium: 820,
    netCarbs: 29.8,
    dietaryTags: ["GF", "DF", "NF"],
    imageUrl: mealImages[1],
    description: "Lean beef strips with mixed vegetables and savory sauce over cauliflower rice.",
    ingredients: ["Grass-Fed Beef", "Cauliflower Rice", "Bell Peppers", "Snap Peas", "Carrots", "Broccoli", "Coconut Aminos", "Garlic", "Ginger", "Sesame Oil", "Olive Oil", "Sea Salt", "Black Pepper"],
    allergens: ["Sesame"],
    prepMethods: [
      { method: "Microwave", instructions: "Heat for 3–4 min" },
      { method: "Oven bake", instructions: "375°F for 12–15 min" },
      { method: "Storage", instructions: "Keep refrigerated" },
    ],
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
    saturatedFat: 5.4,
    polyUnsaturatedFat: 8.2,
    fiber: 3.1,
    sugar: 2.8,
    cholesterol: 112,
    sodium: 610,
    netCarbs: 4.9,
    dietaryTags: ["GF", "DF", "NF", "SF"],
    imageUrl: mealImages[2],
    isNew: true,
    description: "Wild Atlantic salmon fillet with roasted asparagus and lemon herb butter.",
    ingredients: ["Wild Atlantic Salmon", "Asparagus", "Lemon", "Butter", "Fresh Dill", "Garlic", "Olive Oil", "Sea Salt", "Black Pepper", "Capers"],
    allergens: ["Fish", "Milk"],
    prepMethods: [
      { method: "Microwave", instructions: "Heat for 2–3 min" },
      { method: "Oven bake", instructions: "350°F for 8–10 min" },
      { method: "Storage", instructions: "Keep refrigerated" },
    ],
  },
  {
    id: "meal_004",
    name: "Turkey Meatballs & Zoodles",
    planType: "GLP-1 Support",
    category: "meals",
    price: 13.99,
    calories: 380,
    protein: 35,
    carbs: 18,
    fat: 14,
    saturatedFat: 3.2,
    polyUnsaturatedFat: 2.0,
    fiber: 4.8,
    sugar: 8.1,
    cholesterol: 98,
    sodium: 540,
    netCarbs: 13.2,
    dietaryTags: ["GF", "DF"],
    imageUrl: mealImages[3],
    description: "Lean turkey meatballs over zucchini noodles with marinara sauce.",
    ingredients: ["Ground Turkey", "Zucchini", "Tomatoes", "Garlic", "Fresh Basil", "Olive Oil", "Onion", "Italian Seasoning", "Sea Salt", "Black Pepper", "Parmesan (DF sub)"],
    allergens: ["Eggs"],
    prepMethods: [
      { method: "Microwave", instructions: "Heat for 3 min" },
      { method: "Oven bake", instructions: "350°F for 10–12 min" },
      { method: "Storage", instructions: "Keep refrigerated" },
    ],
  },
  {
    id: "meal_005",
    name: "Overnight Oats Supreme",
    planType: "Power",
    category: "breakfast",
    price: 9.99,
    calories: 340,
    protein: 18,
    carbs: 52,
    fat: 8,
    saturatedFat: 1.2,
    polyUnsaturatedFat: 2.5,
    fiber: 7.2,
    sugar: 14.5,
    cholesterol: 0,
    sodium: 120,
    netCarbs: 44.8,
    dietaryTags: ["GF", "V"],
    imageUrl: mealImages[4],
    description: "Rolled oats with chia seeds, almond milk, berries, and honey.",
    ingredients: ["Rolled Oats (GF)", "Chia Seeds", "Almond Milk", "Mixed Berries", "Honey", "Vanilla Extract", "Maple Syrup", "Cinnamon"],
    allergens: ["Tree Nuts"],
    prepMethods: [
      { method: "Ready to eat", instructions: "Serve cold or warm" },
      { method: "Microwave", instructions: "Heat for 1–2 min" },
      { method: "Storage", instructions: "Keep refrigerated" },
    ],
  },
  {
    id: "meal_006",
    name: "Egg White Frittata",
    planType: "Lean Muscle",
    category: "breakfast",
    price: 10.99,
    calories: 280,
    protein: 28,
    carbs: 12,
    fat: 10,
    saturatedFat: 2.1,
    polyUnsaturatedFat: 1.4,
    fiber: 2.8,
    sugar: 4.2,
    cholesterol: 20,
    sodium: 480,
    netCarbs: 9.2,
    dietaryTags: ["GF", "DF", "NF", "SF"],
    imageUrl: mealImages[5],
    isNew: true,
    description: "Fluffy egg white frittata with spinach, mushrooms, and feta cheese.",
    ingredients: ["Egg Whites", "Baby Spinach", "Cremini Mushrooms", "Feta Cheese (DF sub)", "Cherry Tomatoes", "Olive Oil", "Garlic", "Fresh Chives", "Sea Salt", "Black Pepper"],
    allergens: ["Eggs"],
    prepMethods: [
      { method: "Microwave", instructions: "Heat for 2 min" },
      { method: "Oven bake", instructions: "350°F for 8 min" },
      { method: "Storage", instructions: "Keep refrigerated" },
    ],
  },
  {
    id: "meal_007",
    name: "Chocolate Protein Shake",
    planType: "Pro Athlete",
    category: "shakes",
    price: 8.99,
    calories: 220,
    protein: 30,
    carbs: 18,
    fat: 4,
    saturatedFat: 1.0,
    polyUnsaturatedFat: 0.8,
    fiber: 3.5,
    sugar: 6.2,
    cholesterol: 55,
    sodium: 210,
    netCarbs: 14.5,
    dietaryTags: ["GF", "NF"],
    imageUrl: mealImages[6],
    description: "Rich chocolate whey protein shake with almond milk and banana.",
    ingredients: ["Whey Protein Isolate", "Almond Milk", "Banana", "Cocoa Powder", "Honey", "Vanilla Extract", "Ice"],
    allergens: ["Milk", "Soya"],
    prepMethods: [
      { method: "Shake & drink", instructions: "Shake well before serving" },
      { method: "Storage", instructions: "Keep refrigerated" },
      { method: "Best by", instructions: "Within 24 hours" },
    ],
  },
  {
    id: "meal_008",
    name: "Mixed Nut & Date Bar",
    planType: "Power",
    category: "snacks",
    price: 4.99,
    calories: 180,
    protein: 6,
    carbs: 22,
    fat: 9,
    saturatedFat: 1.5,
    polyUnsaturatedFat: 2.8,
    fiber: 3.0,
    sugar: 16.0,
    cholesterol: 0,
    sodium: 45,
    netCarbs: 19.0,
    dietaryTags: ["GF", "V"],
    imageUrl: mealImages[7],
    description: "Energy-packed bar with dates, almonds, cashews, and dark chocolate chips.",
    ingredients: ["Medjool Dates", "Almonds", "Cashews", "Dark Chocolate Chips", "Rolled Oats", "Coconut Oil", "Vanilla Extract", "Sea Salt"],
    allergens: ["Tree Nuts"],
    prepMethods: [
      { method: "Ready to eat", instructions: "No prep needed" },
      { method: "Storage", instructions: "Room temp up to 5 days" },
      { method: "Best by", instructions: "See packaging date" },
    ],
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
  // Easy
  { id: "ch_easy_1", level: "easy", levelLabel: "Easy", name: "2-Week Streak", description: "Complete 2 weeks without skipping", current: 2, target: 2, reward: "Free Breakfast", rewardType: "physical", status: "completed", points: 50 },
  { id: "ch_easy_2", level: "easy", levelLabel: "Easy", name: "Meal Rater", description: "Rate 4 meals", current: 3, target: 4, reward: "Free Wrap", rewardType: "physical", status: "active", points: 50, daysLeft: 7 },
  { id: "ch_easy_3", level: "easy", levelLabel: "Easy", name: "First Referral", description: "Refer your first friend who subscribes", current: 2, target: 1, reward: "$20 Store Credit", rewardType: "credit", status: "completed", points: 100 },
  // Medium
  { id: "ch_med_1", level: "medium", levelLabel: "Medium", name: "4-Week Consistent", description: "Complete 4 weeks without skipping", current: 2, target: 4, reward: "Free Power Bowl", rewardType: "physical", status: "active", points: 150 },
  { id: "ch_med_2", level: "medium", levelLabel: "Medium", name: "Weekly Reviewer", description: "Rate meals for 4 consecutive weeks", current: 1, target: 4, reward: "$10 Store Credit", rewardType: "credit", status: "active", points: 150, daysLeft: 21 },
  { id: "ch_med_3", level: "medium", levelLabel: "Medium", name: "Active Referrer", description: "Keep 1 referral active for 2 weeks", current: 0, target: 1, reward: "Free Shake", rewardType: "physical", status: "locked", points: 150 },
  // Hard
  { id: "ch_hard_1", level: "hard", levelLabel: "Hard", name: "Consistency King", description: "Complete 8 weeks without skipping", current: 6, target: 8, reward: "Premium Shaker", rewardType: "physical", status: "active", points: 300 },
  { id: "ch_hard_2", level: "hard", levelLabel: "Hard", name: "Community Builder", description: "8 weeks active + 3 referrals", current: 2, target: 3, reward: "$50 Store Credit", rewardType: "credit", status: "active", points: 300 },
  { id: "ch_hard_3", level: "hard", levelLabel: "Hard", name: "Gold Member", description: "Reach Gold membership tier", current: 0, target: 1, reward: "Lunch Bag", rewardType: "physical", status: "locked", points: 300 },
  // Premium
  { id: "ch_prem_1", level: "premium", levelLabel: "Premium", name: "12-Week Champion", description: "Stay active for 12 consecutive weeks", current: 6, target: 12, reward: "Limited Edition Sauce Kit", rewardType: "physical", status: "active", points: 500 },
  { id: "ch_prem_2", level: "premium", levelLabel: "Premium", name: "Top Referrer", description: "3 referrals active for 4+ weeks", current: 0, target: 3, reward: "$100 Store Credit", rewardType: "credit", status: "locked", points: 500 },
  { id: "ch_prem_3", level: "premium", levelLabel: "Premium", name: "Platinum Elite", description: "Reach Platinum membership tier", current: 0, target: 1, reward: "Limited Edition Item", rewardType: "physical", status: "locked", points: 500 },
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
  successfulReferrals: [
    { id: "ref_1", firstName: "Carlos", date: "2026-04-12" },
    { id: "ref_2", firstName: "Mia", date: "2026-03-28" },
  ],
};

export const mockLeaderboard = {
  allTime: [
    { rank: 1, name: "James T.", points: 2840, isMe: false },
    { rank: 2, name: "Priya R.", points: 2310, isMe: false },
    { rank: 3, name: "Lucas M.", points: 1890, isMe: false },
    { rank: 4, name: "Sarah J.", points: 1240, isMe: true },
    { rank: 5, name: "Omar K.", points: 1100, isMe: false },
    { rank: 6, name: "Nina C.", points: 980, isMe: false },
    { rank: 7, name: "Ethan B.", points: 850, isMe: false },
    { rank: 8, name: "Zoe W.", points: 720, isMe: false },
    { rank: 9, name: "Diego F.", points: 640, isMe: false },
    { rank: 10, name: "Ava L.", points: 510, isMe: false },
  ],
  thisMonth: [
    { rank: 1, name: "Sarah J.", points: 340, isMe: true },
    { rank: 2, name: "Priya R.", points: 290, isMe: false },
    { rank: 3, name: "Ethan B.", points: 210, isMe: false },
    { rank: 4, name: "Omar K.", points: 180, isMe: false },
    { rank: 5, name: "Nina C.", points: 150, isMe: false },
    { rank: 6, name: "Lucas M.", points: 120, isMe: false },
    { rank: 7, name: "Ava L.", points: 90, isMe: false },
    { rank: 8, name: "Diego F.", points: 80, isMe: false },
    { rank: 9, name: "James T.", points: 60, isMe: false },
    { rank: 10, name: "Zoe W.", points: 50, isMe: false },
  ],
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
