import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Link } from "@/components/ui/link";
import { toast } from "sonner";

interface LoginFormProps {
  isLoading?: boolean;
  error?: string | null;
}

const LoginForm = ({ isLoading: initialIsLoading = false, error: initialError = null }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(initialError);
  const [isLoading, setIsLoading] = useState(initialIsLoading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Basic validation
    if (!email.trim()) {
      setValidationError("Email is required");
      return;
    }

    if (!password.trim()) {
      setValidationError("Password is required");
      return;
    }

    if (!email.includes("@")) {
      setValidationError("Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);

      // Wywołanie endpointu API do logowania
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setValidationError(data.error || "Failed to login. Please check your credentials.");
        setIsLoading(false);
        return;
      }

      // Sukces - sprawdź czy mamy przekierowanie
      if (data.success && data.redirectTo) {
        toast.success("Login successful!");
        // Przekieruj na stronę docelową
        window.location.href = data.redirectTo;
        return;
      }

      // Pomyślne logowanie ale bez przekierowania
      toast.success("Login successful!");
      setIsLoading(false);
    } catch (error) {
      console.error("Login error:", error);
      setValidationError("An unexpected error occurred. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-card shadow-sm max-w-md w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {validationError && (
          <Alert variant="destructive" className="mb-2">
            <AlertDescription>{validationError}</AlertDescription>
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
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          <span className={isLoading ? "opacity-0" : ""}>{isLoading ? "Logging in..." : "Login"}</span>
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
