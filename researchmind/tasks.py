import os

from crewai import Task

class ResearchTasks:
    def __init__(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.output_file = os.path.join(base_dir, "output", "report.md")

    def plan_task(self, agent, topic):
        return Task(
            description=f'Break down the research topic: "{topic}" into 5-7 focused sub-questions. Ensure coverage of fundamentals, current state of the art, practical applications, risks/limitations, and open problems.',
            expected_output='A prioritized list of 5-7 clear and search-friendly research questions with short rationale for each.',
            agent=agent
        )

    def research_task(self, agent, topic):
        return Task(
            description=f'Based on the research plan for "{topic}", use the search tool to collect detailed evidence for each sub-question. For each major claim, include at least one supporting source URL. Capture quantitative metrics when available, note publication year/recency, and include conflicting viewpoints where they exist.',
            expected_output='Comprehensive evidence notes grouped by sub-question, with factual claims, numeric findings, publication context, and source URLs.',
            agent=agent,
            context=[] # Will be populated with the previous task's output automatically by CrewAI if sequential
        )

    def analysis_task(self, agent):
        return Task(
            description='Review the gathered evidence. Filter irrelevant material, identify high-confidence insights, highlight contradictions, and distinguish mature findings from uncertain claims. Explicitly list research gaps and unresolved questions.',
            expected_output='A synthesized analysis with confidence-aware insights, contradictions, key takeaways, and a dedicated list of research gaps.',
            agent=agent
        )

    def publication_task(self, agent):
        return Task(
            description='Prepare the report for professional LaTeX publication. Normalize section structure, ensure there are 10-15 scholarly references with full URLs, and verify that each research gap statement is paired with at least one citation. Produce publication guidance that the final writer can directly turn into a polished report.',
            expected_output='A publication-ready outline with section ordering, citation coverage notes, and reference completeness checks for the final report.',
            agent=agent
        )

    def write_task(self, agent):
        return Task(
            description='Write a comprehensive publication-style research report in Markdown. Include sections in this exact order: Summary, Key Findings, Research Gaps, Sources, and Conclusion. Use concise language and ensure key claims are traceable to sources. In the Sources section, list 10-15 distinct, working paper links (full URLs). For every bullet under Research Gaps, include at least one citation URL.',
            expected_output='A structured, polished Markdown research report with the required sections, 10-15 valid paper links, and citations attached to every research gap bullet.',
            agent=agent,
            output_file=self.output_file # Saves the output to a file
        )
