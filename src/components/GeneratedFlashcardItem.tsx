import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { GeneratedFlashcardViewModel } from "@/lib/hooks/useFlashcardGeneration";

// Props interface for the component
interface GeneratedFlashcardItemProps {
  flashcard: GeneratedFlashcardViewModel;
  index: number;
  onUpdateStatus: (index: number, status: GeneratedFlashcardViewModel["status"]) => void;
  onUpdateContent: (index: number, front: string, back: string) => void;
}

const GeneratedFlashcardItem = ({ flashcard, index, onUpdateStatus, onUpdateContent }: GeneratedFlashcardItemProps) => {
  // Local state for editing
  const [frontEdit, setFrontEdit] = useState<string>(flashcard.currentFront);
  const [backEdit, setBackEdit] = useState<string>(flashcard.currentBack);
  const [frontError, setFrontError] = useState<string | null>(null);
  const [backError, setBackError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(true);

  // Maximum character limits
  const MAX_FRONT_LENGTH = 200;
  const MAX_BACK_LENGTH = 500;

  // Validate when inputs change
  useEffect(() => {
    validateContent();
  }, [frontEdit, backEdit]);

  // Validate content without setting state during render
  const validateContent = () => {
    let valid = true;

    // Check front content
    if (frontEdit.length === 0) {
      setFrontError("Front side cannot be empty");
      valid = false;
    } else if (frontEdit.length > MAX_FRONT_LENGTH) {
      setFrontError(`Front side is too long (max ${MAX_FRONT_LENGTH} characters)`);
      valid = false;
    } else {
      setFrontError(null);
    }

    // Check back content
    if (backEdit.length === 0) {
      setBackError("Back side cannot be empty");
      valid = false;
    } else if (backEdit.length > MAX_BACK_LENGTH) {
      setBackError(`Back side is too long (max ${MAX_BACK_LENGTH} characters)`);
      valid = false;
    } else {
      setBackError(null);
    }

    setIsValid(valid);
    return valid;
  };

  // Handle status update
  const handleStatusUpdate = (status: GeneratedFlashcardViewModel["status"]) => {
    onUpdateStatus(index, status);
  };

  // Start editing mode
  const handleEdit = () => {
    setFrontEdit(flashcard.currentFront);
    setBackEdit(flashcard.currentBack);
    setFrontError(null);
    setBackError(null);
    setIsValid(true);
    onUpdateStatus(index, "editing");
  };

  // Cancel editing and revert changes
  const handleCancelEdit = () => {
    onUpdateStatus(index, "pending");
  };

  // Save edited content
  const handleSaveEdit = () => {
    if (isValid) {
      onUpdateContent(index, frontEdit, backEdit);
    }
  };

  // Get card style based on status
  const getCardStyle = () => {
    switch (flashcard.status) {
      case "accepted":
        return "border-green-300 bg-green-50";
      case "rejected":
        return "border-red-300 bg-red-50 opacity-60";
      case "editing":
        return "border-blue-300 bg-blue-50";
      default:
        return "border-gray-200";
    }
  };

  return (
    <Card className={`transition-all ${getCardStyle()}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">
            Card #{index + 1}{" "}
            {flashcard.source === "ai-edited" && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded ml-2">Edited</span>
            )}
          </span>
          <div className="text-xs text-muted-foreground">
            {flashcard.status === "accepted" && <span className="text-green-600 font-medium">Accepted</span>}
            {flashcard.status === "rejected" && <span className="text-red-600 font-medium">Rejected</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {flashcard.status === "editing" ? (
          // Edit mode
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor={`front-${index}`} className="text-sm font-medium">
                Front Side:
              </label>
              <Input
                id={`front-${index}`}
                value={frontEdit}
                onChange={(e) => setFrontEdit(e.target.value)}
                placeholder="Front side text"
                className={frontError ? "border-red-500" : ""}
              />
              {frontError && <div className="text-red-500 text-xs">{frontError}</div>}
              <div className="text-xs text-muted-foreground text-right">
                {frontEdit.length}/{MAX_FRONT_LENGTH}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor={`back-${index}`} className="text-sm font-medium">
                Back Side:
              </label>
              <Textarea
                id={`back-${index}`}
                value={backEdit}
                onChange={(e) => setBackEdit(e.target.value)}
                placeholder="Back side text"
                className={backError ? "border-red-500" : ""}
              />
              {backError && <div className="text-red-500 text-xs">{backError}</div>}
              <div className="text-xs text-muted-foreground text-right">
                {backEdit.length}/{MAX_BACK_LENGTH}
              </div>
            </div>
          </div>
        ) : (
          // View mode
          <div className={`space-y-3 ${flashcard.status === "rejected" ? "opacity-60" : ""}`}>
            <div>
              <p className="text-sm font-medium mb-1">Front:</p>
              <p className="p-2 bg-white rounded border border-gray-100">{flashcard.currentFront}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Back:</p>
              <p className="p-2 bg-white rounded border border-gray-100 whitespace-pre-wrap">{flashcard.currentBack}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2">
        {flashcard.status === "editing" ? (
          // Edit mode actions
          <>
            <Button variant="outline" size="sm" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEdit} disabled={!isValid}>
              Save
            </Button>
          </>
        ) : flashcard.status === "pending" ? (
          // Default actions
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate("rejected")}
              className="text-red-500 hover:text-red-700"
            >
              Reject
            </Button>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate("accepted")}
              className="text-green-500 hover:text-green-700"
            >
              Accept
            </Button>
          </>
        ) : (
          // Accepted/Rejected actions
          <Button variant="outline" size="sm" onClick={() => handleStatusUpdate("pending")}>
            Reset
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default GeneratedFlashcardItem;
