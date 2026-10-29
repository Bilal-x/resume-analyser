"""
Verified Technology Taxonomy & Relationship Map
Defines technical relationships, ecosystem mappings, domain archetypes,
synonyms, typo resilience, and HR-aligned engineering domain detection.
"""

import re
from typing import Dict, List, Optional, Any, Set

# Synonym and typo normalization map
SYNONYM_MAP: Dict[str, str] = {
    "js": "JavaScript",
    "javascript": "JavaScript",
    "java script": "JavaScript",
    "js/javascript": "JavaScript",
    "javascript/js": "JavaScript",
    "vanilla js": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "type script": "TypeScript",
    "py": "Python",
    "python": "Python",
    "py3": "Python",
    "python3": "Python",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "docker": "Docker",
    "aws": "Amazon Web Services",
    "amazon web services": "Amazon Web Services",
    "gcp": "Google Cloud Platform",
    "google cloud": "Google Cloud Platform",
    "google cloud platform": "Google Cloud Platform",
    "azure": "Microsoft Azure",
    "ms azure": "Microsoft Azure",
    "microsoft azure": "Microsoft Azure",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "postgre": "PostgreSQL",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "react": "React",
    "react.js": "React",
    "reactjs": "React",
    "react js": "React",
    "node": "Node.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "node js": "Node.js",
    "vue": "Vue.js",
    "vue.js": "Vue.js",
    "vuejs": "Vue.js",
    "vue js": "Vue.js",
    "angular": "Angular",
    "angular.js": "Angular",
    "angularjs": "Angular",
    "next": "Next.js",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "springboot": "Spring Boot",
    "dotnet": ".NET",
    ".net": ".NET",
    "asp.net": "ASP.NET",
    "c#": "C#",
    "csharp": "C#",
    "c sharp": "C#",
    "c++": "C++",
    "cpp": "C++",
    "c plus plus": "C++",
    "golang": "Go",
    "go lang": "Go",
    "go": "Go",
    "sklearn": "scikit-learn",
    "scikit-learn": "scikit-learn",
    "scikit learn": "scikit-learn",
    "tf": "TensorFlow",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "torch": "PyTorch",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "rest": "REST APIs",
    "restful": "REST APIs",
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    "graphql": "GraphQL",
    "sql": "SQL",
    "nosql": "NoSQL",
    "redis": "Redis",
    "elasticsearch": "Elasticsearch",
    "elastic search": "Elasticsearch",
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "dl": "Deep Learning",
    "nlp": "Natural Language Processing",
    "natural language processing": "Natural Language Processing",
    "cv": "Computer Vision",
    "computer vision": "Computer Vision",
    "llm": "Large Language Models",
    "large language models": "Large Language Models",
    "llms": "Large Language Models",
    "genai": "Generative AI",
    "generative ai": "Generative AI",
    "ai": "Artificial Intelligence",
    "artificial intelligence": "Artificial Intelligence",
    "ai engineering": "AI Engineering",
    "ai engineer": "AI Engineering",
    "frontend": "Frontend Engineering",
    "front-end": "Frontend Engineering",
    "frontend engineering": "Frontend Engineering",
    "frontend development": "Frontend Engineering",
    "web development": "Frontend Engineering",
    "web engineering": "Frontend Engineering",
    "backend": "Backend Engineering",
    "back-end": "Backend Engineering",
    "backend engineering": "Backend Engineering",
    "backend development": "Backend Engineering",
    "figma": "Figma / UI Design",
    "ui": "UI/UX Design",
    "ui/ux": "UI/UX Design",
    "ui design": "UI/UX Design",
    "web design": "Web Design",
    "web designing": "Web Design",
    "html": "HTML",
    "html5": "HTML",
    "css": "CSS",
    "css3": "CSS",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
}

