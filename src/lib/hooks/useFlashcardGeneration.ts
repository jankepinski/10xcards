import { useState } from "react";
import type { GenerationResultDTO, CreateGenerationCommand, CreateFlashcardsCommand } from "@/types";
import { toast } from "sonner";

// Define the GeneratedFlashcardViewModel type
export interface GeneratedFlashcardViewModel {
  originalFront: string;
  originalBack: string;
  currentFront: string;
  currentBack: string;
  source: "ai-full" | "ai-edited";
  status: "pending" | "accepted" | "rejected" | "editing";
}

export const useFlashcardGeneration = () => {
  // State variables
  const [sourceText, setSourceText] = useState<string>("");
  const [isLoadingGeneration, setIsLoadingGeneration] = useState<boolean>(false);
  const [isLoadingSave, setIsLoadingSave] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<GeneratedFlashcardViewModel[]>([]);
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Handle source text change
  const handleSourceTextChange = (text: string) => {
    setSourceText(text);

    // Clear validation error if the text is valid
    if (validationError && text.length >= 1000 && text.length <= 10000) {
      setValidationError(null);
    }
  };

  // Validate the source text
  const validateSourceText = (): boolean => {
    if (sourceText.length < 1000) {
      setValidationError("Text is too short. Minimum 1000 characters required.");
      return false;
    }
    if (sourceText.length > 10000) {
      setValidationError("Text is too long. Maximum 10000 characters allowed.");
      return false;
    }
    return true;
  };

  // Handle generate button click
  const handleGenerate = async () => {
    // Clear previous errors
    setGenerationError(null);

    // Validate the source text
    if (!validateSourceText()) {
      return;
    }

    // Set loading state
    setIsLoadingGeneration(true);

    try {
      // Create the request payload
      const payload: CreateGenerationCommand = {
        source_text: sourceText,
      };

      // Call the API
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Handle the response
      if (response.ok) {
        const data: GenerationResultDTO = await response.json();

        // Update the state with the generation result
        setGenerationId(data.generation.id);

        // Map the flashcards to the view model
        const flashcardViewModels: GeneratedFlashcardViewModel[] = data.flashcards.map((flashcard) => ({
          originalFront: flashcard.front,
          originalBack: flashcard.back,
          currentFront: flashcard.front,
          currentBack: flashcard.back,
          source: "ai-full",
          status: "pending",
        }));

        setGeneratedFlashcards(flashcardViewModels);

        // Show success toast
        toast.success(`Generated ${flashcardViewModels.length} flashcards successfully!`);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Failed to generate flashcards. Please try again.";
        setGenerationError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = "An unexpected error occurred. Please try again later.";
      setGenerationError(errorMessage);
      toast.error(errorMessage);
      console.error("Error generating flashcards:", error);
    } finally {
      setIsLoadingGeneration(false);
    }
  };

  // Handle flashcard status update
  const handleUpdateCardStatus = (index: number, status: GeneratedFlashcardViewModel["status"]) => {
    setGeneratedFlashcards((prevCards) => prevCards.map((card, i) => (i === index ? { ...card, status } : card)));
  };

  // Handle flashcard content update
  const handleUpdateCardContent = (index: number, front: string, back: string) => {
    setGeneratedFlashcards((prevCards) =>
      prevCards.map((card, i) =>
        i === index
          ? {
              ...card,
              currentFront: front,
              currentBack: back,
              source: "ai-edited",
              status: "pending",
            }
          : card
      )
    );

    // Show success toast for edit
    toast.success("Flashcard edited successfully!");
  };

  // Handle save accepted flashcards
  const handleSaveAccepted = async () => {
    // Filter accepted flashcards
    const acceptedFlashcards = generatedFlashcards.filter((card) => card.status === "accepted");

    // Validate if there are any accepted flashcards
    if (acceptedFlashcards.length === 0 || !generationId) {
      toast.error("No flashcards selected for saving");
      return;
    }

    // Set loading state
    setIsLoadingSave(true);
    setSaveError(null);

    try {
      // Create the request payload
      const payload: CreateFlashcardsCommand = {
        flashcards: acceptedFlashcards.map((card) => ({
          front: card.currentFront,
          back: card.currentBack,
          source: card.source,
          generation_id: generationId,
        })),
      };

      // Call the API
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Handle the response
      if (response.ok) {
        // Reset the form and state on successful save
        setSourceText("");
        setGeneratedFlashcards([]);
        setGenerationId(null);

        // Show success toast
        toast.success(`Saved ${acceptedFlashcards.length} flashcards successfully!`);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Failed to save flashcards. Please try again.";
        setSaveError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = "An unexpected error occurred. Please try again later.";
      setSaveError(errorMessage);
      toast.error(errorMessage);
      console.error("Error saving flashcards:", error);
    } finally {
      setIsLoadingSave(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: generatedFlashcards.length,
    accepted: generatedFlashcards.filter((card) => card.status === "accepted").length,
    rejected: generatedFlashcards.filter((card) => card.status === "rejected").length,
    pending: generatedFlashcards.filter((card) => card.status === "pending" || card.status === "editing").length,
  };

  // Return the hook values
  return {
    // State
    sourceText,
    isLoadingGeneration,
    isLoadingSave,
    generationError,
    saveError,
    generatedFlashcards,
    generationId,
    validationError,
    stats,

    // Handlers
    handleSourceTextChange,
    handleGenerate,
    handleUpdateCardStatus,
    handleUpdateCardContent,
    handleSaveAccepted,
  };
};
