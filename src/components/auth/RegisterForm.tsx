import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Link } from "@/components/ui/link";

interface RegisterFormProps {
  onSubmit?: (email: string, password: string, confirmPassword: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

const RegisterForm = ({
  onSubmit,
  isLoading: initialLoading = false,
  error: initialError = null,
}: RegisterFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(initialError);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!email.trim()) {
      setValidationError("Email is required");
      return;
    }

    if (!password.trim()) {
      setValidationError("Password is required");
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

    if (!email.includes("@")) {
      setValidationError("Please enter a valid email address");
      return;
    }

    // If onSubmit prop exists, use it (for testing or custom handling)
    if (onSubmit) {
      onSubmit(email, password, confirmPassword);
      return;
    }

    // Otherwise, submit to the API endpoint
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      // Success - handle redirection or display success message
      setSuccess(data.message || "Account created successfully!");

      // Redirect to the specified page after a short delay
      if (data.redirectTo) {
        setTimeout(() => {
          window.location.href = data.redirectTo;
        }, 1500);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-card shadow-sm max-w-md w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {(error || validationError) && (
          <Alert variant="destructive" className="mb-2">
            <AlertDescription>{error || validationError}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-2 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="password">Password</Label>
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
          <Label htmlFor="confirmPassword">Confirm Password</Label>
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
          <span className={isLoading ? "opacity-0" : ""}>{isLoading ? "Creating account..." : "Register"}</span>
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Login here
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;