# Domain Archetypes (Clusters that map individual skills to engineering disciplines)
FRONTEND_CLUSTER = {
    "html", "css", "js", "javascript", "typescript", "ts", "react", "react.js",
    "reactjs", "vue", "vue.js", "vuejs", "angular", "next.js", "nextjs",
    "tailwind", "tailwindcss", "bootstrap", "ui", "ui/ux", "figma",
    "web design", "web designing", "web development", "redux", "zustand",
    "component architecture", "single page applications", "dom"
}

BACKEND_CLUSTER = {
    "python", "node", "node.js", "nodejs", "express", "django", "fastapi",
    "flask", "java", "spring boot", "spring", "go", "golang", "c#", ".net",
    "sql", "postgresql", "postgres", "mysql", "mongodb", "redis", "rest",
    "rest apis", "restful", "graphql", "microservices", "orm / sql"
}

AI_CLUSTER = {
    "python", "machine learning", "ml", "deep learning", "dl", "pytorch",
    "tensorflow", "scikit-learn", "sklearn", "nlp", "computer vision",
    "large language models", "llm", "llms", "generative ai", "genai",
    "langchain", "transformers", "hugging face", "neural networks",
    "model training", "artificial intelligence", "ai engineering"
}

# Framework / Tool to Parent Ecosystem Mapping
ECOSYSTEM_MAP: Dict[str, Dict[str, Any]] = {
    "FastAPI": {
        "implied_skills": ["Python", "REST APIs", "Asynchronous Programming", "Backend Development", "Backend Engineering"],
        "confidence": "High",
        "explanation": "FastAPI is an asynchronous Python web framework for developing production REST APIs.",
        "unverified": "Production deployment scale"
    },
    "Django": {
        "implied_skills": ["Python", "Backend Development", "Backend Engineering", "ORM / SQL", "Web Development"],
        "confidence": "High",
        "explanation": "Django is a high-level Python web framework with full-stack ORM architecture.",
        "unverified": "Microservices experience"
    },
    "Flask": {
        "implied_skills": ["Python", "Backend Development", "Backend Engineering", "REST APIs", "Web Development"],
        "confidence": "High",
        "explanation": "Flask is a lightweight Python WSGI web framework.",
        "unverified": "Monolithic scaling"
    },
    "React": {
        "implied_skills": ["JavaScript", "HTML", "CSS", "Frontend Development", "Frontend Engineering", "Component Architecture", "Single Page Applications"],
        "confidence": "High",
        "explanation": "React is a JavaScript library for building component-driven user interfaces; working with React establishes foundational JavaScript, HTML, and CSS competency.",
        "unverified": "Enterprise state management"
    },
    "Next.js": {
        "implied_skills": ["React", "JavaScript", "HTML", "CSS", "Frontend Engineering", "Server-Side Rendering (SSR)", "Full-Stack Development"],
        "confidence": "High",
        "explanation": "Next.js is a production React framework supporting SSR, routing, and modern frontend architecture.",
        "unverified": "Distributed backend architectures"
    },
    "Vue.js": {
        "implied_skills": ["JavaScript", "HTML", "CSS", "Frontend Engineering", "Frontend Development", "Single Page Applications"],
        "confidence": "High",
        "explanation": "Vue.js is a progressive JavaScript framework for user interfaces.",
        "unverified": "Large monorepos"
    },
    "Node.js": {
        "implied_skills": ["JavaScript", "Backend Development", "Backend Engineering", "Event-Driven Architecture", "REST APIs"],
        "confidence": "High",
        "explanation": "Node.js is an asynchronous event-driven JavaScript backend runtime.",
        "unverified": "Native performance tuning"
    },
    "Express": {
        "implied_skills": ["Node.js", "JavaScript", "REST APIs", "Backend Development", "Backend Engineering"],
        "confidence": "High",
        "explanation": "Express is the standard minimalist backend framework for Node.js.",
        "unverified": "Distributed streaming"
    },
    "Spring Boot": {
        "implied_skills": ["Java", "Backend Development", "Backend Engineering", "Microservices", "Enterprise Systems"],
        "confidence": "High",
        "explanation": "Spring Boot is the industry-standard Java framework for microservices.",
        "unverified": "Serverless workflows"
    },
    "scikit-learn": {
        "implied_skills": ["Python", "Machine Learning", "AI Engineering", "Data Preprocessing", "Applied Statistics"],
        "confidence": "High",
        "explanation": "scikit-learn is the standard Python toolkit for traditional machine learning algorithms.",
        "unverified": "Distributed training"
    },
    "PyTorch": {
        "implied_skills": ["Python", "Deep Learning", "Neural Networks", "Machine Learning", "AI Engineering"],
        "confidence": "High",
        "explanation": "PyTorch is a leading deep learning library for neural network training and AI engineering.",
        "unverified": "Multi-GPU distributed training"
    },
    "TensorFlow": {
        "implied_skills": ["Python", "Deep Learning", "Neural Networks", "Machine Learning", "AI Engineering"],
        "confidence": "High",
        "explanation": "TensorFlow is an open source deep learning platform for AI modeling.",
        "unverified": "Edge model quantization"
    },
    "Docker": {
        "implied_skills": ["Containerization", "DevOps", "Application Packaging"],
        "confidence": "High",
        "explanation": "Docker containerizes applications for consistent multi-environment runtime.",
        "unverified": "Multi-cluster orchestration"
    },
    "Kubernetes": {
        "implied_skills": ["Container Orchestration", "Docker", "DevOps", "Infrastructure Automation"],
        "confidence": "High",
        "explanation": "Kubernetes orchestrates containerized workloads at cluster scale.",
        "unverified": "Service mesh tuning"
    },
    "PostgreSQL": {
        "implied_skills": ["SQL", "Relational Databases", "Database Design", "Data Persistence"],
        "confidence": "High",
        "explanation": "PostgreSQL is a robust object-relational database management system.",
        "unverified": "Multi-master clustering"
    },
    "MongoDB": {
        "implied_skills": ["NoSQL", "Document Databases", "Data Modeling"],
        "confidence": "High",
        "explanation": "MongoDB is a document-oriented NoSQL database.",
        "unverified": "Relational SQL querying"
    },
    "Web Application": {
        "implied_skills": ["HTML", "CSS", "JavaScript", "Frontend Engineering", "Web Development"],
        "confidence": "High",
        "explanation": "Building a web application requires core web standards: HTML for structure, CSS for layout/styling, and JavaScript for user interactions.",
        "unverified": "Complex state management"
    }
}

