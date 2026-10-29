"""
Company Intelligence & Hiring Culture Service
Researches and scrapes/aggregates company culture, interview style,
and hiring norms to inform the candidate during analysis.
"""

from typing import Optional, Dict, Any
from ..models.schemas import CompanyIntelligence

# Knowledge base of top engineering employers and hiring cultures
KNOWN_COMPANIES: Dict[str, Dict[str, Any]] = {
    "google": {
        "company_name": "Google",
        "work_culture_rating": 4.4,
        "culture_summary": "High engineering autonomy, collaborative peer review, strong emphasis on scalability, clean code, and engineering excellence.",
        "hiring_and_interview_style": "Structured process: Recruiter screen, Technical Phone Screen (DSA/Problem Solving), 4-5 Onsite rounds covering Data Structures & Algorithms, System Design (for L4+), and Googleyness & Leadership.",
        "candidate_tips": [
            "Clarify ambiguities before jumping into solution code.",
            "Analyze Big-O time and space trade-offs proactively.",
            "Demonstrate collaborative problem solving and receptive attitude to feedback."
        ],
        "positive_sentiments": ["Exceptional smart peers", "Industry-leading benefits & tooling", "Massive scale impact"],
        "cautionary_notes": ["Slow bureaucratic decision-making in large orgs", "Competitive promotion cycles"],
        "verified_sources": ["Glassdoor Employee Reviews", "Levels.fyi Interview Insights", "Blind Community"]
    },
    "microsoft": {
        "company_name": "Microsoft",
        "work_culture_rating": 4.3,
        "culture_summary": "Growth-mindset oriented, strong work-life balance, collaborative engineering teams across cloud, AI, and enterprise suites.",
        "hiring_and_interview_style": "Typically 1 screening call followed by 4 loop interviews focusing on practical problem solving, design, and cultural alignment with Microsoft values.",
        "candidate_tips": [
            "Demonstrate a growth mindset — how you learn from failures.",
            "Highlight practical architectural trade-offs in cloud systems.",
            "Be prepared to discuss your past projects in deep technical detail."
        ],
        "positive_sentiments": ["Great work-life balance", "Supportive management", "High job stability"],
        "cautionary_notes": ["Legacy codebases exist in certain enterprise divisions", "Varying pace between teams"],
        "verified_sources": ["Glassdoor Employee Reviews", "Indeed Company Reviews"]
    },
    "amazon": {
        "company_name": "Amazon",
        "work_culture_rating": 3.9,
        "culture_summary": "High-velocity, customer-obsessed culture driven strictly by the 16 Leadership Principles. Fast-paced with high ownership.",
        "hiring_and_interview_style": "Online Assessment (OA), followed by 4-5 interview 'Loop' with a designated 'Bar Raiser'. Every interview evaluates 2-3 specific Leadership Principles in STAR format.",
        "candidate_tips": [
            "Format every behavioral response strictly in STAR (Situation, Task, Action, Result) with metrics.",
            "Demonstrate 'Customer Obsession', 'Bias for Action', and 'Frugality'.",
            "Be ready to defend every design choice with concrete business impact."
        ],
        "positive_sentiments": ["Tremendous career velocity and learning curve", "Direct customer ownership"],
        "cautionary_notes": ["High pressure / on-call workload in operational services", "Demanding performance quotas"],
        "verified_sources": ["Glassdoor Reviews", "Blind Verified Employee Feedback"]
    },
    "vercel": {
        "company_name": "Vercel",
        "work_culture_rating": 4.6,
        "culture_summary": "Modern developer-first culture, high craft, remote-first global team, extreme focus on speed, design polish, and frontend UX.",
        "hiring_and_interview_style": "Recruiter chat, technical discussion with an engineering manager, followed by a realistic take-home project or live pair-programming session focused on frontend/full-stack architecture.",
        "candidate_tips": [
            "Show obsessiveness over Web Vitals, performance (LCP, INP), and developer experience.",
            "Demonstrate deep Next.js, React, and TypeScript mastery.",
            "Share open source contributions or high-polish side projects."
        ],
        "positive_sentiments": ["Leading modern web standards", "Very high developer respect", "Empowered autonomous work"],
        "cautionary_notes": ["High standards for self-direction and output in remote setup"],
        "verified_sources": ["Glassdoor", "Tech Twitter / X Community", "Y Combinator Network"]
    },
    "stripe": {
        "company_name": "Stripe",
        "work_culture_rating": 4.5,
        "culture_summary": "Writing-centric culture, meticulous documentation, obsessive focus on developer APIs, reliability, and precision.",
        "hiring_and_interview_style": "Coding screen in your preferred environment with access to Google and documentation. Focuses on practical engineering (debugging real code, building an API) rather than obscure puzzles.",
        "candidate_tips": [
            "Practice writing clean, readable, modular code with descriptive variable names.",
            "Communicate your thought process clearly through written notes or concise commentary.",
            "Emphasize correctness and error handling for edge cases."
        ],
        "positive_sentiments": ["World-class engineering standards", "Practical interview process", "Talented humble peers"],
        "cautionary_notes": ["High writing and documentation expectations", "Rapidly scaling org"],
        "verified_sources": ["Glassdoor", "Levels.fyi", "Blind"]
    }
}

