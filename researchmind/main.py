import os
import sys
from dotenv import load_dotenv
from crewai import Crew, Process

# Ensure we can import modules if running from parent or inside
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from agents import ResearchAgents
    from tasks import ResearchTasks
    from reporting import generate_compiled_report
except ImportError:
    # Fallback if running as module
    from researchmind.agents import ResearchAgents
    from researchmind.tasks import ResearchTasks
    from researchmind.reporting import generate_compiled_report

def main():
    load_dotenv()
    
    # Check for API Keys
    if not os.getenv("SERPER_API_KEY"):
        print("Warning: SERPER_API_KEY not found in environment variables.")
        print("Search functionality may fail. Please set it in your .env file.")
    
    if not os.getenv("GROQ_API_KEY"):
        print("Warning: GROQ_API_KEY not found in environment variables.")
        print("Agents requires an LLM to function.")

    print("Welcome to ResearchMind!")
    print("--------------------------------")
    topic = input("Enter the research topic: ")

    if not topic:
        print("Topic cannot be empty.")
        return

    # Instantiate Agents
    agents = ResearchAgents()
    try:
        planner = agents.planner_agent()
        researcher = agents.researcher_agent()
        analyst = agents.analyst_agent()
        publication_editor = agents.publication_agent()
        writer = agents.writer_agent()
    except Exception as e:
        print(f"Error initializing agents: {e}")
        return

    # Instantiate Tasks
    tasks = ResearchTasks()
    plan = tasks.plan_task(planner, topic)
    research = tasks.research_task(researcher, topic)
    analysis = tasks.analysis_task(analyst)
    publication = tasks.publication_task(publication_editor)
    write = tasks.write_task(writer)

    # Create Crew
    crew = Crew(
        agents=[planner, researcher, analyst, publication_editor, writer],
        tasks=[plan, research, analysis, publication, write],
        process=Process.sequential,
        verbose=True
    )

    print(f"\nStarting research on: {topic}\n")
    try:
        result = crew.kickoff()
        
        print("\n################################################")
        print("## Research Completed")
        print("################################################\n")
        print(f"Report saved to output/report.md")

        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            markdown_path = os.path.join(base_dir, "output", "report.md")
            with open(markdown_path, "r", encoding="utf-8") as report_file:
                markdown = report_file.read()

            compiled = generate_compiled_report(topic=topic, markdown=markdown, output_dir=os.path.join(base_dir, "output"))
            print(f"LaTeX saved to output/{os.path.basename(compiled.latex_path)}")
            if compiled.pdf_path:
                print(f"PDF generated at output/{os.path.basename(compiled.pdf_path)} using {compiled.compiler}")
            else:
                print("No LaTeX compiler found (tried tectonic/pdflatex/xelatex/lualatex).")
        except Exception as compile_error:
            print(f"Warning: failed to compile LaTeX report: {compile_error}")

        print("\nFinal Result Summary:")
        print(result)
        
    except Exception as e:
        print(f"An error occurred during execution: {e}")

if __name__ == "__main__":
    main()
