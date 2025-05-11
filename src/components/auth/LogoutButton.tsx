import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const LogoutButton = ({ variant = "ghost", size = "default", className = "" }: LogoutButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.redirected) {
        // Jeśli serwer przekierował, przekieruj klienta
        window.location.href = response.url;
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to logout");
        setIsLoading(false);
        return;
      }

      // Na wszelki wypadek, gdyby nie było przekierowania
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An unexpected error occurred during logout");
      setIsLoading(false);
    }
  };

  return (
    <Button variant={variant} size={size} className={className} onClick={handleLogout} disabled={isLoading}>
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
};

export default LogoutButton;
