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
