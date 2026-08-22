import * as TabsPrimitive from "@radix-ui/react-tabs";

export const Tabs = TabsPrimitive.Root;

export const TabsList = ({ className = "", ...rest }) => (
  <TabsPrimitive.List
    className={`flex gap-1 border-b border-gold/30 ${className}`}
    {...rest}
  />
);

export const Tab = ({ className = "", ...rest }) => (
  <TabsPrimitive.Trigger
    className={`px-4 py-2.5 text-sm font-semibold text-muted transition-colors duration-fast border-b-2 border-transparent -mb-px hover:text-ink data-[state=active]:text-crimson data-[state=active]:border-crimson focus-visible:shadow-gold outline-none ${className}`}
    {...rest}
  />
);

export const TabsContent = ({ className = "", ...rest }) => (
  <TabsPrimitive.Content
    className={`pt-5 focus-visible:shadow-gold outline-none animate-fade-rise ${className}`}
    {...rest}
  />
);
