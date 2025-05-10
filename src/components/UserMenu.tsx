import { useState } from "react";
import { useNavigate } from "../lib/hooks/useNavigate";
import { Button } from "./ui/button";
import { LogOutIcon, UserIcon } from "lucide-react";

interface UserMenuProps {
  email: string;
}

export default function UserMenu({ email }: UserMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Przekieruj do strony logowania po udanym wylogowaniu
        navigate("/login");
      } else {
        console.error("Logout failed");
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm">
        <UserIcon className="h-4 w-4" />
        <span className="hidden md:inline">{email}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex items-center gap-1"
      >
        {isLoggingOut ? (
          <span className="flex items-center gap-1">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Logging out...</span>
          </span>
        ) : (
          <>
            <LogOutIcon className="h-4 w-4" />
            <span>Logout</span>
          </>
        )}
      </Button>
    </div>
  );
}
