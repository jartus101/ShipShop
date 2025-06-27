import { DetailedPost } from "@/types/video";

interface CategoryPreference {
  category: string;
  likeCount: number;
  probability: number;
  subcategoryPreferences: Record<string, { count: number; probability: number }>;
}

interface UserPreferences {
  totalLikes: number;
  categoryPreferences: Record<string, CategoryPreference>;
}

/**
 * Calculate user preferences based on their liked posts
 */
export function calculateUserPreferences(likedPosts: DetailedPost[]): UserPreferences {
  const categoryStats: Record<string, { count: number; subcategories: Record<string, number> }> = {};
  
  // Count likes by category and subcategory
  likedPosts.forEach(post => {
    const category = post.hashtag;
    const subcategory = post.subcategory || 'general';
    
    if (!categoryStats[category]) {
      categoryStats[category] = { count: 0, subcategories: {} };
    }
    
    categoryStats[category].count++;
    categoryStats[category].subcategories[subcategory] = 
      (categoryStats[category].subcategories[subcategory] || 0) + 1;
  });
  
  const totalLikes = likedPosts.length;
  const categoryPreferences: Record<string, CategoryPreference> = {};
  
  // Calculate probabilities
  Object.entries(categoryStats).forEach(([category, stats]) => {
    const categoryProbability = stats.count / totalLikes;
    const subcategoryPreferences: Record<string, { count: number; probability: number }> = {};
    
    Object.entries(stats.subcategories).forEach(([subcategory, count]) => {
      subcategoryPreferences[subcategory] = {
        count,
        probability: count / stats.count
      };
    });
    
    categoryPreferences[category] = {
      category,
      likeCount: stats.count,
      probability: categoryProbability,
      subcategoryPreferences
    };
  });
  
  return {
    totalLikes,
    categoryPreferences
  };
}

/**
 * Weighted random selection based on probabilities
 */
function weightedRandomSelect<T>(items: Array<{ item: T; weight: number }>): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item.item;
    }
  }
  
  // Fallback to last item
  return items[items.length - 1].item;
}

/**
 * Order posts based on user preferences with probabilistic sampling
 */
export function orderPostsByPreferences(
  posts: DetailedPost[], 
  userPreferences: UserPreferences,
  batchSize: number = 10
): DetailedPost[] {
  if (userPreferences.totalLikes === 0) {
    // No likes history, return shuffled posts
    return [...posts].sort(() => Math.random() - 0.5);
  }
  
  const orderedPosts: DetailedPost[] = [];
  const remainingPosts = [...posts];
  const categorizedPosts: Record<string, DetailedPost[]> = {};
  
  // Group posts by category
  remainingPosts.forEach(post => {
    const category = post.hashtag;
    if (!categorizedPosts[category]) {
      categorizedPosts[category] = [];
    }
    categorizedPosts[category].push(post);
  });
  
  // Process posts in batches to maintain variety
  while (remainingPosts.length > 0 && orderedPosts.length < posts.length) {
    const batchPosts: DetailedPost[] = [];
    
    for (let i = 0; i < batchSize && remainingPosts.length > 0; i++) {
      // Select category based on user preferences
      const categoryWeights = Object.entries(userPreferences.categoryPreferences)
        .filter(([category]) => categorizedPosts[category]?.length > 0)
        .map(([category, pref]) => ({
          item: category,
          weight: pref.probability * 100 // Scale up for better distribution
        }));
      
      if (categoryWeights.length === 0) {
        // No preferred categories available, pick random
        const availableCategories = Object.keys(categorizedPosts).filter(cat => categorizedPosts[cat].length > 0);
        if (availableCategories.length === 0) break;
        
        const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        const randomPost = categorizedPosts[randomCategory].splice(
          Math.floor(Math.random() * categorizedPosts[randomCategory].length), 1
        )[0];
        batchPosts.push(randomPost);
        continue;
      }
      
      const selectedCategory = weightedRandomSelect(categoryWeights);
      const categoryPosts = categorizedPosts[selectedCategory];
      
      if (categoryPosts.length === 0) continue;
      
      // Within the category, select subcategory based on preferences
      const categoryPrefs = userPreferences.categoryPreferences[selectedCategory];
      const subcategoryGroups: Record<string, DetailedPost[]> = {};
      
      categoryPosts.forEach(post => {
        const subcategory = post.subcategory || 'general';
        if (!subcategoryGroups[subcategory]) {
          subcategoryGroups[subcategory] = [];
        }
        subcategoryGroups[subcategory].push(post);
      });
      
      const subcategoryWeights = Object.entries(categoryPrefs.subcategoryPreferences)
        .filter(([subcategory]) => subcategoryGroups[subcategory]?.length > 0)
        .map(([subcategory, pref]) => ({
          item: subcategory,
          weight: pref.probability * 100
        }));
      
      let selectedPost: DetailedPost;
      
      if (subcategoryWeights.length === 0) {
        // No subcategory preferences, pick random from category
        selectedPost = categoryPosts.splice(
          Math.floor(Math.random() * categoryPosts.length), 1
        )[0];
      } else {
        const selectedSubcategory = weightedRandomSelect(subcategoryWeights);
        const subcategoryPosts = subcategoryGroups[selectedSubcategory];
        selectedPost = subcategoryPosts.splice(
          Math.floor(Math.random() * subcategoryPosts.length), 1
        )[0];
        
        // Remove from main category array
        const postIndex = categoryPosts.indexOf(selectedPost);
        if (postIndex > -1) {
          categoryPosts.splice(postIndex, 1);
        }
      }
      
      batchPosts.push(selectedPost);
      remainingPosts.splice(remainingPosts.indexOf(selectedPost), 1);
    }
    
    // Shuffle the batch to add some randomness
    batchPosts.sort(() => Math.random() - 0.5);
    orderedPosts.push(...batchPosts);
  }
  
  return orderedPosts;
}

/**
 * Main function to get personalized feed
 */
export async function getPersonalizedFeed(
  allPosts: DetailedPost[],
  likedPosts: DetailedPost[]
): Promise<DetailedPost[]> {
  const userPreferences = calculateUserPreferences(likedPosts);
  return orderPostsByPreferences(allPosts, userPreferences);
}
