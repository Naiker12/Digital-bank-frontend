import * as Radix from "radix-ui";

console.log("Radix keys:", Object.keys(Radix));
if (Radix.Slot) console.log("Slot is defined:", typeof Radix.Slot);
if (Radix.Tooltip) console.log("Tooltip is defined:", typeof Radix.Tooltip);
if (Radix.TooltipContent) console.log("TooltipContent is defined:", typeof Radix.TooltipContent);