KNOWN_LANGUAGES: set = {"python", "javascript", "typescript", "java", "c++", "c#", "c", "go", "ruby", "rust", "php", "swift", "kotlin", "scala", "r", "sql", "html", "css", "bash", "shell"}
KNOWN_FRAMEWORKS: set = {"react", "react.js", "next.js", "vue", "vue.js", "angular", "node.js", "express", "fastapi", "django", "flask", "spring", "spring boot", "asp.net", ".net", "pytorch", "tensorflow", "scikit-learn", "keras", "pandas", "numpy"}
KNOWN_DATABASES: set = {"postgresql", "postgres", "mysql", "mongodb", "sqlite", "redis", "elasticsearch", "dynamodb", "cassandra", "mariadb", "oracle", "neo4j", "supabase"}
KNOWN_CLOUD: set = {"aws", "amazon web services", "azure", "microsoft azure", "gcp", "google cloud platform", "firebase", "heroku", "digitalocean"}
KNOWN_DEVOPS: set = {"docker", "kubernetes", "k8s", "git", "github", "gitlab", "ci/cd", "jenkins", "terraform", "ansible", "linux", "nginx"}

def clean_skill_token(raw: str) -> str:
    """Strip punctuation and extra whitespace from token."""
    return re.sub(r'^[^\w+#.]+|[^\w+#.]+$', '', raw.strip())

