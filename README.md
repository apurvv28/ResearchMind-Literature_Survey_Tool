# ResearchMind - AI Research Assistant

ResearchMind is a full-stack AI research workflow that generates structured literature reviews from a topic prompt.

It combines:
- A modern Next.js web app for topic input, progress tracking, history, and results.
- A Python FastAPI + CrewAI backend that runs a multi-agent research pipeline.
- Automated report artifacts in Markdown, LaTeX, and optional PDF.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [API Contract](#api-contract)
- [Generated Outputs](#generated-outputs)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)

## Overview

Given a research topic, the backend orchestrates specialist agents to:
1. Plan focused sub-questions.
2. Gather evidence using web search.
3. Analyze contradictions and confidence.
4. Prepare publication structure and references.
5. Produce a final research report.

The frontend then presents:
- Summary and key findings.
- Key paper cards with links.
- Research gaps with citations.
- Actions to copy summary, copy LaTeX, and download PDF.

## Architecture

Frontend flow:
1. User enters a topic on the home page.
2. The app navigates to a processing screen and calls `/api/research`.
3. The Next.js API route forwards the request to the Python backend.
4. The UI renders structured results and stores topic history in browser storage.

Backend flow:
1. `POST /research` starts CrewAI sequential tasks.
2. A Markdown report is written to `researchmind/output/report.md`.
3. The report is normalized into a structured API response.
4. LaTeX is generated and PDF compilation is attempted.
5. Output files are served from `/output`.

## Tech Stack

Frontend (`ai-research-assistant`):
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion

Backend (`researchmind`):
- Python
- FastAPI + Uvicorn
- CrewAI + crewai-tools
- LangChain ecosystem
- PyLaTeX

## Project Structure

```text
Researcher/
	README.md
	ai-research-assistant/
		app/
			api/research/route.ts   # Next.js proxy to backend
			page.tsx                # Topic input
			processing/page.tsx     # Progress state
			results/page.tsx        # Structured output view
			history/page.tsx        # Previously queried topics
		lib/research-api.ts       # Frontend API client and storage helpers
	researchmind/
		api.py                    # FastAPI app and /research endpoint
		agents.py                 # CrewAI agent definitions
		tasks.py                  # CrewAI task definitions
		reporting.py              # Markdown -> LaTeX/PDF compilation
		tools.py                  # Search tool configuration
		main.py                   # CLI entrypoint
		output/                   # Generated report artifacts
```

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.10+
- npm (or another Node package manager)
- Optional LaTeX compiler for PDF generation:
	- `pdflatex`, `xelatex`, `lualatex`, or `tectonic`

### 1) Frontend setup

```bash
cd ai-research-assistant
npm install
```

### 2) Backend setup

```bash
cd researchmind
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Environment Variables

Create `researchmind/.env`:

```env
SERPER_API_KEY=your_serper_key
GROQ_API_KEY=your_groq_key
```

Optional frontend variable in `ai-research-assistant/.env.local`:

```env
RESEARCHMIND_API_URL=http://127.0.0.1:8001
```

If `RESEARCHMIND_API_URL` is not provided, the frontend defaults to `http://127.0.0.1:8001`.

## Running the Project

Use two terminals.

Terminal A (backend):

```bash
cd researchmind
.venv\Scripts\activate
uvicorn api:app --reload --host 127.0.0.1 --port 8001
```

Terminal B (frontend):

```bash
cd ai-research-assistant
npm run dev
```

Open `http://localhost:3000`.

## API Contract

### Health check

`GET /health`

Response:

```json
{ "ok": true }
```

### Run research

`POST /research`

Request body:

```json
{
	"topic": "Federated Learning Security"
}
```

Response shape (abridged):

```json
{
	"topic": "...",
	"summary": ["..."],
	"keyFindings": ["..."],
	"keyPapers": [{ "title": "...", "authors": "...", "year": 2025, "url": "..." }],
	"researchGaps": ["..."],
	"sources": ["..."],
	"rawReport": "...",
	"latexCode": "...",
	"latexPath": "report.tex",
	"pdfPath": "report.pdf",
	"pdfUrl": "/output/report.pdf",
	"latexCompiler": "pylatex:..."
}
```

## Generated Outputs

The backend writes artifacts to `researchmind/output/`:
- `report.md` - generated markdown report.
- `report.tex` - generated LaTeX source.
- `report.pdf` - compiled PDF (only when a LaTeX compiler is available).

## Troubleshooting

- Missing API keys:
	- Ensure `SERPER_API_KEY` and `GROQ_API_KEY` are set in `researchmind/.env`.
- Backend unreachable from frontend:
	- Confirm backend is running on `127.0.0.1:8001`.
	- Set `RESEARCHMIND_API_URL` in `ai-research-assistant/.env.local` if using a custom host/port.
- PDF not generated:
	- Install one supported LaTeX compiler (`tectonic` is a simple option).
	- Markdown and LaTeX outputs will still be generated even when PDF compilation fails.

## Future Improvements

- Add persistent database-backed research history.
- Add citation quality scoring and source trust ranking.
- Add authentication and per-user workspaces.
- Add background job queueing for long-running research tasks.

