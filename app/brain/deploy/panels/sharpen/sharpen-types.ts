export type SharpenStatus = "strong" | "solid" | "gap" | "empty";

export interface SharpenSection {
  id: string;
  title: string;
  why_it_matters: string;
  status: SharpenStatus;
  fields_filled: string[];
  fields_missing: string[];
  data: Record<string, unknown>;
}

export interface SharpenState {
  summary: string;
  sections: SharpenSection[];
  acting_as_email: string | null;
}
