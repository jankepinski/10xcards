import { useState, useEffect } from "react";
import type { FlashcardListItemViewModel, EditFlashcardFormData } from "../../types/viewModels";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Loader2 } from "lucide-react";

interface EditFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (flashcardId: string, data: EditFlashcardFormData) => Promise<void>;
  flashcard: FlashcardListItemViewModel | null;
}

const EditFlashcardModal = ({ isOpen, onClose, onSave, flashcard }: EditFlashcardModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<EditFlashcardFormData>({
    front: "",
    back: "",
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when flashcard changes
  useEffect(() => {
    if (flashcard) {
      setFormData({
        front: flashcard.front,
        back: flashcard.back,
      });
      // Clear errors when opening a new flashcard
      setErrors({});
    }
  }, [flashcard]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Front validation
    if (!formData.front.trim()) {
      newErrors.front = "Front side is required.";
    } else if (formData.front.length > 200) {
      newErrors.front = "Front side can be maximum 200 characters.";
    }

    // Back validation
    if (!formData.back.trim()) {
      newErrors.back = "Back side is required.";
    } else if (formData.back.length > 500) {
      newErrors.back = "Back side can be maximum 500 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!flashcard) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(flashcard.id, formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Flashcard</DialogTitle>
          <DialogDescription>Make changes to your flashcard. Click save when you&apos;re done.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label
              htmlFor="front"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Front side
            </label>
            <Input
              id="front"
              name="front"
              value={formData.front}
              onChange={handleInputChange}
              placeholder="Front side of the flashcard"
              disabled={isSubmitting}
              className={errors.front ? "border-destructive" : ""}
              aria-invalid={!!errors.front}
            />
            {errors.front && <p className="text-sm text-destructive mt-1">{errors.front}</p>}
            <div className="text-xs text-muted-foreground mt-1">{formData.front.length}/200 characters</div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="back"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Back side
            </label>
            <Textarea
              id="back"
              name="back"
              value={formData.back}
              onChange={handleInputChange}
              placeholder="Back side of the flashcard"
              disabled={isSubmitting}
              className={errors.back ? "border-destructive" : ""}
              aria-invalid={!!errors.back}
              rows={5}
            />
            {errors.back && <p className="text-sm text-destructive mt-1">{errors.back}</p>}
            <div className="text-xs text-muted-foreground mt-1">{formData.back.length}/500 characters</div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFlashcardModal;
