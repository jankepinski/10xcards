import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFlashcardGeneration } from "../../../lib/hooks/useFlashcardGeneration";
import { toast } from "sonner";

// Mock toast notifications
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useFlashcardGeneration", () => {
  // Reset mocks between tests
  beforeEach(() => {
    vi.resetAllMocks();

    // Setup fetch mock to return successful responses by default
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("source text validation", () => {
    it("should set validation error when text is too short", () => {
      const { result } = renderHook(() => useFlashcardGeneration());

      // Set short source text
      act(() => {
        result.current.handleSourceTextChange("Short text");
      });

      // Try to generate flashcards
      act(() => {
        result.current.handleGenerate();
      });

      // Validation error should be set
      expect(result.current.validationError).toBe("Text is too short. Minimum 1000 characters required.");
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should set validation error when text is too long", () => {
      const { result } = renderHook(() => useFlashcardGeneration());

      // Create a very long string (over 10000 chars)
      const longText = "A".repeat(11000);

      act(() => {
        result.current.handleSourceTextChange(longText);
      });

      act(() => {
        result.current.handleGenerate();
      });

      expect(result.current.validationError).toBe("Text is too long. Maximum 10000 characters allowed.");
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should clear validation error when entering valid text after error", () => {
      const { result } = renderHook(() => useFlashcardGeneration());

      // First set invalid text
      act(() => {
        result.current.handleSourceTextChange("Short text");
      });

      act(() => {
        result.current.handleGenerate();
      });

      expect(result.current.validationError).toBe("Text is too short. Minimum 1000 characters required.");

      // Then set valid text
      const validText = "A".repeat(1500);
      act(() => {
        result.current.handleSourceTextChange(validText);
      });

      expect(result.current.validationError).toBeNull();
    });
  });

  describe("flashcard generation", () => {
    it("should successfully generate flashcards", async () => {
      // Setup mock response
      const mockResponse = {
        generation: { id: 123 },
        flashcards: [
          { front: "Question 1", back: "Answer 1" },
          { front: "Question 2", back: "Answer 2" },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const { result } = renderHook(() => useFlashcardGeneration());

      // Set valid source text
      act(() => {
        result.current.handleSourceTextChange("A".repeat(1500));
      });

      // Generate flashcards
      await act(async () => {
        await result.current.handleGenerate();
      });

      // Check if fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/generations",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: expect.any(String),
        })
      );

      // Check if state was updated correctly
      expect(result.current.generationId).toBe(123);
      expect(result.current.generatedFlashcards).toHaveLength(2);
      expect(result.current.generatedFlashcards[0].originalFront).toBe("Question 1");
      expect(result.current.generatedFlashcards[0].status).toBe("pending");

      // Check if toast was called
      expect(toast.success).toHaveBeenCalledWith("Generated 2 flashcards successfully!");
    });

    it("should handle API error during generation", async () => {
      // Setup mock error response
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValueOnce({
          message: "API error occurred",
        }),
      });

      const { result } = renderHook(() => useFlashcardGeneration());

      // Set valid source text
      act(() => {
        result.current.handleSourceTextChange("A".repeat(1500));
      });

      // Generate flashcards
      await act(async () => {
        await result.current.handleGenerate();
      });

      // Check error state
      expect(result.current.generationError).toBe("API error occurred");
      expect(toast.error).toHaveBeenCalledWith("API error occurred");
      expect(result.current.generatedFlashcards).toHaveLength(0);
    });

    it("should handle unexpected error during generation", async () => {
      // Setup fetch to throw an error
      global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useFlashcardGeneration());

      // Set valid source text
      act(() => {
        result.current.handleSourceTextChange("A".repeat(1500));
      });

      // Generate flashcards
      await act(async () => {
        await result.current.handleGenerate();
      });

      // Check error state
      expect(result.current.generationError).toBe("An unexpected error occurred. Please try again later.");
      expect(toast.error).toHaveBeenCalledWith("An unexpected error occurred. Please try again later.");
    });
  });

  describe("flashcard management", () => {
    it("should update flashcard status", async () => {
      // First set up the hook with generated flashcards - simulate successful API call
      const mockResponse = {
        generation: { id: 123 },
        flashcards: [
          { front: "Question 1", back: "Answer 1" },
          { front: "Question 2", back: "Answer 2" },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const { result } = renderHook(() => useFlashcardGeneration());

      // Set valid source text and generate flashcards
      act(() => {
        result.current.handleSourceTextChange("A".repeat(1500));
      });

      await act(async () => {
        await result.current.handleGenerate();
      });

      // Verify setup worked
      expect(result.current.generatedFlashcards).toHaveLength(2);

      // Now test status update
      act(() => {
        result.current.handleUpdateCardStatus(0, "accepted");
      });

      // Check if status was updated
      expect(result.current.generatedFlashcards[0].status).toBe("accepted");
      expect(result.current.generatedFlashcards[1].status).toBe("pending");

      // Stats should be updated accordingly
      expect(result.current.stats.accepted).toBe(1);
      expect(result.current.stats.pending).toBe(1);
    });

    it("should update flashcard content", async () => {
      // First set up the hook with generated flashcards - simulate successful API call
      const mockResponse = {
        generation: { id: 123 },
        flashcards: [{ front: "Original Question", back: "Original Answer" }],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const { result } = renderHook(() => useFlashcardGeneration());

      // Set valid source text and generate flashcards
      act(() => {
        result.current.handleSourceTextChange("A".repeat(1500));
      });

      await act(async () => {
        await result.current.handleGenerate();
      });

      // Verify setup worked
      expect(result.current.generatedFlashcards).toHaveLength(1);

      // Now test content update
      act(() => {
        result.current.handleUpdateCardContent(0, "Edited Question", "Edited Answer");
      });

      // Check if content was updated
      expect(result.current.generatedFlashcards[0].currentFront).toBe("Edited Question");
      expect(result.current.generatedFlashcards[0].currentBack).toBe("Edited Answer");
      expect(result.current.generatedFlashcards[0].source).toBe("ai-edited");
      expect(result.current.generatedFlashcards[0].status).toBe("pending");

      // Original content should remain unchanged
      expect(result.current.generatedFlashcards[0].originalFront).toBe("Original Question");
      expect(result.current.generatedFlashcards[0].originalBack).toBe("Original Answer");

      // Toast should be called
      expect(toast.success).toHaveBeenCalledWith("Flashcard edited successfully!");
    });
  });

  describe("saving flashcards", () => {
    it("should successfully save accepted flashcards", async () => {
      // First set up the hook with generated flashcards - simulate successful API call
      const mockResponse = {
        generation: { id: 123 },
        flashcards: [
          { front: "Question 1", back: "Answer 1" },
          { front: "Question 2", back: "Answer 2" },
          { front: "Question 3", back: "Answer 3" },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const { result } = renderHook(() => useFlashcardGeneration());

      // Set valid source text and generate flashcards
      act(() => {
        result.current.handleSourceTextChange("A".repeat(1500));
      });

      await act(async () => {
        await result.current.handleGenerate();
      });

      // Set two flashcards to accepted status
      act(() => {
        result.current.handleUpdateCardStatus(0, "accepted");
        result.current.handleUpdateCardStatus(1, "accepted");
        result.current.handleUpdateCardStatus(2, "rejected");
      });

      // Reset the mock to track the save call
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({}),
      });

      // Now try to save the accepted flashcards
      await act(async () => {
        await result.current.handleSaveAccepted();
      });

      // Check if fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/flashcards",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );

      // Check if state was reset
      expect(result.current.sourceText).toBe("");
      expect(result.current.generatedFlashcards).toHaveLength(0);
      expect(result.current.generationId).toBeNull();

      // Check if toast was called
      expect(toast.success).toHaveBeenCalledWith("Saved 2 flashcards successfully!");
    });

    it("should handle error when no flashcards are accepted", async () => {
      // First set up the hook with generated flashcards - simulate successful API call
      const mockResponse = {
        generation: { id: 123 },
        flashcards: [{ front: "Question 1", back: "Answer 1" }],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const { result } = renderHook(() => useFlashcardGeneration());

      // Set valid source text and generate flashcards
      act(() => {
        result.current.handleSourceTextChange("A".repeat(1500));
      });

      await act(async () => {
        await result.current.handleGenerate();
      });

      // Reset the mock to track the save call
      global.fetch = vi.fn();

      // Try to save without accepting any flashcards
      await act(async () => {
        await result.current.handleSaveAccepted();
      });

      // Fetch should not be called
      expect(global.fetch).not.toHaveBeenCalled();

      // Toast error should be shown
      expect(toast.error).toHaveBeenCalledWith("No flashcards selected for saving");
    });

    it("should handle API error during save", async () => {
      // First set up the hook with generated flashcards - simulate successful API call
      const mockResponse = {
        generation: { id: 123 },
        flashcards: [{ front: "Question 1", back: "Answer 1" }],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const { result } = renderHook(() => useFlashcardGeneration());

      // Set valid source text and generate flashcards
      act(() => {
        result.current.handleSourceTextChange("A".repeat(1500));
      });

      await act(async () => {
        await result.current.handleGenerate();
      });

      // Set flashcard to accepted status
      act(() => {
        result.current.handleUpdateCardStatus(0, "accepted");
      });

      // Set up error response for save
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValueOnce({
          message: "Failed to save flashcards",
        }),
      });

      // Try to save the accepted flashcard
      await act(async () => {
        await result.current.handleSaveAccepted();
      });

      // Check error state
      expect(result.current.saveError).toBe("Failed to save flashcards");
      expect(toast.error).toHaveBeenCalledWith("Failed to save flashcards");

      // State should not be reset
      expect(result.current.generatedFlashcards).toHaveLength(1);
    });

    it("should handle unexpected error during save", async () => {
      // First set up the hook with generated flashcards - simulate successful API call
      const mockResponse = {
        generation: { id: 123 },
        flashcards: [{ front: "Question 1", back: "Answer 1" }],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const { result } = renderHook(() => useFlashcardGeneration());

      // Set valid source text and generate flashcards
      act(() => {
        result.current.handleSourceTextChange("A".repeat(1500));
      });

      await act(async () => {
        await result.current.handleGenerate();
      });

      // Set flashcard to accepted status
      act(() => {
        result.current.handleUpdateCardStatus(0, "accepted");
      });

      // Set up error for save
      global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));

      // Try to save the accepted flashcard
      await act(async () => {
        await result.current.handleSaveAccepted();
      });

      // Check error state
      expect(result.current.saveError).toBe("An unexpected error occurred. Please try again later.");
      expect(toast.error).toHaveBeenCalledWith("An unexpected error occurred. Please try again later.");
    });
  });

  describe("stats calculation", () => {
    it("should calculate correct stats based on flashcard status", async () => {
      // First set up the hook with generated flashcards - simulate successful API call
      const mockResponse = {
        generation: { id: 123 },
        flashcards: [
          { front: "Question 1", back: "Answer 1" },
          { front: "Question 2", back: "Answer 2" },
          { front: "Question 3", back: "Answer 3" },
          { front: "Question 4", back: "Answer 4" },
          { front: "Question 5", back: "Answer 5" },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const { result } = renderHook(() => useFlashcardGeneration());

      // Set valid source text and generate flashcards
      act(() => {
        result.current.handleSourceTextChange("A".repeat(1500));
      });

      await act(async () => {
        await result.current.handleGenerate();
      });

      // Set different statuses
      act(() => {
        result.current.handleUpdateCardStatus(0, "accepted");
        result.current.handleUpdateCardStatus(1, "accepted");
        result.current.handleUpdateCardStatus(2, "rejected");
        // Leave 3 as pending
        // Set 4 to editing state by updating content
        result.current.handleUpdateCardContent(4, "Edited", "Content");
      });

      // Check stats
      expect(result.current.stats.total).toBe(5);
      expect(result.current.stats.accepted).toBe(2);
      expect(result.current.stats.rejected).toBe(1);
      expect(result.current.stats.pending).toBe(2); // index 3 = pending, index 4 = editing
    });
  });
});
