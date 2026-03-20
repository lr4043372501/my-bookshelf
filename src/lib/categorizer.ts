/**
 * Book categorization and description utilities
 * Uses simple heuristics for categorization
 */

import { BookCategory } from '@/types';

// Keywords for each category
const CATEGORY_KEYWORDS: Record<BookCategory, string[]> = {
  fiction: [
    'novel', 'story', 'fiction', 'characters', 'plot', 'narrative', 'chapter',
    'protagonist', 'setting', 'drama', 'tale', 'adventure', 'mystery', 'romance'
  ],
  'non-fiction': [
    'analysis', 'research', 'study', 'evidence', 'theory', 'facts', 'real',
    'documentary', 'journalism', 'report'
  ],
  science: [
    'physics', 'chemistry', 'biology', 'science', 'experiment', 'hypothesis',
    'scientific', 'research', 'discovery', 'molecular', 'quantum', 'evolution'
  ],
  technology: [
    'software', 'hardware', 'computer', 'programming', 'digital', 'technology',
    'algorithm', 'data', 'machine learning', 'AI', 'internet', 'code', 'system'
  ],
  history: [
    'history', 'historical', 'century', 'ancient', 'war', 'civilization',
    'empire', 'revolution', 'period', 'era', 'past', 'chronicle'
  ],
  biography: [
    'biography', 'memoir', 'autobiography', 'life', 'born', 'died', 'career',
    'personal', 'achievement', 'legacy', 'childhood'
  ],
  'self-help': [
    'self-improvement', 'motivation', 'success', 'mindfulness', 'habits',
    'productivity', 'happiness', 'growth', 'personal development', 'wellness'
  ],
  business: [
    'business', 'management', 'marketing', 'strategy', 'leadership',
    'entrepreneurship', 'finance', 'investment', 'economy', 'company'
  ],
  philosophy: [
    'philosophy', 'ethics', 'existence', 'consciousness', 'meaning', 'truth',
    'wisdom', 'think', 'reason', 'logic', 'metaphysics', 'philosophical'
  ],
  art: [
    'art', 'painting', 'sculpture', 'music', 'design', 'creative', 'artist',
    'aesthetic', 'visual', 'gallery', 'masterpiece', 'artistic'
  ],
  other: [],
};

interface CategorizationResult {
  category: BookCategory;
  themes: string[];
  confidence: number;
}

/**
 * Categorize a book based on extracted text content
 */
export function categorizeBook(text: string, title: string): CategorizationResult {
  const combinedText = `${title} ${text}`.toLowerCase();
  const scores: Record<BookCategory, number> = {
    fiction: 0,
    'non-fiction': 0,
    science: 0,
    technology: 0,
    history: 0,
    biography: 0,
    'self-help': 0,
    business: 0,
    philosophy: 0,
    art: 0,
    other: 0,
  };

  // Count keyword matches for each category
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = combinedText.match(regex);
      if (matches) {
        scores[category as BookCategory] += matches.length;
      }
    }
  }

  // Find the category with the highest score
  let maxCategory: BookCategory = 'other';
  let maxScore = 0;

  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxCategory = category as BookCategory;
    }
  }

  // Extract themes (top keywords that appeared)
  const themes = extractThemes(combinedText);

  // Calculate confidence (0-1 scale)
  const totalMatches = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalMatches > 0 ? maxScore / totalMatches : 0;

  return {
    category: maxCategory,
    themes,
    confidence: Math.min(confidence, 1),
  };
}

/**
 * Extract key themes from text
 */
function extractThemes(text: string): string[] {
  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them',
    'their', 'we', 'us', 'our', 'you', 'your', 'he', 'him', 'his', 'she',
    'her', 'i', 'me', 'my', 'who', 'whom', 'whose', 'which', 'what', 'where',
    'when', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'not', 'only', 'same', 'so',
    'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then',
  ]);

  // Extract words and count frequency
  const words = text.match(/\b[a-z]{3,}\b/gi) || [];
  const frequency: Record<string, number> = {};

  for (const word of words) {
    const lowerWord = word.toLowerCase();
    if (!stopWords.has(lowerWord)) {
      frequency[lowerWord] = (frequency[lowerWord] || 0) + 1;
    }
  }

  // Get top themes by frequency
  const sortedWords = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  return sortedWords;
}

/**
 * Generate a book description from text
 */
export function generateDescription(text: string, title: string, category: BookCategory): string {
  // Extract first meaningful sentences
  const sentences = text
    .replace(/\s+/g, ' ')
    .match(/[^.!?]+[.!?]+/g) || [];

  const relevantSentences = sentences
    .filter(s => s.trim().length > 50 && s.trim().length < 200)
    .slice(0, 3);

  if (relevantSentences.length > 0) {
    return `${category.charAt(0).toUpperCase() + category.slice(1)} book: "${title}" - ${relevantSentences.join(' ')}`;
  }

  return `"${title}" - A ${category} book exploring themes related to the subject matter.`;
}