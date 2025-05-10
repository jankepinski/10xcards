import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { z } from "zod";
import { useNavigate } from "@/lib/hooks/useNavigate";

// Define the base Zod schema first before adding refinements
const registerBaseSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
});

// Add the refinement for password matching
const registerSchema = registerBaseSchema.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Type for form values based on the schema
type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  // Form state
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form validation state
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  // Validate email with Zod
  const validateEmail = (email: string): boolean => {
    const result = registerBaseSchema.shape.email.safeParse(email);
    if (!result.success) {
      setEmailError(result.error.issues[0].message);
      return false;
    }
    setEmailError(null);
    return true;
  };

  // Validate password with Zod
  const validatePassword = (password: string): boolean => {
    const result = registerBaseSchema.shape.password.safeParse(password);
    if (!result.success) {
      setPasswordError(result.error.issues[0].message);
      return false;
    }
    setPasswordError(null);
    return true;
  };

  // Validate password confirmation with Zod
  // This also needs to check if passwords match
  const validateConfirmPassword = (password: string, confirmPassword: string): boolean => {
    // First check if the confirm password field itself is valid
    const baseResult = registerBaseSchema.shape.confirmPassword.safeParse(confirmPassword);
    if (!baseResult.success) {
      setConfirmPasswordError(baseResult.error.issues[0].message);
      return false;
    }

    // Then check if passwords match using the refine validation
    const matchResult = registerSchema.safeParse({ email, password, confirmPassword });
    if (!matchResult.success) {
      const errors = matchResult.error.format();
      if (errors.confirmPassword?._errors.length) {
        setConfirmPasswordError(errors.confirmPassword._errors[0]);
        return false;
      }
    }

    setConfirmPasswordError(null);
    return true;
  };

  // Validate entire form with Zod
  const validateForm = (values: RegisterFormValues): boolean => {
    const result = registerSchema.safeParse(values);
    if (!result.success) {
      const formattedErrors = result.error.format();

      // Set field errors
      setEmailError(formattedErrors.email?._errors[0] || null);
      setPasswordError(formattedErrors.password?._errors[0] || null);
      setConfirmPasswordError(formattedErrors.confirmPassword?._errors[0] || null);

      return false;
    }

    // Clear all errors if validation passes
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error state
    setError(null);

    // Validate form with Zod
    const formValues = { email, password, confirmPassword };
    const isValid = validateForm(formValues);

    if (!isValid) {
      return;
    }

    // Show loading state
    setIsLoading(true);

    try {
      // Send registration data to the API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle registration error
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      if (data.success) {
        // Registration successful - redirect to the flashcards generation page
        navigate("/generate-flashcards");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Failed to connect to the server. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-card shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Display error message if any */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
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

        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => validatePassword(password)}
              placeholder="Create a password"
              disabled={isLoading}
              className={passwordError ? "border-red-500 pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
          {passwordError && <p className="text-red-500 text-xs">{passwordError}</p>}
        </div>

        {/* Confirm Password field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => validateConfirmPassword(password, confirmPassword)}
              placeholder="Confirm your password"
              disabled={isLoading}
              className={confirmPasswordError ? "border-red-500 pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
          {confirmPasswordError && <p className="text-red-500 text-xs">{confirmPasswordError}</p>}
        </div>

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
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </div>
  );
};

export default RegisterForm;
