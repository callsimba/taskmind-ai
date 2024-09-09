export const categories = ['Work', 'Personal', 'Shopping', 'Health', 'Other'] as const;

export type Category = typeof categories[number];

const categoryKeywords: Record<Category, string[]> = {
  Work: ['meeting', 'project', 'deadline', 'presentation', 'client', 'report', 'email', 'call', 'pitch'],
  Personal: ['family', 'friend', 'hobby', 'leisure', 'vacation', 'birthday', 'party', 'social'],
  Shopping: ['buy', 'purchase', 'shop', 'grocery', 'store', 'mall', 'online', 'order'],
  Health: ['exercise', 'workout', 'gym', 'doctor', 'appointment', 'medicine', 'diet', 'sleep'],
  Other: [],
};

export function determineCategory(taskTitle: string): Category {
  const lowercaseTitle = taskTitle.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowercaseTitle.includes(keyword))) {
      return category as Category;
    }
  }
  
  return 'Other';
}