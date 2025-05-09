import { useState } from "react";
import type { FlashcardListItemViewModel } from "../../types/viewModels";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface FlashcardListItemProps {
  flashcard: FlashcardListItemViewModel;
  onEdit: (flashcard: FlashcardListItemViewModel) => void;
  onDelete: (flashcardId: string) => void;
}

const FlashcardListItem = ({ flashcard, onEdit, onDelete }: FlashcardListItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format date for display if available
  const formattedDate = flashcard.updated_at ? new Date(flashcard.updated_at).toLocaleDateString() : undefined;

  // Truncate text if it's longer than 100 characters and the card is not expanded
  const truncateFront =
    !isExpanded && flashcard.front.length > 100 ? `${flashcard.front.substring(0, 100)}...` : flashcard.front;

  const truncateBack =
    !isExpanded && flashcard.back.length > 100 ? `${flashcard.back.substring(0, 100)}...` : flashcard.back;

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="pt-6">
        <div className="space-y-3">
          {/* Front side */}
          <div>
            <h3 className="text-lg font-medium mb-1">Front</h3>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{truncateFront}</p>
          </div>

          {/* Back side */}
          <div>
            <h3 className="text-lg font-medium mb-1">Back</h3>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{truncateBack}</p>
          </div>

          {/* Source if available */}
          {flashcard.source && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Source:</span> {flashcard.source}
            </div>
          )}

          {/* Updated date if available */}
          {formattedDate && <div className="text-xs text-muted-foreground">Last updated: {formattedDate}</div>}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between bg-muted/30 py-3">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(flashcard)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(flashcard.id)}
            className="text-destructive hover:text-destructive border-destructive/40 hover:border-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>

        {/* Expand/Collapse button when content is long */}
        {(flashcard.front.length > 100 || flashcard.back.length > 100) && (
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="ml-auto">
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Expand
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default FlashcardListItem;
