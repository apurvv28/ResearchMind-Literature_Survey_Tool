from crewai import Agent
from tools import search_tool
import os

class ResearchAgents:
    def planner_agent(self):
        return Agent(
            role='Research Planner',
            goal='Break down the given topic into focused sub-questions for research.',
            backstory='You are an expert research planner. Your job is to take a broad topic and identify the key areas that need to be investigated to provide a comprehensive answer. You break complex problems into manageable research questions.',
            verbose=True,
            allow_delegation=False,
            llm='groq/meta-llama/llama-4-scout-17b-16e-instruct'
        )

    def researcher_agent(self):
        return Agent(
            role='Senior Researcher',
            goal='Conduct deep, source-grounded web research with verifiable evidence and broad coverage of the topic.',
            backstory='You are a tenacious principal researcher who triangulates claims across multiple reputable sources, prioritizes recent evidence, captures quantitative results, and records source links for every major assertion.',
            tools=[search_tool],
            verbose=True,
            allow_delegation=False,
            llm='groq/meta-llama/llama-4-scout-17b-16e-instruct'
        )

    def analyst_agent(self):
        return Agent(
            role='Research Analyst',
            goal='Analyze gathered information, identify key insights, and evaluate source confidence and contradictions.',
            backstory='You are a critical thinker who evaluates methodological quality, highlights agreement and disagreement across sources, and separates strong evidence from weak or speculative claims.',
            verbose=True,
            allow_delegation=False,
            llm='groq/meta-llama/llama-4-scout-17b-16e-instruct'
        )

    def writer_agent(self):
        return Agent(
            role='Content Writer',
            goal='Compile findings into a publication-style report with clear structure, evidence-backed statements, and citations.',
            backstory='You are a skilled technical writer who produces polished research reports with concise prose, explicit evidence attribution, and complete source sections suitable for professional publication workflows.',
            verbose=True,
            allow_delegation=False,
            llm='groq/meta-llama/llama-4-scout-17b-16e-instruct'
        )

    def publication_agent(self):
        return Agent(
            role='LaTeX Publication Editor',
            goal='Prepare a LaTeX-ready publication package with strong citation hygiene, reference completeness, and professional report structure.',
            backstory='You are a technical publication specialist. You ensure the final report is cleanly structured for LaTeX rendering, contains enough scholarly references, and presents research gaps with explicit supporting citations.',
            verbose=True,
            allow_delegation=False,
            llm='groq/meta-llama/llama-4-scout-17b-16e-instruct'
        )
