"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  Apple,
  ArrowLeft,
  Beef,
  Carrot,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Coffee,
  CookingPot,
  Clock3,
  Database,
  Egg,
  Fish,
  Home,
  Leaf,
  Menu,
  Milk,
  Plus,
  Tag,
  NotebookPen,
  Package,
  PenSquare,
  MoreHorizontal,
  Settings2,
  ShoppingBasket,
  Sparkles,
  Sprout,
  Users2,
  Trees,
  Wheat,
  X,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type View = "today" | "shopping" | "dacia" | "home" | "users" | "recipes";
type Category = "Produce" | "Dairy" | "Pantry" | "Home";
type IconKey =
  | "apple"
  | "carrot"
  | "milk"
  | "egg"
  | "coffee"
  | "fish"
  | "beef"
  | "package";

type FavoriteItem = {
  id: string;
  title: string;
  category: Category;
  icon: IconKey;
  isRecurring?: boolean;
};

type ItemState = {
  status: "shopping" | "storage";
  boughtAt: number | null;
  purchaseHistory: number[];
};

type DatabaseStatus = "idle" | "ready" | "schema-pending" | "error";
type WorkspaceStatus = "idle" | "ready" | "creating" | "error";
type SyncStatus = "local" | "loading" | "saving" | "synced" | "error";
type ShoppingItemRow = {
  id: string;
  title: string;
  category: string;
  icon: string;
  is_recurring: boolean;
  status: "shopping" | "storage" | null;
  bought_at: string | null;
};
type ShoppingPurchaseEventRow = {
  shopping_item_id: string;
  purchased_at: string;
};
type HomeTaskRow = {
  id: string;
  title: string;
  interval_days: number;
  completed_at: string | null;
  completed_by: string | null;
  completed_by_label: string | null;
  archived_at: string | null;
};
type HomeNoteRow = {
  id: string;
  category: string;
  note: string;
  archived_at: string | null;
};
type GardenTaskRow = {
  id: string;
  title: string;
  completed_at: string | null;
  completed_by: string | null;
  completed_by_label: string | null;
  created_by: string | null;
  created_by_label: string | null;
  archived_at: string | null;
};
type GardenPlantRow = {
  id: string;
  name: string;
  icon: string;
  planted_at: string;
  last_watered_at: string;
  watering_interval_days: number;
  note: string | null;
  archived_at: string | null;
};
type GardenNoteRow = {
  id: string;
  category: string;
  note: string;
  created_by: string | null;
  created_by_label: string | null;
  archived_at: string | null;
};
type GardenFridgeItemRow = {
  id: string;
  name: string;
  created_by: string | null;
  created_by_label: string | null;
};
type RecipeRow = {
  id: string;
  title: string;
  prep_time: string;
  servings: string;
  tags: string[];
  thumbnail_path: string | null;
  archived_at: string | null;
};
type RecipeIngredientRow = {
  recipe_id: string;
  item: string;
  amount: number | null;
  unit: string | null;
};
type RecipeStepRow = {
  recipe_id: string;
  text: string;
  step_time: string | null;
};
type RecipeMissingItemRow = {
  recipe_id: string;
  item: string;
};
type RecipeImageRow = {
  recipe_id: string;
  label: string | null;
  storage_path: string;
};

type PlantRecord = {
  id: string;
  name: string;
  plantedAt: number;
  lastWateredAt: number;
  wateringIntervalDays: number;
  note: string;
  icon: LucideIcon;
};
type GardenTask = {
  id: string;
  title: string;
  completedAt: number | null;
  completedByUserId: string | null;
  completedByLetter: string | null;
  createdByLetter: string | null;
};
type GardenNote = {
  id: string;
  category: string;
  note: string;
  createdByLetter: string | null;
};
type GardenFridgeItem = {
  id: string;
  name: string;
  createdByLetter: string | null;
};
type HomeRecurringTask = {
  id: string;
  title: string;
  intervalDays: number;
  completedAt: number | null;
  completedByUserId: string | null;
  completedByLetter: string | null;
};
type HomeNoteRecord = {
  id: string;
  category: string;
  note: string;
};
type HomePlantRecord = {
  id: string;
  name: string;
  room: string;
  lastWateredAt: number;
  wateringIntervalDays: number;
  note: string;
  icon: LucideIcon;
};
type RecipeRecord = {
  id: string;
  title: string;
  time: string;
  servings: string;
  tags: string[];
  missingItems: string[];
  thumbnailUrl: string | null;
  gallery: Array<{ label: string; url: string | null }>;
  ingredients: Array<{ item: string; amount: number; unit: string }>;
  steps: Array<{ text: string; time: string }>;
};
type RecipeIngredient = { item: string; amount: number; unit: string };
type RecipeStepDraft = { text: string; time: string };

function normalizeIngredient(ingredient: string | RecipeIngredient): RecipeIngredient {
  if (typeof ingredient !== "string") return ingredient;
  const name = ingredient.toLowerCase();
  if (name.includes("pasta")) return { item: ingredient, amount: 500, unit: "g" };
  if (name.includes("rice")) return { item: ingredient, amount: 250, unit: "g" };
  if (name.includes("tomato")) return { item: ingredient, amount: 400, unit: "g" };
  if (name.includes("olive oil")) return { item: ingredient, amount: 250, unit: "ml" };
  if (name.includes("soy sauce")) return { item: ingredient, amount: 150, unit: "ml" };
  if (name.includes("salt")) return { item: ingredient, amount: 1, unit: "tsp" };
  if (name.includes("pepper")) return { item: ingredient, amount: 1, unit: "tsp" };
  if (name.includes("butter")) return { item: ingredient, amount: 1, unit: "tbsp" };
  if (name.includes("garlic")) return { item: ingredient, amount: 2, unit: "cloves" };
  if (name.includes("egg")) return { item: ingredient, amount: 4, unit: "pcs" };
  return { item: ingredient, amount: 1, unit: "tbsp" };
}

function serializeRecipeIngredients(ingredients: RecipeIngredient[]) {
  return ingredients.map((ingredient) => `${ingredient.amount} ${ingredient.unit} ${ingredient.item}`).join("\n");
}

function parseRecipeIngredients(value: string): RecipeIngredient[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+(?:[.,]\d+)?)\s+([^\s]+)\s+(.+)$/);
      if (!match) return { item: line, amount: 1, unit: "x" };
      return {
        amount: Number(match[1].replace(",", ".")) || 1,
        unit: match[2] || "x",
        item: match[3].trim(),
      };
    });
}

function serializeRecipeSteps(steps: RecipeStepDraft[]) {
  return steps.map((step) => `${step.time} | ${step.text}`).join("\n");
}

function parseRecipeSteps(value: string): RecipeStepDraft[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [timePart, ...textParts] = line.split("|");
      if (textParts.length === 0) return { time: "5 min", text: line };
      return {
        time: timePart.trim() || "5 min",
        text: textParts.join("|").trim(),
      };
    });
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return fallback;
}

function formatRelativeWaterTime(timestamp: number, now: number) {
  const diffMs = Math.max(0, now - timestamp);
  const diffHours = Math.max(1, Math.floor(diffMs / (60 * 60 * 1000)));
  if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
}

const dayMs = 24 * 60 * 60 * 1000;
const seedNow = Date.now();
const plantIconOptions = [
  { value: "sprout", label: "Sprout" },
  { value: "leaf", label: "Leaf" },
  { value: "trees", label: "Trees" },
  { value: "wheat", label: "Wheat" },
] as const;
const plantIntervalOptions = [1, 2, 3, 5, 7, 10, 14];

