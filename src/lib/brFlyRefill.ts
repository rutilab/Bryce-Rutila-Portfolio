/**
 * Bridge between hero BR-fly slots (page) and slingshot launches (section rules).
 * When a flung fly reaches the center of a vacant (netted) slot, it can fill in.
 */

export type VacantFlySlot = {
  index: number;
  cx: number;
  cy: number;
};

type BrFlyRefillApi = {
  getVacantSlots: () => VacantFlySlot[];
  fillSlot: (index: number, src: string) => void;
};

let api: BrFlyRefillApi | null = null;

export function registerBrFlyRefill(next: BrFlyRefillApi | null) {
  api = next;
}

export function getVacantBrFlySlots(): VacantFlySlot[] {
  return api?.getVacantSlots() ?? [];
}

export function fillBrFlySlot(index: number, src: string) {
  api?.fillSlot(index, src);
}
