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

export const getCategoryColor = (category) => {
  const colors = {
    'Food & Dining': '#FF6384',
    'Transportation': '#36A2EB',
    'Shopping': '#FFCE56',
    'Entertainment': '#4BC0C0',
    'Bills & Utilities': '#9966FF',
    'Healthcare': '#FF9F40',
    'Education': '#FF6384',
    'Travel': '#C9CBCF',
    'Groceries': '#4BC0C0',
    'Personal Care': '#FF9F40',
    'Gifts & Donations': '#36A2EB',
    'Other': '#9966FF',
  };
  return colors[category] || '#999999';
};

// Category Management Functions
const CUSTOM_CATEGORIES_KEY = 'paisa_custom_categories';

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

  const trimmedName = categoryName.trim();
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
  
  return trimmedName;
};

export const removeCustomCategory = (categoryName) => {
  const customCategories = getCustomCategories();
  const filtered = customCategories.filter(cat => cat !== categoryName);
  localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(filtered));
};
