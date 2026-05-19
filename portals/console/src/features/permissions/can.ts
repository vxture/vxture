import type { Capability } from "@/entities/console";

export function hasCapability(
  capabilities: Capability[],
  target?: Capability,
): boolean {
  if (!target) {
    return true;
  }

  return capabilities.includes(target);
}
