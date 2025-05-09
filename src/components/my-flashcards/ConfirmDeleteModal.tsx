import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2, AlertTriangle } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (flashcardId: string) => Promise<void>;
  flashcardId: string | null;
}

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, flashcardId }: ConfirmDeleteModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!flashcardId) return;

    setIsDeleting(true);

    try {
      await onConfirm(flashcardId);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Confirm Deletion</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete this flashcard? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isDeleting || !flashcardId}>
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              "Delete Flashcard"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteModal;
