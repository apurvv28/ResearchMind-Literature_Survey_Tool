export type ResearchPaper = {
  title: string;
  authors?: string;
  year?: number | null;
  url: string;
};

export type ResearchResult = {
  topic: string;
  summary: string[];
  keyFindings: string[];
  keyPapers: ResearchPaper[];
  researchGaps: string[];
  sources?: string[];
  rawReport?: string;
  latexCode?: string | null;
  latexPath?: string | null;
  pdfPath?: string | null;
  pdfUrl?: string | null;
  latexCompiler?: string | null;
};

const PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_RESEARCHMIND_API_URL?.replace(/\/$/, "");

function getResearchEndpoint(): string {
  // In production (Vercel), call Render API directly to avoid serverless proxy timeouts.
  if (PUBLIC_BACKEND_URL) {
    return `${PUBLIC_BACKEND_URL}/research`;
  }

  // Local fallback uses Next.js API route proxy.
  return "/api/research";
}

export async function fetchResearch(topic: string): Promise<ResearchResult> {
  const response = await fetch(getResearchEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ topic }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error ?? "Failed to generate research summary");
  }

  return payload as ResearchResult;
}

export function saveResearchResult(result: ResearchResult): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(`research:${result.topic.toLowerCase()}`, JSON.stringify(result));

  const existing = JSON.parse(localStorage.getItem("research-history") ?? "[]") as string[];
  const deduped = [result.topic, ...existing.filter((item) => item !== result.topic)].slice(0, 30);
  localStorage.setItem("research-history", JSON.stringify(deduped));
}

export function getSavedResearch(topic: string): ResearchResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  const key = `research:${topic.toLowerCase()}`;
  const raw = sessionStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ResearchResult;
  } catch {
    return null;
  }
}

export function getHistoryTopics(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem("research-history") ?? "[]") as string[];
  } catch {
    return [];
  }
}