def normalize_skill_name(raw_name: str) -> str:
    """
    Robust skill normalization handling synonyms, slashes, and common typos.
    E.g.: 'js/javascript' -> 'JavaScript', 'react.js' -> 'React', 'py' -> 'Python'
    """
    if not raw_name:
        return ""
    clean = clean_skill_token(raw_name)
    low = clean.lower()

    if low in SYNONYM_MAP:
        return SYNONYM_MAP[low]

    # Handle composite slashes like 'HTML/CSS' or 'JS/TS' or 'JavaScript/Python'
    if "/" in low:
        parts = [p.strip() for p in low.split("/") if p.strip()]
        for p in parts:
            if p in SYNONYM_MAP:
                return SYNONYM_MAP[p]

    # Handle comma or space variations
    for syn_key, standard_name in SYNONYM_MAP.items():
        if syn_key == low:
            return standard_name

    return clean.title() if len(clean) > 2 else clean.upper()

def get_inferred_skills(technology: str) -> Optional[Dict[str, Any]]:
    """Return implied skills, confidence, and explanation for a given technology."""
    standard_name = normalize_skill_name(technology)
    if standard_name in ECOSYSTEM_MAP:
        return ECOSYSTEM_MAP[standard_name]
    return None

def detect_domain_archetypes(
    skills: List[str],
    projects: List[Dict[str, Any]],
    work_exp: List[Dict[str, Any]]
) -> Dict[str, bool]:
    """
    Detect whether candidate has established competencies in major engineering disciplines:
    - Frontend Engineering
    - Backend Engineering
    - AI / ML Engineering
    """
    all_terms = set()
    for s in skills:
        all_terms.add(s.lower())
        all_terms.add(normalize_skill_name(s).lower())

    for p in projects:
        all_terms.add(p.get("name", "").lower())
        for t in p.get("technologies", []):
            all_terms.add(t.lower())
            all_terms.add(normalize_skill_name(t).lower())
        for b in p.get("bullets", []):
            all_terms.update(re.findall(r'\b[a-zA-Z0-9+#.]+\b', b.lower()))

    # Check Frontend
    frontend_hits = sum(1 for term in FRONTEND_CLUSTER if term in all_terms)
    has_web_proj = any(
        any(k in (p.get("name", "") + " " + " ".join(p.get("bullets", []))).lower()
            for k in ["web app", "website", "dashboard", "frontend", "ui", "web portal", "e-commerce"])
        for p in projects
    )
    is_frontend = (frontend_hits >= 2) or has_web_proj or any(s in all_terms for s in ["react", "next.js", "vue.js", "angular"])

    # Check Backend
    backend_hits = sum(1 for term in BACKEND_CLUSTER if term in all_terms)
    has_api_proj = any(
        any(k in (p.get("name", "") + " " + " ".join(p.get("bullets", []))).lower()
            for k in ["api", "server", "backend", "database", "microservice", "crud", "rest"])
        for p in projects
    )
    is_backend = (backend_hits >= 2) or has_api_proj or any(s in all_terms for s in ["fastapi", "django", "express", "spring boot"])

    # Check AI / ML
    ai_hits = sum(1 for term in AI_CLUSTER if term in all_terms)
    has_ai_proj = any(
        any(k in (p.get("name", "") + " " + " ".join(p.get("bullets", []))).lower()
            for k in ["machine learning", "neural network", "classification", "nlp", "llm", "ai model", "trained model", "langchain", "sentiment analysis", "predictive", "recommendation system", "computer vision", "object detection", "deep learning"])
        for p in projects
    )
    is_ai = (ai_hits >= 2) or has_ai_proj or any(s in all_terms for s in ["pytorch", "tensorflow", "scikit-learn", "langchain"])

    return {
        "Frontend Engineering": is_frontend,
        "Backend Engineering": is_backend,
        "AI Engineering": is_ai
    }
