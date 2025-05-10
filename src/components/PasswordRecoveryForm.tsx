import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PasswordRecoveryForm = () => {
  // Form state
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Form validation state
  const [emailError, setEmailError] = useState<string | null>(null);

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    setEmailError(isValid ? null : "Please enter a valid email address");
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setError(null);
    setSuccess(false);

    // Validate form
    const isEmailValid = validateEmail(email);

    if (!isEmailValid) {
      return;
    }

    // Simulate form submission
    setIsLoading(true);

    try {
      // Here would be the actual password recovery implementation
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Note: In a real implementation, this would be replaced with actual API calls
      console.log("Password recovery submitted for:", email);

      // Show success message
      setSuccess(true);
    } catch (error) {
      console.error("Password recovery error:", error);
      setError("Failed to send recovery instructions. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-card shadow-sm">
      {success ? (
        <div className="text-center space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              Recovery instructions sent! Please check your email inbox.
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground mt-4">
            If you don&apos;t receive an email within a few minutes, check your spam folder or try again.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setEmail("");
              setSuccess(false);
            }}
          >
            Try another email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display error message if any */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validateEmail(email)}
              placeholder="your.email@example.com"
              disabled={isLoading}
              className={emailError ? "border-red-500" : ""}
            />
            {emailError && <p className="text-red-500 text-xs">{emailError}</p>}
          </div>

          <p className="text-sm text-muted-foreground">We&apos;ll send you a link to reset your password.</p>

          {/* Submit button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Sending...
              </span>
            ) : (
              "Send Reset Instructions"
            )}
          </Button>
        </form>
      )}
    </div>
  );
};

export default PasswordRecoveryForm;