function toDateInputValue(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

const initialPlants: PlantRecord[] = [
  {
    id: "tomatoes",
    name: "Tomatoes",
    plantedAt: seedNow - 32 * dayMs,
    lastWateredAt: seedNow - 1 * dayMs,
    wateringIntervalDays: 2,
    note: "Sunny spot, tie stems weekly",
    icon: Sprout,
  },
  {
    id: "cucumbers",
    name: "Cucumbers",
    plantedAt: seedNow - 24 * dayMs,
    lastWateredAt: seedNow - 2 * dayMs,
    wateringIntervalDays: 1,
    note: "Check leaves for mildew",
    icon: Leaf,
  },
  {
    id: "rosemary",
    name: "Rosemary",
    plantedAt: seedNow - 70 * dayMs,
    lastWateredAt: seedNow - 4 * dayMs,
    wateringIntervalDays: 5,
    note: "Low water, full sun",
    icon: Trees,
  },
  {
    id: "strawberries",
    name: "Strawberries",
    plantedAt: seedNow - 52 * dayMs,
    lastWateredAt: seedNow - 1 * dayMs,
    wateringIntervalDays: 2,
    note: "Harvest window active",
    icon: Wheat,
  },
];
const initialGardenTasks: GardenTask[] = [
  { id: "rain-barrel", title: "Refill rain barrel", completedAt: null, completedByUserId: null, completedByLetter: null, createdByLetter: null },
  { id: "trim-hedges", title: "Trim hedges around path", completedAt: null, completedByUserId: null, completedByLetter: null, createdByLetter: null },
  { id: "compost-bed", title: "Add compost to tomato bed", completedAt: null, completedByUserId: null, completedByLetter: null, createdByLetter: null },
  { id: "tool-corner", title: "Clean tool corner", completedAt: null, completedByUserId: null, completedByLetter: null, createdByLetter: null },
];
const initialGardenNotes: GardenNote[] = [
  {
    id: "supplies",
    category: "Supplies",
    note: "Buy new basil seeds and check drip hose connector before weekend.",
    createdByLetter: null,
  },
  {
    id: "watering",
    category: "Watering",
    note: "Tomatoes and cucumbers need early morning watering on hot days.",
    createdByLetter: null,
  },
  {
    id: "planning",
    category: "Planning",
    note: "Move mint to bigger pot and schedule slug-trap check this week.",
    createdByLetter: null,
  },
];
const initialHomeRecurringTasks: HomeRecurringTask[] = [
  { id: "hallway-bulb", title: "Replace hallway bulb", intervalDays: 0, completedAt: null, completedByUserId: null, completedByLetter: null },
  { id: "vacuum", title: "Vacuum living room", intervalDays: 7, completedAt: null, completedByUserId: null, completedByLetter: null },
  { id: "laundry", title: "Laundry and fold", intervalDays: 14, completedAt: null, completedByUserId: null, completedByLetter: null },
  { id: "bathroom", title: "Bathroom deep clean", intervalDays: 21, completedAt: null, completedByUserId: null, completedByLetter: null },
  { id: "fridge", title: "Fridge clean + check leftovers", intervalDays: 30, completedAt: null, completedByUserId: null, completedByLetter: null },
  { id: "windows", title: "Clean windows", intervalDays: 90, completedAt: null, completedByUserId: null, completedByLetter: null },
];
const initialHomeNotes: HomeNoteRecord[] = [
  { id: "home-maintenance", category: "Maintenance", note: "Call landlord about kitchen sink pressure." },
  { id: "home-supplies", category: "Supplies", note: "Need dishwasher tabs and bathroom cleaner." },
  { id: "home-reminder", category: "Reminder", note: "Change bed sheets every Sunday evening." },
];
const initialHomePlants: HomePlantRecord[] = [
  {
    id: "monstera-living-room",
    name: "Monstera",
    room: "Living Room",
    lastWateredAt: seedNow - 4 * dayMs,
    wateringIntervalDays: 7,
    note: "Rotate toward the window once a week.",
    icon: Leaf,
  },
  {
    id: "basil-kitchen",
    name: "Basil",
    room: "Kitchen",
    lastWateredAt: seedNow - 1 * dayMs,
    wateringIntervalDays: 2,
    note: "Keep the soil slightly moist.",
    icon: Sprout,
  },
  {
    id: "snake-plant-bedroom",
    name: "Snake Plant",
    room: "Bedroom",
    lastWateredAt: seedNow - 8 * dayMs,
    wateringIntervalDays: 14,
    note: "Do not overwater.",
    icon: Trees,
  },
];
const iconMap: Record<IconKey, LucideIcon> = {
  apple: Apple,
  carrot: Carrot,
  milk: Milk,
  egg: Egg,
  coffee: Coffee,
  fish: Fish,
  beef: Beef,
  package: Package,
};

const iconTone: Record<IconKey, string> = {
  apple: "bg-emerald-50 text-emerald-700 border-emerald-100",
  carrot: "bg-orange-50 text-orange-700 border-orange-100",
  milk: "bg-sky-50 text-sky-700 border-sky-100",
  egg: "bg-stone-50 text-stone-700 border-stone-200",
  coffee: "bg-yellow-50 text-yellow-800 border-yellow-100",
  fish: "bg-cyan-50 text-cyan-700 border-cyan-100",
  beef: "bg-red-50 text-red-700 border-red-100",
  package: "bg-slate-50 text-slate-700 border-slate-200",
};

const defaultFavorites: FavoriteItem[] = [
  { id: "apples", title: "Apples", category: "Produce", icon: "apple" },
  { id: "carrots", title: "Carrots", category: "Produce", icon: "carrot" },
  { id: "milk", title: "Milk", category: "Dairy", icon: "milk" },
  { id: "butter", title: "Butter", category: "Dairy", icon: "milk" },
  { id: "eggs", title: "Eggs", category: "Dairy", icon: "egg" },
  { id: "coffee", title: "Coffee", category: "Pantry", icon: "coffee" },
  { id: "olive-oil", title: "Olive oil", category: "Pantry", icon: "package" },
  { id: "fish", title: "Fish", category: "Pantry", icon: "fish" },
  { id: "steak", title: "Steak", category: "Pantry", icon: "beef" },
  { id: "trash-bags", title: "Trash bags", category: "Home", icon: "package" },
];

const recurringDefaults = ["milk", "butter", "olive-oil", "coffee"] as const;
const shoppingRealtimeTables = ["shopping_items", "shopping_purchase_events", "activity_events"] as const;
const homeRealtimeTables = ["home_tasks", "home_notes", "activity_events"] as const;
const daciaRealtimeTables = ["garden_tasks", "garden_plants", "garden_notes", "garden_fridge_items", "activity_events"] as const;
const recipeRealtimeTables = [
  "recipes",
  "recipe_ingredients",
  "recipe_steps",
  "recipe_missing_items",
  "recipe_images",
  "activity_events",
] as const;

const defaultStates: Record<string, ItemState> = {
  apples: { status: "shopping", boughtAt: null, purchaseHistory: [] },
  milk: {
    status: "storage",
    boughtAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    purchaseHistory: [
      Date.now() - 2 * 24 * 60 * 60 * 1000,
      Date.now() - 11 * 24 * 60 * 60 * 1000,
      Date.now() - 27 * 24 * 60 * 60 * 1000,
    ],
  },
  coffee: {
    status: "storage",
    boughtAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
    purchaseHistory: [
      Date.now() - 6 * 24 * 60 * 60 * 1000,
      Date.now() - 16 * 24 * 60 * 60 * 1000,
      Date.now() - 44 * 24 * 60 * 60 * 1000,
    ],
  },
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const normalizeShoppingTitle = (title: string) => title.trim().replace(/\s+/g, " ").toLowerCase();

const navItems: Array<{ label: string; view: View; icon: LucideIcon }> = [
  { label: "Today", view: "today", icon: Home },
  { label: "Shopping", view: "shopping", icon: ShoppingBasket },
  { label: "Dacia", view: "dacia", icon: Leaf },
  { label: "Home", view: "home", icon: NotebookPen },
  { label: "Recipes", view: "recipes", icon: CookingPot },
  { label: "Profile", view: "users", icon: Settings2 },
];
const mobilePrimaryNav: Array<{ label: string; view: View; icon: LucideIcon }> = [
  { label: "Today", view: "today", icon: Home },
  { label: "Shopping", view: "shopping", icon: ShoppingBasket },
  { label: "Dacia", view: "dacia", icon: Leaf },
  { label: "Home", view: "home", icon: NotebookPen },
  { label: "Recipes", view: "recipes", icon: CookingPot },
];

export default function HomePage() {
  const [{ client: supabaseClient, configError }] = useState<{
    client: SupabaseClient | null;
    configError: string | null;
  }>(() => {
    try {
      return { client: createSupabaseBrowserClient(), configError: null };
    } catch {
      return { client: null, configError: "Supabase is not configured." };
    }
  });
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(Boolean(supabaseClient));
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(configError);
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus>("idle");
  const [databaseMessage, setDatabaseMessage] = useState("Waiting for login");
  const [workspaceStatus, setWorkspaceStatus] = useState<WorkspaceStatus>("idle");
  const [workspaceMessage, setWorkspaceMessage] = useState("Workspace starts after database setup.");
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [shoppingSyncStatus, setShoppingSyncStatus] = useState<SyncStatus>("local");
  const [shoppingSyncMessage, setShoppingSyncMessage] = useState("Prototype data only");
  const [homeSyncStatus, setHomeSyncStatus] = useState<SyncStatus>("local");
  const [homeSyncMessage, setHomeSyncMessage] = useState("Prototype data only");
  const [daciaSyncStatus, setDaciaSyncStatus] = useState<SyncStatus>("local");
  const [daciaSyncMessage, setDaciaSyncMessage] = useState("Prototype data only");
  const [recipeSyncStatus, setRecipeSyncStatus] = useState<SyncStatus>("local");
  const [recipeSyncMessage, setRecipeSyncMessage] = useState("Prototype data only");
  const [activeView, setActiveView] = useState<View>("shopping");
  const [favorites, setFavorites] = useState<FavoriteItem[]>(defaultFavorites);
  const [states, setStates] = useState<Record<string, ItemState>>(defaultStates);
  const [browse] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [browseOpen, setBrowseOpen] = useState(false);
  const [pendingBuyConfirmId, setPendingBuyConfirmId] = useState<string | null>(null);
  const [pendingRestockConfirmId, setPendingRestockConfirmId] = useState<string | null>(null);
  const [pendingBrowseRemoveId, setPendingBrowseRemoveId] = useState<string | null>(null);
  const [plants, setPlants] = useState<PlantRecord[]>(initialPlants);
  const [archivedPlants, setArchivedPlants] = useState<PlantRecord[]>([]);
  const [gardenTasks, setGardenTasks] = useState<GardenTask[]>(initialGardenTasks);
  const [archivedGardenTasks, setArchivedGardenTasks] = useState<GardenTask[]>([]);
  const [fridgeItems, setFridgeItems] = useState<GardenFridgeItem[]>([]);
  const [gardenNotes, setGardenNotes] = useState<GardenNote[]>(initialGardenNotes);
  const [archivedGardenNotes, setArchivedGardenNotes] = useState<GardenNote[]>([]);
  const [donePlantIds, setDonePlantIds] = useState<string[]>([]);
  const [doneNoteIds, setDoneNoteIds] = useState<string[]>([]);
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [newPlantName, setNewPlantName] = useState("");
  const [newPlantIconKey, setNewPlantIconKey] = useState("sprout");
  const [newPlantPlantedDate, setNewPlantPlantedDate] = useState(toDateInputValue(seedNow));
  const [newPlantWateringInterval, setNewPlantWateringInterval] = useState("2");
  const [newPlantNote, setNewPlantNote] = useState("");
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  const [editingPlantName, setEditingPlantName] = useState("");
  const [editingPlantIconKey, setEditingPlantIconKey] = useState("sprout");
  const [editingPlantPlantedDate, setEditingPlantPlantedDate] = useState(toDateInputValue(seedNow));
  const [editingPlantWateringInterval, setEditingPlantWateringInterval] = useState("2");
  const [editingPlantNote, setEditingPlantNote] = useState("");
  const [showAddGardenTask, setShowAddGardenTask] = useState(false);
  const [newGardenTaskTitle, setNewGardenTaskTitle] = useState("");
  const [showAddFridgeItem, setShowAddFridgeItem] = useState(false);
  const [newFridgeItemName, setNewFridgeItemName] = useState("");
  const [showAddGardenNote, setShowAddGardenNote] = useState(false);
  const [newGardenNoteCategory, setNewGardenNoteCategory] = useState("Planning");
  const [newGardenNoteText, setNewGardenNoteText] = useState("");
  const [editingGardenTaskId, setEditingGardenTaskId] = useState<string | null>(null);
  const [editingGardenTaskTitle, setEditingGardenTaskTitle] = useState("");
  const [editingGardenNoteId, setEditingGardenNoteId] = useState<string | null>(null);
  const [editingGardenNoteCategory, setEditingGardenNoteCategory] = useState("");
  const [editingGardenNoteText, setEditingGardenNoteText] = useState("");
  const [homeRecurringTasks, setHomeRecurringTasks] = useState<HomeRecurringTask[]>(
    initialHomeRecurringTasks,
  );
  const [archivedHomeTasks, setArchivedHomeTasks] = useState<HomeRecurringTask[]>([]);
  const [timeNow, setTimeNow] = useState(seedNow);
  const [showAddHomeTask, setShowAddHomeTask] = useState(false);
  const [newHomeTaskTitle, setNewHomeTaskTitle] = useState("");
  const [newHomeTaskInterval, setNewHomeTaskInterval] = useState("7");
  const [collapsedHomeTaskGroups, setCollapsedHomeTaskGroups] = useState<number[]>([]);
  const [homePlants, setHomePlants] = useState<HomePlantRecord[]>(initialHomePlants);
  const [homeNotes, setHomeNotes] = useState<HomeNoteRecord[]>(initialHomeNotes);
  const [showAddHomeNote, setShowAddHomeNote] = useState(false);
  const [newHomeNoteCategory, setNewHomeNoteCategory] = useState("General");
  const [newHomeNoteText, setNewHomeNoteText] = useState("");
  const [editingHomeNoteId, setEditingHomeNoteId] = useState<string | null>(null);
  const [editingHomeNoteCategory, setEditingHomeNoteCategory] = useState("");
  const [editingHomeNoteText, setEditingHomeNoteText] = useState("");
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [quickCaptureType, setQuickCaptureType] = useState<"task" | "note">("task");
  const [quickCaptureText, setQuickCaptureText] = useState("");
  const [recipes, setRecipes] = useState<RecipeRecord[]>([]);
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);
  const [isRecipeEditing, setIsRecipeEditing] = useState(false);
  const [recipeEditorId, setRecipeEditorId] = useState<string | null>(null);
  const [recipeTitleInput, setRecipeTitleInput] = useState("");
  const [recipeTimeInput, setRecipeTimeInput] = useState("");
  const [recipeServingsInput, setRecipeServingsInput] = useState("");
  const [recipeTagsInput, setRecipeTagsInput] = useState("");
  const [recipeIngredientsInput, setRecipeIngredientsInput] = useState("");
  const [recipeStepsInput, setRecipeStepsInput] = useState("");
  const [recipeMissingItemsInput, setRecipeMissingItemsInput] = useState("");
  const [pendingMissingPillKey, setPendingMissingPillKey] = useState<string | null>(null);
  const [addedMissingPillKeys, setAddedMissingPillKeys] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    if (!supabaseClient) return;

    supabaseClient.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setAuthError(error.message);
        }
        setAuthUser(data.session?.user ?? null);
        setAuthLoading(false);
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        setAuthError(getErrorMessage(error, "Could not check your session."));
        setAuthLoading(false);
      });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabaseClient]);

  useEffect(() => {
    if (!supabaseClient || !authUser) return;

    const client = supabaseClient;
    let mounted = true;

    async function checkDatabase() {
      try {
        const { error } = await client.from("profiles").select("id", { count: "exact", head: true });

        if (!mounted) return;

        if (!error) {
          setDatabaseStatus("ready");
          setDatabaseMessage("Auth and database are reachable.");
          return;
        }

        if (error.code === "42P01" || error.message.toLowerCase().includes("does not exist")) {
          setDatabaseStatus("schema-pending");
          setDatabaseMessage("Auth works. Database migration still needs to be applied.");
          return;
        }

        setDatabaseStatus("error");
        setDatabaseMessage(error.message);
      } catch (error) {
        if (!mounted) return;
        setDatabaseStatus("error");
        setDatabaseMessage(getErrorMessage(error, "Database check failed."));
      }
    }

    void checkDatabase();

    return () => {
      mounted = false;
    };
  }, [authUser, supabaseClient]);

  useEffect(() => {
    if (!supabaseClient || !authUser || databaseStatus !== "ready") return;

    const client = supabaseClient;
    const user = authUser;
    let mounted = true;

    async function ensureWorkspace() {
      const displayName = user.email?.split("@")[0] || "Owner";

      const { data: workspaceId, error } = await client.rpc("ensure_owner_workspace", {
        workspace_name: "Famlify Home",
        profile_display_name: displayName,
      });

      if (error) throw error;
      return workspaceId as string;
    }

    ensureWorkspace()
      .then((workspaceId) => {
        if (!mounted || !workspaceId) return;
        setActiveWorkspaceId(workspaceId);
        setWorkspaceStatus("ready");
        setWorkspaceMessage("Private owner workspace is ready.");
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        setWorkspaceStatus("error");
        setWorkspaceMessage(getErrorMessage(error, "Workspace setup failed."));
      });

    return () => {
      mounted = false;
    };
  }, [authUser, databaseStatus, supabaseClient]);

  useEffect(() => {
    if (!supabaseClient || !authUser || databaseStatus !== "ready") return;

    const client = supabaseClient;
    const displayName = authUser.email?.split("@")[0]?.trim();
    if (!displayName) return;

    void client.from("profiles").upsert(
      {
        id: authUser.id,
        display_name: displayName,
      },
      { onConflict: "id" },
    );
  }, [authUser, databaseStatus, supabaseClient]);

  useEffect(() => {
    if (!pendingBuyConfirmId) return;
    const timer = window.setTimeout(() => setPendingBuyConfirmId(null), 1800);
    return () => window.clearTimeout(timer);
  }, [pendingBuyConfirmId]);

  useEffect(() => {
    if (!pendingRestockConfirmId) return;
    const timer = window.setTimeout(() => setPendingRestockConfirmId(null), 1800);
    return () => window.clearTimeout(timer);
  }, [pendingRestockConfirmId]);

  useEffect(() => {
    if (!pendingBrowseRemoveId) return;
    const timer = window.setTimeout(() => setPendingBrowseRemoveId(null), 1800);
    return () => window.clearTimeout(timer);
  }, [pendingBrowseRemoveId]);

  const logActivity = useCallback(async (
    action: "created" | "updated" | "checked" | "restocked" | "archived" | "deleted",
    entityTable: string,
    entityId: string | null,
    label: string,
    metadata: Record<string, unknown> = {},
  ) => {
    if (!supabaseClient || !authUser || !activeWorkspaceId) return;

    await supabaseClient.from("activity_events").insert({
      workspace_id: activeWorkspaceId,
      actor_id: authUser.id,
      action,
      entity_table: entityTable,
      entity_id: entityId,
      label,
      metadata,
    });
  }, [activeWorkspaceId, authUser, supabaseClient]);

  const rowToFavorite = useCallback((item: ShoppingItemRow): FavoriteItem => {
    const allowedCategories: Category[] = ["Produce", "Dairy", "Pantry", "Home"];
    return {
      id: item.id,
      title: item.title,
      category: allowedCategories.includes(item.category as Category) ? (item.category as Category) : "Pantry",
      icon: item.icon in iconMap ? (item.icon as IconKey) : "package",
      isRecurring: item.is_recurring,
    };
  }, []);

  const ensureShoppingItem = useCallback(async (title: string) => {
    if (!supabaseClient || !activeWorkspaceId || !authUser) return null;

    const cleanedTitle = title.trim().replace(/\s+/g, " ");
    const normalizedTitle = normalizeShoppingTitle(cleanedTitle);
    if (!cleanedTitle) return null;

    const { data: existingRows, error: existingError } = await supabaseClient
      .from("shopping_items")
      .select("id,title,category,icon,is_recurring,status,bought_at")
      .eq("workspace_id", activeWorkspaceId)
      .ilike("title", cleanedTitle)
      .is("archived_at", null)
      .limit(1);

    if (existingError) throw existingError;
    const existingRow = existingRows?.find((row) => normalizeShoppingTitle(row.title) === normalizedTitle);
    if (existingRow) return rowToFavorite(existingRow as ShoppingItemRow);

    const { data: createdRow, error: createError } = await supabaseClient
      .from("shopping_items")
      .insert({
        workspace_id: activeWorkspaceId,
        title: cleanedTitle,
        category: "Pantry",
        icon: "package",
        status: "shopping",
        created_by: authUser.id,
      })
      .select("id,title,category,icon,is_recurring,status,bought_at")
      .single();

    if (createError) throw createError;
    return rowToFavorite(createdRow as ShoppingItemRow);
  }, [activeWorkspaceId, authUser, rowToFavorite, supabaseClient]);

  const applyShoppingRows = useCallback((items: ShoppingItemRow[], events: ShoppingPurchaseEventRow[]) => {
    const historyByItem = events.reduce<Record<string, number[]>>((acc, event) => {
      acc[event.shopping_item_id] = acc[event.shopping_item_id] ?? [];
      acc[event.shopping_item_id].push(new Date(event.purchased_at).getTime());
      return acc;
    }, {});
    const uniqueItems = items.filter((item, index, source) => {
      const normalizedTitle = normalizeShoppingTitle(item.title);
      return source.findIndex((candidate) => normalizeShoppingTitle(candidate.title) === normalizedTitle) === index;
    });

    setFavorites(uniqueItems.map(rowToFavorite));

    setStates(
      uniqueItems.reduce<Record<string, ItemState>>((acc, item) => {
        if (item.status) {
          acc[item.id] = {
            status: item.status,
            boughtAt: item.bought_at ? new Date(item.bought_at).getTime() : null,
            purchaseHistory: historyByItem[item.id] ?? [],
          };
        }
        return acc;
      }, {}),
    );
  }, [rowToFavorite]);

  const applyHomeRows = useCallback((tasks: HomeTaskRow[], notes: HomeNoteRow[]) => {
    setHomeRecurringTasks(
      tasks
        .filter((task) => !task.archived_at)
        .map((task) => ({
          id: task.id,
          title: task.title,
          intervalDays: task.interval_days,
          completedAt: task.completed_at ? new Date(task.completed_at).getTime() : null,
          completedByUserId: task.completed_by,
          completedByLetter: task.completed_by_label,
        })),
    );
    setArchivedHomeTasks(
      tasks
        .filter((task) => task.archived_at)
        .map((task) => ({
          id: task.id,
          title: task.title,
          intervalDays: task.interval_days,
          completedAt: task.completed_at ? new Date(task.completed_at).getTime() : null,
          completedByUserId: task.completed_by,
          completedByLetter: task.completed_by_label,
        })),
    );
    setHomeNotes(
      notes
        .filter((note) => !note.archived_at)
        .map((note) => ({
          id: note.id,
          category: note.category,
          note: note.note,
        })),
    );
  }, []);

  const loadHomeFromSupabase = useCallback(async (options: { quiet?: boolean } = {}) => {
    if (!supabaseClient || !activeWorkspaceId) return;
    if (!options.quiet) {
      setHomeSyncStatus("loading");
      setHomeSyncMessage("Loading shared home data...");
    }

    try {
      const { data: taskRows, error: taskError } = await supabaseClient
        .from("home_tasks")
        .select("id,title,interval_days,completed_at,completed_by,completed_by_label,archived_at")
        .eq("workspace_id", activeWorkspaceId)
        .order("created_at", { ascending: true });

      if (taskError) throw taskError;

      if (!taskRows || taskRows.length === 0) {
        const seedRows = initialHomeRecurringTasks.map((task) => ({
          workspace_id: activeWorkspaceId,
          title: task.title,
          interval_days: task.intervalDays,
          completed_at: task.completedAt ? new Date(task.completedAt).toISOString() : null,
          completed_by: null,
          completed_by_label: null,
          created_by: authUser?.id ?? null,
        }));
        const { error: seedError } = await supabaseClient.from("home_tasks").insert(seedRows);
        if (seedError) throw seedError;
        await logActivity("created", "home_tasks", null, "Seeded home tasks", { count: seedRows.length });
      }

      const { data: noteRows, error: noteError } = await supabaseClient
        .from("home_notes")
        .select("id,category,note,archived_at")
        .eq("workspace_id", activeWorkspaceId)
        .order("created_at", { ascending: false });

      if (noteError) throw noteError;

      if (!noteRows || noteRows.length === 0) {
        const noteSeedRows = initialHomeNotes.map((note) => ({
          workspace_id: activeWorkspaceId,
          category: note.category,
          note: note.note,
          created_by: authUser?.id ?? null,
        }));
        const { error: noteSeedError } = await supabaseClient.from("home_notes").insert(noteSeedRows);
        if (noteSeedError) throw noteSeedError;
        await logActivity("created", "home_notes", null, "Seeded home notes", { count: noteSeedRows.length });
      }

      const [{ data: refreshedTasks, error: refreshedTaskError }, { data: refreshedNotes, error: refreshedNoteError }] =
        await Promise.all([
          supabaseClient
            .from("home_tasks")
            .select("id,title,interval_days,completed_at,completed_by,completed_by_label,archived_at")
            .eq("workspace_id", activeWorkspaceId)
            .order("created_at", { ascending: true }),
          supabaseClient
            .from("home_notes")
            .select("id,category,note,archived_at")
            .eq("workspace_id", activeWorkspaceId)
            .order("created_at", { ascending: false }),
        ]);

      if (refreshedTaskError) throw refreshedTaskError;
      if (refreshedNoteError) throw refreshedNoteError;

      applyHomeRows((refreshedTasks ?? []) as HomeTaskRow[], (refreshedNotes ?? []) as HomeNoteRow[]);
      setHomeSyncStatus("synced");
      setHomeSyncMessage("Shared home data saved and live.");
    } catch (error) {
      setHomeSyncStatus("error");
      setHomeSyncMessage(getErrorMessage(error, "Home sync failed."));
    }
  }, [activeWorkspaceId, applyHomeRows, authUser?.id, logActivity, supabaseClient]);

  const plantIconFromKey = useCallback((icon: string): LucideIcon => {
    if (icon === "leaf") return Leaf;
    if (icon === "trees") return Trees;
    if (icon === "wheat") return Wheat;
    return Sprout;
  }, []);

  const plantIconKey = useCallback((icon: LucideIcon): string => {
    if (icon === Leaf) return "leaf";
    if (icon === Trees) return "trees";
    if (icon === Wheat) return "wheat";
    return "sprout";
  }, []);

  const applyDaciaRows = useCallback((tasks: GardenTaskRow[], plantRows: GardenPlantRow[], notes: GardenNoteRow[], fridgeRows: GardenFridgeItemRow[]) => {
    setGardenTasks(
      tasks
        .filter((task) => !task.archived_at)
        .map((task) => ({
          id: task.id,
          title: task.title,
          completedAt: task.completed_at ? new Date(task.completed_at).getTime() : null,
          completedByUserId: task.completed_by,
          completedByLetter: task.completed_by_label,
          createdByLetter: task.created_by_label,
        })),
    );
    setArchivedGardenTasks(
      tasks
        .filter((task) => task.archived_at)
        .map((task) => ({
          id: task.id,
          title: task.title,
          completedAt: task.completed_at ? new Date(task.completed_at).getTime() : null,
          completedByUserId: task.completed_by,
          completedByLetter: task.completed_by_label,
          createdByLetter: task.created_by_label,
        })),
    );
    setPlants(
      plantRows
        .filter((plant) => !plant.archived_at)
        .map((plant) => ({
          id: plant.id,
          name: plant.name,
          icon: plantIconFromKey(plant.icon),
          plantedAt: new Date(plant.planted_at).getTime(),
          lastWateredAt: new Date(plant.last_watered_at).getTime(),
          wateringIntervalDays: plant.watering_interval_days,
          note: plant.note ?? "",
        })),
    );
    setArchivedPlants(
      plantRows
        .filter((plant) => plant.archived_at)
        .map((plant) => ({
          id: plant.id,
          name: plant.name,
          icon: plantIconFromKey(plant.icon),
          plantedAt: new Date(plant.planted_at).getTime(),
          lastWateredAt: new Date(plant.last_watered_at).getTime(),
          wateringIntervalDays: plant.watering_interval_days,
          note: plant.note ?? "",
        })),
    );
    setGardenNotes(notes.filter((note) => !note.archived_at).map((note) => ({ id: note.id, category: note.category, note: note.note, createdByLetter: note.created_by_label })));
    setArchivedGardenNotes(notes.filter((note) => note.archived_at).map((note) => ({ id: note.id, category: note.category, note: note.note, createdByLetter: note.created_by_label })));
    setFridgeItems(
      fridgeRows.map((item) => ({
        id: item.id,
        name: item.name,
        createdByLetter: item.created_by_label,
      })),
    );
  }, [plantIconFromKey]);

  const loadDaciaFromSupabase = useCallback(async (options: { quiet?: boolean } = {}) => {
    if (!supabaseClient || !activeWorkspaceId) return;
    if (!options.quiet) {
      setDaciaSyncStatus("loading");
      setDaciaSyncMessage("Loading shared Dacia data...");
    }

    try {
      const [
        { data: taskRows, error: taskError },
        { data: plantRows, error: plantError },
        { data: noteRows, error: noteError },
        { data: fridgeRows, error: fridgeError },
      ] =
        await Promise.all([
          supabaseClient
            .from("garden_tasks")
            .select("id,title,completed_at,completed_by,completed_by_label,created_by,created_by_label,archived_at")
            .eq("workspace_id", activeWorkspaceId)
            .order("created_at", { ascending: true }),
          supabaseClient
            .from("garden_plants")
            .select("id,name,icon,planted_at,last_watered_at,watering_interval_days,note,archived_at")
            .eq("workspace_id", activeWorkspaceId)
            .order("created_at", { ascending: true }),
          supabaseClient
            .from("garden_notes")
            .select("id,category,note,created_by,created_by_label,archived_at")
            .eq("workspace_id", activeWorkspaceId)
            .order("created_at", { ascending: false }),
          supabaseClient
            .from("garden_fridge_items")
            .select("id,name,created_by,created_by_label")
            .eq("workspace_id", activeWorkspaceId)
            .order("created_at", { ascending: false }),
        ]);

      if (taskError) throw taskError;
      if (plantError) throw plantError;
      if (noteError) throw noteError;
      if (fridgeError) throw fridgeError;

      applyDaciaRows(
        (taskRows ?? []) as GardenTaskRow[],
        (plantRows ?? []) as GardenPlantRow[],
        (noteRows ?? []) as GardenNoteRow[],
        (fridgeRows ?? []) as GardenFridgeItemRow[],
      );
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage("Shared Dacia data saved and live.");
    } catch (error) {
      setDaciaSyncStatus("error");
      setDaciaSyncMessage(getErrorMessage(error, "Dacia sync failed."));
    }
  }, [activeWorkspaceId, applyDaciaRows, supabaseClient]);

  const applyRecipeRows = useCallback((
    recipeRows: RecipeRow[],
    ingredientRows: RecipeIngredientRow[],
    stepRows: RecipeStepRow[],
    missingRows: RecipeMissingItemRow[],
    imageRows: RecipeImageRow[],
  ) => {
    setRecipes(
      recipeRows
        .filter((recipe) => !recipe.archived_at)
        .map((recipe) => ({
          id: recipe.id,
          title: recipe.title,
          time: recipe.prep_time,
          servings: recipe.servings,
          tags: recipe.tags ?? [],
          missingItems: missingRows
            .filter((item) => item.recipe_id === recipe.id)
            .map((item) => item.item),
          thumbnailUrl: null,
          gallery: imageRows
            .filter((image) => image.recipe_id === recipe.id)
            .map((image) => ({ label: image.label ?? "Photo", url: null })),
          ingredients: ingredientRows
            .filter((ingredient) => ingredient.recipe_id === recipe.id)
            .map((ingredient) => ({
              item: ingredient.item,
              amount: Number(ingredient.amount ?? 1),
              unit: ingredient.unit ?? "x",
            })),
          steps: stepRows
            .filter((step) => step.recipe_id === recipe.id)
            .map((step) => ({
              text: step.text,
              time: step.step_time ?? "5 min",
            })),
        })),
    );
  }, []);

  const loadRecipesFromSupabase = useCallback(async (options: { quiet?: boolean } = {}) => {
    if (!supabaseClient || !activeWorkspaceId) return;
    if (!options.quiet) {
      setRecipeSyncStatus("loading");
      setRecipeSyncMessage("Loading shared recipes...");
    }

    try {
      const { error: recipeError } = await supabaseClient
        .from("recipes")
        .select("id,title,prep_time,servings,tags,thumbnail_path,archived_at")
        .eq("workspace_id", activeWorkspaceId)
        .order("created_at", { ascending: true });

      if (recipeError) throw recipeError;

      const [
        { data: refreshedRecipes, error: refreshedRecipeError },
        { data: ingredientRows, error: ingredientError },
        { data: stepRows, error: stepError },
        { data: missingRows, error: missingError },
        { data: imageRows, error: imageError },
      ] = await Promise.all([
        supabaseClient.from("recipes").select("id,title,prep_time,servings,tags,thumbnail_path,archived_at").eq("workspace_id", activeWorkspaceId).order("created_at", { ascending: true }),
        supabaseClient.from("recipe_ingredients").select("recipe_id,item,amount,unit").eq("workspace_id", activeWorkspaceId).order("sort_order", { ascending: true }),
        supabaseClient.from("recipe_steps").select("recipe_id,text,step_time").eq("workspace_id", activeWorkspaceId).order("sort_order", { ascending: true }),
        supabaseClient.from("recipe_missing_items").select("recipe_id,item").eq("workspace_id", activeWorkspaceId),
        supabaseClient.from("recipe_images").select("recipe_id,label,storage_path").eq("workspace_id", activeWorkspaceId).order("sort_order", { ascending: true }),
      ]);

      if (refreshedRecipeError) throw refreshedRecipeError;
      if (ingredientError) throw ingredientError;
      if (stepError) throw stepError;
      if (missingError) throw missingError;
      if (imageError) throw imageError;

      applyRecipeRows(
        (refreshedRecipes ?? []) as RecipeRow[],
        (ingredientRows ?? []) as RecipeIngredientRow[],
        (stepRows ?? []) as RecipeStepRow[],
        (missingRows ?? []) as RecipeMissingItemRow[],
        (imageRows ?? []) as RecipeImageRow[],
      );
      setRecipeSyncStatus("synced");
      setRecipeSyncMessage("Shared recipes saved and live.");
    } catch (error) {
      setRecipeSyncStatus("error");
      setRecipeSyncMessage(getErrorMessage(error, "Recipe sync failed."));
    }
  }, [activeWorkspaceId, applyRecipeRows, supabaseClient]);

  const loadShoppingFromSupabase = useCallback(async (options: { quiet?: boolean } = {}) => {
    if (!supabaseClient || !activeWorkspaceId) return;
    if (!options.quiet) {
      setShoppingSyncStatus("loading");
      setShoppingSyncMessage("Loading shared shopping data...");
    }

    try {
      const { data: itemRows, error: itemError } = await supabaseClient
        .from("shopping_items")
        .select("id,title,category,icon,is_recurring,status,bought_at")
        .eq("workspace_id", activeWorkspaceId)
        .is("archived_at", null)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (itemError) throw itemError;

      if (!itemRows || itemRows.length === 0) {
        const seedRows = defaultFavorites.map((item, index) => {
          const boughtAt = defaultStates[item.id]?.boughtAt ?? null;
          return {
          workspace_id: activeWorkspaceId,
          title: item.title,
          category: item.category,
          icon: item.icon,
          is_recurring: recurringDefaults.includes(item.id as (typeof recurringDefaults)[number]),
          status: defaultStates[item.id]?.status ?? null,
          bought_at: boughtAt ? new Date(boughtAt).toISOString() : null,
          sort_order: index,
          created_by: authUser?.id ?? null,
          };
        });

        const { data: seededRows, error: seedError } = await supabaseClient
          .from("shopping_items")
          .insert(seedRows)
          .select("id,title,category,icon,is_recurring,status,bought_at");
        if (seedError) throw seedError;
        await logActivity("created", "shopping_items", null, "Seeded shopping library", {
          count: seedRows.length,
        });
        applyShoppingRows((seededRows ?? []) as ShoppingItemRow[], []);
        setShoppingSyncStatus("synced");
        setShoppingSyncMessage("Shared shopping library created and live.");
        return;
      }

      const { data: eventRows, error: eventError } = await supabaseClient
        .from("shopping_purchase_events")
        .select("shopping_item_id,purchased_at")
        .eq("workspace_id", activeWorkspaceId)
        .order("purchased_at", { ascending: false });

      if (eventError) throw eventError;

      applyShoppingRows(itemRows as ShoppingItemRow[], (eventRows ?? []) as ShoppingPurchaseEventRow[]);
      setShoppingSyncStatus("synced");
      setShoppingSyncMessage("Shared shopping data saved and live.");
    } catch (error) {
      setShoppingSyncStatus("error");
      setShoppingSyncMessage(getErrorMessage(error, "Shopping sync failed."));
    }
  }, [activeWorkspaceId, applyShoppingRows, authUser?.id, logActivity, supabaseClient]);

  useEffect(() => {
    if (!supabaseClient || !activeWorkspaceId || databaseStatus !== "ready") return;
    const timer = window.setTimeout(() => {
      void loadShoppingFromSupabase();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activeWorkspaceId, databaseStatus, loadShoppingFromSupabase, supabaseClient]);

  useEffect(() => {
    if (!supabaseClient || !activeWorkspaceId || databaseStatus !== "ready") return;

    const channel = supabaseClient.channel(`shopping-sync:${activeWorkspaceId}`);
    for (const table of shoppingRealtimeTables) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `workspace_id=eq.${activeWorkspaceId}` },
        () => {
          setShoppingSyncStatus("loading");
          setShoppingSyncMessage("Live update received. Refreshing...");
          void loadShoppingFromSupabase({ quiet: true });
        },
      );
    }

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setShoppingSyncStatus("synced");
        setShoppingSyncMessage("Live shopping sync connected.");
      }
    });

    return () => {
      void supabaseClient.removeChannel(channel);
    };
  }, [activeWorkspaceId, databaseStatus, loadShoppingFromSupabase, supabaseClient]);

  useEffect(() => {
    if (!supabaseClient || !activeWorkspaceId || databaseStatus !== "ready") return;
    const timer = window.setTimeout(() => {
      void loadHomeFromSupabase();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activeWorkspaceId, databaseStatus, loadHomeFromSupabase, supabaseClient]);

  useEffect(() => {
    if (!supabaseClient || !activeWorkspaceId || databaseStatus !== "ready") return;

    const channel = supabaseClient.channel(`home-sync:${activeWorkspaceId}`);
    for (const table of homeRealtimeTables) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `workspace_id=eq.${activeWorkspaceId}` },
        () => {
          setHomeSyncStatus("loading");
          setHomeSyncMessage("Live home update received. Refreshing...");
          void loadHomeFromSupabase({ quiet: true });
        },
      );
    }

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setHomeSyncStatus("synced");
        setHomeSyncMessage("Live home sync connected.");
      }
    });

    return () => {
      void supabaseClient.removeChannel(channel);
    };
  }, [activeWorkspaceId, databaseStatus, loadHomeFromSupabase, supabaseClient]);

  useEffect(() => {
    if (!supabaseClient || !activeWorkspaceId || databaseStatus !== "ready") return;
    const timer = window.setTimeout(() => {
      void loadDaciaFromSupabase();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activeWorkspaceId, databaseStatus, loadDaciaFromSupabase, supabaseClient]);

  useEffect(() => {
    if (!supabaseClient || !activeWorkspaceId || databaseStatus !== "ready") return;

    const channel = supabaseClient.channel(`dacia-sync:${activeWorkspaceId}`);
    for (const table of daciaRealtimeTables) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `workspace_id=eq.${activeWorkspaceId}` },
        () => {
          setDaciaSyncStatus("loading");
          setDaciaSyncMessage("Live Dacia update received. Refreshing...");
          void loadDaciaFromSupabase({ quiet: true });
        },
      );
    }

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setDaciaSyncStatus("synced");
        setDaciaSyncMessage("Live Dacia sync connected.");
      }
    });

    return () => {
      void supabaseClient.removeChannel(channel);
    };
  }, [activeWorkspaceId, databaseStatus, loadDaciaFromSupabase, supabaseClient]);

  useEffect(() => {
    if (!supabaseClient || !activeWorkspaceId || databaseStatus !== "ready") return;
    const timer = window.setTimeout(() => {
      void loadRecipesFromSupabase();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activeWorkspaceId, databaseStatus, loadRecipesFromSupabase, supabaseClient]);

  useEffect(() => {
    if (!supabaseClient || !activeWorkspaceId || databaseStatus !== "ready") return;

    const channel = supabaseClient.channel(`recipe-sync:${activeWorkspaceId}`);
    for (const table of recipeRealtimeTables) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `workspace_id=eq.${activeWorkspaceId}` },
        () => {
          setRecipeSyncStatus("loading");
          setRecipeSyncMessage("Live recipe update received. Refreshing...");
          void loadRecipesFromSupabase({ quiet: true });
        },
      );
    }

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setRecipeSyncStatus("synced");
        setRecipeSyncMessage("Live recipe sync connected.");
      }
    });

    return () => {
      void supabaseClient.removeChannel(channel);
    };
  }, [activeWorkspaceId, databaseStatus, loadRecipesFromSupabase, supabaseClient]);

  useEffect(() => {
    if (!supabaseClient || !activeWorkspaceId || databaseStatus !== "ready") return;

    const refreshSharedData = () => {
      void loadShoppingFromSupabase({ quiet: true });
      void loadHomeFromSupabase({ quiet: true });
      void loadDaciaFromSupabase({ quiet: true });
      void loadRecipesFromSupabase({ quiet: true });
    };

    const timer = window.setInterval(refreshSharedData, 4000);
    return () => window.clearInterval(timer);
  }, [
    activeWorkspaceId,
    databaseStatus,
    loadDaciaFromSupabase,
    loadHomeFromSupabase,
    loadRecipesFromSupabase,
    loadShoppingFromSupabase,
    supabaseClient,
  ]);

  useEffect(() => {
    const timer = window.setInterval(() => setTimeNow(Date.now()), 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!pendingMissingPillKey) return;
    const timer = window.setTimeout(() => setPendingMissingPillKey(null), 1800);
    return () => window.clearTimeout(timer);
  }, [pendingMissingPillKey]);

  useEffect(() => {
    if (addedMissingPillKeys.length === 0) return;
    const timer = window.setTimeout(() => setAddedMissingPillKeys([]), 2200);
    return () => window.clearTimeout(timer);
  }, [addedMissingPillKeys]);

  const filteredFavorites = useMemo(() => {
    const needle = browse.trim().toLowerCase();
    if (!needle) return favorites;
    return favorites.filter((item) => item.title.toLowerCase().includes(needle));
  }, [browse, favorites]);

  const shoppingItems = favorites.filter((item) => states[item.id]?.status === "shopping");
  const storageItems = favorites.filter((item) => states[item.id]?.status === "storage");
  const recurringItems = favorites.filter(
    (item) => item.isRecurring || recurringDefaults.includes(item.id as (typeof recurringDefaults)[number]),
  );
  const boughtEvents = Object.values(states).reduce(
    (acc, entry) => acc + (entry.purchaseHistory?.length ?? 0),
    0,
  );
  const currentUserInitial = (authUser?.email?.trim().charAt(0) || "U").toUpperCase();
  const completedGardenTaskIds = gardenTasks.filter((task) => task.completedAt !== null).map((task) => task.id);
  const categories: Category[] = ["Produce", "Dairy", "Pantry", "Home"];
  const statsRows = [
    { label: "Week", maxDays: 7 },
    { label: "Month", maxDays: 30 },
    { label: "6 Months", maxDays: 180 },
  ];
  const purchasedItemsDetailed = favorites
    .map((item) => ({
      ...item,
      boughtAt: states[item.id]?.boughtAt ?? null,
      history: states[item.id]?.purchaseHistory ?? [],
    }))
    .filter((item) => item.history.length > 0)
    .sort((a, b) => (b.boughtAt ?? 0) - (a.boughtAt ?? 0));
  const homeDueTasks = homeRecurringTasks.filter((task) => {
    if (!task.completedAt) return true;
    if (task.intervalDays === 0) return false;
    return timeNow - task.completedAt >= task.intervalDays * dayMs;
  }).length;
  const homeDoneThisWeek = homeRecurringTasks.filter((task) => {
    if (!task.completedAt) return false;
    return timeNow - task.completedAt <= 7 * dayMs;
  }).length;
  const daciaWaterDue = plants.filter(
    (plant) => daysSince(plant.lastWateredAt) >= plant.wateringIntervalDays,
  ).length;
  const daciaOpenTasks = gardenTasks.length;
  const recipesMissingTotal = recipes.reduce(
    (acc, recipe) => acc + (recipe.missingItems?.length ?? 0),
    0,
  );
  const activeNavItem = navItems.find((item) => item.view === activeView) ?? navItems[0];
  const ActiveNavIcon = activeNavItem.icon;
  const dashboardModules = [
    {
      title: "Shopping",
      view: "shopping" as const,
      icon: ShoppingBasket,
      value: shoppingItems.length,
      label: "open items",
      tone: "from-emerald-500/20 via-lime-400/10 to-transparent",
      ring: "ring-emerald-500/20",
      dot: "bg-emerald-500",
      status: `${storageItems.length} in storage`,
      details: [
        `${shoppingItems.length} to buy right now`,
        `${recurringItems.length} recurring restock items`,
        "Recipe ingredients can be sent here",
      ],
    },
    {
      title: "Home",
      view: "home" as const,
      icon: Home,
      value: homeDueTasks,
      label: "tasks due",
      tone: "from-sky-500/20 via-cyan-400/10 to-transparent",
      ring: "ring-sky-500/20",
      dot: "bg-sky-500",
      status: `${homeDoneThisWeek} done this week`,
      details: [
        `${homeDueTasks} recurring tasks due`,
        `${archivedHomeTasks.length} tasks archived`,
        "Weekly, monthly, and one-time flows",
      ],
    },
    {
      title: "Dacia",
      view: "dacia" as const,
      icon: Leaf,
      value: daciaWaterDue,
      label: "plants need water",
      tone: "from-green-500/20 via-teal-400/10 to-transparent",
      ring: "ring-green-500/20",
      dot: "bg-green-500",
      status: `${plants.length} plants tracked`,
      details: [
        `${daciaOpenTasks} open garden tasks`,
        `${plants.length} active plants`,
        "Archive for done tasks, notes, plants",
      ],
    },
    {
      title: "Recipes",
      view: "recipes" as const,
      icon: CookingPot,
      value: recipes.length,
      label: "saved recipes",
      tone: "from-rose-500/20 via-orange-400/10 to-transparent",
      ring: "ring-rose-500/20",
      dot: "bg-rose-500",
      status: `${recipesMissingTotal} missing pills`,
      details: [
        "Ingredient amounts and step timers",
        "Photo strip inside recipe details",
        "Double-tap missing pills to add",
      ],
    },
    {
      title: "Profile",
      view: "users" as const,
      icon: Settings2,
      value: 2,
      label: "private users",
      tone: "from-violet-500/20 via-fuchsia-400/10 to-transparent",
      ring: "ring-violet-500/20",
      dot: "bg-violet-500",
      status: "Both owners",
      details: [
        "Logged-in profile prototype",
        "Supabase Auth active",
        "Private household workspace",
      ],
    },
  ];

  const databaseStatusCopy: Record<DatabaseStatus, { label: string; tone: string; dot: string }> = {
    idle: {
      label: "Checking",
      tone: "border-slate-500/15 bg-slate-50 text-slate-900",
      dot: "bg-slate-400",
    },
    ready: {
      label: "Connected",
      tone: "border-emerald-500/15 bg-emerald-50 text-emerald-900",
      dot: "bg-emerald-500",
    },
    "schema-pending": {
      label: "Schema pending",
      tone: "border-amber-500/20 bg-amber-50 text-amber-900",
      dot: "bg-amber-500",
    },
    error: {
      label: "Check needed",
      tone: "border-rose-500/20 bg-rose-50 text-rose-900",
      dot: "bg-rose-500",
    },
  };

  const workspaceStatusCopy: Record<WorkspaceStatus, { label: string; tone: string; dot: string }> = {
    idle: {
      label: "Waiting",
      tone: "border-slate-500/15 bg-slate-50 text-slate-900",
      dot: "bg-slate-400",
    },
    creating: {
      label: "Preparing",
      tone: "border-sky-500/15 bg-sky-50 text-sky-900",
      dot: "bg-sky-500",
    },
    ready: {
      label: "Ready",
      tone: "border-emerald-500/15 bg-emerald-50 text-emerald-900",
      dot: "bg-emerald-500",
    },
    error: {
      label: "Check needed",
      tone: "border-rose-500/20 bg-rose-50 text-rose-900",
      dot: "bg-rose-500",
    },
  };

  const shoppingSyncCopy: Record<SyncStatus, { label: string; tone: string; dot: string }> = {
    local: {
      label: "Local",
      tone: "border-slate-500/15 bg-slate-50 text-slate-900",
      dot: "bg-slate-400",
    },
    loading: {
      label: "Syncing",
      tone: "border-sky-500/15 bg-sky-50 text-sky-900",
      dot: "bg-sky-500",
    },
    saving: {
      label: "Saving",
      tone: "border-amber-500/20 bg-amber-50 text-amber-900",
      dot: "bg-amber-500",
    },
    synced: {
      label: "Saved",
      tone: "border-emerald-500/15 bg-emerald-50 text-emerald-900",
      dot: "bg-emerald-500",
    },
    error: {
      label: "Error",
      tone: "border-rose-500/20 bg-rose-50 text-rose-900",
      dot: "bg-rose-500",
    },
  };
  const globalSyncStatus: SyncStatus =
    databaseStatus === "error" || workspaceStatus === "error"
      ? "error"
      : databaseStatus === "schema-pending"
        ? "local"
        : databaseStatus === "ready" && workspaceStatus === "ready"
          ? shoppingSyncStatus === "error" || homeSyncStatus === "error"
            || daciaSyncStatus === "error" || recipeSyncStatus === "error"
            ? "error"
            : shoppingSyncStatus === "saving" || homeSyncStatus === "saving" || daciaSyncStatus === "saving" || recipeSyncStatus === "saving"
              ? "saving"
              : shoppingSyncStatus === "loading" || homeSyncStatus === "loading" || daciaSyncStatus === "loading" || recipeSyncStatus === "loading"
                ? "loading"
                : shoppingSyncStatus === "synced" && homeSyncStatus === "synced" && daciaSyncStatus === "synced" && recipeSyncStatus === "synced"
                  ? "synced"
                  : "local"
          : "loading";
  const globalSyncCopy = shoppingSyncCopy[globalSyncStatus];
  const globalSyncMessage =
    databaseStatus === "schema-pending"
      ? "Migration pending"
      : databaseStatus !== "ready"
        ? databaseMessage
        : workspaceStatus !== "ready"
          ? workspaceMessage
          : globalSyncStatus === "synced"
            ? "Shopping, Home, Dacia and Recipes are live."
            : recipeSyncStatus === "error" || recipeSyncStatus === "saving" || recipeSyncStatus === "loading"
              ? recipeSyncMessage
              : daciaSyncStatus === "error" || daciaSyncStatus === "saving" || daciaSyncStatus === "loading"
              ? daciaSyncMessage
              : homeSyncStatus === "error" || homeSyncStatus === "saving" || homeSyncStatus === "loading"
              ? homeSyncMessage
              : shoppingSyncMessage;

  async function addToShopping(item: FavoriteItem) {
    if (supabaseClient && activeWorkspaceId) {
      setShoppingSyncStatus("saving");
      setShoppingSyncMessage(`Saving ${item.title} to the shared list...`);
      let persistedItem: FavoriteItem | null = item;

      try {
        persistedItem = uuidPattern.test(item.id) ? item : await ensureShoppingItem(item.title);
      } catch (error) {
        setShoppingSyncStatus("error");
        setShoppingSyncMessage(getErrorMessage(error, `Could not prepare ${item.title} for sync.`));
        return;
      }

      if (!persistedItem) {
        setShoppingSyncStatus("error");
        setShoppingSyncMessage(`${item.title} could not be prepared for sync.`);
        return;
      }

      const { error } = await supabaseClient
        .from("shopping_items")
        .update({ status: "shopping", archived_at: null })
        .eq("id", persistedItem.id)
        .eq("workspace_id", activeWorkspaceId);

      if (error) {
        setShoppingSyncStatus("error");
        setShoppingSyncMessage(error.message);
        return;
      }

      await logActivity("updated", "shopping_items", persistedItem.id, `${persistedItem.title} added to shopping`);
      setShoppingSyncStatus("synced");
      setShoppingSyncMessage(`${persistedItem.title} saved to shopping.`);

      setFavorites((prev) => {
        const withoutDraft = prev.filter((favorite) => favorite.id !== item.id && favorite.id !== persistedItem.id);
        return [persistedItem, ...withoutDraft];
      });
      setStates((prev) => ({
        ...prev,
        [persistedItem.id]: {
          status: "shopping",
          boughtAt: prev[item.id]?.boughtAt ?? prev[persistedItem.id]?.boughtAt ?? null,
          purchaseHistory: prev[item.id]?.purchaseHistory ?? prev[persistedItem.id]?.purchaseHistory ?? [],
        },
      }));
      setPendingBrowseRemoveId(null);
      return;
    }

    setStates((prev) => ({
      ...prev,
      [item.id]: {
        status: "shopping",
        boughtAt: prev[item.id]?.boughtAt ?? null,
        purchaseHistory: prev[item.id]?.purchaseHistory ?? [],
      },
    }));
    setPendingBrowseRemoveId(null);
  }

  async function removeFromShopping(item: FavoriteItem) {
    if (supabaseClient && activeWorkspaceId) {
      setShoppingSyncStatus("saving");
      setShoppingSyncMessage(`Removing ${item.title} from the shared list...`);
      const { error } = await supabaseClient
        .from("shopping_items")
        .update({ status: null })
        .eq("id", item.id)
        .eq("workspace_id", activeWorkspaceId);

      if (error) {
        setShoppingSyncStatus("error");
        setShoppingSyncMessage(error.message);
        return;
      }

      await logActivity("updated", "shopping_items", item.id, `${item.title} removed from active list`);
      setShoppingSyncStatus("synced");
      setShoppingSyncMessage(`${item.title} removed.`);
    }

    setStates((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
    setPendingBrowseRemoveId(null);
  }

  async function archiveShoppingItem(item: FavoriteItem) {
    if (supabaseClient && activeWorkspaceId && uuidPattern.test(item.id)) {
      setShoppingSyncStatus("saving");
      setShoppingSyncMessage(`Removing ${item.title} from the shared library...`);
      const { error } = await supabaseClient
        .from("shopping_items")
        .update({ status: null, archived_at: new Date().toISOString() })
        .eq("id", item.id)
        .eq("workspace_id", activeWorkspaceId);

      if (error) {
        setShoppingSyncStatus("error");
        setShoppingSyncMessage(error.message);
        return;
      }

      await logActivity("archived", "shopping_items", item.id, `${item.title} removed from shopping library`);
      setShoppingSyncStatus("synced");
      setShoppingSyncMessage(`${item.title} removed from shopping items.`);
    }

    setFavorites((prev) => prev.filter((favorite) => favorite.id !== item.id));
    setStates((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
    setPendingBrowseRemoveId(null);
  }

  async function markBought(item: FavoriteItem) {
    const now = timeNow;
    if (supabaseClient && activeWorkspaceId && authUser) {
      const boughtAt = new Date(now).toISOString();
      setShoppingSyncStatus("saving");
      setShoppingSyncMessage(`Saving ${item.title} as bought...`);

      const { error: itemError } = await supabaseClient
        .from("shopping_items")
        .update({ status: "storage", bought_at: boughtAt })
        .eq("id", item.id)
        .eq("workspace_id", activeWorkspaceId);

      if (itemError) {
        setShoppingSyncStatus("error");
        setShoppingSyncMessage(itemError.message);
        return;
      }

      const { error: eventError } = await supabaseClient.from("shopping_purchase_events").insert({
        workspace_id: activeWorkspaceId,
        shopping_item_id: item.id,
        purchased_by: authUser.id,
        purchased_at: boughtAt,
      });

      if (eventError) {
        setShoppingSyncStatus("error");
        setShoppingSyncMessage(eventError.message);
        return;
      }

      await logActivity("checked", "shopping_items", item.id, `${item.title} bought`);
      setShoppingSyncStatus("synced");
      setShoppingSyncMessage(`${item.title} saved in storage.`);
    }

    setStates((prev) => ({
      ...prev,
      [item.id]: {
        status: "storage",
        boughtAt: now,
        purchaseHistory: [...(prev[item.id]?.purchaseHistory ?? []), now],
      },
    }));
    setPendingBuyConfirmId(null);
  }

  function handleShoppingCardClick(item: FavoriteItem) {
    if (pendingBuyConfirmId === item.id) {
      markBought(item);
      return;
    }
    setPendingBuyConfirmId(item.id);
  }

  async function moveBackToShopping(item: FavoriteItem) {
    if (supabaseClient && activeWorkspaceId) {
      setShoppingSyncStatus("saving");
      setShoppingSyncMessage(`Moving ${item.title} back to shopping...`);
      const { error } = await supabaseClient
        .from("shopping_items")
        .update({ status: "shopping" })
        .eq("id", item.id)
        .eq("workspace_id", activeWorkspaceId);

      if (error) {
        setShoppingSyncStatus("error");
        setShoppingSyncMessage(error.message);
        return;
      }

      await logActivity("restocked", "shopping_items", item.id, `${item.title} needs restock`);
      setShoppingSyncStatus("synced");
      setShoppingSyncMessage(`${item.title} moved back to shopping.`);
    }

    setStates((prev) => ({
      ...prev,
      [item.id]: {
        status: "shopping",
        boughtAt: prev[item.id]?.boughtAt ?? null,
        purchaseHistory: prev[item.id]?.purchaseHistory ?? [],
      },
    }));
    setPendingRestockConfirmId(null);
  }

  function handleStorageCardClick(item: FavoriteItem) {
    if (pendingRestockConfirmId === item.id) {
      moveBackToShopping(item);
      return;
    }
    setPendingRestockConfirmId(item.id);
  }

  function handleBrowseCardClick(item: FavoriteItem) {
    const status = states[item.id]?.status;
    if (status === "shopping") {
      if (pendingBrowseRemoveId === item.id) {
        removeFromShopping(item);
        return;
      }
      setPendingBrowseRemoveId(item.id);
      return;
    }
    addToShopping(item);
  }

  async function createFavorite() {
    const title = newTitle.trim();
    if (!title) return;
    const normalizedTitle = normalizeShoppingTitle(title);
    const existingFavorite = favorites.find((item) => normalizeShoppingTitle(item.title) === normalizedTitle);

    if (existingFavorite) {
      setShoppingSyncStatus("synced");
      setShoppingSyncMessage(`${existingFavorite.title} already exists in Shopping Items.`);
      setNewTitle("");
      return;
    }

    if (supabaseClient && activeWorkspaceId && authUser) {
      setShoppingSyncStatus("saving");
      setShoppingSyncMessage(`Saving ${title} as shared item...`);

      try {
        const favorite = await ensureShoppingItem(title);
        if (!favorite) {
          setShoppingSyncStatus("error");
          setShoppingSyncMessage(`${title} could not be created.`);
          return;
        }

        const { error } = await supabaseClient
          .from("shopping_items")
          .update({ status: "shopping", archived_at: null })
          .eq("id", favorite.id)
          .eq("workspace_id", activeWorkspaceId);

        if (error) throw error;

        await logActivity("created", "shopping_items", favorite.id, `${favorite.title} created`);
        setFavorites((prev) => {
          const withoutDuplicate = prev.filter(
            (item) => item.id !== favorite.id && item.title.toLowerCase() !== favorite.title.toLowerCase(),
          );
          return [favorite, ...withoutDuplicate];
        });
        setStates((prev) => ({
          ...prev,
          [favorite.id]: {
            status: "shopping",
            boughtAt: prev[favorite.id]?.boughtAt ?? null,
            purchaseHistory: prev[favorite.id]?.purchaseHistory ?? [],
          },
        }));
        setShoppingSyncStatus("synced");
        setShoppingSyncMessage(`${favorite.title} saved to shared shopping.`);
        setNewTitle("");
        return;
      } catch (error) {
        setShoppingSyncStatus("error");
        setShoppingSyncMessage(getErrorMessage(error, `Could not create ${title}.`));
        return;
      }
    }

    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (favorites.some((item) => item.id === id)) return;

    const favorite: FavoriteItem = {
      id,
      title,
      category: "Pantry",
      icon: "package",
    };

    setFavorites((prev) => [favorite, ...prev]);
    setStates((prev) => ({
      ...prev,
      [id]: { status: "shopping", boughtAt: null, purchaseHistory: [] },
    }));
    setNewTitle("");
  }

  async function waterPlantNow(plantId: string) {
    const plant = plants.find((item) => item.id === plantId);
    if (!plant) return;
    if (supabaseClient && activeWorkspaceId) {
      setDaciaSyncStatus("saving");
      setDaciaSyncMessage(`Saving watering for ${plant.name}...`);
      const { error } = await supabaseClient
        .from("garden_plants")
        .update({ last_watered_at: new Date(timeNow).toISOString() })
        .eq("id", plantId)
        .eq("workspace_id", activeWorkspaceId);
      if (error) {
        setDaciaSyncStatus("error");
        setDaciaSyncMessage(error.message);
        return;
      }
      await logActivity("updated", "garden_plants", plantId, `${plant.name} watered`);
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage(`${plant.name} watering saved.`);
    }
    setPlants((prev) =>
      prev.map((plant) =>
        plant.id === plantId ? { ...plant, lastWateredAt: timeNow } : plant,
      ),
    );
  }
  async function archivePlantsByIds(plantIds: string[]) {
    if (plantIds.length === 0) return;
    if (supabaseClient && activeWorkspaceId) {
      setDaciaSyncStatus("saving");
      setDaciaSyncMessage(`Archiving ${plantIds.length} plants...`);
      const { error } = await supabaseClient
        .from("garden_plants")
        .update({ archived_at: new Date(timeNow).toISOString() })
        .in("id", plantIds)
        .eq("workspace_id", activeWorkspaceId);
      if (error) {
        setDaciaSyncStatus("error");
        setDaciaSyncMessage(error.message);
        return;
      }
      await logActivity("archived", "garden_plants", null, "Archived garden plants", { count: plantIds.length });
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage(`${plantIds.length} plants archived.`);
    }
    setPlants((prev) => {
      const targetSet = new Set(plantIds);
      const moved = prev.filter((p) => targetSet.has(p.id));
      if (moved.length === 0) return prev;
      setArchivedPlants((a) => [...moved, ...a]);
      return prev.filter((p) => !targetSet.has(p.id));
    });
    setDonePlantIds([]);
  }
  async function deletePlant(plantId: string) {
    await archivePlantsByIds([plantId]);
    setPlants((prev) => prev.filter((p) => p.id !== plantId));
    setDonePlantIds((prev) => prev.filter((id) => id !== plantId));
  }
  async function restorePlant(plantId: string) {
    if (supabaseClient && activeWorkspaceId) {
      setDaciaSyncStatus("saving");
      setDaciaSyncMessage("Restoring plant...");
      const { error } = await supabaseClient
        .from("garden_plants")
        .update({ archived_at: null })
        .eq("id", plantId)
        .eq("workspace_id", activeWorkspaceId);
      if (error) {
        setDaciaSyncStatus("error");
        setDaciaSyncMessage(error.message);
        return;
      }
      await logActivity("updated", "garden_plants", plantId, "Restored garden plant");
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage("Plant restored.");
    }
    setArchivedPlants((prev) => {
      const target = prev.find((p) => p.id === plantId);
      if (!target) return prev;
      setPlants((a) => [target, ...a]);
      return prev.filter((p) => p.id !== plantId);
    });
  }

  async function deleteArchivedPlantsBulk() {
    if (archivedPlants.length === 0) return;
    const archivedPlantIds = archivedPlants.map((plant) => plant.id);

    if (supabaseClient && activeWorkspaceId) {
      setDaciaSyncStatus("saving");
      setDaciaSyncMessage(`Deleting ${archivedPlantIds.length} archived plants...`);
      const { error } = await supabaseClient
        .from("garden_plants")
        .delete()
        .in("id", archivedPlantIds)
        .eq("workspace_id", activeWorkspaceId);

      if (error) {
        setDaciaSyncStatus("error");
        setDaciaSyncMessage(error.message);
        return;
      }

      await logActivity("deleted", "garden_plants", null, "Deleted archived garden plants", {
        count: archivedPlantIds.length,
      });
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage(`${archivedPlantIds.length} archived plants deleted.`);
    }

    setArchivedPlants([]);
  }

  async function addPlant() {
    const name = newPlantName.trim();
    const wateringIntervalDays = Math.max(1, Number(newPlantWateringInterval) || 1);
    const note = newPlantNote.trim();
    const plantedAt = new Date(newPlantPlantedDate || toDateInputValue(timeNow)).getTime();
    if (!name) return;

    if (supabaseClient && activeWorkspaceId) {
      setDaciaSyncStatus("saving");
      setDaciaSyncMessage(`Saving ${name}...`);
      const { data, error } = await supabaseClient
        .from("garden_plants")
        .insert({
          workspace_id: activeWorkspaceId,
          name,
          icon: newPlantIconKey,
          planted_at: new Date(plantedAt).toISOString(),
          last_watered_at: new Date(timeNow).toISOString(),
          watering_interval_days: wateringIntervalDays,
          note: note || null,
        })
        .select("id")
        .single();

      if (error) {
        setDaciaSyncStatus("error");
        setDaciaSyncMessage(error.message);
        return;
      }

      await logActivity("created", "garden_plants", data.id as string, `${name} created`);
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage(`${name} saved.`);
      setNewPlantName("");
      setNewPlantIconKey("sprout");
      setNewPlantPlantedDate(toDateInputValue(timeNow));
      setNewPlantWateringInterval("2");
      setNewPlantNote("");
      setShowAddPlant(false);
      return;
    }

    setPlants((prev) => [
      {
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name,
        icon: plantIconFromKey(newPlantIconKey),
        plantedAt,
        lastWateredAt: timeNow,
        wateringIntervalDays,
        note,
      },
      ...prev,
    ]);
    setNewPlantName("");
    setNewPlantIconKey("sprout");
    setNewPlantPlantedDate(toDateInputValue(timeNow));
    setNewPlantWateringInterval("2");
    setNewPlantNote("");
    setShowAddPlant(false);
  }

  async function savePlantEdit() {
    const name = editingPlantName.trim();
    const wateringIntervalDays = Math.max(1, Number(editingPlantWateringInterval) || 1);
    const note = editingPlantNote.trim();
    const plantedAt = new Date(editingPlantPlantedDate || toDateInputValue(timeNow)).getTime();
    if (!editingPlantId || !name) return;

    if (supabaseClient && activeWorkspaceId) {
      setDaciaSyncStatus("saving");
      setDaciaSyncMessage(`Saving ${name}...`);
      const { error } = await supabaseClient
        .from("garden_plants")
        .update({
          name,
          icon: editingPlantIconKey,
          planted_at: new Date(plantedAt).toISOString(),
          watering_interval_days: wateringIntervalDays,
          note: note || null,
        })
        .eq("id", editingPlantId)
        .eq("workspace_id", activeWorkspaceId);

      if (error) {
        setDaciaSyncStatus("error");
        setDaciaSyncMessage(error.message);
        return;
      }

      await logActivity("updated", "garden_plants", editingPlantId, `${name} updated`);
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage(`${name} updated.`);
    }

    setPlants((prev) =>
      prev.map((plant) =>
        plant.id === editingPlantId
          ? {
              ...plant,
              name,
              icon: plantIconFromKey(editingPlantIconKey),
              plantedAt,
              wateringIntervalDays,
              note,
            }
          : plant,
      ),
    );
    setEditingPlantId(null);
    setEditingPlantName("");
    setEditingPlantIconKey("sprout");
    setEditingPlantPlantedDate(toDateInputValue(timeNow));
    setEditingPlantWateringInterval("2");
    setEditingPlantNote("");
  }
  async function archiveTasksByIds(taskIds: string[]) {
    if (taskIds.length === 0) return;
    if (supabaseClient && activeWorkspaceId) {
      setDaciaSyncStatus("saving");
      setDaciaSyncMessage(`Archiving ${taskIds.length} garden tasks...`);
      const { error } = await supabaseClient
        .from("garden_tasks")
        .update({ archived_at: new Date(timeNow).toISOString() })
        .in("id", taskIds)
        .eq("workspace_id", activeWorkspaceId);
      if (error) {
        setDaciaSyncStatus("error");
        setDaciaSyncMessage(error.message);
        return;
      }
      await logActivity("archived", "garden_tasks", null, "Archived garden tasks", { count: taskIds.length });
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage(`${taskIds.length} garden tasks archived.`);
    }
    setGardenTasks((prev) => {
      const targetSet = new Set(taskIds);
      const moved = prev.filter((t) => targetSet.has(t.id));
      if (moved.length === 0) return prev;
      setArchivedGardenTasks((a) => [...moved, ...a]);
      return prev.filter((t) => !targetSet.has(t.id));
    });
  }
  async function deleteTask(taskId: string) {
    await archiveTasksByIds([taskId]);
    setGardenTasks((prev) => prev.filter((t) => t.id !== taskId));
  }
  async function restoreTask(taskId: string) {
    if (supabaseClient && activeWorkspaceId) {
      setDaciaSyncStatus("saving");
      setDaciaSyncMessage("Restoring garden task...");
      const { error } = await supabaseClient
        .from("garden_tasks")
        .update({ archived_at: null })
        .eq("id", taskId)
        .eq("workspace_id", activeWorkspaceId);
      if (error) {
        setDaciaSyncStatus("error");
        setDaciaSyncMessage(error.message);
        return;
      }
      await logActivity("updated", "garden_tasks", taskId, "Restored garden task");
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage("Garden task restored.");
    }
    setArchivedGardenTasks((prev) => {
      const target = prev.find((t) => t.id === taskId);
      if (!target) return prev;
      setGardenTasks((a) => [{ ...target, completedAt: null, completedByUserId: null, completedByLetter: null }, ...a]);
      return prev.filter((t) => t.id !== taskId);
    });
  }

  async function deleteArchivedTasksBulk() {
    if (archivedGardenTasks.length === 0) return;
    const archivedTaskIds = archivedGardenTasks.map((task) => task.id);

    if (supabaseClient && activeWorkspaceId) {
      setDaciaSyncStatus("saving");
      setDaciaSyncMessage(`Deleting ${archivedTaskIds.length} archived garden tasks...`);
      const { error } = await supabaseClient
        .from("garden_tasks")
        .delete()
        .in("id", archivedTaskIds)
        .eq("workspace_id", activeWorkspaceId);

      if (error) {
        setDaciaSyncStatus("error");
        setDaciaSyncMessage(error.message);
        return;
      }

      await logActivity("deleted", "garden_tasks", null, "Deleted archived garden tasks", {
        count: archivedTaskIds.length,
      });
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage(`${archivedTaskIds.length} archived garden tasks deleted.`);
      void loadDaciaFromSupabase({ quiet: true });
    }

    setArchivedGardenTasks([]);
  }

  async function addFridgeItem() {
    const name = newFridgeItemName.trim();
    if (!name) return;

    const duplicateExists = fridgeItems.some((item) => item.name.trim().toLowerCase() === name.toLowerCase());
    if (duplicateExists) {
      setDaciaSyncStatus("error");
      setDaciaSyncMessage(`${name} is already in the fridge reminder.`);
      return;
    }

    if (supabaseClient && activeWorkspaceId && authUser) {
      setDaciaSyncStatus("saving");
      setDaciaSyncMessage(`Saving ${name}...`);
      const { data, error } = await supabaseClient
        .from("garden_fridge_items")
        .insert({
          workspace_id: activeWorkspaceId,
          name,
          created_by: authUser.id,
          created_by_label: currentUserInitial,
        })
        .select("id")
        .single();

      if (error) {
        setDaciaSyncStatus("error");
        setDaciaSyncMessage(error.message);
        return;
      }

      await logActivity("created", "garden_fridge_items", data.id as string, `${name} added to fridge`);
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage(`${name} saved.`);
      setFridgeItems((prev) => [{ id: data.id as string, name, createdByLetter: currentUserInitial }, ...prev]);
    }

    setNewFridgeItemName("");
    setShowAddFridgeItem(false);
  }

  async function removeFridgeItem(itemId: string) {
    const target = fridgeItems.find((item) => item.id === itemId);
    if (!target) return;

    if (supabaseClient && activeWorkspaceId) {
      setDaciaSyncStatus("saving");
      setDaciaSyncMessage(`Removing ${target.name}...`);
      const { error } = await supabaseClient
        .from("garden_fridge_items")
        .delete()
        .eq("id", itemId)
        .eq("workspace_id", activeWorkspaceId);

      if (error) {
        setDaciaSyncStatus("error");
        setDaciaSyncMessage(error.message);
        return;
      }

      await logActivity("deleted", "garden_fridge_items", itemId, `${target.name} removed from fridge`);
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage(`${target.name} removed.`);
    }

    setFridgeItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  async function addGardenTask() {
    const title = newGardenTaskTitle.trim();
    if (!title) return;

    if (supabaseClient && activeWorkspaceId && authUser) {
      setDaciaSyncStatus("saving");
      setDaciaSyncMessage(`Saving ${title}...`);
      const { data, error } = await supabaseClient
        .from("garden_tasks")
        .insert({
          workspace_id: activeWorkspaceId,
          title,
          created_by: authUser.id,
          created_by_label: currentUserInitial,
        })
        .select("id")
        .single();

      if (error) {
        setDaciaSyncStatus("error");
        setDaciaSyncMessage(error.message);
        return;
      }

      await logActivity("created", "garden_tasks", data.id as string, `${title} created`);
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage(`${title} saved.`);
      setNewGardenTaskTitle("");
      setShowAddGardenTask(false);
      return;
    }

    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    setGardenTasks((prev) => [
      {
        id,
        title,
        completedAt: null,
        completedByUserId: null,
        completedByLetter: null,
        createdByLetter: currentUserInitial,
      },
      ...prev,
    ]);
    setNewGardenTaskTitle("");
    setShowAddGardenTask(false);
  }

  async function saveGardenTaskEdit() {
    const title = editingGardenTaskTitle.trim();
    if (!editingGardenTaskId || !title) return;

    if (supabaseClient && activeWorkspaceId) {
      setDaciaSyncStatus("saving");
      setDaciaSyncMessage(`Saving ${title}...`);
      const { error } = await supabaseClient
        .from("garden_tasks")
        .update({ title })
        .eq("id", editingGardenTaskId)
        .eq("workspace_id", activeWorkspaceId);

      if (error) {
        setDaciaSyncStatus("error");
        setDaciaSyncMessage(error.message);
        return;
      }

      await logActivity("updated", "garden_tasks", editingGardenTaskId, `${title} updated`);
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage(`${title} updated.`);
    }

    setGardenTasks((prev) => prev.map((task) => (task.id === editingGardenTaskId ? { ...task, title } : task)));
    setEditingGardenTaskId(null);
    setEditingGardenTaskTitle("");
  }

  async function toggleGardenTaskDone(taskId: string) {
    const target = gardenTasks.find((task) => task.id === taskId);
    if (!target) return;
    const nextCompletedAt = target.completedAt ? null : new Date(timeNow).toISOString();
    const nextCompletedBy = target.completedAt ? null : authUser?.id ?? null;
    const nextCompletedByLetter = target.completedAt ? null : currentUserInitial;

    if (supabaseClient && activeWorkspaceId) {
      setDaciaSyncStatus("saving");
      setDaciaSyncMessage(`Saving ${target.title}...`);
      const { error } = await supabaseClient
        .from("garden_tasks")
        .update({
          completed_at: nextCompletedAt,
          completed_by: nextCompletedBy,
          completed_by_label: nextCompletedByLetter,
        })
        .eq("id", taskId)
        .eq("workspace_id", activeWorkspaceId);

      if (error) {
        setDaciaSyncStatus("error");
        setDaciaSyncMessage(error.message);
        return;
      }

      await logActivity(
        target.completedAt ? "updated" : "checked",
        "garden_tasks",
        taskId,
        `${target.title} ${target.completedAt ? "reopened" : "done"}`,
      );
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage(`${target.title} saved.`);
    }

    setGardenTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completedAt: target.completedAt ? null : timeNow,
              completedByUserId: target.completedAt ? null : authUser?.id ?? null,
              completedByLetter: target.completedAt ? null : currentUserInitial,
            }
          : task,
      ),
    );
  }
  async function archiveNotesByIds(noteIds: string[]) {
    if (noteIds.length === 0) return;
    if (supabaseClient && activeWorkspaceId) {
      setDaciaSyncStatus("saving");
      setDaciaSyncMessage(`Archiving ${noteIds.length} garden notes...`);
      const { error } = await supabaseClient
        .from("garden_notes")
        .update({ archived_at: new Date(timeNow).toISOString() })
        .in("id", noteIds)
        .eq("workspace_id", activeWorkspaceId);
      if (error) {
        setDaciaSyncStatus("error");
        setDaciaSyncMessage(error.message);
        return;
      }
      await logActivity("archived", "garden_notes", null, "Archived garden notes", { count: noteIds.length });
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage(`${noteIds.length} garden notes archived.`);
    }
    setGardenNotes((prev) => {
      const targetSet = new Set(noteIds);
      const moved = prev.filter((n) => targetSet.has(n.id));
      if (moved.length === 0) return prev;
      setArchivedGardenNotes((a) => [...moved, ...a]);
      return prev.filter((n) => !targetSet.has(n.id));
    });
    setDoneNoteIds([]);
  }

  async function addGardenNote() {
    const category = newGardenNoteCategory.trim();
    const note = newGardenNoteText.trim();
    if (!category || !note) return;

    if (supabaseClient && activeWorkspaceId && authUser) {
      setDaciaSyncStatus("saving");
      setDaciaSyncMessage("Saving garden note...");
      const { data, error } = await supabaseClient
        .from("garden_notes")
        .insert({
          workspace_id: activeWorkspaceId,
          category,
          note,
          created_by: authUser.id,
          created_by_label: currentUserInitial,
        })
        .select("id")
        .single();

      if (error) {
        setDaciaSyncStatus("error");
        setDaciaSyncMessage(error.message);
        return;
      }

      await logActivity("created", "garden_notes", data.id as string, `${category} note created`);
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage("Garden note saved.");
      setNewGardenNoteCategory("Planning");
      setNewGardenNoteText("");
      setShowAddGardenNote(false);
      return;
    }

    setGardenNotes((prev) => [{ id: `${Date.now()}`, category, note, createdByLetter: currentUserInitial }, ...prev]);
    setNewGardenNoteCategory("Planning");
    setNewGardenNoteText("");
    setShowAddGardenNote(false);
  }

  async function saveGardenNoteEdit() {
    const category = editingGardenNoteCategory.trim();
    const note = editingGardenNoteText.trim();
    if (!editingGardenNoteId || !category || !note) return;

    if (supabaseClient && activeWorkspaceId) {
      setDaciaSyncStatus("saving");
      setDaciaSyncMessage("Saving garden note...");
      const { error } = await supabaseClient
        .from("garden_notes")
        .update({ category, note })
        .eq("id", editingGardenNoteId)
        .eq("workspace_id", activeWorkspaceId);

      if (error) {
        setDaciaSyncStatus("error");
        setDaciaSyncMessage(error.message);
        return;
      }

      await logActivity("updated", "garden_notes", editingGardenNoteId, `${category} note updated`);
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage("Garden note updated.");
    }

    setGardenNotes((prev) =>
      prev.map((entry) => (entry.id === editingGardenNoteId ? { ...entry, category, note } : entry)),
    );
    setEditingGardenNoteId(null);
    setEditingGardenNoteCategory("");
    setEditingGardenNoteText("");
  }

  async function deleteNote(noteId: string) {
    await archiveNotesByIds([noteId]);
    setGardenNotes((prev) => prev.filter((n) => n.id !== noteId));
    setDoneNoteIds((prev) => prev.filter((id) => id !== noteId));
  }
  async function restoreNote(noteId: string) {
    if (supabaseClient && activeWorkspaceId) {
      setDaciaSyncStatus("saving");
      setDaciaSyncMessage("Restoring garden note...");
      const { error } = await supabaseClient
        .from("garden_notes")
        .update({ archived_at: null })
        .eq("id", noteId)
        .eq("workspace_id", activeWorkspaceId);
      if (error) {
        setDaciaSyncStatus("error");
        setDaciaSyncMessage(error.message);
        return;
      }
      await logActivity("updated", "garden_notes", noteId, "Restored garden note");
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage("Garden note restored.");
    }
    setArchivedGardenNotes((prev) => {
      const target = prev.find((n) => n.id === noteId);
      if (!target) return prev;
      setGardenNotes((a) => [target, ...a]);
      return prev.filter((n) => n.id !== noteId);
    });
  }

  async function deleteArchivedNotesBulk() {
    if (archivedGardenNotes.length === 0) return;
    const archivedNoteIds = archivedGardenNotes.map((note) => note.id);

    if (supabaseClient && activeWorkspaceId) {
      setDaciaSyncStatus("saving");
      setDaciaSyncMessage(`Deleting ${archivedNoteIds.length} archived notes...`);
      const { error } = await supabaseClient
        .from("garden_notes")
        .delete()
        .in("id", archivedNoteIds)
        .eq("workspace_id", activeWorkspaceId);

      if (error) {
        setDaciaSyncStatus("error");
        setDaciaSyncMessage(error.message);
        return;
      }

      await logActivity("deleted", "garden_notes", null, "Deleted archived garden notes", {
        count: archivedNoteIds.length,
      });
      setDaciaSyncStatus("synced");
      setDaciaSyncMessage(`${archivedNoteIds.length} archived notes deleted.`);
    }

    setArchivedGardenNotes([]);
  }

  function isRecurringTaskDone(task: HomeRecurringTask) {
    if (!task.completedAt) return false;
    if (task.intervalDays === 0) return true;
    return timeNow - task.completedAt < task.intervalDays * dayMs;
  }

  function recurringTaskDaysLeft(task: HomeRecurringTask) {
    if (!task.completedAt) return 0;
    const remaining = task.intervalDays - Math.floor((timeNow - task.completedAt) / dayMs);
    return Math.max(0, remaining);
  }

function recurringTaskIntervalLabel(intervalDays: number) {
  if (intervalDays === 0) return "one time";
  if (intervalDays === 1) return "daily";
  if (intervalDays === 2) return "every 2 days";
  if (intervalDays === 3) return "every 3 days";
  if (intervalDays === 7) return "weekly";
  if (intervalDays === 14) return "every 2 weeks";
  if (intervalDays === 21) return "every 3 weeks";
  if (intervalDays === 30) return "monthly";
  if (intervalDays === 90) return "every 3 months";
  if (intervalDays === 180) return "every 6 months";
  return `every ${intervalDays}d`;
}

  async function toggleRecurringTaskDone(taskId: string) {
    const target = homeRecurringTasks.find((task) => task.id === taskId);
    if (!target) return;
    const activeDone =
      target.completedAt !== null && timeNow - target.completedAt < target.intervalDays * dayMs;
    const nextCompletedByUserId = activeDone ? null : authUser?.id ?? null;
    const nextCompletedByLetter = activeDone ? null : currentUserInitial;

    if (supabaseClient && activeWorkspaceId && authUser) {
      setHomeSyncStatus("saving");
      setHomeSyncMessage(`Saving ${target.title}...`);
      const completedAt = activeDone ? null : new Date(timeNow).toISOString();
      const { error } = await supabaseClient
        .from("home_tasks")
        .update({
          completed_at: completedAt,
          completed_by: nextCompletedByUserId,
          completed_by_label: nextCompletedByLetter,
        })
        .eq("id", taskId)
        .eq("workspace_id", activeWorkspaceId);

      if (error) {
        setHomeSyncStatus("error");
        setHomeSyncMessage(error.message);
        return;
      }

      await logActivity(activeDone ? "updated" : "checked", "home_tasks", taskId, `${target.title} ${activeDone ? "reopened" : "done"}`);
      setHomeSyncStatus("synced");
      setHomeSyncMessage(`${target.title} saved.`);
    }

    setHomeRecurringTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          completedAt: activeDone ? null : timeNow,
          completedByUserId: nextCompletedByUserId,
          completedByLetter: nextCompletedByLetter,
        };
      }),
    );
  }

  async function addHomeRecurringTask() {
    const title = newHomeTaskTitle.trim();
    if (!title) return;
    const intervalDays = Number(newHomeTaskInterval);
    if (supabaseClient && activeWorkspaceId && authUser) {
      setHomeSyncStatus("saving");
      setHomeSyncMessage(`Saving ${title}...`);
      const { data, error } = await supabaseClient
        .from("home_tasks")
        .insert({
          workspace_id: activeWorkspaceId,
          title,
          interval_days: intervalDays,
          created_by: authUser.id,
        })
        .select("id")
        .single();

      if (error) {
        setHomeSyncStatus("error");
        setHomeSyncMessage(error.message);
        return;
      }

      await logActivity("created", "home_tasks", data.id as string, `${title} created`);
      setHomeSyncStatus("synced");
      setHomeSyncMessage(`${title} saved.`);
      setNewHomeTaskTitle("");
      setNewHomeTaskInterval("7");
      setShowAddHomeTask(false);
      return;
    }

    const id = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${timeNow}`;
      setHomeRecurringTasks((prev) => [
        ...prev,
        { id, title, intervalDays, completedAt: null, completedByUserId: null, completedByLetter: null },
      ]);
    setNewHomeTaskTitle("");
    setNewHomeTaskInterval("7");
    setShowAddHomeTask(false);
  }

  async function archiveCompletedHomeTasks() {
    const doneTasks = homeRecurringTasks.filter((task) => isRecurringTaskDone(task));
    if (doneTasks.length === 0) return;

    if (supabaseClient && activeWorkspaceId) {
      setHomeSyncStatus("saving");
      setHomeSyncMessage(`Archiving ${doneTasks.length} home tasks...`);
      const { error } = await supabaseClient
        .from("home_tasks")
        .update({ archived_at: new Date(timeNow).toISOString() })
        .in("id", doneTasks.map((task) => task.id))
        .eq("workspace_id", activeWorkspaceId);

      if (error) {
        setHomeSyncStatus("error");
        setHomeSyncMessage(error.message);
        return;
      }

      await logActivity("archived", "home_tasks", null, "Archived completed home tasks", {
        count: doneTasks.length,
      });
      setHomeSyncStatus("synced");
      setHomeSyncMessage(`${doneTasks.length} home tasks archived.`);
    }

    setHomeRecurringTasks((prev) => {
      const done = prev.filter((task) => isRecurringTaskDone(task));
      if (done.length === 0) return prev;
      setArchivedHomeTasks((existing) => [...done, ...existing]);
      return prev.filter((task) => !isRecurringTaskDone(task));
    });
  }

function inferTaskIntervalDays(text: string) {
  const t = text.toLowerCase();
  if (t.includes("daily") || t.includes("every day")) return 1;
  if (t.includes("every 2 day")) return 2;
  if (t.includes("every 3 day")) return 3;
  if (t.includes("6 month") || t.includes("six month")) return 180;
  if (t.includes("3 month")) return 90;
  if (t.includes("2 week")) return 14;
  if (t.includes("3 week")) return 21;
  if (t.includes("month")) return 30;
  if (t.includes("week")) return 7;
  if (t.includes("one time") || t.includes("once")) return 0;
  return 7;
}

  function inferNoteCategory(text: string) {
    const t = text.toLowerCase();
    if (t.includes("buy") || t.includes("stock") || t.includes("order")) return "Supplies";
    if (t.includes("repair") || t.includes("landlord") || t.includes("fix")) return "Maintenance";
    if (t.includes("remember") || t.includes("remind") || t.includes("sunday")) return "Reminder";
    return "General";
  }

  async function saveQuickCapture() {
    const text = quickCaptureText.trim();
    if (!text) return;
    if (quickCaptureType === "task") {
      const intervalDays = inferTaskIntervalDays(text);
      if (supabaseClient && activeWorkspaceId && authUser) {
        setHomeSyncStatus("saving");
        setHomeSyncMessage(`Saving ${text}...`);
        const { data, error } = await supabaseClient
          .from("home_tasks")
          .insert({
            workspace_id: activeWorkspaceId,
            title: text,
            interval_days: intervalDays,
            created_by: authUser.id,
          })
          .select("id")
          .single();

        if (error) {
          setHomeSyncStatus("error");
          setHomeSyncMessage(error.message);
          return;
        }

        await logActivity("created", "home_tasks", data.id as string, `${text} captured`);
        setHomeSyncStatus("synced");
        setHomeSyncMessage(`${text} saved.`);
        setQuickCaptureText("");
        setQuickCaptureOpen(false);
        return;
      }

      const id = `${text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${timeNow}`;
      setHomeRecurringTasks((prev) => [
        ...prev,
        { id, title: text, intervalDays, completedAt: null, completedByUserId: null, completedByLetter: null },
      ]);
    } else {
      const category = inferNoteCategory(text);
      if (supabaseClient && activeWorkspaceId && authUser) {
        setHomeSyncStatus("saving");
        setHomeSyncMessage(`Saving note...`);
        const { data, error } = await supabaseClient
          .from("home_notes")
          .insert({
            workspace_id: activeWorkspaceId,
            category,
            note: text,
            created_by: authUser.id,
          })
          .select("id")
          .single();

        if (error) {
          setHomeSyncStatus("error");
          setHomeSyncMessage(error.message);
          return;
        }

        await logActivity("created", "home_notes", data.id as string, `${category} note captured`);
        setHomeSyncStatus("synced");
        setHomeSyncMessage("Note saved.");
        setQuickCaptureText("");
        setQuickCaptureOpen(false);
        return;
      }

      const id = `note-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${timeNow}`;
      setHomeNotes((prev) => [{ id, category, note: text }, ...prev]);
    }
    setQuickCaptureText("");
    setQuickCaptureOpen(false);
  }

  async function addHomeNote() {
    const category = newHomeNoteCategory.trim() || "General";
    const note = newHomeNoteText.trim();
    if (!note) return;

    if (supabaseClient && activeWorkspaceId && authUser) {
      setHomeSyncStatus("saving");
      setHomeSyncMessage("Saving note...");
      const { data, error } = await supabaseClient
        .from("home_notes")
        .insert({
          workspace_id: activeWorkspaceId,
          category,
          note,
          created_by: authUser.id,
        })
        .select("id")
        .single();

      if (error) {
        setHomeSyncStatus("error");
        setHomeSyncMessage(error.message);
        return;
      }

      await logActivity("created", "home_notes", data.id as string, `${category} note created`);
      setHomeSyncStatus("synced");
      setHomeSyncMessage("Note saved.");
      setNewHomeNoteCategory("General");
      setNewHomeNoteText("");
      setShowAddHomeNote(false);
      return;
    }

    setHomeNotes((prev) => [{ id: `home-note-${Date.now()}`, category, note }, ...prev]);
    setNewHomeNoteCategory("General");
    setNewHomeNoteText("");
    setShowAddHomeNote(false);
  }

  function startEditHomeNote(note: HomeNoteRecord) {
    setEditingHomeNoteId(note.id);
    setEditingHomeNoteCategory(note.category);
    setEditingHomeNoteText(note.note);
    setShowAddHomeNote(false);
  }

  async function saveHomeNoteEdit() {
    const category = editingHomeNoteCategory.trim() || "General";
    const note = editingHomeNoteText.trim();
    if (!editingHomeNoteId || !note) return;

    if (supabaseClient && activeWorkspaceId) {
      setHomeSyncStatus("saving");
      setHomeSyncMessage("Updating note...");
      const { error } = await supabaseClient
        .from("home_notes")
        .update({ category, note })
        .eq("id", editingHomeNoteId)
        .eq("workspace_id", activeWorkspaceId);

      if (error) {
        setHomeSyncStatus("error");
        setHomeSyncMessage(error.message);
        return;
      }

      await logActivity("updated", "home_notes", editingHomeNoteId, `${category} note updated`);
      setHomeSyncStatus("synced");
      setHomeSyncMessage("Note updated.");
    }

    setHomeNotes((prev) =>
      prev.map((entry) => (entry.id === editingHomeNoteId ? { ...entry, category, note } : entry)),
    );
    setEditingHomeNoteId(null);
    setEditingHomeNoteCategory("");
    setEditingHomeNoteText("");
  }

  async function deleteHomeNote(noteId: string) {
    if (supabaseClient && activeWorkspaceId) {
      setHomeSyncStatus("saving");
      setHomeSyncMessage("Deleting note...");
      const { error } = await supabaseClient
        .from("home_notes")
        .delete()
        .eq("id", noteId)
        .eq("workspace_id", activeWorkspaceId);

      if (error) {
        setHomeSyncStatus("error");
        setHomeSyncMessage(error.message);
        return;
      }

      await logActivity("deleted", "home_notes", noteId, "Home note deleted");
      setHomeSyncStatus("synced");
      setHomeSyncMessage("Note deleted.");
    }

    setHomeNotes((prev) => prev.filter((entry) => entry.id !== noteId));
    if (editingHomeNoteId === noteId) {
      setEditingHomeNoteId(null);
      setEditingHomeNoteCategory("");
      setEditingHomeNoteText("");
    }
  }

  function toggleHomeTaskGroup(intervalDays: number) {
    setCollapsedHomeTaskGroups((prev) =>
      prev.includes(intervalDays)
        ? prev.filter((value) => value !== intervalDays)
        : [...prev, intervalDays],
    );
  }

  function waterHomePlantNow(plantId: string) {
    setHomePlants((prev) =>
      prev.map((plant) =>
        plant.id === plantId
          ? {
              ...plant,
              lastWateredAt: timeNow,
            }
          : plant,
      ),
    );
  }

  function resetRecipeEditor() {
    setIsRecipeEditing(false);
    setRecipeEditorId(null);
    setRecipeTitleInput("");
    setRecipeTimeInput("");
    setRecipeServingsInput("");
    setRecipeTagsInput("");
    setRecipeIngredientsInput("");
    setRecipeStepsInput("");
    setRecipeMissingItemsInput("");
  }

  function startCreateRecipe() {
    setActiveRecipeId("new");
    setIsRecipeEditing(true);
    setRecipeEditorId(null);
    setRecipeTitleInput("");
    setRecipeTimeInput("25 min");
    setRecipeServingsInput("2 servings");
    setRecipeTagsInput("");
    setRecipeIngredientsInput("");
    setRecipeStepsInput("");
    setRecipeMissingItemsInput("");
  }

  function startEditRecipe(recipe: RecipeRecord) {
    setActiveRecipeId(recipe.id);
    setIsRecipeEditing(true);
    setRecipeEditorId(recipe.id);
    setRecipeTitleInput(recipe.title);
    setRecipeTimeInput(recipe.time);
    setRecipeServingsInput(recipe.servings);
    setRecipeTagsInput(recipe.tags.join(", "));
    setRecipeIngredientsInput(serializeRecipeIngredients(recipe.ingredients));
    setRecipeStepsInput(serializeRecipeSteps(recipe.steps));
    setRecipeMissingItemsInput(recipe.missingItems.join(", "));
  }

  async function saveRecipeEditor() {
    const title = recipeTitleInput.trim();
    if (!title || !supabaseClient || !activeWorkspaceId || !authUser) return;

    const tags = recipeTagsInput.split(",").map((tag) => tag.trim()).filter(Boolean);
    const ingredients = parseRecipeIngredients(recipeIngredientsInput);
    const steps = parseRecipeSteps(recipeStepsInput);
    const missingItems = recipeMissingItemsInput.split(",").map((item) => item.trim()).filter(Boolean);

    setRecipeSyncStatus("saving");
    setRecipeSyncMessage(`${recipeEditorId ? "Updating" : "Saving"} recipe...`);

    try {
      let recipeId = recipeEditorId;

      if (recipeId) {
        const { error: recipeError } = await supabaseClient
          .from("recipes")
          .update({
            title,
            prep_time: recipeTimeInput.trim() || "25 min",
            servings: recipeServingsInput.trim() || "2 servings",
            tags,
          })
          .eq("id", recipeId)
          .eq("workspace_id", activeWorkspaceId);
        if (recipeError) throw recipeError;

        const [{ error: deleteIngredientsError }, { error: deleteStepsError }, { error: deleteMissingError }] =
          await Promise.all([
            supabaseClient.from("recipe_ingredients").delete().eq("recipe_id", recipeId).eq("workspace_id", activeWorkspaceId),
            supabaseClient.from("recipe_steps").delete().eq("recipe_id", recipeId).eq("workspace_id", activeWorkspaceId),
            supabaseClient.from("recipe_missing_items").delete().eq("recipe_id", recipeId).eq("workspace_id", activeWorkspaceId),
          ]);

        if (deleteIngredientsError) throw deleteIngredientsError;
        if (deleteStepsError) throw deleteStepsError;
        if (deleteMissingError) throw deleteMissingError;
      } else {
        const { data, error: recipeError } = await supabaseClient
          .from("recipes")
          .insert({
            workspace_id: activeWorkspaceId,
            title,
            prep_time: recipeTimeInput.trim() || "25 min",
            servings: recipeServingsInput.trim() || "2 servings",
            tags,
            created_by: authUser.id,
          })
          .select("id")
          .single();
        if (recipeError) throw recipeError;
        recipeId = data.id as string;
      }

      if (!recipeId) throw new Error("Recipe could not be saved.");

      if (ingredients.length > 0) {
        const { error } = await supabaseClient.from("recipe_ingredients").insert(
          ingredients.map((ingredient, index) => ({
            workspace_id: activeWorkspaceId,
            recipe_id: recipeId,
            item: ingredient.item,
            amount: ingredient.amount,
            unit: ingredient.unit,
            sort_order: index,
          })),
        );
        if (error) throw error;
      }

      if (steps.length > 0) {
        const { error } = await supabaseClient.from("recipe_steps").insert(
          steps.map((step, index) => ({
            workspace_id: activeWorkspaceId,
            recipe_id: recipeId,
            text: step.text,
            step_time: step.time,
            sort_order: index,
          })),
        );
        if (error) throw error;
      }

      if (missingItems.length > 0) {
        const { error } = await supabaseClient.from("recipe_missing_items").insert(
          missingItems.map((item) => ({
            workspace_id: activeWorkspaceId,
            recipe_id: recipeId,
            item,
          })),
        );
        if (error) throw error;
      }

      await logActivity(recipeEditorId ? "updated" : "created", "recipes", recipeId, `${title} ${recipeEditorId ? "updated" : "created"}`);
      setRecipeSyncStatus("synced");
      setRecipeSyncMessage(recipeEditorId ? "Recipe updated." : "Recipe saved.");
      setActiveRecipeId(recipeId);
      setIsRecipeEditing(false);
      setRecipeEditorId(recipeId);
      void loadRecipesFromSupabase({ quiet: true });
    } catch (error) {
      setRecipeSyncStatus("error");
      setRecipeSyncMessage(getErrorMessage(error, "Recipe save failed."));
    }
  }

  async function deleteRecipe(recipeId: string, title: string) {
    if (!supabaseClient || !activeWorkspaceId) {
      setRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId));
      if (activeRecipeId === recipeId) setActiveRecipeId(null);
      return;
    }

    setRecipeSyncStatus("saving");
    setRecipeSyncMessage(`Deleting ${title}...`);

    try {
      const { error } = await supabaseClient
        .from("recipes")
        .delete()
        .eq("id", recipeId)
        .eq("workspace_id", activeWorkspaceId);
      if (error) throw error;

      await logActivity("deleted", "recipes", recipeId, `${title} deleted`);
      setRecipeSyncStatus("synced");
      setRecipeSyncMessage("Recipe deleted.");
      setRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId));
      if (activeRecipeId === recipeId) {
        setActiveRecipeId(null);
        resetRecipeEditor();
      }
    } catch (error) {
      setRecipeSyncStatus("error");
      setRecipeSyncMessage(getErrorMessage(error, "Recipe delete failed."));
    }
  }

  function addRecipeIngredientsToShopping(recipe: RecipeRecord) {
    const normalizedIngredients: RecipeIngredient[] = recipe.ingredients.map((ingredient) =>
      normalizeIngredient(ingredient),
    );

    setFavorites((prevFavorites) => {
      const existingIds = new Set(prevFavorites.map((item) => item.id));
      const newItems: FavoriteItem[] = [];

      for (const ingredient of normalizedIngredients) {
        const id = ingredient.item.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        if (existingIds.has(id)) continue;
        existingIds.add(id);
        newItems.push({
          id,
          title: ingredient.item,
          category: "Pantry",
          icon: "package",
        });
      }

      return newItems.length > 0 ? [...prevFavorites, ...newItems] : prevFavorites;
    });

    setStates((prevStates) => {
      const nextStates = { ...prevStates };
      for (const ingredient of normalizedIngredients) {
        const id = ingredient.item.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const history = nextStates[id]?.purchaseHistory ?? [];
        nextStates[id] = {
          status: "shopping",
          boughtAt: nextStates[id]?.boughtAt ?? null,
          purchaseHistory: history,
        };
      }
      return nextStates;
    });
  }

  async function addIngredientToShopping(ingredientName: string) {
    const normalized = normalizeIngredient(ingredientName);
    const syncedItem =
      supabaseClient && activeWorkspaceId && authUser ? await ensureShoppingItem(normalized.item) : null;
    const id = syncedItem?.id ?? normalized.item.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const title = syncedItem?.title ?? normalized.item;
    const category = syncedItem?.category ?? "Pantry";
    const icon = syncedItem?.icon ?? "package";

    setFavorites((prevFavorites) => {
      if (prevFavorites.some((item) => item.id === id)) return prevFavorites;
      return [
        ...prevFavorites,
        {
          id,
          title,
          category,
          icon,
          isRecurring: syncedItem?.isRecurring,
        },
      ];
    });

    setStates((prevStates) => {
      const history = prevStates[id]?.purchaseHistory ?? [];
      return {
        ...prevStates,
        [id]: {
          status: "shopping",
          boughtAt: prevStates[id]?.boughtAt ?? null,
          purchaseHistory: history,
        },
      };
    });
  }

  async function handleMissingPillClick(recipeId: string, ingredientName: string) {
    const key = `${recipeId}:${ingredientName.toLowerCase()}`;
    if (pendingMissingPillKey === key) {
      if (supabaseClient && activeWorkspaceId) {
        setRecipeSyncStatus("saving");
        setRecipeSyncMessage(`Saving ${ingredientName} as handled...`);
        const { error } = await supabaseClient
          .from("recipe_missing_items")
          .delete()
          .eq("workspace_id", activeWorkspaceId)
          .eq("recipe_id", recipeId)
          .eq("item", ingredientName);

        if (error) {
          setRecipeSyncStatus("error");
          setRecipeSyncMessage(error.message);
          return;
        }

        await logActivity("updated", "recipe_missing_items", null, `${ingredientName} added from recipe`);
        setRecipeSyncStatus("synced");
        setRecipeSyncMessage(`${ingredientName} marked as added.`);
      }
      try {
        await addIngredientToShopping(ingredientName);
      } catch (error) {
        setRecipeSyncStatus("error");
        setRecipeSyncMessage(getErrorMessage(error, "Could not add ingredient to shopping."));
        return;
      }
      setPendingMissingPillKey(null);
      setAddedMissingPillKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe.id === recipeId
            ? { ...recipe, missingItems: recipe.missingItems.filter((item) => item !== ingredientName) }
            : recipe,
        ),
      );
      return;
    }
    setPendingMissingPillKey(key);
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabaseClient) {
      setAuthError("Supabase is not configured.");
      return;
    }

    setAuthError(null);
    setAuthLoading(true);

    const credentials = {
      email: authEmail.trim(),
      password: authPassword,
    };

    const { error } = await supabaseClient.auth.signInWithPassword(credentials);

    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
      return;
    }

    setAuthLoading(false);
  }

  async function handleSignOut() {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    setAuthUser(null);
    setDatabaseStatus("idle");
    setDatabaseMessage("Waiting for login");
    setWorkspaceStatus("idle");
    setWorkspaceMessage("Workspace starts after database setup.");
    setActiveWorkspaceId(null);
  }

  if (authLoading && !authUser) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(79,149,119,0.14),transparent_30rem),linear-gradient(180deg,#fbfaf7_0%,#f3f7f3_100%)] px-4 text-foreground">
        <Card className="w-full max-w-sm border-border/70 bg-card/90 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-600" />
            <p className="text-sm text-muted-foreground">Checking session...</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!authUser) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(79,149,119,0.14),transparent_30rem),linear-gradient(180deg,#fbfaf7_0%,#f3f7f3_100%)] px-4 py-8 text-foreground">
        <Card className="w-full max-w-md overflow-hidden border-border/70 bg-card/95 shadow-sm ring-1 ring-emerald-500/10">
          <CardHeader className="border-b border-border/60 bg-background/50">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-950 text-base font-semibold text-white">
              F
            </div>
            <CardTitle>Sign in to Famlify</CardTitle>
            <p className="text-sm text-muted-foreground">
              Private household workspace for the two co-owners.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <form className="space-y-3" onSubmit={handleAuthSubmit}>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="auth-email">
                  Email
                </label>
                <Input
                  id="auth-email"
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  autoComplete="email"
                  required
                  className="h-11 rounded-xl bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="auth-password">
                  Password
                </label>
                <Input
                  id="auth-password"
                  type="password"
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  minLength={6}
                  className="h-11 rounded-xl bg-background"
                />
              </div>
              {authError ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                  {authError}
                </div>
              ) : null}
              <Button type="submit" className="h-11 w-full rounded-xl" disabled={authLoading}>
                {authLoading ? "Please wait..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top_left,rgba(79,149,119,0.14),transparent_30rem),linear-gradient(180deg,#fbfaf7_0%,#f3f7f3_100%)] text-foreground">
      <div className="sticky top-0 z-30 border-b border-border/70 bg-background/90 shadow-sm backdrop-blur-xl xl:hidden">
        <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          {activeView === "recipes" && activeRecipeId ? (
            <button
              type="button"
              onClick={() => setActiveRecipeId(null)}
              className="flex min-w-0 items-center gap-3 rounded-lg py-2 text-left"
              aria-label="Back to recipes"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-900 shadow-sm">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold leading-tight">Back to recipes</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {recipes.find((recipe) => recipe.id === activeRecipeId)?.title ?? "Recipe details"}
                </span>
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveView("today")}
              className="flex min-w-0 items-center gap-3 rounded-lg py-2 text-left"
              aria-label="Open Today"
            >
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-950 text-sm font-semibold text-white shadow-sm">
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_35%)]" />
                <span className="relative">F</span>
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold leading-tight">Famlify</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ActiveNavIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {activeNavItem.label}
                </span>
              </span>
            </button>
          )}

          <div className="hidden items-center gap-1 md:flex">
            {mobilePrimaryNav.map((item) => (
              <Button
                key={item.view}
                type="button"
                size="sm"
                variant={activeView === item.view ? "default" : "ghost"}
                className="gap-2"
                onClick={() => setActiveView(item.view)}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`hidden h-9 max-w-[13rem] items-center gap-2 rounded-xl border px-3 text-xs shadow-sm sm:inline-flex ${globalSyncCopy.tone}`}
              title={globalSyncMessage}
              aria-label={`Sync status: ${globalSyncCopy.label}. ${globalSyncMessage}`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${globalSyncCopy.dot} ${
                  globalSyncStatus === "loading" || globalSyncStatus === "saving" ? "animate-pulse" : ""
                }`}
              />
              <span className="font-semibold">{globalSyncCopy.label}</span>
              <span className="hidden truncate text-muted-foreground lg:inline">{globalSyncMessage}</span>
            </div>
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-sm sm:hidden ${globalSyncCopy.tone}`}
              title={globalSyncMessage}
              aria-label={`Sync status: ${globalSyncCopy.label}. ${globalSyncMessage}`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${globalSyncCopy.dot} ${
                  globalSyncStatus === "loading" || globalSyncStatus === "saving" ? "animate-pulse" : ""
                }`}
              />
            </div>
            <Button
              type="button"
              size="icon"
              variant={activeView === "users" ? "default" : "outline"}
              className="h-9 w-9 shrink-0 rounded-xl bg-background/80"
              onClick={() => setActiveView("users")}
              aria-label={`Open Profile for ${authUser?.email ?? "current user"}`}
              title={authUser?.email ?? "Current user"}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-[11px] font-semibold text-emerald-900">
                {currentUserInitial}
              </span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="hidden h-9 rounded-xl bg-background/80 px-3 text-xs sm:inline-flex"
              onClick={handleSignOut}
            >
              Sign out
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 shrink-0 rounded-xl bg-background/80"
                >
                  <Menu className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {navItems.map((item) => (
                  <DropdownMenuItem
                    key={item.view}
                    onClick={() => setActiveView(item.view)}
                    className={
                      activeView === item.view
                        ? "bg-primary/10 text-primary focus:bg-primary/10 focus:text-primary"
                        : ""
                    }
                  >
                    <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/70">
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {activeView === item.view ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="mx-auto flex min-h-svh w-full max-w-7xl gap-6 px-4 pb-24 pt-4 sm:px-6 md:pb-8 md:pt-6 xl:px-8">
        <aside className="sticky top-6 hidden h-[calc(100svh-3rem)] w-64 shrink-0 flex-col justify-between rounded-lg border bg-card/80 p-4 shadow-sm backdrop-blur xl:flex">
          <div className="space-y-8">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="mt-4">
                <p className="text-xl font-semibold">Famlify</p>
                <p className="text-sm text-muted-foreground">Private home organizer</p>
              </div>
            </div>

            <nav className="space-y-1" aria-label="Main navigation">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant={activeView === item.view ? "default" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => setActiveView(item.view)}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Button>
              ))}
            </nav>

            <Card className="border-border/70 bg-background/70 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Users</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between rounded-md border border-border/70 bg-card px-2 py-1.5">
                  <span className="text-sm font-medium">You</span>
                  <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">Owner</Badge>
                </div>
                <div className="flex items-center justify-between rounded-md border border-border/70 bg-card px-2 py-1.5">
                  <span className="text-sm font-medium">Partner</span>
                  <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">Owner</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>

        <section className="w-full min-w-0">
          {activeView === "today" ? (
            <div className="space-y-5">
              <section className="relative overflow-hidden rounded-xl border border-border/70 bg-card/90 p-4 shadow-sm ring-1 ring-white/60 sm:p-5">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_36%)]" />
                <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl space-y-2">
                    <Badge className="border border-emerald-500/20 bg-emerald-50 text-emerald-900 hover:bg-emerald-50">
                      Magic UI dashboard schema
                    </Badge>
                    <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Today</h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                      One calm overview for Shopping, Home, Dacia, Recipes, and Profile.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-white/70 bg-background/75 p-1.5 shadow-[0_16px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:gap-2 lg:min-w-[23rem]">
                    <button
                      type="button"
                      onClick={() => setActiveView("shopping")}
                      className="group relative min-w-0 overflow-hidden rounded-lg border border-emerald-500/15 bg-emerald-50/70 px-2 py-2 text-left transition hover:-translate-y-0.5 hover:bg-emerald-50 sm:px-3 sm:py-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <ShoppingBasket className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                        <span className="text-xl font-semibold leading-none text-emerald-950 tabular-nums">
                          <NumberTicker value={shoppingItems.length} />
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] font-medium uppercase tracking-normal text-emerald-900">
                        Shopping
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-emerald-900/70">
                        {storageItems.length} in storage
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView("home")}
                      className="group relative min-w-0 overflow-hidden rounded-lg border border-sky-500/15 bg-sky-50/70 px-2 py-2 text-left transition hover:-translate-y-0.5 hover:bg-sky-50 sm:px-3 sm:py-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Home className="h-4 w-4 text-sky-700" aria-hidden="true" />
                        <span className="text-xl font-semibold leading-none text-sky-950 tabular-nums">
                          <NumberTicker value={homeDueTasks} />
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] font-medium uppercase tracking-normal text-sky-900">
                        Home due
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-sky-900/70">
                        {homeDoneThisWeek} done this week
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView("dacia")}
                      className="group relative min-w-0 overflow-hidden rounded-lg border border-green-500/15 bg-green-50/70 px-2 py-2 text-left transition hover:-translate-y-0.5 hover:bg-green-50 sm:px-3 sm:py-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Leaf className="h-4 w-4 text-green-700" aria-hidden="true" />
                        <span className="text-xl font-semibold leading-none text-green-950 tabular-nums">
                          <NumberTicker value={daciaWaterDue} />
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] font-medium uppercase tracking-normal text-green-900">
                        Water
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-green-900/70">
                        {plants.length} plants tracked
                      </p>
                    </button>
                  </div>
                </div>
              </section>

              <section className="relative overflow-hidden rounded-xl border border-border/70 bg-card/90 p-4 shadow-sm ring-1 ring-sky-500/10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_36%)]" />
                <div className="relative mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="inline-flex items-center gap-2 text-sm font-semibold">
                      <Sparkles className="h-4 w-4 text-sky-700" aria-hidden="true" />
                      Household pulse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Fast signals from the whole prototype.
                    </p>
                  </div>
                  <Badge className="shrink-0 bg-sky-100 text-sky-950 hover:bg-sky-100">
                    Live overview
                  </Badge>
                </div>
                <div className="relative grid gap-2 md:grid-cols-3">
                  {[
                    {
                      label: "Priority",
                      value: homeDueTasks + shoppingItems.length + daciaWaterDue,
                      detail: "actions need attention",
                      icon: Sparkles,
                      tone: "border-amber-200/70 bg-amber-50/70 text-amber-950",
                      bar: "bg-amber-500",
                      width: Math.min(100, (homeDueTasks + shoppingItems.length + daciaWaterDue) * 12),
                    },
                    {
                      label: "Completed",
                      value: homeDoneThisWeek,
                      detail: "home tasks finished this week",
                      icon: CheckCircle2,
                      tone: "border-emerald-200/70 bg-emerald-50/70 text-emerald-950",
                      bar: "bg-emerald-500",
                      width: Math.min(100, homeDoneThisWeek * 20),
                    },
                    {
                      label: "Data ready",
                      value: boughtEvents,
                      detail: "purchase events tracked",
                      icon: Package,
                      tone: "border-sky-200/70 bg-sky-50/70 text-sky-950",
                      bar: "bg-sky-500",
                      width: Math.min(100, boughtEvents * 10),
                    },
                  ].map((signal) => {
                    const Icon = signal.icon;
                    return (
                      <div key={signal.label} className={`rounded-xl border p-3 shadow-sm ${signal.tone}`}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="inline-flex items-center gap-2 text-[11px] font-medium opacity-80">
                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                            {signal.label}
                          </p>
                          <span className="text-xl font-semibold leading-none tabular-nums">
                            {signal.value}
                          </span>
                        </div>
                        <p className="mt-2 text-xs opacity-75">{signal.detail}</p>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background/70">
                          <div
                            className={`h-full rounded-full ${signal.bar}`}
                            style={{ width: `${Math.max(8, signal.width)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="relative mt-3 rounded-xl border border-border/60 bg-background/70 p-3 text-xs text-muted-foreground">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <p>
                      Shopping: <span className="font-semibold text-foreground">{shoppingItems.length}</span> open
                    </p>
                    <p>
                      Garden: <span className="font-semibold text-foreground">{daciaWaterDue}</span> water due
                    </p>
                    <p>
                      Recipes: <span className="font-semibold text-foreground">{recipesMissingTotal}</span> missing
                    </p>
                  </div>
                </div>
              </section>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {dashboardModules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <button
                      key={module.title}
                      type="button"
                      onClick={() => setActiveView(module.view)}
                      className={`group relative overflow-hidden rounded-xl border border-border/70 bg-card p-4 text-left shadow-sm ring-1 ${module.ring} transition duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md`}
                    >
                      <div
                        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${module.tone} opacity-90 transition group-hover:opacity-100`}
                      />
                      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                      <div className="relative space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-background/80 shadow-sm">
                              <Icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <div>
                              <p className="text-sm font-semibold">{module.title}</p>
                              <p className="text-xs text-muted-foreground">{module.status}</p>
                            </div>
                          </div>
                          <span className="mt-1 flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2 py-1 text-[11px] text-muted-foreground">
                            <span className={`h-1.5 w-1.5 rounded-full ${module.dot}`} />
                            Live
                          </span>
                        </div>

                        <div>
                          <p className="text-3xl font-semibold leading-none tabular-nums">
                            <NumberTicker value={module.value} />
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">{module.label}</p>
                        </div>

                        <div className="space-y-2 border-t border-border/60 pt-3">
                          {module.details.map((detail) => (
                            <p
                              key={detail}
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${module.dot}`} />
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="hidden">
                <button
                  type="button"
                  onClick={() => setActiveView("shopping")}
                  className="rounded-md border border-border/70 bg-card p-3 text-left transition hover:bg-muted/30"
                >
                  <p className="inline-flex items-center gap-1 text-sm font-semibold">
                    <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
                    Shopping
                  </p>
                  <p className="mt-1 text-2xl font-semibold">{shoppingItems.length}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {shoppingItems.length} to buy · {storageItems.length} in storage
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("home")}
                  className="rounded-md border border-border/70 bg-card p-3 text-left transition hover:bg-muted/30"
                >
                  <p className="inline-flex items-center gap-1 text-sm font-semibold">
                    <Home className="h-4 w-4" aria-hidden="true" />
                    Home
                  </p>
                  <p className="mt-1 text-2xl font-semibold">{homeDueTasks}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {
                      homeRecurringTasks.filter((task) => {
                        if (!task.completedAt) return true;
                        if (task.intervalDays === 0) return false;
                        return timeNow - task.completedAt >= task.intervalDays * dayMs;
                      }).length
                    }{" "}
                    due tasks
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("dacia")}
                  className="rounded-md border border-border/70 bg-card p-3 text-left transition hover:bg-muted/30"
                >
                  <p className="inline-flex items-center gap-1 text-sm font-semibold">
                    <Leaf className="h-4 w-4" aria-hidden="true" />
                    Dacia
                  </p>
                  <p className="mt-1 text-2xl font-semibold">{plants.length}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {plants.length} active plants · {gardenTasks.length} garden tasks
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("recipes")}
                  className="rounded-md border border-border/70 bg-card p-3 text-left transition hover:bg-muted/30"
                >
                  <p className="inline-flex items-center gap-1 text-sm font-semibold">
                    <CookingPot className="h-4 w-4" aria-hidden="true" />
                    Recipes
                  </p>
                  <p className="mt-1 text-2xl font-semibold">{recipes.length}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {recipes.length} saved recipes · quick add to shopping
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("users")}
                  className="rounded-md border border-border/70 bg-card p-3 text-left transition hover:bg-muted/30"
                >
                  <p className="inline-flex items-center gap-1 text-sm font-semibold">
                    <Settings2 className="h-4 w-4" aria-hidden="true" />
                    Profile
                  </p>
                  <p className="mt-1 text-2xl font-semibold">You</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Logged-in user & access settings
                  </p>
                </button>
              </div>

              <div className="hidden">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="inline-flex items-center gap-1 text-sm">
                      <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
                      Shopping Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-xs text-muted-foreground">
                    <p>{shoppingItems.length} to buy right now</p>
                    <p>{storageItems.length} currently in storage</p>
                    <p>{recurringItems.length} recurring restock items</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="inline-flex items-center gap-1 text-sm">
                      <Home className="h-4 w-4" aria-hidden="true" />
                      Home Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-xs text-muted-foreground">
                    <p>{homeDueTasks} recurring tasks due</p>
                    <p>{homeDoneThisWeek} tasks completed this week</p>
                    <p>{archivedHomeTasks.length} tasks archived</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="inline-flex items-center gap-1 text-sm">
                      <Leaf className="h-4 w-4" aria-hidden="true" />
                      Dacia Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-xs text-muted-foreground">
                    <p>{plants.length} active plants tracked</p>
                    <p>{daciaWaterDue} plants need watering</p>
                    <p>{daciaOpenTasks} open garden tasks</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="inline-flex items-center gap-1 text-sm">
                      <CookingPot className="h-4 w-4" aria-hidden="true" />
                      Recipe Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-xs text-muted-foreground">
                    <p>{recipes.length} recipes saved</p>
                    <p>{recipesMissingTotal} missing ingredient pills</p>
                    <p>Direct add-to-shopping flow enabled</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="inline-flex items-center gap-1 text-sm">
                      <Settings2 className="h-4 w-4" aria-hidden="true" />
                      Profile Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-xs text-muted-foreground">
                    <p>Logged in as co-owner account</p>
                    <p>Private 2-user household workspace</p>
                    <p>Permissions and login setup prototype</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : activeView === "shopping" ? (
            <div className="space-y-5">
              <Button
                type="button"
                variant="default"
                className="h-12 w-full justify-between rounded-xl border border-emerald-700/70 bg-emerald-900 text-white shadow-sm hover:bg-emerald-950"
                onClick={() => setBrowseOpen(true)}
              >
                <span className="flex items-center gap-2">
                  <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
                  Browse items
                </span>
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </Button>

              {browseOpen ? (
                <div className="fixed inset-0 z-50 flex flex-col bg-background/96 backdrop-blur-sm">
                  <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 sm:px-6">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Browse Shopping Items</p>
                      <p className="text-xs text-muted-foreground">
                        Search favorites, add custom items, and tap items into the shopping list.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-full"
                      onClick={() => setBrowseOpen(false)}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Close browse items</span>
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
                      <div className="rounded-2xl border border-border/70 bg-background/80 p-3 shadow-sm">
                        <p className="mb-2 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-normal text-muted-foreground">
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          Add custom item
                        </p>
                        <div className="grid gap-2 lg:grid-cols-[1fr_auto]">
                          <Input
                            value={newTitle}
                            onChange={(event) => setNewTitle(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") createFavorite();
                            }}
                            placeholder="e.g. Rice, basil, oat milk"
                            aria-label="Add shopping item"
                            className="h-11 rounded-xl border-border/80 bg-background/90 px-3 shadow-sm"
                          />
                          {newTitle.trim() ? (
                            <Button type="button" onClick={createFavorite} className="h-11 rounded-xl px-5">
                              Add item
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border/70 bg-background/70 p-3 sm:grid-cols-4 lg:grid-cols-6">
                        {filteredFavorites.map((item) => {
                          const Icon = iconMap[item.icon];
                          const state = states[item.id];
                          const inShopping = state?.status === "shopping";
                          const inStorage = state?.status === "storage";
                          const isPendingRemove = pendingBrowseRemoveId === item.id;

                          return (
                            <div
                              key={item.id}
                              className={
                                inShopping
                                  ? "relative aspect-square overflow-hidden rounded-xl border border-primary/40 bg-primary/10 text-center shadow-sm ring-1 ring-primary/10 transition hover:-translate-y-0.5"
                                  : inStorage
                                    ? "relative aspect-square overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 text-center shadow-sm ring-1 ring-emerald-500/10 transition hover:-translate-y-0.5"
                                    : "relative aspect-square overflow-hidden rounded-xl border border-border/70 bg-card text-center shadow-sm transition hover:-translate-y-0.5 hover:bg-muted/30"
                              }
                            >
                              <button
                                type="button"
                                onClick={() => archiveShoppingItem(item)}
                                className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-border/70 bg-white/90 text-muted-foreground shadow-sm transition hover:bg-rose-100 hover:text-rose-700 active:scale-95"
                                aria-label={`Remove ${item.title} from shopping items`}
                              >
                                <X className="h-3 w-3" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleBrowseCardClick(item)}
                                className="flex h-full w-full flex-col items-center justify-center rounded-[inherit] p-2 transition active:scale-[0.98]"
                                aria-label={`Add ${item.title} to shopping`}
                              >
                                {inShopping ? (
                                  <span
                                    className={
                                      isPendingRemove
                                        ? "mb-1 inline-flex items-center gap-1 rounded-full bg-rose-200 px-1.5 py-0.5 text-[9px] font-semibold text-rose-950"
                                        : "mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-200 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-950"
                                    }
                                  >
                                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                    {isPendingRemove ? "Tap again" : "Added"}
                                  </span>
                                ) : null}
                                <span className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg border ${iconTone[item.icon]}`}>
                                  <Icon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <span className="line-clamp-2 text-xs font-medium">{item.title}</span>
                                <span className="mt-1 text-[10px] text-muted-foreground">
                                  {inShopping
                                    ? isPendingRemove
                                      ? "Remove from shopping"
                                      : "Double tap to remove"
                                    : item.category}
                                </span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 xl:grid-cols-2">
                <Card className="overflow-hidden border-emerald-200/70 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-500/10">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-emerald-200/60 bg-emerald-50/70 pb-3">
                    <div>
                      <CardTitle className="inline-flex items-center gap-2 text-base">
                        <Package className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                        Storage
                      </CardTitle>
                      <p className="mt-1 text-xs text-emerald-900/70">Tap twice to restock later.</p>
                    </div>
                    <Badge className="bg-emerald-200 text-emerald-950 hover:bg-emerald-200">
                      {storageItems.length} in stock
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4">
                    {storageItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Storage is empty.</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                          {storageItems.map((item) => {
                            const Icon = iconMap[item.icon];
                            const boughtAt = states[item.id]?.boughtAt;
                            const isPending = pendingRestockConfirmId === item.id;
                            return (
                              <div
                                key={item.id}
                                className={
                                  isPending
                                    ? "relative aspect-square rounded-lg border-2 border-emerald-500 bg-emerald-100 text-center shadow-sm ring-2 ring-emerald-300/40 transition"
                                    : "relative aspect-square rounded-lg border border-emerald-300/80 bg-background/80 text-center shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-100"
                                }
                              >
                                <button
                                  type="button"
                                  onClick={() => removeFromShopping(item)}
                                  className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-emerald-300/80 bg-white/90 text-emerald-900 shadow-sm transition hover:bg-emerald-200 active:scale-95"
                                  aria-label={`Remove ${item.title} from storage`}
                                >
                                  <X className="h-3 w-3" aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStorageCardClick(item)}
                                  className="flex h-full w-full flex-col items-center justify-center rounded-[inherit] p-1.5 transition active:scale-[0.98]"
                                  aria-label={`Move ${item.title} back to shopping`}
                                >
                                  <span
                                    className={`mb-1 flex h-5 w-5 items-center justify-center rounded-sm border ${iconTone[item.icon]}`}
                                  >
                                    <Icon className="h-3 w-3" aria-hidden="true" />
                                  </span>
                                  <span className="line-clamp-2 px-0.5 text-[11px] font-semibold leading-tight text-foreground">
                                    {item.title}
                                  </span>
                                  <span
                                    className={
                                      isPending
                                        ? "mt-1 rounded-full bg-emerald-300 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-950"
                                        : "mt-1 rounded-full bg-emerald-200 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-950"
                                    }
                                  >
                                    {isPending
                                      ? "tap again"
                                      : boughtAt
                                        ? `${daysSince(boughtAt)}d ago`
                                        : "bought"}
                                  </span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <div className="rounded-xl border border-emerald-200/70 bg-background/70 p-2.5 shadow-sm">
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="rounded-lg bg-emerald-50/70 px-2 py-2">
                              <p className="text-[11px] text-muted-foreground">In stock</p>
                              <p className="text-sm font-semibold">{storageItems.length}</p>
                            </div>
                            <div className="rounded-lg bg-emerald-50/70 px-2 py-2">
                              <p className="text-[11px] text-muted-foreground">Bought today</p>
                              <p className="text-sm font-semibold">
                                {
                                  storageItems.filter((item) => {
                                    const boughtAt = states[item.id]?.boughtAt;
                                    return boughtAt ? daysSince(boughtAt) === 0 : false;
                                  }).length
                                }
                              </p>
                            </div>
                            <div className="rounded-lg bg-emerald-50/70 px-2 py-2">
                              <p className="text-[11px] text-muted-foreground">Need soon</p>
                              <p className="text-sm font-semibold">
                                {
                                  storageItems.filter((item) => {
                                    const boughtAt = states[item.id]?.boughtAt;
                                    return boughtAt ? daysSince(boughtAt) >= 5 : false;
                                  }).length
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-amber-200/70 bg-amber-50/40 shadow-sm ring-1 ring-amber-500/10">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-amber-200/60 bg-amber-50/70 pb-3">
                    <div>
                      <CardTitle className="inline-flex items-center gap-2 text-base">
                        <ShoppingBasket className="h-4 w-4 text-amber-700" aria-hidden="true" />
                        Shopping List
                      </CardTitle>
                      <p className="mt-1 text-xs text-amber-900/70">Tap twice to confirm as bought.</p>
                    </div>
                    <Badge className="bg-amber-200 text-amber-950 hover:bg-amber-200">
                      {shoppingItems.length} to buy
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4">
                    {shoppingItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nothing to buy right now.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                        {shoppingItems.map((item) => {
                          const Icon = iconMap[item.icon];
                          const isPending = pendingBuyConfirmId === item.id;
                          return (
                            <div
                              key={item.id}
                              className={
                                isPending
                                  ? "relative aspect-square rounded-lg border-2 border-amber-500 bg-amber-100 text-center shadow-sm ring-2 ring-amber-300/40 transition"
                                  : "relative aspect-square rounded-lg border border-amber-300/80 bg-background/80 text-center shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-100"
                              }
                            >
                              <button
                                type="button"
                                onClick={() => removeFromShopping(item)}
                                className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-amber-300/80 bg-white/90 text-amber-900 shadow-sm transition hover:bg-amber-200 active:scale-95"
                                aria-label={`Remove ${item.title} from shopping list`}
                              >
                                <X className="h-3 w-3" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleShoppingCardClick(item)}
                                className="flex h-full w-full flex-col items-center justify-center rounded-[inherit] p-1.5 transition active:scale-[0.98]"
                                aria-label={`Mark ${item.title} as bought`}
                              >
                                <span
                                  className={`mb-1 flex h-5 w-5 items-center justify-center rounded-sm border ${iconTone[item.icon]}`}
                                >
                                  <Icon className="h-3 w-3" aria-hidden="true" />
                                </span>
                                <span className="line-clamp-2 px-0.5 text-[11px] font-semibold leading-tight text-foreground">
                                  {item.title}
                                </span>
                                <span
                                  className={
                                    isPending
                                      ? "mt-1 rounded-full bg-amber-300 px-1.5 py-0.5 text-[9px] font-semibold text-amber-950"
                                      : "mt-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-900"
                                  }
                                >
                                  {isPending ? "tap again" : "to buy"}
                                </span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="relative overflow-hidden border-border/70 bg-card/90 shadow-sm ring-1 ring-amber-500/10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_34%)]" />
                <CardHeader className="relative flex flex-row items-center justify-between border-b border-border/60 bg-background/50 pb-3">
                  <div>
                    <CardTitle className="inline-flex items-center gap-2 text-base">
                      <Clock3 className="h-4 w-4" aria-hidden="true" />
                      Recurring Shopping
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Things you probably restock again and again.
                    </p>
                  </div>
                  <Badge variant="outline">Always needed</Badge>
                </CardHeader>
                <CardContent className="relative p-3 sm:p-4">
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {recurringItems.map((item) => {
                      const Icon = iconMap[item.icon];
                      const state = states[item.id];
                      const inShopping = state?.status === "shopping";
                      const boughtAt = state?.boughtAt;
                      const daysAgo = boughtAt ? daysSince(boughtAt) : null;
                      const freshness = daysAgo === null ? 0 : Math.max(8, 100 - Math.round((daysAgo / 14) * 100));
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => addToShopping(item)}
                          className={
                            inShopping
                              ? "group relative overflow-hidden rounded-xl border border-amber-300 bg-amber-50 p-2.5 text-left shadow-sm ring-1 ring-amber-500/20"
                              : "group relative overflow-hidden rounded-xl border border-border/70 bg-background/80 p-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-muted/40"
                          }
                          aria-label={`Add ${item.title} to shopping`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${iconTone[item.icon]}`}
                            >
                              <Icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <span
                              className={
                                inShopping
                                  ? "rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-950"
                                  : "rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                              }
                            >
                              {inShopping ? "Queued" : "Restock"}
                            </span>
                          </div>
                          <div className="mt-2 min-w-0">
                            <span className="block truncate text-[13px] font-semibold leading-tight">{item.title}</span>
                            <span className="mt-0.5 block text-[11px] text-muted-foreground">
                              {inShopping
                                ? "In shopping"
                                : boughtAt
                                  ? `Last ${daysSince(boughtAt)}d ago`
                                  : "Tap to add"}
                            </span>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className={
                                freshness < 35
                                  ? "h-full rounded-full bg-amber-500"
                                  : "h-full rounded-full bg-emerald-500"
                              }
                              style={{ width: `${inShopping ? 100 : freshness}%` }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-border/70 bg-card/90 shadow-sm ring-1 ring-sky-500/10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_34%)]" />
                <CardHeader className="relative flex flex-row items-center justify-between border-b border-border/60 bg-background/50 pb-3">
                  <div>
                    <CardTitle className="inline-flex items-center gap-2 text-base">
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      Statistics
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Buying rhythm by range, category, and item.
                    </p>
                  </div>
                  <Badge variant="secondary">Detailed view</Badge>
                </CardHeader>
                <CardContent className="relative space-y-4 p-3 sm:p-4">
                  <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-border/70 bg-background/70 p-1.5 shadow-sm sm:gap-2">
                    <div className="rounded-lg border border-sky-200/70 bg-sky-50/70 px-2 py-2 shadow-sm sm:px-3">
                      <p className="flex items-center gap-1.5 text-[10px] font-medium leading-tight text-sky-900/70 sm:text-[11px]">
                        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="truncate">Purchase events</span>
                      </p>
                      <p className="mt-1 text-xl font-semibold leading-none text-sky-950 tabular-nums sm:text-2xl">
                        <NumberTicker value={boughtEvents} />
                      </p>
                    </div>
                    <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/70 px-2 py-2 shadow-sm sm:px-3">
                      <p className="flex items-center gap-1.5 text-[10px] font-medium leading-tight text-emerald-900/70 sm:text-[11px]">
                        <Package className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="truncate">Tracked items</span>
                      </p>
                      <p className="mt-1 text-xl font-semibold leading-none text-emerald-950 tabular-nums sm:text-2xl">
                        <NumberTicker value={purchasedItemsDetailed.length} />
                      </p>
                    </div>
                    <div className="rounded-lg border border-amber-200/70 bg-amber-50/70 px-2 py-2 shadow-sm sm:px-3">
                      <p className="flex items-center gap-1.5 text-[10px] font-medium leading-tight text-amber-900/70 sm:text-[11px]">
                        <ShoppingBasket className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="truncate">Restock signals</span>
                      </p>
                      <p className="mt-1 text-xl font-semibold leading-none text-amber-950 tabular-nums sm:text-2xl">
                        <NumberTicker value={recurringItems.length} />
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2 lg:grid-cols-3">
                    {statsRows.map((row) => {
                      const total = favorites.reduce(
                        (acc, item) =>
                          acc +
                          (states[item.id]?.purchaseHistory ?? []).filter(
                            (stamp) => daysSince(stamp) <= row.maxDays,
                          ).length,
                        0,
                      );
                      return (
                        <div key={row.label} className="rounded-xl border border-border/70 bg-background/75 p-3 shadow-sm">
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">{row.label}</p>
                              <p className="text-[11px] text-muted-foreground">Category spread</p>
                            </div>
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary tabular-nums">
                              {total}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {categories.map((category) => {
                              const categoryTotal = favorites
                                .filter((item) => item.category === category)
                                .reduce(
                                  (acc, item) =>
                                    acc +
                                    (states[item.id]?.purchaseHistory ?? []).filter(
                                      (stamp) => daysSince(stamp) <= row.maxDays,
                                    ).length,
                                  0,
                                );
                              const width = total > 0 ? Math.max(8, Math.round((categoryTotal / total) * 100)) : 8;
                              return (
                                <div key={category} className="space-y-1">
                                  <div className="flex items-center justify-between gap-2 text-[11px]">
                                    <span className="truncate text-muted-foreground">{category}</span>
                                    <span className="font-semibold text-foreground">{categoryTotal}</span>
                                  </div>
                                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${width}%` }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-background/70">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/70 bg-muted/40 text-xs uppercase tracking-normal text-muted-foreground">
                          <th className="px-3 py-2 text-left font-semibold">Range</th>
                          <th className="px-3 py-2 text-right font-semibold">Total</th>
                          {categories.map((category) => (
                            <th key={category} className="px-3 py-2 text-right font-semibold">
                              {category}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {statsRows.map((row) => {
                          const rowItems = favorites.filter((item) => {
                            const history = states[item.id]?.purchaseHistory ?? [];
                            return history.some((stamp) => daysSince(stamp) <= row.maxDays);
                          });
                          return (
                            <tr key={row.label} className="border-b border-border/50 last:border-b-0">
                              <td className="px-3 py-2 font-medium">{row.label}</td>
                              <td className="px-3 py-2 text-right font-semibold">
                                {rowItems.reduce(
                                  (acc, item) =>
                                    acc +
                                    (states[item.id]?.purchaseHistory ?? []).filter(
                                      (stamp) => daysSince(stamp) <= row.maxDays,
                                    ).length,
                                  0,
                                )}
                              </td>
                              {categories.map((category) => (
                                <td key={category} className="px-3 py-2 text-right text-muted-foreground">
                                  {rowItems
                                    .filter((item) => item.category === category)
                                    .reduce(
                                      (acc, item) =>
                                        acc +
                                        (states[item.id]?.purchaseHistory ?? []).filter(
                                          (stamp) => daysSince(stamp) <= row.maxDays,
                                        ).length,
                                      0,
                                    )}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">Bought item rhythm</p>
                      <p className="text-xs text-muted-foreground">
                        Total tracked purchases: <span className="font-semibold text-foreground">{boughtEvents}</span>
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2 lg:grid-cols-2 xl:hidden">
                    {purchasedItemsDetailed.length === 0 ? (
                      <div className="rounded-xl border border-border/70 bg-card p-3 text-sm text-muted-foreground shadow-sm">
                        No bought items tracked yet.
                      </div>
                    ) : (
                      purchasedItemsDetailed.map((item) => (
                        <div key={item.id} className="rounded-xl border border-border/70 bg-background/75 p-3 shadow-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold">{item.title}</p>
                              <p className="text-[11px] text-muted-foreground">
                                Last bought: {item.boughtAt ? `${daysSince(item.boughtAt)}d ago` : "-"}
                              </p>
                            </div>
                            <Badge variant="secondary" className="shrink-0">
                              {item.category}
                            </Badge>
                          </div>
                          <div className="mt-3 grid grid-cols-4 gap-1.5 text-center text-[11px] text-muted-foreground">
                            <p className="rounded-md bg-muted/40 px-1.5 py-1">
                              <span className="block">Week</span>
                              <span className="font-medium text-foreground">
                                {item.history.filter((stamp) => daysSince(stamp) <= 7).length}
                              </span>
                            </p>
                            <p className="rounded-md bg-muted/40 px-1.5 py-1">
                              <span className="block">Month</span>
                              <span className="font-medium text-foreground">
                                {item.history.filter((stamp) => daysSince(stamp) <= 30).length}
                              </span>
                            </p>
                            <p className="rounded-md bg-muted/40 px-1.5 py-1">
                              <span className="block">6 mo</span>
                              <span className="font-medium text-foreground">
                                {item.history.filter((stamp) => daysSince(stamp) <= 180).length}
                              </span>
                            </p>
                            <p className="rounded-md bg-muted/40 px-1.5 py-1">
                              <span className="block">Total</span>
                              <span className="font-medium text-foreground">{item.history.length}</span>
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-card xl:block">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/70 bg-muted/30 text-xs uppercase text-muted-foreground">
                          <th className="px-3 py-2 text-left font-semibold">Item</th>
                          <th className="px-3 py-2 text-left font-semibold">Category</th>
                          <th className="px-3 py-2 text-right font-semibold">Week</th>
                          <th className="px-3 py-2 text-right font-semibold">Month</th>
                          <th className="px-3 py-2 text-right font-semibold">6 Months</th>
                          <th className="px-3 py-2 text-right font-semibold">Total</th>
                          <th className="px-3 py-2 text-right font-semibold">Last bought</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchasedItemsDetailed.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-3 py-3 text-sm text-muted-foreground">
                              No bought items tracked yet.
                            </td>
                          </tr>
                        ) : (
                          purchasedItemsDetailed.map((item) => (
                            <tr key={item.id} className="border-b border-border/50 last:border-b-0">
                              <td className="px-3 py-2 font-medium">{item.title}</td>
                              <td className="px-3 py-2 text-muted-foreground">{item.category}</td>
                              <td className="px-3 py-2 text-right text-muted-foreground">
                                {item.history.filter((stamp) => daysSince(stamp) <= 7).length}
                              </td>
                              <td className="px-3 py-2 text-right text-muted-foreground">
                                {item.history.filter((stamp) => daysSince(stamp) <= 30).length}
                              </td>
                              <td className="px-3 py-2 text-right text-muted-foreground">
                                {item.history.filter((stamp) => daysSince(stamp) <= 180).length}
                              </td>
                              <td className="px-3 py-2 text-right font-semibold">{item.history.length}</td>
                              <td className="px-3 py-2 text-right text-muted-foreground">
                                {item.boughtAt ? `${daysSince(item.boughtAt)}d ago` : "-"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : activeView === "dacia" ? (
            <div className="space-y-5">
              <section className="relative overflow-hidden rounded-xl border border-border/70 bg-card/90 p-4 shadow-sm ring-1 ring-emerald-500/10 sm:p-5">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_36%)]" />
                <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl space-y-2">
                    <Badge className="border border-emerald-500/20 bg-emerald-50 text-emerald-900 hover:bg-emerald-50">
                      Schrebergarten hub
                    </Badge>
                    <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Dacia</h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                      Manage garden tasks, plants, watering, notes, and archive flow in one place.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-white/70 bg-background/75 p-1.5 shadow-[0_16px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:gap-2 lg:min-w-[23rem]">
                    <div className="rounded-lg border border-amber-500/15 bg-amber-50/80 px-2 py-2 sm:px-3">
                      <CheckCircle2 className="mb-2 h-4 w-4 text-amber-700" aria-hidden="true" />
                      <p className="text-xl font-semibold leading-none text-amber-950 tabular-nums">
                        <NumberTicker value={gardenTasks.length} />
                      </p>
                      <p className="mt-1 truncate text-[11px] font-medium text-amber-900">Tasks</p>
                    </div>
                    <div className="rounded-lg border border-emerald-500/15 bg-emerald-50/80 px-2 py-2 sm:px-3">
                      <Sprout className="mb-2 h-4 w-4 text-emerald-700" aria-hidden="true" />
                      <p className="text-xl font-semibold leading-none text-emerald-950 tabular-nums">
                        <NumberTicker value={plants.length} />
                      </p>
                      <p className="mt-1 truncate text-[11px] font-medium text-emerald-900">Plants</p>
                    </div>
                    <div className="rounded-lg border border-sky-500/15 bg-sky-50/80 px-2 py-2 sm:px-3">
                      <Leaf className="mb-2 h-4 w-4 text-sky-700" aria-hidden="true" />
                      <p className="text-xl font-semibold leading-none text-sky-950 tabular-nums">
                        <NumberTicker value={daciaWaterDue} />
                      </p>
                      <p className="mt-1 truncate text-[11px] font-medium text-sky-900">Water due</p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
                <Card className="relative overflow-hidden border-amber-200/70 bg-amber-50/40 shadow-sm ring-1 ring-amber-500/10 xl:col-span-1">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_34%)]" />
                  <CardHeader className="relative flex flex-row items-start justify-between border-b border-amber-200/60 bg-amber-50/70 pb-3">
                    <div>
                      <CardTitle className="inline-flex items-center gap-2 text-base">
                        <CheckCircle2 className="h-4 w-4 text-amber-700" aria-hidden="true" />
                        Garden Tasks
                      </CardTitle>
                      <p className="mt-1 text-xs text-amber-900/70">Checked tasks can be archived as done.</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant={showAddGardenTask ? "default" : "outline"}
                        className="h-7 px-2 text-xs"
                        onClick={() => setShowAddGardenTask((prev) => !prev)}
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                        Add task
                      </Button>
                      {completedGardenTaskIds.length > 0 ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() => archiveTasksByIds(completedGardenTaskIds)}
                        >
                          Archive done ({completedGardenTaskIds.length})
                        </Button>
                      ) : null}
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground">
                        <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">Task settings</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="relative p-3 sm:p-4">
                    {showAddGardenTask ? (
                      <div className="mb-3 rounded-xl border border-amber-200/70 bg-background/80 p-2.5 shadow-sm">
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Input
                            value={newGardenTaskTitle}
                            onChange={(event) => setNewGardenTaskTitle(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") void addGardenTask();
                            }}
                            placeholder="Add garden task"
                            className="h-10 rounded-lg border-amber-200/80 bg-background/90"
                            aria-label="Add garden task"
                          />
                          <div className="flex gap-2 sm:shrink-0">
                            <Button type="button" onClick={() => void addGardenTask()} className="h-10 flex-1 sm:px-4">
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-10 flex-1 sm:px-4"
                              onClick={() => {
                                setNewGardenTaskTitle("");
                                setShowAddGardenTask(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    <div className="space-y-2">
                      {gardenTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start justify-between gap-2 rounded-xl border border-amber-200/70 bg-background/80 p-2.5 shadow-sm"
                        >
                          <label className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={task.completedAt !== null}
                              onChange={() => toggleGardenTaskDone(task.id)}
                              className="mt-0.5 h-4 w-4 accent-primary"
                            />
                            {editingGardenTaskId === task.id ? (
                              <div className="flex flex-col gap-2">
                                <Input
                                  value={editingGardenTaskTitle}
                                  onChange={(event) => setEditingGardenTaskTitle(event.target.value)}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") void saveGardenTaskEdit();
                                  }}
                                  className="h-9 rounded-lg border-amber-200/80 bg-background/90"
                                  aria-label="Edit garden task"
                                />
                                <div className="flex gap-2">
                                  <Button type="button" size="sm" className="h-8 px-3 text-xs" onClick={() => void saveGardenTaskEdit()}>
                                    Save
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-3 text-xs"
                                    onClick={() => {
                                      setEditingGardenTaskId(null);
                                      setEditingGardenTaskTitle("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <span className="flex items-center gap-2 text-sm">
                                <span>{task.title}</span>
                                {task.createdByLetter ? (
                                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-amber-300 bg-amber-100 px-1 text-[10px] font-semibold text-amber-950">
                                    {task.createdByLetter}
                                  </span>
                                ) : null}
                              </span>
                            )}
                          </label>
                          <div className="flex items-center gap-1">
                            {task.completedAt !== null ? (
                              <span
                                className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 px-1.5 text-[10px] font-semibold text-emerald-900"
                                title={`Checked by ${task.completedByLetter ?? currentUserInitial}`}
                                aria-label={`Checked by ${task.completedByLetter ?? currentUserInitial}`}
                              >
                                {task.completedByLetter ?? currentUserInitial}
                              </span>
                            ) : null}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground">
                                  <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span className="sr-only">Task actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingGardenTaskId(task.id);
                                    setEditingGardenTaskTitle(task.title);
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => archiveTasksByIds([task.id])}>Archive</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => deleteTask(task.id)}>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                    {archivedGardenTasks.length > 0 ? (
                      <div className="mt-3 rounded-xl border border-amber-200/70 bg-background/70 p-2.5 shadow-sm">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-[11px] font-semibold text-muted-foreground">Archived tasks</p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-[11px]"
                            onClick={deleteArchivedTasksBulk}
                          >
                            Delete archived tasks
                          </Button>
                        </div>
                        <div className="space-y-1.5">
                          {archivedGardenTasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between rounded border border-border/50 px-2 py-1.5">
                              <span className="text-xs text-muted-foreground">{task.title}</span>
                              <Button type="button" size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={() => restoreTask(task.id)}>
                                Restore
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-cyan-200/70 bg-cyan-50/40 shadow-sm ring-1 ring-cyan-500/10 xl:col-span-1">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.14),transparent_34%)]" />
                  <CardHeader className="relative flex flex-row items-start justify-between border-b border-cyan-200/60 bg-cyan-50/70 pb-3">
                    <div>
                      <CardTitle className="inline-flex items-center gap-2 text-base">
                        <Package className="h-4 w-4 text-cyan-700" aria-hidden="true" />
                        Fridge
                      </CardTitle>
                      <p className="mt-1 text-xs text-cyan-900/70">Quick reminder of what is currently in there.</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={showAddFridgeItem ? "default" : "outline"}
                      className="h-7 px-2 text-xs"
                      onClick={() => setShowAddFridgeItem((prev) => !prev)}
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                      Add item
                    </Button>
                  </CardHeader>
                  <CardContent className="relative p-3 sm:p-4">
                    {showAddFridgeItem ? (
                      <div className="mb-3 rounded-xl border border-cyan-200/70 bg-background/80 p-2.5 shadow-sm">
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Input
                            value={newFridgeItemName}
                            onChange={(event) => setNewFridgeItemName(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") void addFridgeItem();
                            }}
                            placeholder="Add fridge item"
                            className="h-10 rounded-lg border-cyan-200/80 bg-background/90"
                            aria-label="Add fridge item"
                          />
                          <div className="flex gap-2 sm:shrink-0">
                            <Button type="button" onClick={() => void addFridgeItem()} className="h-10 flex-1 sm:px-4">
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-10 flex-1 sm:px-4"
                              onClick={() => {
                                setNewFridgeItemName("");
                                setShowAddFridgeItem(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {fridgeItems.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-cyan-200/80 bg-background/55 px-3 py-6 text-center text-sm text-cyan-950/70">
                        Add what is currently in the fridge so both of you can see it.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {fridgeItems.map((item) => (
                          <div
                            key={item.id}
                            className="relative min-h-24 rounded-xl border border-cyan-200/80 bg-background/85 p-2.5 shadow-sm"
                          >
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="absolute right-1 top-1 h-6 w-6 text-muted-foreground"
                              onClick={() => void removeFridgeItem(item.id)}
                            >
                              <X className="h-3.5 w-3.5" aria-hidden="true" />
                              <span className="sr-only">Remove fridge item</span>
                            </Button>
                            <div className="flex h-full flex-col justify-between gap-2">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-800">
                                <Package className="h-4 w-4" aria-hidden="true" />
                              </span>
                              <div className="space-y-1 pr-5">
                                <p className="text-sm font-medium leading-5 text-foreground">{item.name}</p>
                                {item.createdByLetter ? (
                                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-cyan-300 bg-cyan-100 px-1 text-[10px] font-semibold text-cyan-950">
                                    {item.createdByLetter}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-emerald-200/70 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-500/10 xl:col-span-1">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_34%)]" />
                  <CardHeader className="relative flex flex-row items-start justify-between border-b border-emerald-200/60 bg-emerald-50/70 pb-3">
                    <div>
                      <CardTitle className="inline-flex items-center gap-2 text-base">
                        <Sprout className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                        Plants
                      </CardTitle>
                      <p className="mt-1 text-xs text-emerald-900/70">Watering rhythm and plant notes.</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant={showAddPlant ? "default" : "outline"}
                        className="h-7 px-2 text-xs"
                        onClick={() => setShowAddPlant((prev) => !prev)}
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                        Add plant
                      </Button>
                      {donePlantIds.length > 0 ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() => archivePlantsByIds(donePlantIds)}
                        >
                          Archive done ({donePlantIds.length})
                        </Button>
                      ) : null}
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground">
                        <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">Plant settings</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="relative p-3 sm:p-4">
                    {showAddPlant ? (
                      <div className="mb-3 rounded-xl border border-emerald-200/70 bg-background/80 p-2.5 shadow-sm">
                        <div className="flex flex-col gap-2">
                          <Input
                            value={newPlantName}
                            onChange={(event) => setNewPlantName(event.target.value)}
                            placeholder="Plant name"
                            className="h-10 rounded-lg border-emerald-200/80 bg-background/90"
                            aria-label="Plant name"
                          />
                          <div className="grid grid-cols-[auto_1fr] gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-200/80 bg-emerald-50 text-emerald-800">
                              <CalendarDays className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <Input
                              type="date"
                              value={newPlantPlantedDate}
                              onChange={(event) => setNewPlantPlantedDate(event.target.value)}
                              className="h-10 rounded-lg border-emerald-200/80 bg-background/90"
                              aria-label="Plant planted date"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={newPlantIconKey}
                              onChange={(event) => setNewPlantIconKey(event.target.value)}
                              className="h-10 rounded-lg border border-emerald-200/80 bg-background/90 px-3 text-sm"
                              aria-label="Plant icon"
                            >
                              {plantIconOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <select
                              value={newPlantWateringInterval}
                              onChange={(event) => setNewPlantWateringInterval(event.target.value)}
                              className="h-10 rounded-lg border border-emerald-200/80 bg-background/90 px-3 text-sm"
                              aria-label="Plant watering interval"
                            >
                              {plantIntervalOptions.map((option) => (
                                <option key={option} value={option}>
                                  every {option} day{option === 1 ? "" : "s"}
                                </option>
                              ))}
                            </select>
                          </div>
                          <Input
                            value={newPlantNote}
                            onChange={(event) => setNewPlantNote(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") void addPlant();
                            }}
                            placeholder="Plant note"
                            className="h-10 rounded-lg border-emerald-200/80 bg-background/90"
                            aria-label="Plant note"
                          />
                          <div className="flex gap-2">
                            <Button type="button" onClick={() => void addPlant()} className="h-10 flex-1">
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-10 flex-1"
                              onClick={() => {
                                setNewPlantName("");
                                setNewPlantIconKey("sprout");
                                setNewPlantWateringInterval("2");
                                setNewPlantNote("");
                                setShowAddPlant(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    <div className="space-y-2">
                      {plants.map((plant) => {
                        const waterAge = daysSince(plant.lastWateredAt);
                        const waterLeft = Math.max(
                          8,
                          100 - Math.round((waterAge / plant.wateringIntervalDays) * 100),
                        );
                        const waterDue = waterAge >= plant.wateringIntervalDays;
                        return (
                        <div
                          key={plant.id}
                          className="rounded-xl border border-emerald-200/70 bg-background/80 p-2.5 shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={donePlantIds.includes(plant.id)}
                                onChange={(event) =>
                                  setDonePlantIds((prev) =>
                                    event.target.checked
                                      ? [...prev, plant.id]
                                      : prev.filter((id) => id !== plant.id),
                                  )
                                }
                                className="h-4 w-4 accent-primary"
                              />
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-100 text-emerald-800">
                                <plant.icon className="h-3.5 w-3.5" aria-hidden="true" />
                              </span>
                              {editingPlantId === plant.id ? (
                                <div className="flex flex-col gap-2">
                                  <Input
                                    value={editingPlantName}
                                    onChange={(event) => setEditingPlantName(event.target.value)}
                                    className="h-9 rounded-lg border-emerald-200/80 bg-background/90"
                                    aria-label="Edit plant name"
                                  />
                                  <div className="grid grid-cols-[auto_1fr] gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200/80 bg-emerald-50 text-emerald-800">
                                      <CalendarDays className="h-4 w-4" aria-hidden="true" />
                                    </div>
                                    <Input
                                      type="date"
                                      value={editingPlantPlantedDate}
                                      onChange={(event) => setEditingPlantPlantedDate(event.target.value)}
                                      className="h-9 rounded-lg border-emerald-200/80 bg-background/90"
                                      aria-label="Edit plant planted date"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <select
                                      value={editingPlantIconKey}
                                      onChange={(event) => setEditingPlantIconKey(event.target.value)}
                                      className="h-9 rounded-lg border border-emerald-200/80 bg-background/90 px-3 text-sm"
                                      aria-label="Edit plant icon"
                                    >
                                      {plantIconOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                    <select
                                      value={editingPlantWateringInterval}
                                      onChange={(event) => setEditingPlantWateringInterval(event.target.value)}
                                      className="h-9 rounded-lg border border-emerald-200/80 bg-background/90 px-3 text-sm"
                                      aria-label="Edit plant watering interval"
                                    >
                                      {plantIntervalOptions.map((option) => (
                                        <option key={option} value={option}>
                                          every {option} day{option === 1 ? "" : "s"}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <Input
                                    value={editingPlantNote}
                                    onChange={(event) => setEditingPlantNote(event.target.value)}
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter") void savePlantEdit();
                                    }}
                                    className="h-9 rounded-lg border-emerald-200/80 bg-background/90"
                                    aria-label="Edit plant note"
                                  />
                                  <div className="flex gap-2">
                                    <Button type="button" size="sm" className="h-8 px-3 text-xs" onClick={() => void savePlantEdit()}>
                                      Save
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="h-8 px-3 text-xs"
                                      onClick={() => {
                                        setEditingPlantId(null);
                                        setEditingPlantName("");
                                        setEditingPlantIconKey("sprout");
                                        setEditingPlantWateringInterval("2");
                                        setEditingPlantNote("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm font-semibold">{plant.name}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => waterPlantNow(plant.id)}
                                disabled={!waterDue}
                                className="h-7 px-2 text-xs"
                              >
                                {waterDue ? "Water now" : "Watered"}
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground">
                                    <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span className="sr-only">Plant actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingPlantId(plant.id);
                                      setEditingPlantName(plant.name);
                                      setEditingPlantIconKey(plantIconKey(plant.icon));
                                      setEditingPlantPlantedDate(toDateInputValue(plant.plantedAt));
                                      setEditingPlantWateringInterval(String(plant.wateringIntervalDays));
                                      setEditingPlantNote(plant.note);
                                    }}
                                  >
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => archivePlantsByIds([plant.id])}>Archive</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => deletePlant(plant.id)}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
                            <p className="text-muted-foreground">
                              Planted: <span className="font-medium text-foreground">{daysSince(plant.plantedAt)}d ago</span>
                            </p>
                            <p className="text-muted-foreground text-right">
                              Last watered: <span className="font-medium text-foreground">{formatRelativeWaterTime(plant.lastWateredAt, timeNow)}</span>
                            </p>
                            <p className="text-muted-foreground">
                              Interval: <span className="font-medium text-foreground">every {plant.wateringIntervalDays}d</span>
                            </p>
                            <p className="text-right">
                              {waterDue ? (
                                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900">
                                  Water due
                                </span>
                              ) : (
                                <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-900">
                                  On track
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className={waterDue ? "h-full rounded-full bg-amber-500" : "h-full rounded-full bg-emerald-500"}
                              style={{ width: `${waterDue ? 12 : waterLeft}%` }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{plant.note}</p>
                        </div>
                      );
                      })}
                    </div>
                    {archivedPlants.length > 0 ? (
                      <div className="mt-3 rounded-xl border border-emerald-200/70 bg-background/70 p-2.5 shadow-sm">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-[11px] font-semibold text-muted-foreground">Archived plants</p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-[11px]"
                            onClick={deleteArchivedPlantsBulk}
                          >
                            Delete archived plants
                          </Button>
                        </div>
                        <div className="space-y-1.5">
                          {archivedPlants.map((plant) => (
                            <div key={plant.id} className="flex items-center justify-between rounded border border-border/50 px-2 py-1.5">
                              <span className="text-xs text-muted-foreground">{plant.name}</span>
                              <Button type="button" size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={() => restorePlant(plant.id)}>
                                Restore
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-sky-200/70 bg-sky-50/40 shadow-sm ring-1 ring-sky-500/10 xl:col-span-1">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_34%)]" />
                  <CardHeader className="relative flex flex-row items-start justify-between border-b border-sky-200/60 bg-sky-50/70 pb-3">
                    <div>
                      <CardTitle className="inline-flex items-center gap-2 text-base">
                        <NotebookPen className="h-4 w-4 text-sky-700" aria-hidden="true" />
                        Notes & Todo
                      </CardTitle>
                      <p className="mt-1 text-xs text-sky-900/70">Categorized notes for garden planning.</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant={showAddGardenNote ? "default" : "outline"}
                        className="h-7 px-2 text-xs"
                        onClick={() => setShowAddGardenNote((prev) => !prev)}
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                        Add note
                      </Button>
                      {doneNoteIds.length > 0 ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() => archiveNotesByIds(doneNoteIds)}
                        >
                          Archive done ({doneNoteIds.length})
                        </Button>
                      ) : null}
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground">
                        <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">Note settings</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="relative space-y-2 p-3 sm:p-4">
                    {showAddGardenNote ? (
                      <div className="rounded-xl border border-sky-200/70 bg-background/80 p-2.5 shadow-sm">
                        <div className="flex flex-col gap-2">
                          <Input
                            value={newGardenNoteCategory}
                            onChange={(event) => setNewGardenNoteCategory(event.target.value)}
                            placeholder="Category"
                            className="h-10 rounded-lg border-sky-200/80 bg-background/90"
                            aria-label="Garden note category"
                          />
                          <Input
                            value={newGardenNoteText}
                            onChange={(event) => setNewGardenNoteText(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") void addGardenNote();
                            }}
                            placeholder="Add note or todo"
                            className="h-10 rounded-lg border-sky-200/80 bg-background/90"
                            aria-label="Garden note text"
                          />
                          <div className="flex gap-2">
                            <Button type="button" onClick={() => void addGardenNote()} className="h-10 flex-1">
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-10 flex-1"
                              onClick={() => {
                                setNewGardenNoteCategory("Planning");
                                setNewGardenNoteText("");
                                setShowAddGardenNote(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {gardenNotes.map((entry) => (
                      <div key={entry.id} className="rounded-xl border border-sky-200/70 bg-background/80 p-2.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={doneNoteIds.includes(entry.id)}
                              onChange={(event) =>
                                setDoneNoteIds((prev) =>
                                  event.target.checked
                                    ? [...prev, entry.id]
                                    : prev.filter((id) => id !== entry.id),
                                )
                              }
                              className="h-4 w-4 accent-primary"
                            />
                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-950">
                              <PenSquare className="h-3 w-3" aria-hidden="true" />
                              {entry.category}
                            </span>
                            {entry.createdByLetter ? (
                              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-sky-300 bg-sky-100 px-1 text-[10px] font-semibold text-sky-950">
                                {entry.createdByLetter}
                              </span>
                            ) : null}
                          </label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground">
                                <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                                <span className="sr-only">Note actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingGardenNoteId(entry.id);
                                  setEditingGardenNoteCategory(entry.category);
                                  setEditingGardenNoteText(entry.note);
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => archiveNotesByIds([entry.id])}>Archive</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteNote(entry.id)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {editingGardenNoteId === entry.id ? (
                          <div className="mt-2 flex flex-col gap-2">
                            <Input
                              value={editingGardenNoteCategory}
                              onChange={(event) => setEditingGardenNoteCategory(event.target.value)}
                              className="h-9 rounded-lg border-sky-200/80 bg-background/90"
                              aria-label="Edit note category"
                            />
                            <Input
                              value={editingGardenNoteText}
                              onChange={(event) => setEditingGardenNoteText(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") void saveGardenNoteEdit();
                              }}
                              className="h-9 rounded-lg border-sky-200/80 bg-background/90"
                              aria-label="Edit note text"
                            />
                            <div className="flex gap-2">
                              <Button type="button" size="sm" className="h-8 px-3 text-xs" onClick={() => void saveGardenNoteEdit()}>
                                Save
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs"
                                onClick={() => {
                                  setEditingGardenNoteId(null);
                                  setEditingGardenNoteCategory("");
                                  setEditingGardenNoteText("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-1 text-sm">{entry.note}</p>
                        )}
                      </div>
                    ))}
                    {archivedGardenNotes.length > 0 ? (
                      <div className="rounded-xl border border-sky-200/70 bg-background/70 p-2.5 shadow-sm">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-[11px] font-semibold text-muted-foreground">Archived notes</p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-[11px]"
                            onClick={() => void deleteArchivedNotesBulk()}
                          >
                            Delete archived notes
                          </Button>
                        </div>
                        <div className="space-y-1.5">
                          {archivedGardenNotes.map((note) => (
                            <div key={note.id} className="flex items-center justify-between rounded border border-border/50 px-2 py-1.5">
                              <span className="text-xs text-muted-foreground">{note.category}</span>
                              <Button type="button" size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={() => restoreNote(note.id)}>
                                Restore
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : activeView === "home" ? (
            <div className="space-y-5">
              <section className="relative overflow-hidden rounded-xl border border-border/70 bg-card/90 p-3 shadow-sm ring-1 ring-sky-500/10 sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="inline-flex items-center gap-2 text-sm font-semibold">
                      <Sparkles className="h-4 w-4 text-sky-700" aria-hidden="true" />
                      Quick capture
                    </p>
                    <p className="text-xs text-muted-foreground">Add a task or note without leaving the flow.</p>
                  </div>
                  <Button type="button" size="sm" className="h-9 gap-1 rounded-xl px-3" onClick={() => setQuickCaptureOpen((prev) => !prev)}>
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    {quickCaptureOpen ? "Close" : "Capture"}
                  </Button>
                </div>
                {quickCaptureOpen ? (
                  <div className="mt-3 rounded-xl border border-sky-200/70 bg-sky-50/40 p-2.5 shadow-sm">
                    <div className="mb-2 flex gap-1">
                      <Button type="button" size="sm" variant={quickCaptureType === "task" ? "default" : "outline"} className="h-8 rounded-xl px-3 text-xs" onClick={() => setQuickCaptureType("task")}>Task</Button>
                      <Button type="button" size="sm" variant={quickCaptureType === "note" ? "default" : "outline"} className="h-8 rounded-xl px-3 text-xs" onClick={() => setQuickCaptureType("note")}>Note</Button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <Input
                        value={quickCaptureText}
                        onChange={(event) => setQuickCaptureText(event.target.value)}
                        placeholder={quickCaptureType === "task" ? "e.g. Clean filters every 3 weeks" : "e.g. buy cleaner for kitchen"}
                        className="h-10 rounded-xl bg-background"
                      />
                      <Button type="button" size="sm" className="h-10 rounded-xl px-4" onClick={saveQuickCapture}>
                        Add
                      </Button>
                    </div>
                  </div>
                ) : null}
              </section>

              <Card className="relative overflow-hidden border-border/70 bg-card/90 shadow-sm ring-1 ring-amber-500/10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_34%)]" />
                <CardHeader className="relative border-b border-border/60 bg-background/50 pb-3">
                  <CardTitle className="inline-flex items-center gap-2 text-base">
                    <CheckCircle2 className="h-4 w-4 text-amber-700" aria-hidden="true" />
                    Today Focus
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative p-3 sm:p-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-2 text-center shadow-sm">
                      <p className="text-[11px] text-amber-800">Due today</p>
                      <p className="text-lg font-semibold text-amber-950">
                        {
                          homeRecurringTasks.filter((task) => {
                            if (task.intervalDays === 0) return !isRecurringTaskDone(task);
                            return !isRecurringTaskDone(task);
                          }).length
                        }
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-2 text-center shadow-sm">
                      <p className="text-[11px] text-emerald-800">Done this week</p>
                      <p className="text-lg font-semibold text-emerald-950">
                        {
                          homeRecurringTasks.filter((task) => {
                            if (!task.completedAt) return false;
                            return timeNow - task.completedAt <= 7 * dayMs;
                          }).length
                        }
                      </p>
                    </div>
                    <div className="rounded-xl border border-sky-200 bg-sky-50/80 p-2 text-center shadow-sm">
                      <p className="text-[11px] text-sky-800">Recurring active</p>
                      <p className="text-lg font-semibold text-sky-950">
                        {homeRecurringTasks.filter((task) => task.intervalDays > 0).length}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Prototype mode: lightweight focus metrics for fast daily planning.
                  </p>
                </CardContent>
              </Card>

              <div className="grid gap-4 xl:grid-cols-[1.25fr_0.85fr_0.9fr]">
                <Card className="relative overflow-hidden border-sky-200/70 bg-sky-50/40 shadow-sm ring-1 ring-sky-500/10">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_34%)]" />
                  <CardHeader className="relative flex flex-row items-center justify-between border-b border-sky-200/60 bg-sky-50/70 pb-3">
                    <div>
                      <CardTitle className="inline-flex items-center gap-2 text-base">
                        <NotebookPen className="h-4 w-4 text-sky-700" aria-hidden="true" />
                        Home Tasks
                      </CardTitle>
                      <p className="mt-1 text-xs text-sky-900/70">Repeatable rhythms and one-time home jobs.</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-xl px-2 text-xs"
                        onClick={archiveCompletedHomeTasks}
                      >
                        Archive
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 rounded-xl px-2 text-xs"
                        onClick={() => setShowAddHomeTask((prev) => !prev)}
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        Add task
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="relative p-3 sm:p-4">
                    {showAddHomeTask ? (
                      <div className="mb-3 rounded-xl border border-sky-200/70 bg-background/80 p-2.5 shadow-sm">
                        <div className="space-y-2">
                          <Input
                            value={newHomeTaskTitle}
                            onChange={(event) => setNewHomeTaskTitle(event.target.value)}
                            placeholder="Task name"
                            className="h-10 rounded-xl bg-background"
                          />
                          <select
                            value={newHomeTaskInterval}
                            onChange={(event) => setNewHomeTaskInterval(event.target.value)}
                            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                            aria-label="Task interval"
                          >
                            <option value="0">One Time</option>
                            <option value="1">Daily</option>
                            <option value="2">Every 2 Days</option>
                            <option value="3">Every 3 Days</option>
                            <option value="7">1 Week</option>
                            <option value="14">2 Weeks</option>
                            <option value="21">3 Weeks</option>
                            <option value="30">1 Month</option>
                            <option value="90">3 Months</option>
                            <option value="180">6 Months</option>
                          </select>
                          <Button
                            type="button"
                            size="sm"
                            className="h-9 w-full rounded-xl"
                            onClick={addHomeRecurringTask}
                          >
                            Save task
                          </Button>
                        </div>
                      </div>
                    ) : null}
                    <div className="space-y-3">
                      {[
                        { label: "One Time", intervalDays: 0 },
                        { label: "Daily", intervalDays: 1 },
                        { label: "Every 2 Days", intervalDays: 2 },
                        { label: "Every 3 Days", intervalDays: 3 },
                        { label: "1 Week", intervalDays: 7 },
                        { label: "2 Weeks", intervalDays: 14 },
                        { label: "3 Weeks", intervalDays: 21 },
                        { label: "1 Month", intervalDays: 30 },
                        { label: "3 Months", intervalDays: 90 },
                        { label: "6 Months", intervalDays: 180 },
                      ].map((group) => {
                        const groupedTasks = homeRecurringTasks
                          .filter((task) => task.intervalDays === group.intervalDays)
                          .slice()
                          .sort((a, b) => Number(isRecurringTaskDone(a)) - Number(isRecurringTaskDone(b)));
                        if (groupedTasks.length === 0) return null;
                        const isCollapsed = collapsedHomeTaskGroups.includes(group.intervalDays);
                        return (
                          <div key={group.label} className="space-y-1.5 rounded-2xl border border-sky-200/70 bg-sky-50/35 p-2 shadow-sm">
                            <button
                              type="button"
                              onClick={() => toggleHomeTaskGroup(group.intervalDays)}
                              className="flex w-full items-center justify-between rounded-xl border border-sky-200/80 bg-sky-50/75 px-3 py-2 text-left shadow-sm transition hover:bg-sky-100/80"
                            >
                              <span className="flex items-center gap-2">
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-sky-200 bg-white/90 text-sky-700">
                                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                                </span>
                                <span>
                                  <span className="block text-[12px] font-semibold uppercase text-sky-950">{group.label}</span>
                                  <span className="block text-[10px] text-sky-900/70">
                                    {groupedTasks.length} task{groupedTasks.length === 1 ? "" : "s"}
                                  </span>
                                </span>
                              </span>
                              <span className="inline-flex items-center gap-2">
                                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-900">
                                  {group.intervalDays === 0 ? "One-off" : `${group.intervalDays}d`}
                                </span>
                                {isCollapsed ? (
                                  <ChevronDown className="h-4 w-4 text-sky-700" aria-hidden="true" />
                                ) : (
                                  <ChevronUp className="h-4 w-4 text-sky-700" aria-hidden="true" />
                                )}
                              </span>
                            </button>
                            {!isCollapsed
                              ? groupedTasks.map((task) => {
                              const done = isRecurringTaskDone(task);
                              const daysLeft = recurringTaskDaysLeft(task);
                              return (
                                <div
                                  key={task.id}
                                  className={
                                    done
                                      ? "flex items-start justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/85 p-2.5 shadow-sm"
                                      : "flex items-start justify-between gap-2 rounded-xl border border-border/70 bg-background/85 p-2.5 shadow-sm"
                                  }
                                >
                                  <label className="flex items-start gap-2">
                                    <input
                                      type="checkbox"
                                      checked={done}
                                      onChange={() => toggleRecurringTaskDone(task.id)}
                                      className="mt-0.5 h-4 w-4 accent-primary"
                                    />
                                    <span>
                                      <span className="block text-sm">{task.title}</span>
                                      <span className="block text-[11px] text-muted-foreground">
                                        {recurringTaskIntervalLabel(task.intervalDays)}
                                      </span>
                                    </span>
                                  </label>
                                  <div className="flex items-center gap-1">
                                    {done ? (
                                      <div className="flex items-center gap-1">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-900 ring-1 ring-emerald-200">
                                          {task.intervalDays === 0 ? "done" : `back in ${daysLeft}d`}
                                        </span>
                                        {task.completedByUserId ? (
                                          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 px-1.5 text-[10px] font-semibold text-emerald-900">
                                            {task.completedByLetter ?? "U"}
                                          </span>
                                        ) : null}
                                      </div>
                                    ) : (
                                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-200">
                                        due
                                      </span>
                                    )}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground">
                                          <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                                          <span className="sr-only">Task actions</span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => toggleRecurringTaskDone(task.id)}>
                                          {done ? "Mark as open" : "Mark as done"}
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              );
                            })
                              : null}
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Done tasks re-open automatically when their repeat interval expires.
                    </p>
                    {archivedHomeTasks.length > 0 ? (
                      <div className="mt-2 rounded-xl border border-border/60 bg-background/70 p-2 shadow-sm">
                        <p className="text-[11px] font-semibold text-muted-foreground">
                          Archived tasks: {archivedHomeTasks.length}
                        </p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-emerald-200/70 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-500/10">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.13),transparent_34%)]" />
                  <CardHeader className="relative border-b border-emerald-200/60 bg-emerald-50/70 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="inline-flex items-center gap-2 text-base">
                          <Leaf className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                          Plants
                        </CardTitle>
                        <p className="mt-1 text-xs text-emerald-900/70">Indoor plants to water and keep an eye on.</p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-950 hover:bg-emerald-100">
                        {homePlants.length} plants
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="relative space-y-2 p-3 sm:p-4">
                    {homePlants.map((plant) => {
                      const hoursSinceWatered = (timeNow - plant.lastWateredAt) / (60 * 60 * 1000);
                      const waterDue = hoursSinceWatered >= plant.wateringIntervalDays * 24;
                      const waterLeft = waterDue
                        ? 12
                        : Math.max(10, 100 - Math.round((hoursSinceWatered / (plant.wateringIntervalDays * 24)) * 100));

                      return (
                        <div key={plant.id} className="rounded-xl border border-emerald-200/70 bg-background/85 p-3 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2">
                              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-100 text-emerald-800">
                                <plant.icon className="h-4 w-4" aria-hidden="true" />
                              </span>
                              <div>
                                <p className="text-sm font-semibold">{plant.name}</p>
                                <p className="text-[11px] text-muted-foreground">{plant.room}</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => waterHomePlantNow(plant.id)}
                              disabled={!waterDue}
                              className="h-7 rounded-lg px-2 text-xs"
                            >
                              {waterDue ? "Water now" : "Watered"}
                            </Button>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
                            <p className="text-muted-foreground">
                              Last watered: <span className="font-medium text-foreground">{formatRelativeWaterTime(plant.lastWateredAt, timeNow)}</span>
                            </p>
                            <p className="text-right text-muted-foreground">
                              Interval: <span className="font-medium text-foreground">every {plant.wateringIntervalDays}d</span>
                            </p>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className={waterDue ? "h-full rounded-full bg-amber-500" : "h-full rounded-full bg-emerald-500"}
                              style={{ width: `${waterLeft}%` }}
                            />
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">{plant.note}</p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-emerald-200/70 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-500/10">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.13),transparent_34%)]" />
                  <CardHeader className="relative border-b border-emerald-200/60 bg-emerald-50/70 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="inline-flex items-center gap-2 text-base">
                          <PenSquare className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                          Notes
                        </CardTitle>
                        <p className="mt-1 text-xs text-emerald-900/70">Small reminders grouped by context.</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-xl border-emerald-200 bg-white/80 px-3 text-emerald-900"
                        onClick={() => {
                          setShowAddHomeNote((prev) => !prev);
                          setEditingHomeNoteId(null);
                        }}
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        Add note
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="relative space-y-2 p-3 sm:p-4">
                    {showAddHomeNote ? (
                      <div className="rounded-2xl border border-emerald-200/80 bg-white/85 p-3.5 shadow-sm">
                        <div className="space-y-2">
                          <select
                            value={newHomeNoteCategory}
                            onChange={(event) => setNewHomeNoteCategory(event.target.value)}
                            className="h-10 w-full rounded-xl border border-emerald-200 bg-background px-3 text-sm outline-none ring-0"
                          >
                            {["General", "Supplies", "Maintenance", "Reminder"].map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                          <textarea
                            value={newHomeNoteText}
                            onChange={(event) => setNewHomeNoteText(event.target.value)}
                            placeholder="Add a note for the flat..."
                            className="min-h-24 w-full rounded-xl border border-emerald-200 bg-background px-3 py-2.5 text-sm outline-none ring-0"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-9 rounded-xl"
                              onClick={() => {
                                setShowAddHomeNote(false);
                                setNewHomeNoteCategory("General");
                                setNewHomeNoteText("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button type="button" className="h-9 rounded-xl" onClick={() => void addHomeNote()}>
                              Save note
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {homeNotes.map((note) => {
                      const isEditing = editingHomeNoteId === note.id;
                      return (
                        <div key={note.id} className="rounded-xl border border-emerald-200/70 bg-background/85 p-3.5 shadow-sm">
                          {isEditing ? (
                            <div className="space-y-2">
                              <select
                                value={editingHomeNoteCategory}
                                onChange={(event) => setEditingHomeNoteCategory(event.target.value)}
                                className="h-10 w-full rounded-xl border border-emerald-200 bg-background px-3 text-sm outline-none ring-0"
                              >
                                {["General", "Supplies", "Maintenance", "Reminder"].map((category) => (
                                  <option key={category} value={category}>
                                    {category}
                                  </option>
                                ))}
                              </select>
                              <textarea
                                value={editingHomeNoteText}
                                onChange={(event) => setEditingHomeNoteText(event.target.value)}
                                className="min-h-24 w-full rounded-xl border border-emerald-200 bg-background px-3 py-2.5 text-sm outline-none ring-0"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="h-9 rounded-xl"
                                  onClick={() => {
                                    setEditingHomeNoteId(null);
                                    setEditingHomeNoteCategory("");
                                    setEditingHomeNoteText("");
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button type="button" className="h-9 rounded-xl" onClick={() => void saveHomeNoteEdit()}>
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between gap-3">
                                <p className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-950">
                                  <Tag className="h-3 w-3" aria-hidden="true" />
                                  {note.category}
                                </p>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button type="button" size="icon" variant="ghost" className="mt-[-2px] h-7 w-7 text-muted-foreground">
                                      <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                                      <span className="sr-only">Note actions</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => startEditHomeNote(note)}>Edit</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => void deleteHomeNote(note.id)}>Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-foreground/90">{note.note}</p>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

              </div>
            </div>
          ) : activeView === "recipes" ? (
            <div className="space-y-5">
              <section className="relative overflow-hidden rounded-xl border border-border/70 bg-card/90 p-3 shadow-sm ring-1 ring-rose-500/10 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-foreground">Recipes</p>
                    <p className="inline-flex items-center gap-2 text-sm font-semibold">
                      <Tag className="h-4 w-4" aria-hidden="true" />
                      Quick filters
                    </p>
                    <p className="text-xs text-muted-foreground">Swipe on mobile, wrap on desktop.</p>
                  </div>
                  <Button type="button" size="sm" className="h-9 rounded-xl" onClick={startCreateRecipe}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    Add recipe
                  </Button>
                </div>
                <div className="mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:overflow-visible">
                  {["Quick (under 20 min)", "Vegetarian", "High protein", "Garden use"].map((filter) => (
                    <Badge
                      key={filter}
                      variant="outline"
                      className="snap-start whitespace-nowrap rounded-full border-border/70 bg-background/75 px-3 py-1"
                    >
                      {filter}
                    </Badge>
                  ))}
                </div>
              </section>

              {activeRecipeId ? (
                <Card className="relative overflow-hidden border-border/70 bg-card/90 shadow-sm ring-1 ring-rose-500/10">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.12),transparent_34%)]" />
                  <CardHeader className="relative flex flex-row items-start justify-between gap-3 border-b border-border/60 bg-background/50 pb-3">
                    <div>
                      <CardTitle className="text-base">
                        {recipes.find((recipe) => recipe.id === activeRecipeId)?.title ?? "Recipe"}
                      </CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">Recipe details and cooking flow.</p>
                    </div>
                    <div className="hidden shrink-0 gap-2 xl:flex">
                      {!isRecipeEditing && recipes.find((item) => item.id === activeRecipeId) ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => {
                            const currentRecipe = recipes.find((item) => item.id === activeRecipeId);
                            if (currentRecipe) startEditRecipe(currentRecipe);
                          }}
                        >
                          Edit recipe
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => {
                          setActiveRecipeId(null);
                          resetRecipeEditor();
                        }}
                      >
                      Back to recipes
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="relative space-y-4 p-3 sm:p-4">
                    {(() => {
                      const recipe = recipes.find((item) => item.id === activeRecipeId);
                      if (isRecipeEditing) {
                        return (
                          <div className="space-y-3">
                            <Input value={recipeTitleInput} onChange={(event) => setRecipeTitleInput(event.target.value)} placeholder="Recipe name" className="h-11 rounded-xl" />
                            <div className="grid gap-2 sm:grid-cols-2">
                              <Input value={recipeTimeInput} onChange={(event) => setRecipeTimeInput(event.target.value)} placeholder="25 min" className="h-11 rounded-xl" />
                              <Input value={recipeServingsInput} onChange={(event) => setRecipeServingsInput(event.target.value)} placeholder="2 servings" className="h-11 rounded-xl" />
                            </div>
                            <Input value={recipeTagsInput} onChange={(event) => setRecipeTagsInput(event.target.value)} placeholder="Tags, comma separated" className="h-11 rounded-xl" />
                            <textarea
                              value={recipeIngredientsInput}
                              onChange={(event) => setRecipeIngredientsInput(event.target.value)}
                              placeholder={"Ingredients, one per line\n500 g pasta\n250 ml cream"}
                              className="min-h-32 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
                            />
                            <textarea
                              value={recipeStepsInput}
                              onChange={(event) => setRecipeStepsInput(event.target.value)}
                              placeholder={"Steps, one per line\n5 min | Boil the pasta\n10 min | Finish the sauce"}
                              className="min-h-32 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
                            />
                            <Input
                              value={recipeMissingItemsInput}
                              onChange={(event) => setRecipeMissingItemsInput(event.target.value)}
                              placeholder="Missing items, comma separated"
                              className="h-11 rounded-xl"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                className="rounded-xl"
                                onClick={() => {
                                  if (recipeEditorId) {
                                    setIsRecipeEditing(false);
                                  } else {
                                    setActiveRecipeId(null);
                                    resetRecipeEditor();
                                  }
                                }}
                              >
                                Cancel
                              </Button>
                              <Button type="button" className="rounded-xl" onClick={() => void saveRecipeEditor()}>
                                Save recipe
                              </Button>
                            </div>
                          </div>
                        );
                      }
                      if (!recipe) return null;
                      return (
                        <>
                          <div className="relative overflow-hidden rounded-xl border border-border/70 bg-muted/30 shadow-sm">
                          {recipe.thumbnailUrl ? (
                            <img
                              src={recipe.thumbnailUrl}
                              alt={`${recipe.title} thumbnail`}
                              className="h-40 w-full object-cover sm:h-44"
                            />
                          ) : (
                            <div className="flex h-40 w-full items-center justify-center text-xs text-muted-foreground sm:h-44">
                              No photo yet
                            </div>
                          )}
                            <div className="absolute bottom-3 left-3 flex gap-2">
                              <Badge className="bg-background/90 text-foreground hover:bg-background/90">
                                <Clock3 className="mr-1 h-3 w-3" aria-hidden="true" />
                                {recipe.time}
                              </Badge>
                              <Badge className="bg-background/90 text-foreground hover:bg-background/90">
                                <Users2 className="mr-1 h-3 w-3" aria-hidden="true" />
                                {recipe.servings}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                              {(recipe.gallery ?? [
                                { label: "Plating", url: null },
                                { label: "Step", url: null },
                                { label: "Ingredients", url: null },
                              ]).map((slide, idx) => (
                                <div
                                  key={`${slide.label}-${idx}`}
                                  className="shrink-0 rounded-lg border border-border/60 bg-background/70 p-1 shadow-sm"
                                >
                                  <div className="h-8 w-14 rounded-md bg-muted/50" />
                                </div>
                              ))}
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-3 shadow-sm">
                              <p className="inline-flex items-center gap-2 text-sm font-semibold">
                                <ShoppingBasket className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                                Ingredients
                              </p>
                              <ul className="mt-1 space-y-1 text-sm">
                                {recipe.ingredients.map((ingredient, idx) => {
                                  const normalized = normalizeIngredient(ingredient);
                                  return (
                                  <li key={`${normalized.item}-${idx}`} className="flex items-center justify-between gap-2 rounded-lg bg-background/70 px-2 py-1">
                                    <span>{normalized.item}</span>
                                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-950">
                                      {normalized.amount} {normalized.unit}
                                    </span>
                                  </li>
                                  );
                                })}
                              </ul>
                            </div>
                            <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-3 shadow-sm">
                              <p className="inline-flex items-center gap-2 text-sm font-semibold">
                                <Clock3 className="h-4 w-4 text-amber-700" aria-hidden="true" />
                                Steps
                              </p>
                              <ol className="mt-1 space-y-1 text-sm">
                                {recipe.steps.map((step, idx) => (
                                  <li key={`${step.text}-${idx}`} className="flex items-center justify-between gap-2 rounded-lg bg-background/70 px-2 py-1">
                                    <span>{idx + 1}. {step.text}</span>
                                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-950">
                                      {step.time}
                                    </span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            className="h-10 w-full rounded-xl sm:w-auto"
                            onClick={() => addRecipeIngredientsToShopping(recipe)}
                          >
                            Add to shopping list
                          </Button>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {recipes.map((recipe) => (
                  <Card key={recipe.id} className="group relative overflow-hidden border-border/70 bg-card/90 shadow-sm ring-1 ring-rose-500/10 transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.10),transparent_34%)] opacity-80" />
                    <CardContent className="relative space-y-3 p-3">
                      <div className="relative overflow-hidden rounded-xl border border-border/70 bg-muted/30 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setActiveRecipeId(recipe.id)}
                          className="block w-full text-left"
                          aria-label={`Open ${recipe.title} details`}
                        >
                          {recipe.thumbnailUrl ? (
                            <img
                              src={recipe.thumbnailUrl}
                              alt={`${recipe.title} thumbnail`}
                              className="h-28 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-32"
                            />
                          ) : (
                            <div className="flex h-28 w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(244,63,94,0.12),transparent_45%)] text-xs text-muted-foreground sm:h-32">
                              <CookingPot className="mr-2 h-4 w-4" aria-hidden="true" />
                              No photo yet
                            </div>
                          )}
                        </button>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent p-3">
                          <div className="flex items-end justify-between gap-2">
                            <div className="min-w-0">
                              <CardTitle className="truncate text-base text-white">{recipe.title}</CardTitle>
                              <p className="mt-0.5 text-xs text-white/75">
                                {recipe.ingredients.length} ingredients - {recipe.steps.length} steps
                              </p>
                            </div>
                            <div className="pointer-events-auto">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button type="button" size="icon" variant="secondary" className="h-8 w-8 shrink-0 rounded-full bg-background/90">
                                  <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span className="sr-only">Recipe actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => startEditRecipe(recipe)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => void deleteRecipe(recipe.id, recipe.title)}>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] text-muted-foreground">
                        <span className="inline-flex flex-col items-center justify-center gap-1 rounded-lg border border-border/70 bg-background/70 px-1.5 py-2">
                          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                          {recipe.time}
                        </span>
                        <span className="inline-flex flex-col items-center justify-center gap-1 rounded-lg border border-border/70 bg-background/70 px-1.5 py-2">
                          <Users2 className="h-3.5 w-3.5" aria-hidden="true" />
                          {recipe.servings}
                        </span>
                        <span className="inline-flex flex-col items-center justify-center gap-1 rounded-lg border border-border/70 bg-background/70 px-1.5 py-2">
                          <Wheat className="h-3.5 w-3.5" aria-hidden="true" />
                          {recipe.ingredients.length} items
                        </span>
                        <span className="inline-flex flex-col items-center justify-center gap-1 rounded-lg border border-border/70 bg-background/70 px-1.5 py-2">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          {recipe.steps.length} steps
                        </span>
                      </div>
                      <div className="flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {recipe.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="shrink-0 rounded-full text-[11px]">
                            <Tag className="mr-1 h-3 w-3" aria-hidden="true" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-2">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-amber-900">Missing ingredients</span>
                          <span className="text-[10px] text-amber-900/70">double tap</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          {recipe.missingItems.map((missingItem) => {
                            const pillKey = `${recipe.id}:${missingItem.toLowerCase()}`;
                            const isPending = pendingMissingPillKey === pillKey;
                            const isAdded = addedMissingPillKeys.includes(pillKey);
                            return (
                              <button
                                key={pillKey}
                                type="button"
                                onClick={() => handleMissingPillClick(recipe.id, missingItem)}
                                className={
                                  isAdded
                                    ? "shrink-0 rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-900"
                                    : isPending
                                    ? "shrink-0 rounded-full border border-amber-400 bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-950"
                                    : "shrink-0 rounded-full border border-amber-200 bg-background/80 px-2 py-0.5 text-[11px] text-amber-900"
                                }
                              >
                                {isAdded ? `Added: ${missingItem}` : isPending ? `Tap again: ${missingItem}` : missingItem}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="grid grid-cols-[1fr_auto] gap-2">
                        <Button type="button" size="sm" className="h-10 w-full rounded-xl" onClick={() => setActiveRecipeId(recipe.id)}>
                          Recipe details
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-10 rounded-xl px-3"
                          onClick={() => addRecipeIngredientsToShopping(recipe)}
                        >
                          <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Add to shopping list</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              )}
            </div>
          ) : activeView === "users" ? (
            <div className="space-y-5">
              <section className="relative overflow-hidden rounded-xl border border-border/70 bg-card/90 p-4 shadow-sm ring-1 ring-emerald-500/10 sm:p-5">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_36%)]" />
                <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-950 text-2xl font-semibold text-white shadow-sm">
                      Y
                    </span>
                    <div className="space-y-2">
                      <Badge className="border border-emerald-500/20 bg-emerald-50 text-emerald-900 hover:bg-emerald-50">
                        Account overview
                      </Badge>
                      <div>
                        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Profile</h1>
                        <p className="text-sm text-muted-foreground sm:text-base">
                          Your private household account and access settings.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-white/70 bg-background/75 p-1.5 shadow-[0_16px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:gap-2 lg:min-w-[23rem]">
                    <div className="rounded-lg border border-emerald-500/15 bg-emerald-50/80 px-2 py-2 sm:px-3">
                      <Users2 className="mb-2 h-4 w-4 text-emerald-700" aria-hidden="true" />
                      <p className="text-xl font-semibold leading-none text-emerald-950 tabular-nums">2</p>
                      <p className="mt-1 truncate text-[11px] font-medium text-emerald-900">Users</p>
                    </div>
                    <div className="rounded-lg border border-sky-500/15 bg-sky-50/80 px-2 py-2 sm:px-3">
                      <Settings2 className="mb-2 h-4 w-4 text-sky-700" aria-hidden="true" />
                      <p className="text-xl font-semibold leading-none text-sky-950 tabular-nums">2x</p>
                      <p className="mt-1 truncate text-[11px] font-medium text-sky-900">Owners</p>
                    </div>
                    <div className="rounded-lg border border-amber-500/15 bg-amber-50/80 px-2 py-2 sm:px-3">
                      <Database className="mb-2 h-4 w-4 text-amber-700" aria-hidden="true" />
                      <p className="text-xl font-semibold leading-none text-amber-950 tabular-nums">
                        {databaseStatus === "ready" ? "Live" : "Soon"}
                      </p>
                      <p className="mt-1 truncate text-[11px] font-medium text-amber-900">Database</p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <Card className="overflow-hidden border-border/70 bg-card/90 shadow-sm">
                  <CardHeader className="border-b border-border/60 bg-background/50 pb-3">
                    <CardTitle className="inline-flex items-center gap-2 text-base">
                      <Users2 className="h-4 w-4" aria-hidden="true" />
                      Personal profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-3 sm:p-4">
                    <div className="rounded-xl border border-border/70 bg-background/75 p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950 text-lg font-semibold text-white">
                            Y
                          </span>
                          <div>
                            <p className="text-sm font-semibold">You</p>
                            <p className="text-xs text-muted-foreground">{authUser.email}</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">Owner</Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-muted/40 p-2">
                          <p className="text-muted-foreground">Access</p>
                          <p className="font-medium">Full workspace</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-2">
                          <p className="text-muted-foreground">Login</p>
                          <p className="font-medium">Supabase Auth</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-background/75 p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/70 text-muted-foreground">
                            <Database className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold">Supabase connection</p>
                            <p className="text-xs text-muted-foreground">{databaseMessage}</p>
                          </div>
                        </div>
                        <Badge className={databaseStatusCopy[databaseStatus].tone}>
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${databaseStatusCopy[databaseStatus].dot}`} />
                          {databaseStatusCopy[databaseStatus].label}
                        </Badge>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-background/75 p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/70 text-muted-foreground">
                            <Home className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold">Household workspace</p>
                            <p className="text-xs text-muted-foreground">{workspaceMessage}</p>
                            {activeWorkspaceId ? (
                              <p className="mt-1 max-w-[16rem] truncate text-[11px] text-muted-foreground">
                                ID: {activeWorkspaceId}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <Badge className={workspaceStatusCopy[workspaceStatus].tone}>
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${workspaceStatusCopy[workspaceStatus].dot}`} />
                          {workspaceStatusCopy[workspaceStatus].label}
                        </Badge>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-background/75 p-3 shadow-sm">
                      <p className="text-sm font-semibold">Partner profile</p>
                      <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-2">
                        <div>
                          <p className="text-sm font-medium">Partner</p>
                          <p className="text-xs text-muted-foreground">Equal co-owner access</p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">Owner</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-border/70 bg-card/90 shadow-sm">
                  <CardHeader className="border-b border-border/60 bg-background/50 pb-3">
                    <CardTitle className="inline-flex items-center gap-2 text-base">
                      <Settings2 className="h-4 w-4" aria-hidden="true" />
                      Account settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3 sm:p-4">
                    {[
                      ["Profile details", "Name, avatar, contact email"],
                      ["Security", "Password and future 2FA"],
                      ["Notifications", "Shopping and task reminders"],
                      ["Data & export", "Shared workspace data"],
                    ].map(([title, desc]) => (
                      <button
                        key={title}
                        type="button"
                        className="flex w-full items-center justify-between rounded-xl border border-border/70 bg-background/75 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-muted/40"
                      >
                        <span>
                          <span className="block text-sm font-medium">{title}</span>
                          <span className="block text-xs text-muted-foreground">{desc}</span>
                        </span>
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      </button>
                    ))}
                    <Button type="button" variant="outline" className="h-10 w-full rounded-xl" onClick={handleSignOut}>
                      Sign out
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Prototype</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Prototype placeholder. Main flow is on the Shopping page.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 px-3 pb-3 pt-2 lg:hidden">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background via-background/85 to-transparent" />
        <div className="relative mx-auto grid max-w-lg grid-cols-5 gap-1 rounded-2xl border border-border/70 bg-background/90 p-1.5 shadow-[0_18px_55px_rgba(15,23,42,0.16)] backdrop-blur-xl">
          {mobilePrimaryNav.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setActiveView(item.view)}
              className={`relative flex min-h-12 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl px-1 py-2 transition duration-200 ${
                activeView === item.view
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
              aria-label={`Open ${item.label}`}
            >
              {activeView === item.view ? (
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_45%)]" />
              ) : null}
              <item.icon className="relative h-4 w-4" aria-hidden="true" />
              <span className="relative max-w-full truncate text-[11px] font-medium leading-none">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}

function daysSince(timestamp: number) {
  const day = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.floor((Date.now() - timestamp) / day));
}
