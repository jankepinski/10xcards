import { Button } from "@/components/ui/button";
import GeneratedFlashcardItem from "@/components/GeneratedFlashcardItem";
import type { GeneratedFlashcardViewModel } from "@/lib/hooks/useFlashcardGeneration";

// Props interface for the component
interface GeneratedFlashcardsListProps {
  flashcards: GeneratedFlashcardViewModel[];
  generationId: number | null;
  onUpdateCardStatus: (index: number, status: GeneratedFlashcardViewModel["status"]) => void;
  onUpdateCardContent: (index: number, front: string, back: string) => void;
  onSaveAccepted: () => void;
  isLoadingSave: boolean;
}

const GeneratedFlashcardsList = ({
  flashcards,
  generationId,
  onUpdateCardStatus,
  onUpdateCardContent,
  onSaveAccepted,
  isLoadingSave,
}: GeneratedFlashcardsListProps) => {
  // Count of accepted flashcards
  const acceptedCount = flashcards.filter((card) => card.status === "accepted").length;

  // Check if save button should be disabled
  const isSaveDisabled = isLoadingSave || acceptedCount === 0 || !generationId;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Generated Flashcards</h2>
          <p className="text-sm text-muted-foreground">
            Review and select the flashcards you want to save to your collection.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold">{acceptedCount}</span> of {flashcards.length} accepted
          </span>
          <Button onClick={onSaveAccepted} disabled={isSaveDisabled}>
            {isLoadingSave ? "Saving..." : "Save Accepted"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flashcards.map((flashcard, index) => (
          <GeneratedFlashcardItem
            key={index}
            flashcard={flashcard}
            index={index}
            onUpdateStatus={onUpdateCardStatus}
            onUpdateContent={onUpdateCardContent}
          />
        ))}
      </div>

      {acceptedCount > 0 && (
        <div className="flex justify-end mt-4">
          <Button onClick={onSaveAccepted} disabled={isSaveDisabled}>
            {isLoadingSave ? "Saving..." : `Save ${acceptedCount} Accepted Flashcards`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default GeneratedFlashcardsList;
