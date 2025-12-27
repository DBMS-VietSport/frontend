import { courts, courtTypes, branches } from "../../../mock/data";
import type { Court } from "../../../mock/types";
import { nextId } from "../../../mock/id-utils";

export const courtRepo = {
  listCourts: async (): Promise<
    (Court & { court_type_name: string; branch_name: string })[]
  > => {
    await new Promise((r) => setTimeout(r, 50));
    return courts.map((c) => ({
      ...c,
      court_type_name:
        courtTypes.find((t) => t.id === c.court_type_id)?.name || "",
      branch_name: branches.find((b) => b.id === c.branch_id)?.name || "",
    }));
  },
  addCourt: async (
    payload: Omit<Court, "id" | "display_name"> & { display_name?: string }
  ): Promise<Court> => {
    await new Promise((r) => setTimeout(r, 50));
    const newCourt: Court = {
      id: nextId(),
      ...payload,
      display_name: payload.display_name || `Sân ${courts.length + 1}`,
    };
    courts.push(newCourt);
    return newCourt;
  },
  updateCourt: async (id: number, data: Partial<Court>): Promise<Court> => {
    await new Promise((r) => setTimeout(r, 50));
    const idx = courts.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Court not found");
    courts[idx] = { ...courts[idx], ...data };
    return courts[idx];
  },
  listCourtTypes: () => courtTypes,
};
