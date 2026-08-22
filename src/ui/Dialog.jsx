import * as DialogPrimitive from "@radix-ui/react-dialog";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = ({
  title,
  description,
  children,
  side = "center",
  className = "",
}) => {
  const position =
    side === "right" ? "fixed inset-y-0 right-0 h-full w-full max-w-md" : "";
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-ink/60 backdrop-blur-[2px] z-[100] data-[state=open]:animate-fade-rise" />
      <DialogPrimitive.Content
        className={`z-[101] bg-surface grain-bg border border-gold/40 rounded-lg shadow-lift p-6 focus:outline-none ${
          side === "right"
            ? `${position} `
            : "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-lg"
        } ${className}`}
      >
        <div className="hairline-top absolute top-0 left-6 right-6" />
        {title && (
          <DialogPrimitive.Title className="font-display text-xl text-ink mb-2">
            {title}
          </DialogPrimitive.Title>
        )}
        {description && (
          <DialogPrimitive.Description className="text-sm text-muted mb-4">
            {description}
          </DialogPrimitive.Description>
        )}
        {children}
        <DialogPrimitive.Close
          aria-label="Đóng"
          className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-md text-muted hover:text-crimson hover:bg-paper-2 transition-colors"
        >
          ✕
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
};
