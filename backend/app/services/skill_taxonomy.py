"""
Verified Technology Taxonomy & Relationship Map
Defines verified technical relationships, ecosystem mappings, synonyms,
and strict rules distinguishing valid vs invalid inferences.
"""

from typing import Dict, List, Optional, Tuple, Set

# Synonym normalization map
SYNONYM_MAP: Dict[str, str] = {
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
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
    "azure": "Microsoft Azure",
    "ms azure": "Microsoft Azure",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "react": "React",
    "react.js": "React",
    "reactjs": "React",
    "node": "Node.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "vue": "Vue.js",
    "vue.js": "Vue.js",
    "vuejs": "Vue.js",
    "angular": "Angular",
    "angular.js": "Angular",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "dotnet": ".NET",
    ".net": ".NET",
    "asp.net": "ASP.NET",
    "c#": "C#",
    "csharp": "C#",
    "c++": "C++",
    "cpp": "C++",
    "golang": "Go",
    "go lang": "Go",
    "sklearn": "scikit-learn",
    "scikit-learn": "scikit-learn",
    "tf": "TensorFlow",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "git": "Git",
    "github": "GitHub",
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
}

# Framework / Tool to Parent Ecosystem / Language Mapping
# If resume contains the Key, it provides evidence of experience in the Value
ECOSYSTEM_MAP: Dict[str, Dict[str, Any]] = {
    "FastAPI": {
        "implied_skills": ["Python", "REST APIs", "Asynchronous Programming", "Backend Development"],
        "confidence": "High",
        "explanation": "FastAPI is a modern Python asynchronous web framework for building REST APIs.",
        "unverified": "Production deployment scale, architecture beyond API endpoints"
    },
    "Django": {
        "implied_skills": ["Python", "Backend Development", "ORM / SQL", "Web Development"],
        "confidence": "High",
        "explanation": "Django is a high-level Python web framework with built-in ORM.",
        "unverified": "Microservices experience, async architectures"
    },
    "Flask": {
        "implied_skills": ["Python", "Backend Development", "REST APIs", "Web Development"],
        "confidence": "High",
        "explanation": "Flask is a lightweight Python WSGI web application framework.",
        "unverified": "Large monolithic or enterprise architecture"
    },
    "React": {
        "implied_skills": ["JavaScript", "Frontend Development", "Component Architecture", "Single Page Applications"],
        "confidence": "High",
        "explanation": "React is a JavaScript component-based frontend library.",
        "unverified": "State management at enterprise scale, TypeScript proficiency unless stated"
    },
    "Next.js": {
        "implied_skills": ["React", "JavaScript", "Frontend Development", "Server-Side Rendering (SSR)", "Full-Stack Development"],
        "confidence": "High",
        "explanation": "Next.js is a React framework supporting SSR and full-stack capabilities.",
        "unverified": "Complex backend microservices"
    },
    "Vue.js": {
        "implied_skills": ["JavaScript", "Frontend Development", "Single Page Applications"],
        "confidence": "High",
        "explanation": "Vue.js is a progressive JavaScript frontend framework.",
        "unverified": "Large enterprise monorepo management"
    },
    "Node.js": {
        "implied_skills": ["JavaScript", "Backend Development", "Event-Driven Architecture", "REST APIs"],
        "confidence": "High",
        "explanation": "Node.js is an asynchronous event-driven JavaScript runtime for backend services.",
        "unverified": "Multi-threaded native performance, complex SQL tuning"
    },
    "Express": {
        "implied_skills": ["Node.js", "JavaScript", "REST APIs", "Backend Development"],
        "confidence": "High",
        "explanation": "Express is the standard minimalist backend web framework for Node.js.",
        "unverified": "Distributed streaming or microservices"
    },
    "Spring Boot": {
        "implied_skills": ["Java", "Backend Development", "Microservices", "Enterprise Systems"],
        "confidence": "High",
        "explanation": "Spring Boot is the leading Java framework for production microservices.",
        "unverified": "Cloud-native serverless workflows"
    },
    "scikit-learn": {
        "implied_skills": ["Python", "Machine Learning", "Data Preprocessing", "Applied Statistics"],
        "confidence": "High",
        "explanation": "scikit-learn is the standard Python library for traditional ML algorithms (classification, regression, clustering).",
        "unverified": "Deep learning architectures (PyTorch/TensorFlow) or distributed training"
    },
    "pandas": {
        "implied_skills": ["Python", "Data Analysis", "Data Manipulation", "Data Preprocessing"],
        "confidence": "High",
        "explanation": "pandas is a Python library for data manipulation and tabular analysis.",
        "unverified": "Distributed big data systems (Spark/Hadoop)"
    },
    "PyTorch": {
        "implied_skills": ["Python", "Deep Learning", "Neural Networks", "Machine Learning"],
        "confidence": "High",
        "explanation": "PyTorch is an open source deep learning framework.",
        "unverified": "Distributed multi-GPU training at massive scale unless specified"
    },
    "TensorFlow": {
        "implied_skills": ["Python", "Deep Learning", "Neural Networks", "Machine Learning"],
        "confidence": "High",
        "explanation": "TensorFlow is a deep learning and neural network library.",
        "unverified": "Model quantization and on-device deployment"
    },
    "Docker": {
        "implied_skills": ["Containerization", "DevOps", "Application Packaging"],
        "confidence": "High",
        "explanation": "Docker is the standard platform for containerizing applications.",
        "unverified": "Multi-cluster Kubernetes orchestration, cloud provider specifics"
    },
    "Kubernetes": {
        "implied_skills": ["Container Orchestration", "Docker", "DevOps", "Infrastructure Automation"],
        "confidence": "High",
        "explanation": "Kubernetes orchestrates containerized workloads across clusters.",
        "unverified": "Service mesh tuning (Istio) or bare-metal cluster provisioning"
    },
    "AWS Lambda": {
        "implied_skills": ["Amazon Web Services", "Serverless Computing", "Cloud Architecture", "Event-Driven Architecture"],
        "confidence": "High",
        "explanation": "AWS Lambda is Amazon's serverless compute service.",
        "unverified": "Multi-region VPC networking or enterprise IAM policies"
    },
    "PostgreSQL": {
        "implied_skills": ["SQL", "Relational Databases", "Database Design", "Data Persistence"],
        "confidence": "High",
        "explanation": "PostgreSQL is a powerful open source object-relational database system.",
        "unverified": "High-availability multi-master clustering or complex query DBA tuning"
    },
    "MongoDB": {
        "implied_skills": ["NoSQL", "Document Databases", "Data Modeling"],
        "confidence": "High",
        "explanation": "MongoDB is a leading document-oriented NoSQL database.",
        "unverified": "Relational database / SQL proficiency (MongoDB does NOT imply SQL)"
    },
    "CI/CD": {
        "implied_skills": ["DevOps", "Automation", "Software Quality Assurance", "Continuous Integration"],
        "confidence": "High",
        "explanation": "CI/CD indicates automation of build, test, and release pipelines.",
        "unverified": "Specific proprietary deployment tooling"
    }
}

