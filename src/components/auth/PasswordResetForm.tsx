import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Link } from "@/components/ui/link";

interface PasswordResetFormProps {
  onSubmit: (password: string, confirmPassword: string) => void;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const PasswordResetForm = ({ onSubmit, isLoading, error, success }: PasswordResetFormProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!password.trim()) {
      setValidationError("New password is required");
      return;
    }

    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    setValidationError(null);
    onSubmit(password, confirmPassword);
  };

  // If password was reset successfully, show success message
  if (success) {
    return (
      <div className="border rounded-lg p-6 bg-card shadow-sm max-w-md w-full mx-auto">
        <div className="text-center">
          <svg
            className="w-12 h-12 text-green-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-2xl font-bold mb-2">Password Reset Successful</h1>
          <p className="mb-4">Your password has been successfully reset. You can now login with your new password.</p>
          <Link href="/login" className="text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6 bg-card shadow-sm max-w-md w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Reset Your Password</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {(error || validationError) && (
          <Alert variant="destructive" className="mb-2">
            <AlertDescription>{error || validationError}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <Button type="submit" disabled={isLoading} className="mt-2 relative">
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
          <span className={isLoading ? "opacity-0" : ""}>{isLoading ? "Resetting..." : "Reset Password"}</span>
        </Button>
      </form>
    </div>
  );
};

export default PasswordResetForm;
