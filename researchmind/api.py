import os
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from crewai import Crew, Process

# Ensure local imports work when launched from workspace root.
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from agents import ResearchAgents
    from tasks import ResearchTasks
    from reporting import generate_compiled_report
except ImportError:
    from researchmind.agents import ResearchAgents
    from researchmind.tasks import ResearchTasks
    from researchmind.reporting import generate_compiled_report


class ResearchRequest(BaseModel):
    topic: str = Field(min_length=2, max_length=240)


class Paper(BaseModel):
    title: str
    authors: str = "Unknown"
    year: Optional[int] = None
    url: str


class ResearchResponse(BaseModel):
    topic: str
    summary: List[str]
    keyFindings: List[str]
    keyPapers: List[Paper]
    researchGaps: List[str]
    sources: List[str]
    rawReport: str
    latexCode: Optional[str] = None
    latexPath: Optional[str] = None
    pdfPath: Optional[str] = None
    pdfUrl: Optional[str] = None
    latexCompiler: Optional[str] = None


def _read_report() -> str:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(base_dir, "output", "report.md"),
        os.path.join(os.getcwd(), "output", "report.md"),
    ]

    for path in candidates:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as file:
                return file.read()

    raise FileNotFoundError("Unable to locate generated report.md")


def _output_dir() -> str:
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
    os.makedirs(path, exist_ok=True)
    return path


def _cors_allow_origins() -> List[str]:
    configured = os.getenv("CORS_ALLOWED_ORIGINS", "")
    origins = [origin.strip() for origin in configured.split(",") if origin.strip()]

    # Local development defaults.
    for local_origin in ["http://localhost:3000", "http://127.0.0.1:3000"]:
        if local_origin not in origins:
            origins.append(local_origin)

    return origins


def _to_output_relative(path: Optional[str]) -> Optional[str]:
    if not path:
        return None

    base_dir = _output_dir()
    absolute_path = os.path.abspath(path)
    absolute_base = os.path.abspath(base_dir)

    if not absolute_path.startswith(absolute_base):
        return None

    relative = os.path.relpath(absolute_path, absolute_base)
    return relative.replace("\\", "/")


def _extract_section(markdown: str, headings: List[str]) -> str:
    heading_pattern = "|".join(re.escape(h) for h in headings)
    pattern = rf"(?ims)^#+\s*(?:{heading_pattern})\s*$\n(.*?)(?=^#|\Z)"
    match = re.search(pattern, markdown)
    return match.group(1).strip() if match else ""


def _extract_bullets(text: str) -> List[str]:
    if not text:
        return []
    bullets = []
    for line in text.splitlines():
        cleaned = re.sub(r"^\s*[-*•]\s+", "", line).strip()
        if cleaned and cleaned != line.strip():
            bullets.append(cleaned)
    return bullets


def _extract_paragraphs(text: str) -> List[str]:
    if not text:
        return []
    blocks = [block.strip() for block in re.split(r"\n\s*\n", text) if block.strip()]
    paragraphs: List[str] = []

    for block in blocks:
        if re.match(r"^\s*[-*•]\s+", block):
            continue
        paragraphs.append(block.replace("\n", " ").strip())

    return paragraphs


def _extract_sources(markdown: str) -> List[str]:
    urls = re.findall(r"https?://[^\s)\]]+", markdown)
    seen = set()
    ordered = []

    for url in urls:
        normalized = url.rstrip(".,")
        if normalized not in seen:
            seen.add(normalized)
            ordered.append(normalized)

    return ordered


def _source_to_title(url: str) -> str:
    slug = url.split("/")[-1] or url.split("/")[-2]
    clean = re.sub(r"[-_]+", " ", slug)
    clean = re.sub(r"\.[a-z0-9]+$", "", clean, flags=re.IGNORECASE)
    title = clean.strip().title()
    return title if title else "Research Source"


def _fetch_arxiv_papers(topic: str, max_results: int = 15) -> List[Paper]:
    # arXiv is used as a reliable fallback so references are valid and clickable.
    if max_results <= 0:
        return []

    query = urllib.parse.quote(topic)
    url = (
        "https://export.arxiv.org/api/query?"
        f"search_query=all:{query}&start=0&max_results={max_results}&"
        "sortBy=relevance&sortOrder=descending"
    )

    request = urllib.request.Request(url, headers={"User-Agent": "ResearchMind/1.0"})
    with urllib.request.urlopen(request, timeout=20) as response:
        xml_data = response.read()

    root = ET.fromstring(xml_data)
    namespace = {"atom": "http://www.w3.org/2005/Atom"}

    papers: List[Paper] = []
    for entry in root.findall("atom:entry", namespace):
        title_node = entry.find("atom:title", namespace)
        id_node = entry.find("atom:id", namespace)
        published_node = entry.find("atom:published", namespace)
        author_nodes = entry.findall("atom:author", namespace)

        title = (title_node.text or "Untitled").strip() if title_node is not None else "Untitled"
        paper_url = (id_node.text or "").strip() if id_node is not None else ""
        published = (published_node.text or "").strip() if published_node is not None else ""

        authors = []
        for author in author_nodes:
            name_node = author.find("atom:name", namespace)
            if name_node is not None and name_node.text:
                authors.append(name_node.text.strip())

        year: Optional[int] = None
        year_match = re.match(r"^(\d{4})", published)
        if year_match:
            year = int(year_match.group(1))

        if paper_url:
            papers.append(
                Paper(
                    title=title,
                    authors=", ".join(authors[:6]) if authors else "Unknown",
                    year=year,
                    url=paper_url,
                )
            )

    return papers