# Explicit rules for INVALID or WEAK inferences
INVALID_INFERENCE_RULES: List[Dict[str, str]] = [
    {
        "source": "HTML and CSS",
        "invalid_target": "JavaScript",
        "reason": "HTML and CSS markup/styling do not establish JavaScript programming proficiency."
    },
    {
        "source": "React",
        "invalid_target": "Python",
        "reason": "Frontend React development does not establish Python backend proficiency."
    },
    {
        "source": "MongoDB",
        "invalid_target": "SQL",
        "reason": "Document NoSQL databases do not establish Relational SQL proficiency."
    },
    {
        "source": "Docker",
        "invalid_target": "Kubernetes",
        "reason": "Building Docker containers does not automatically establish multi-node Kubernetes cluster orchestration expertise."
    },
    {
        "source": "AI Project / API",
        "invalid_target": "Large Language Models Training",
        "reason": "Calling an AI API or using basic models does not establish experience pre-training or fine-tuning foundation LLMs."
    }
]

# Canonical knowledge sets — importable by all services
KNOWN_LANGUAGES: set = {"python", "javascript", "typescript", "java", "c++", "c#", "c", "go", "ruby", "rust", "php", "swift", "kotlin", "scala", "r", "sql", "html", "css", "bash", "shell"}
KNOWN_FRAMEWORKS: set = {"react", "react.js", "next.js", "vue", "vue.js", "angular", "node.js", "express", "fastapi", "django", "flask", "spring", "spring boot", "asp.net", ".net", "pytorch", "tensorflow", "scikit-learn", "keras", "pandas", "numpy"}
KNOWN_DATABASES: set = {"postgresql", "postgres", "mysql", "mongodb", "sqlite", "redis", "elasticsearch", "dynamodb", "cassandra", "mariadb", "oracle", "neo4j", "supabase"}
KNOWN_CLOUD: set = {"aws", "amazon web services", "azure", "microsoft azure", "gcp", "google cloud platform", "firebase", "heroku", "digitalocean"}
KNOWN_DEVOPS: set = {"docker", "kubernetes", "k8s", "git", "github", "gitlab", "ci/cd", "jenkins", "terraform", "ansible", "linux", "nginx"}

def normalize_skill_name(raw_name: str) -> str:
    """Normalize skill name using the synonym map or clean title casing."""
    clean = raw_name.strip()
    low = clean.lower()
    if low in SYNONYM_MAP:
        return SYNONYM_MAP[low]
    # Check if a synonym match exists within delimiters
    for syn_key, standard_name in SYNONYM_MAP.items():
        if syn_key == low:
            return standard_name
    return clean

def get_inferred_skills(technology: str) -> Optional[Dict[str, Any]]:
    """Return implied skills, confidence, and explanation for a given technology."""
    standard_name = normalize_skill_name(technology)
    if standard_name in ECOSYSTEM_MAP:
        return ECOSYSTEM_MAP[standard_name]
    return None
