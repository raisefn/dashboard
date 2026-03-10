const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = process.env.API_KEY || "";

interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

// --- Projects ---

export interface Project {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  twitter: string | null;
  github: string | null;
  description: string | null;
  sector: string | null;
  chains: string[] | null;
  status: string;
  tvl: number | null;
  tvl_change_7d: number | null;
  token_symbol: string | null;
  market_cap: number | null;
  token_price_usd: number | null;
  github_stars: number | null;
  github_commits_30d: number | null;
  github_contributors: number | null;
  snapshot_proposals_count: number | null;
  snapshot_voters_count: number | null;
  snapshot_proposal_activity_30d: number | null;
  reddit_subscribers: number | null;
  reddit_active_users: number | null;
  hn_mentions_90d: number | null;
  hn_total_points: number | null;
  twitter_followers: number | null;
  telegram_members: number | null;
  token_holder_count: number | null;
  last_enriched_at: string | null;
  created_at: string;
}

export interface ProjectListResponse {
  data: Project[];
  meta: PaginationMeta;
}

// --- Rounds ---

export interface RoundInvestor {
  id: string;
  name: string;
  slug: string;
  is_lead: boolean;
}

export interface ProjectBrief {
  id: string;
  name: string;
  slug: string;
}

export interface Round {
  id: string;
  project: ProjectBrief;
  round_type: string | null;
  amount_usd: number | null;
  valuation_usd: number | null;
  date: string;
  chains: string[] | null;
  sector: string | null;
  category: string | null;
  source_url: string | null;
  source_type: string;
  confidence: number;
  investors: RoundInvestor[];
  created_at: string;
}

export interface RoundListResponse {
  data: Round[];
  meta: PaginationMeta;
}

// --- Investors ---

export interface Investor {
  id: string;
  name: string;
  slug: string;
  type: string | null;
  website: string | null;
  twitter: string | null;
  description: string | null;
  hq_location: string | null;
  rounds_count: number;
  created_at: string;
}

export interface InvestorListResponse {
  data: Investor[];
  meta: PaginationMeta;
}

// --- Fetch helpers ---

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`/v1${path}`, API_BASE);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url.toString(), {
    headers: { "X-API-Key": API_KEY },
    next: { revalidate: 300 }, // cache 5 min
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getProjects(params?: {
  limit?: number;
  offset?: number;
  sort?: string;
  search?: string;
  sector?: string;
  chain?: string;
  status?: string;
}): Promise<ProjectListResponse> {
  const p: Record<string, string> = {};
  if (params?.limit) p.limit = String(params.limit);
  if (params?.offset) p.offset = String(params.offset);
  if (params?.sort) p.sort = params.sort;
  if (params?.search) p.search = params.search;
  if (params?.sector) p.sector = params.sector;
  if (params?.chain) p.chain = params.chain;
  if (params?.status) p.status = params.status;
  return apiFetch<ProjectListResponse>("/projects", p);
}

export async function getProject(slug: string): Promise<Project> {
  return apiFetch<Project>(`/projects/${slug}`);
}

export async function getRounds(params?: {
  limit?: number;
  offset?: number;
  sort?: string;
  sector?: string;
  chain?: string;
  round_type?: string;
  min_amount?: number;
  max_amount?: number;
  date_from?: string;
  date_to?: string;
  investor_slug?: string;
}): Promise<RoundListResponse> {
  const p: Record<string, string> = {};
  if (params?.limit) p.limit = String(params.limit);
  if (params?.offset) p.offset = String(params.offset);
  if (params?.sort) p.sort = params.sort;
  if (params?.sector) p.sector = params.sector;
  if (params?.chain) p.chain = params.chain;
  if (params?.round_type) p.round_type = params.round_type;
  if (params?.min_amount) p.min_amount = String(params.min_amount);
  if (params?.max_amount) p.max_amount = String(params.max_amount);
  if (params?.date_from) p.date_from = params.date_from;
  if (params?.date_to) p.date_to = params.date_to;
  if (params?.investor_slug) p.investor_slug = params.investor_slug;
  return apiFetch<RoundListResponse>("/rounds", p);
}

export async function getInvestors(params?: {
  limit?: number;
  offset?: number;
  search?: string;
  type?: string;
  sort?: string;
}): Promise<InvestorListResponse> {
  const p: Record<string, string> = {};
  if (params?.limit) p.limit = String(params.limit);
  if (params?.offset) p.offset = String(params.offset);
  if (params?.search) p.search = params.search;
  if (params?.type) p.type = params.type;
  if (params?.sort) p.sort = params.sort;
  return apiFetch<InvestorListResponse>("/investors", p);
}

export async function getInvestor(slug: string): Promise<Investor> {
  return apiFetch<Investor>(`/investors/${slug}`);
}

export async function getInvestorRounds(slug: string, params?: {
  limit?: number;
  offset?: number;
}): Promise<RoundListResponse> {
  const p: Record<string, string> = { investor_slug: slug };
  if (params?.limit) p.limit = String(params.limit);
  if (params?.offset) p.offset = String(params.offset);
  return apiFetch<RoundListResponse>("/rounds", p);
}

export async function getProjectRounds(slug: string): Promise<RoundListResponse> {
  // Fetch rounds and filter — or we need a project_slug param on the API
  // For now, get all rounds and the project detail page will show them
  return apiFetch<RoundListResponse>("/rounds", { limit: "200" });
}

// --- Health ---

export interface HealthResponse {
  status: string;
  round_count: number;
  investor_count: number;
  project_count: number;
  last_collection: string;
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

// --- Stats ---

export interface RoundTypeBreakdown {
  round_type: string;
  count: number;
  total_capital: number | null;
}

export interface StatsOverview {
  period: string;
  total_rounds: number;
  total_capital: number | null;
  avg_round_size: number | null;
  median_round_size: number | null;
  by_round_type: RoundTypeBreakdown[];
  prior_period_change: {
    total_rounds_pct: number | null;
    total_capital_pct: number | null;
  } | null;
}

export interface InvestorStats {
  id: string;
  name: string;
  slug: string;
  round_count: number;
  total_deployed: number | null;
}

export interface StatsInvestors {
  period: string;
  most_active: InvestorStats[];
  biggest_deployers: InvestorStats[];
}

export interface SectorStats {
  sector: string;
  round_count: number;
  total_capital: number | null;
  avg_round_size: number | null;
}

export async function getStatsOverview(period = "90d"): Promise<StatsOverview> {
  return apiFetch<StatsOverview>("/stats/overview", { period });
}

export async function getStatsInvestors(period = "90d", limit = 10): Promise<StatsInvestors> {
  return apiFetch<StatsInvestors>("/stats/investors", { period, limit: String(limit) });
}

export async function getStatsSectors(period = "90d"): Promise<SectorStats[]> {
  return apiFetch<SectorStats[]>("/stats/sectors", { period });
}
