import { Alert, AlertDescription } from "@/components/ui/alert";
import GenerationForm from "@/components/GenerationForm";
import GeneratedFlashcardsList from "@/components/GeneratedFlashcardsList";
import { Toaster } from "@/components/ui/sonner";
import { useFlashcardGeneration } from "@/lib/hooks/useFlashcardGeneration";

const FlashcardGenerator = () => {
  // Use the custom hook for flashcard generation
  const {
    sourceText,
    isLoadingGeneration,
    isLoadingSave,
    generationError,
    saveError,
    generatedFlashcards,
    generationId,
    validationError,
    handleSourceTextChange,
    handleGenerate,
    handleUpdateCardStatus,
    handleUpdateCardContent,
    handleSaveAccepted,
  } = useFlashcardGeneration();

  return (
    <>
      {/* Toast provider for notifications */}
      <Toaster position="top-right" />

      <div className="flex flex-col gap-6">
        {/* Display generation error if any */}
        {generationError && (
          <Alert variant="destructive">
            <AlertDescription>{generationError}</AlertDescription>
          </Alert>
        )}

        {/* Display save error if any */}
        {saveError && (
          <Alert variant="destructive">
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}

        {/* Generation form */}
        <GenerationForm
          sourceText={sourceText}
          onSourceTextChange={handleSourceTextChange}
          onSubmit={handleGenerate}
          isLoading={isLoadingGeneration}
          validationError={validationError}
        />

        {/* Generated flashcards list */}
        {generatedFlashcards.length > 0 && (
          <GeneratedFlashcardsList
            flashcards={generatedFlashcards}
            generationId={generationId}
            onUpdateCardStatus={handleUpdateCardStatus}
            onUpdateCardContent={handleUpdateCardContent}
            onSaveAccepted={handleSaveAccepted}
            isLoadingSave={isLoadingSave}
          />
        )}
      </div>
    </>
  );
};

export default FlashcardGenerator;
