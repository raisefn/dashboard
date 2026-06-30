// Sidebar state types — mirror brain/admin.py:/brain/sidebar-state shape

export interface SidebarCampaign {
  id: string;
  status: string;
  target_amount_usd: number | null;
  stage: string | null;
  sector: string | null;
  sectors: string[];
  description: string | null;
  days_in: number | null;
  started_at: string | null;
}

export interface SidebarPipelineInvestor {
  id: string;
  slug: string | null;
  name: string;
  firm: string | null;
  status: string | null;
  days_since_update: number | null;
  meeting_scheduled_for: string | null;
}

export interface SidebarMatchesSummary {
  total_unique: number;
  batches_count: number;
  latest_batch: {
    id: string;
    generated_at: string | null;
    request: { sector?: string; stage?: string; raising_usd?: number } | null;
    count: number;
  } | null;
}

export interface SidebarBrief {
  token: string;
  investor_full_name: string | null;
  investor_first_name: string | null;
  created_at: string | null;
}

export interface SidebarDocument {
  id: string;
  filename: string;
  doc_type: string;
  created_at: string | null;
}

export interface SidebarActivity {
  id: string;
  event_type: string;
  investor_slug: string | null;
  investor_name: string | null;
  summary: string | null;
  created_at: string | null;
}

export type SharpenSidebarStatus = "strong" | "solid" | "gap" | "empty";

export interface SharpenSidebarRow {
  id: "basics" | "story" | "team" | "proof" | "past";
  title: string;
  status: SharpenSidebarStatus;
}

export interface SidebarState {
  campaign: SidebarCampaign | null;
  pipeline: SidebarPipelineInvestor[];
  matches: SidebarMatchesSummary;
  briefs: SidebarBrief[];
  documents: SidebarDocument[];
  activity: SidebarActivity[];
  sharpen?: SharpenSidebarRow[];
  signals_unack_count?: number;
  acting_as_email: string | null;
}
