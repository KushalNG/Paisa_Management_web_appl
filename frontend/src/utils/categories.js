export const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Groceries',
  'Personal Care',
  'Gifts & Donations',
  'Other',
];

export const COMMITMENT_TYPES = [
  'EMI',
  'Subscription',
  'Rent',
  'Other',
];

const CATEGORY_COLORS = {
  'Food & Dining': '#FF6384',
  'Transportation': '#36A2EB',
  'Shopping': '#FFCE56',
  'Entertainment': '#4BC0C0',
  'Bills & Utilities': '#9966FF',
  'Healthcare': '#FF9F40',
  'Education': '#E11D48',
  'Travel': '#14B8A6',
  'Groceries': '#22C55E',
  'Personal Care': '#F97316',
  'Gifts & Donations': '#0EA5E9',
  'Other': '#8B5CF6',
};

const CUSTOM_CATEGORIES_KEY = 'paisa_custom_categories';
const CUSTOM_CATEGORY_COLORS_KEY = 'paisa_custom_category_colors';
const CUSTOM_CATEGORY_COLOR_PALETTE = [
  '#EF4444',
  '#F59E0B',
  '#84CC16',
  '#10B981',
  '#06B6D4',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#D946EF',
  '#EC4899',
  '#F97316',
  '#14B8A6',
];

const normalizeCategoryName = (categoryName) => categoryName.trim();

const readCustomCategoryColors = () => {
  try {
    const stored = localStorage.getItem(CUSTOM_CATEGORY_COLORS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading custom category colors:', error);
    return {};
  }
};

const saveCustomCategoryColors = (colorMap) => {
  localStorage.setItem(CUSTOM_CATEGORY_COLORS_KEY, JSON.stringify(colorMap));
};

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const generateFallbackColor = (category) => {
  const hue = hashString(category) % 360;
  return `hsl(${hue}, 70%, 55%)`;
};

const assignColorToCustomCategory = (categoryName) => {
  const normalizedName = normalizeCategoryName(categoryName);
  const colorMap = readCustomCategoryColors();
  if (colorMap[normalizedName]) {
    return colorMap[normalizedName];
  }

  const usedColors = new Set(Object.values(colorMap));
  const nextColor = CUSTOM_CATEGORY_COLOR_PALETTE.find((color) => !usedColors.has(color))
    || generateFallbackColor(normalizedName);

  colorMap[normalizedName] = nextColor;
  saveCustomCategoryColors(colorMap);
  return nextColor;
};

export const getCategoryColor = (category) => {
  if (!category) return '#999999';
  return CATEGORY_COLORS[category] || assignColorToCustomCategory(category);
};

// Category Management Functions
export const getCustomCategories = () => {
  try {
    const stored = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading custom categories:', error);
    return [];
  }
};

export const getAllCategories = () => {
  const customCategories = getCustomCategories();
  return [...DEFAULT_CATEGORIES, ...customCategories];
};

export const addCustomCategory = (categoryName) => {
  if (!categoryName || typeof categoryName !== 'string') {
    throw new Error('Category name must be a non-empty string');
  }

  const trimmedName = normalizeCategoryName(categoryName);
  if (!trimmedName) {
    throw new Error('Category name cannot be empty');
  }

  const allCategories = getAllCategories();
  if (allCategories.includes(trimmedName)) {
    throw new Error('Category already exists');
  }

  const customCategories = getCustomCategories();
  customCategories.push(trimmedName);
  localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(customCategories));
  assignColorToCustomCategory(trimmedName);

  return trimmedName;
};

export const removeCustomCategory = (categoryName) => {
  const customCategories = getCustomCategories();
  const filtered = customCategories.filter(cat => cat !== categoryName);
  localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(filtered));

  const colorMap = readCustomCategoryColors();
  delete colorMap[categoryName];
  saveCustomCategoryColors(colorMap);
};
