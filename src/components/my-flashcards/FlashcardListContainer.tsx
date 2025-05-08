import { useState, useEffect } from "react";
import type { FlashcardListItemViewModel, EditFlashcardFormData } from "../../types/viewModels";
import type { Pagination, FlashcardsResponseDTO, DeleteResponseDTO, FlashcardDTO } from "../../types";
import FlashcardListItem from "./FlashcardListItem";
import EditFlashcardModal from "./EditFlashcardModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import PaginationControls from "./PaginationControls";
import { Loader2 } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";

const FlashcardListContainer = () => {
  // State management
  const [flashcards, setFlashcards] = useState<FlashcardListItemViewModel[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardListItemViewModel | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingFlashcardId, setDeletingFlashcardId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { toast } = useToast();

  // Fetch flashcards from API
  const fetchFlashcards = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/flashcards?page=${page}&limit=${pagination.limit}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch flashcards: ${response.statusText}`);
      }

      const data: FlashcardsResponseDTO = await response.json();
      setFlashcards(data.flashcards);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch flashcards");
      toast({
        title: "Error",
        description: "Failed to load flashcards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update flashcard
  const handleSaveFlashcard = async (flashcardId: string, data: EditFlashcardFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/flashcards/${flashcardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Flashcard not found. It may have been deleted.");
        }
        throw new Error(`Failed to update flashcard: ${response.statusText}`);
      }

      const updatedFlashcard: FlashcardDTO = await response.json();

      // Update the local state with the updated flashcard
      setFlashcards((cards) => cards.map((card) => (card.id === flashcardId ? { ...card, ...data } : card)));

      // Close the modal
      setShowEditModal(false);
      setEditingFlashcard(null);

      toast({
        title: "Success",
        description: "Flashcard updated successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update flashcard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete flashcard
  const handleDeleteFlashcard = async (flashcardId: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/flashcards/${flashcardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Flashcard not found. It may have been deleted already.");
        }
        throw new Error(`Failed to delete flashcard: ${response.statusText}`);
      }

      const result: DeleteResponseDTO = await response.json();

      // Remove the deleted flashcard from the local state
      setFlashcards((cards) => cards.filter((card) => card.id !== flashcardId));

      // Close the modal
      setShowDeleteModal(false);
      setDeletingFlashcardId(null);

      toast({
        title: "Success",
        description: result.message || "Flashcard deleted successfully.",
      });

      // If we deleted the last flashcard on this page and it's not the first page,
      // go to the previous page
      if (flashcards.length === 1 && pagination.page > 1) {
        fetchFlashcards(pagination.page - 1);
      } else if (flashcards.length === 1) {
        // If it's the first page and we just deleted the last card, refresh to show empty state
        fetchFlashcards(1);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete flashcard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit modal
  const handleEdit = (flashcard: FlashcardListItemViewModel) => {
    setEditingFlashcard(flashcard);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleDelete = (flashcardId: string) => {
    setDeletingFlashcardId(flashcardId);
    setShowDeleteModal(true);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchFlashcards(page);
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchFlashcards();
  }, []);

  // Render loading state
  if (isLoading && flashcards.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading flashcards...</span>
      </div>
    );
  }

  // Render error state
  if (error && flashcards.length === 0) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
        <p className="font-semibold">Failed to load flashcards</p>
        <p>{error}</p>
        <button
          onClick={() => fetchFlashcards()}
          className="mt-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Render empty state
  if (flashcards.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/50">
        <h2 className="text-xl font-semibold mb-2">You don't have any flashcards yet</h2>
        <p className="text-muted-foreground mb-4">Create your first flashcard or generate them with AI.</p>
        {/* Placeholder for potential "Create flashcard" button if needed */}
      </div>
    );
  }

  // Render flashcards list
  return (
    <div className="space-y-6">
      {/* Flashcards list */}
      <div className="space-y-4">
        {flashcards.map((flashcard) => (
          <FlashcardListItem key={flashcard.id} flashcard={flashcard} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>

      {/* Pagination */}
      <PaginationControls pagination={pagination} onPageChange={handlePageChange} />

      {/* Edit modal */}
      {showEditModal && (
        <EditFlashcardModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingFlashcard(null);
          }}
          onSave={handleSaveFlashcard}
          flashcard={editingFlashcard}
        />
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingFlashcardId(null);
          }}
          onConfirm={handleDeleteFlashcard}
          flashcardId={deletingFlashcardId}
        />
      )}
    </div>
  );
};

export default FlashcardListContainer;
