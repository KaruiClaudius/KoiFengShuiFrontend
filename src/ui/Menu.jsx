import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";

export const Menu = MenuPrimitive.Root;
export const MenuTrigger = MenuPrimitive.Trigger;

export const MenuContent = ({ className = "", children, ...rest }) => (
  <MenuPrimitive.Portal>
    <MenuPrimitive.Content
      sideOffset={8}
      align="end"
      className={`z-[110] min-w-[180px] grain-bg bg-surface border border-gold/40 rounded-md shadow-lift p-1.5 data-[state=open]:animate-fade-rise ${className}`}
      {...rest}
    >
      {children}
    </MenuPrimitive.Content>
  </MenuPrimitive.Portal>
);

export const MenuItem = ({ className = "", ...rest }) => (
  <MenuPrimitive.Item
    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-sm cursor-pointer outline-none transition-colors duration-fast text-ink-soft hover:bg-paper-2 hover:text-crimson data-[highlighted]:bg-paper-2 data-[highlighted]:text-crimson ${className}`}
    {...rest}
  />
);

export const MenuSeparator = () => (
  <MenuPrimitive.Separator className="my-1 h-px bg-gold/30" />
);
