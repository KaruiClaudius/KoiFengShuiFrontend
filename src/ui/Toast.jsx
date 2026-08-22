import { Toaster as SonnerToaster, toast } from "sonner";

export const Toaster = () => (
  <SonnerToaster
    position="top-right"
    toastOptions={{
      style: {
        background: "#FFFDF6",
        border: "1px solid rgba(201,162,39,.4)",
        borderRadius: "12px",
        color: "#211B16",
        fontFamily:
          "'Be Vietnam Pro', system-ui, sans-serif",
        boxShadow: "0 18px 44px -22px rgba(33,27,22,.45)",
      },
    }}
  />
);

export { toast };

export const notify = {
  success: (msg) => toast.success(msg),
  error: (msg) => toast.error(msg),
  info: (msg) => toast(msg),
};