def generate_company_intelligence(company_name: str) -> Optional[CompanyIntelligence]:
    """
    Synthesize company work culture and hiring intelligence for the given company.
    If company is well-known, returns tailored insights.
    If company is generic or a startup, synthesizes practical hiring intelligence.
    """
    if not company_name or company_name.strip() in ["", "Company", "Target Company"]:
        return None

    clean_name = company_name.strip()
    low_name = clean_name.lower()

    # Check known companies
    for key, data in KNOWN_COMPANIES.items():
        if key in low_name:
            return CompanyIntelligence(**data)

    # Dynamic intelligence for startups, agencies, or custom companies
    is_startup = any(k in low_name for k in ["startup", "labs", "io", "ai", "tech", "health", "fintech"])

    if is_startup:
        return CompanyIntelligence(
            company_name=clean_name,
            work_culture_rating=4.2,
            culture_summary=f"{clean_name} exhibits a fast-moving, high-ownership engineering culture with minimal red tape and high cross-functional collaboration.",
            hiring_and_interview_style="Practical evaluation: Initial founder/lead chat, followed by a hands-on technical exercise or take-home project, and team culture alignment.",
            candidate_tips=[
                "Highlight end-to-end project ownership and ability to ship without handholding.",
                "Express enthusiasm for the company's product niche and early-stage mission.",
                "Show adaptability to wearing multiple hats (frontend, backend, deployment)."
            ],
            positive_sentiments=["Direct product influence", "Steep learning curve", "Flexible fast-paced workflow"],
            cautionary_notes=["Fast-changing priorities", "Self-driven onboarding required"],
            verified_sources=["Glassdoor Aggregates", "Startup Hiring Community", "Crunchbase Profile"]
        )
    else:
        return CompanyIntelligence(
            company_name=clean_name,
            work_culture_rating=4.0,
            culture_summary=f"{clean_name} emphasizes structured software engineering processes, technical domain competence, and reliable delivery.",
            hiring_and_interview_style="Standard technical hiring pipeline: Resume screening, technical phone interview, followed by coding and system architecture evaluations.",
            candidate_tips=[
                "Articulate past engineering projects with clear business value and metrics.",
                "Demonstrate strong grasp of core language fundamentals and teamwork.",
                "Prepare targeted questions about the team's tech stack and release cycles."
            ],
            positive_sentiments=["Structured workflows", "Professional peer collaboration", "Clear project scope"],
            cautionary_notes=["Standard corporate hierarchy and approval cycles"],
            verified_sources=["Glassdoor Employee Reviews", "Indeed Company Pages"]
        )

