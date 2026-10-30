type ProjectSummary = {
  slug: string;
  title: string;
  description: string;
  tech_stack?: string[] | null;
  github_url?: string | null;
  live_url?: string | null;
  detailed_description?: string | null;
  video_url?: string | null;
};

/** Public project content is sourced only from Supabase so admin edits and clears persist. */
export const withCurrentProjectContent = <T extends ProjectSummary>(project: T): T => project;
