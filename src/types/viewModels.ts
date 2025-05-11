/**
 * View model for a flashcard list item.
 * Contains only the fields needed for display in the list.
 */
export interface FlashcardListItemViewModel {
  id: string;
  front: string;
  back: string;
  source: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Form data for editing a flashcard.
 */
export interface EditFlashcardFormData {
  front: string;
  back: string;
}
