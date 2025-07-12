// components/ui/scroll-area.tsx
import { cn } from "@/lib/utils";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollArea>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollArea>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollArea ref={ref} className={cn("overflow-hidden", className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-md">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar
      orientation="vertical"
      className="flex select-none touch-none p-0.5 bg-transparent transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-gray-400 dark:bg-gray-600" />
    </ScrollAreaPrimitive.Scrollbar>
  </ScrollAreaPrimitive.ScrollArea>
));

ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
