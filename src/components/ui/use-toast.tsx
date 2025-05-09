// Adapted from https://github.com/shadcn-ui/ui/blob/main/packages/ui/src/use-toast.tsx
import { toast as sonnerToast, type ToastT } from "sonner";

type ToasterToast = ToastT & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
};

let count = 0;

function generateId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type Toast = Omit<ToasterToast, "id">;

function toast({ variant = "default", ...props }: Toast) {
  const id = generateId();

  if (variant === "destructive") {
    return sonnerToast.error(props.title as string, {
      id,
      description: props.description as string,
      ...props,
    });
  }

  if (variant === "success") {
    return sonnerToast.success(props.title as string, {
      id,
      description: props.description as string,
      ...props,
    });
  }

  return sonnerToast(props.title as string, {
    id,
    description: props.description as string,
    ...props,
  });
}

function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  };
}

export { useToast, toast };
