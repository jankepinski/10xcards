import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Define props interface for the GenerationForm component
interface GenerationFormProps {
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  validationError: string | null;
}

const GenerationForm = ({
  sourceText,
  onSourceTextChange,
  onSubmit,
  isLoading,
  validationError,
}: GenerationFormProps) => {
  // Calculate character count and limits
  const charCount = sourceText.length;
  const minChars = 1000;
  const maxChars = 10000;

  // Check if the text is valid based on character count
  const isTextValid = charCount >= minChars && charCount <= maxChars;

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // Calculate progress bar width based on character count
  const getProgressWidth = () => {
    if (charCount > maxChars) return "100%";
    if (charCount < minChars) {
      // Scale from 0% to 30% for text below minimum
      return `${(charCount / minChars) * 30}%`;
    }
    // Scale from 30% to 100% for text between min and max
    return `${30 + ((charCount - minChars) / (maxChars - minChars)) * 70}%`;
  };

  // Get progress bar color based on validation
  const getProgressColor = () => {
    if (charCount > maxChars) return "bg-red-500";
    if (charCount < minChars) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <div className="border rounded-lg p-4 bg-card shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="sourceText" className="text-sm font-medium leading-none">
              Source Text
            </label>
            <span className="text-xs text-muted-foreground">
              Min: {minChars} / Max: {maxChars} characters
            </span>
          </div>
          <Textarea
            id="sourceText"
            value={sourceText}
            onChange={(e) => onSourceTextChange(e.target.value)}
            placeholder="Paste your text here (1000-10000 characters)"
            className={`min-h-[200px] transition-all ${isLoading ? "opacity-70" : ""}`}
            disabled={isLoading}
          />

          {/* Character count progress bar */}
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor()} transition-all duration-300`}
              style={{ width: getProgressWidth() }}
            />
          </div>

          {/* Character count indicator */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span
              className={
                charCount < minChars ? "text-amber-600" : charCount > maxChars ? "text-red-600" : "text-green-600"
              }
            >
              {charCount} characters
            </span>
            <span>
              {charCount < minChars
                ? `Add ${minChars - charCount} more characters`
                : charCount > maxChars
                  ? `Remove ${charCount - maxChars} characters`
                  : "Text length is valid"}
            </span>
          </div>

          {/* Display validation error if any */}
          {validationError && <div className="text-red-500 text-sm animate-pulse">{validationError}</div>}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading || !isTextValid} className="relative transition-all">
            {isLoading && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
            )}
            <span className={isLoading ? "opacity-0" : ""}>{isLoading ? "Generating..." : "Generate Flashcards"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GenerationForm;
