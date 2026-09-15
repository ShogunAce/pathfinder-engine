export interface ProblemReframed {
  summary: string;
  sub_problems: string[];
}

export interface KeyPlayer {
  name: string;
  what_they_do: string;
}

export interface Landscape {
  summary: string;
  key_players: KeyPlayer[];
}

export interface Gaps {
  summary: string;
  openings: string[];
}

export interface Pathway {
  platform: string;
  category: string;
  why_fit: string;
  keywords: string;
  search_url: string;
  first_step: string;
}

export interface FirstMove {
  action: string;
  why: string;
  time_estimate: string;
}

export interface InnovationBrief {
  problem_reframed: ProblemReframed;
  landscape: Landscape;
  gaps: Gaps;
  pathways: Pathway[];
  first_move: FirstMove;
}

export interface GenerateBriefRequest {
  problem: string;
}

export interface GenerateBriefResponse {
  brief?: InnovationBrief;
  error?: string;
}

export type PathwayStatus = "Interested" | "Started" | "Active";

export interface UserBriefRecord {
  briefId: string;
  originalProblem: string;
  brief: InnovationBrief;
  createdAt: any;
  pathwayStatuses: Record<string, PathwayStatus>;
}

export interface SavedBriefDoc {
  originalProblem: string;
  brief: InnovationBrief;
  userId?: string | null;
  createdAt: any;
}