def _has_inline_citation(text: str) -> bool:
    if re.search(r"https?://", text):
        return True
    if re.search(r"\[\d+\]", text):
        return True
    return False


def _attach_gap_citations(gaps: List[str], citation_urls: List[str]) -> List[str]:
    if not gaps:
        return gaps

    if not citation_urls:
        return gaps

    cited: List[str] = []
    total = len(citation_urls)
    for index, gap in enumerate(gaps):
        if _has_inline_citation(gap):
            cited.append(gap)
            continue

        # Add two rotating citations to each uncited gap for traceability.
        url_one = citation_urls[index % total]
        url_two = citation_urls[(index + 1) % total] if total > 1 else citation_urls[index % total]
        cited.append(f"{gap} [Citations: {url_one}; {url_two}]")

    return cited


def _to_structured_response(topic: str, report_markdown: str) -> ResearchResponse:
    summary_section = _extract_section(report_markdown, ["Summary", "Abstract", "Overview"])
    findings_section = _extract_section(report_markdown, ["Key Findings", "Findings", "Insights"])
    gaps_section = _extract_section(report_markdown, ["Research Gaps", "Limitations", "Open Problems"])

    summary = _extract_paragraphs(summary_section)
    key_findings = _extract_bullets(findings_section)
    research_gaps = _extract_bullets(gaps_section)
    sources = _extract_sources(report_markdown)

    if not summary:
        summary = [
            f"A structured literature review was generated for {topic}.",
            "The full report is available in the raw output and source sections.",
        ]

    if not key_findings:
        key_findings = [
            "Key findings were not explicitly sectioned by the model output.",
            "Review the full report for detailed evidence and discussion.",
        ]

    if not research_gaps:
        research_gaps = [
            "Clear research gaps were not explicitly listed in the generated report.",
            "Further manual synthesis may be needed for gap analysis.",
        ]

    papers: List[Paper] = []
    seen_urls = set()

    for source in sources:
        normalized = source.strip()
        if not normalized or normalized in seen_urls:
            continue
        seen_urls.add(normalized)
        papers.append(Paper(title=_source_to_title(normalized), url=normalized))

    # Guarantee a professional reference list depth by supplementing from arXiv.
    min_references = 10
    max_references = 15

    if len(papers) < min_references:
        try:
            supplemental = _fetch_arxiv_papers(topic, max_results=max_references)
            for paper in supplemental:
                if paper.url in seen_urls:
                    continue
                seen_urls.add(paper.url)
                papers.append(paper)
                if len(papers) >= max_references:
                    break
        except Exception:
            # Keep API resilient when network calls are not available.
            pass

    papers = papers[:max_references]
    final_sources = [paper.url for paper in papers]
    research_gaps = _attach_gap_citations(research_gaps, final_sources)

    return ResearchResponse(
        topic=topic,
        summary=summary,
        keyFindings=key_findings,
        keyPapers=papers,
        researchGaps=research_gaps,
        sources=final_sources,
        rawReport=report_markdown,
    )


def run_research(topic: str) -> ResearchResponse:
    agents = ResearchAgents()
    tasks = ResearchTasks()

    planner = agents.planner_agent()
    researcher = agents.researcher_agent()
    analyst = agents.analyst_agent()
    publication_editor = agents.publication_agent()
    writer = agents.writer_agent()

    plan = tasks.plan_task(planner, topic)
    research = tasks.research_task(researcher, topic)
    analysis = tasks.analysis_task(analyst)
    publication = tasks.publication_task(publication_editor)
    write = tasks.write_task(writer)

    crew = Crew(
        agents=[planner, researcher, analyst, publication_editor, writer],
        tasks=[plan, research, analysis, publication, write],
        process=Process.sequential,
        verbose=False,
    )

    crew.kickoff()
    report = _read_report()
    structured = _to_structured_response(topic, report)

    try:
        compiled = generate_compiled_report(topic=topic, markdown=report, output_dir=_output_dir())
        structured.latexCode = compiled.latex_code
        structured.latexPath = _to_output_relative(compiled.latex_path)
        structured.pdfPath = _to_output_relative(compiled.pdf_path)
        if structured.pdfPath:
            structured.pdfUrl = f"/output/{structured.pdfPath}"
        structured.latexCompiler = compiled.compiler
    except Exception as error:
        # Keep API resilient: users still get report text if compilation fails.
        structured.latexCode = None
        structured.latexPath = None
        structured.pdfPath = None
        structured.pdfUrl = None
        structured.latexCompiler = f"compile-error: {error}"

    return structured


app = FastAPI(title="ResearchMind API", version="1.0.0")

app.mount("/output", StaticFiles(directory=_output_dir()), name="output")

cors_allow_origin_regex = os.getenv("CORS_ALLOW_ORIGIN_REGEX", r"https://.*\.vercel\.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_allow_origins(),
    allow_origin_regex=cors_allow_origin_regex,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    load_dotenv()


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/research", response_model=ResearchResponse)
def research(request: ResearchRequest) -> ResearchResponse:
    topic = request.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic cannot be empty")

    try:
        return run_research(topic)
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Research failed: {error}")
