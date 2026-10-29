import re
import os
import fitz  # PyMuPDF
from docx import Document
from io import BytesIO
from typing import Dict, List, Any, Tuple, Optional
from ..models.schemas import ExtractedResumeData
from .skill_taxonomy import normalize_skill_name, KNOWN_LANGUAGES, KNOWN_FRAMEWORKS, KNOWN_DATABASES, KNOWN_CLOUD, KNOWN_DEVOPS

EMAIL_REGEX = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')
PHONE_REGEX = re.compile(r'(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}')
LINKEDIN_REGEX = re.compile(r'linkedin\.com/in/([a-zA-Z0-9_-]+)', re.IGNORECASE)
GITHUB_REGEX = re.compile(r'github\.com/([a-zA-Z0-9_-]+)', re.IGNORECASE)

# Standard section header triggers
SECTION_PATTERNS = {
    "summary": re.compile(r'^\s*(professional\s+summary|summary|profile|about\s+me|objective)[\s:\-]*$', re.IGNORECASE),
    "skills": re.compile(r'^\s*(technical\s+skills|skills|technologies|core\s+competencies|tools\s+&\s+technologies|skills\s+&\s+abilities)[\s:\-]*$', re.IGNORECASE),
    "experience": re.compile(r'^\s*(work\s+experience|experience|employment\s+history|professional\s+experience|internships|work\s+history)[\s:\-]*$', re.IGNORECASE),
    "projects": re.compile(r'^\s*(projects|technical\s+projects|academic\s+projects|personal\s+projects|key\s+projects)[\s:\-]*$', re.IGNORECASE),
    "education": re.compile(r'^\s*(education|academic\s+background|academic\s+qualifications|degrees)[\s:\-]*$', re.IGNORECASE),
    "certifications": re.compile(r'^\s*(certifications|certificates|licenses|courses)[\s:\-]*$', re.IGNORECASE),
    "achievements": re.compile(r'^\s*(achievements|awards|honors|publications)[\s:\-]*$', re.IGNORECASE),
}

KNOWN_LANGUAGES = {"python", "javascript", "typescript", "java", "c++", "c#", "c", "go", "ruby", "rust", "php", "swift", "kotlin", "scala", "r", "sql", "html", "css", "bash", "shell"}
KNOWN_FRAMEWORKS = {"react", "react.js", "next.js", "vue", "vue.js", "angular", "node.js", "express", "fastapi", "django", "flask", "spring", "spring boot", "asp.net", ".net", "pytorch", "tensorflow", "scikit-learn", "keras", "pandas", "numpy"}
KNOWN_DATABASES = {"postgresql", "postgres", "mysql", "mongodb", "sqlite", "redis", "elasticsearch", "dynamodb", "cassandra", "mariadb", "oracle", "neo4j", "supabase"}
KNOWN_CLOUD = {"aws", "amazon web services", "azure", "microsoft azure", "gcp", "google cloud platform", "firebase", "heroku", "digitalocean"}
KNOWN_DEVOPS = {"docker", "kubernetes", "k8s", "git", "github", "gitlab", "ci/cd", "jenkins", "terraform", "ansible", "linux", "nginx"}

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract plain text from PDF using PyMuPDF."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages_text = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        pages_text.append(page.get_text("text"))
    doc.close()
    return "\n".join(pages_text)

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX."""
    doc = Document(BytesIO(file_bytes))
    return "\n".join([p.text for p in doc.paragraphs if p.text])

def extract_raw_text(file_bytes: bytes, filename: str) -> str:
    """Detect file type and extract raw text."""
    lower_fn = filename.lower()
    if lower_fn.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif lower_fn.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    else:
        # Default to utf-8 text
        return file_bytes.decode("utf-8", errors="replace")

def segment_sections(text: str) -> Dict[str, str]:
    """Segment resume text into recognized functional sections."""
    lines = [line.strip() for line in text.split("\n")]
    sections: Dict[str, List[str]] = {"header": []}
    current_section = "header"
    
    for line in lines:
        if not line:
            continue
        
        # Check if line matches a section header
        matched_section = None
        for sec_name, pattern in SECTION_PATTERNS.items():
            if pattern.match(line):
                matched_section = sec_name
                break
        
        if matched_section:
            current_section = matched_section
            if current_section not in sections:
                sections[current_section] = []
        else:
            sections[current_section].append(line)
            
    return {sec: "\n".join(lines_list) for sec, lines_list in sections.items() if lines_list}

def parse_projects(project_text: str) -> List[Dict[str, Any]]:
    """Parse distinct projects from project section text."""
    if not project_text:
        return []
    
    lines = [l.strip() for l in project_text.split("\n") if l.strip()]
    projects = []
    current_proj = None
    
    for line in lines:
        # Detect if line looks like a project title (short, contains | or :, or title casing, or bullet start)
        is_title = False
        if len(line) < 80 and any(sep in line for sep in [" | ", " - ", ":", " — "]) and not line.startswith(("-", "•", "*")):
            is_title = True
        elif len(line) < 50 and not line.startswith(("-", "•", "*", "1.", "2.", "3.")) and not line.endswith("."):
            is_title = True
            
        if is_title or current_proj is None:
            if current_proj:
                projects.append(current_proj)
            current_proj = {
                "name": line.split("|")[0].split(":")[0].strip(),
                "raw_header": line,
                "bullets": [],
                "technologies": []
            }
        else:
            if current_proj:
                cleaned_bullet = re.sub(r'^[-•*\d.]+\s*', '', line).strip()
                current_proj["bullets"].append(cleaned_bullet)
                
    if current_proj:
        projects.append(current_proj)
        
    # Extract technologies mentioned in each project
    for proj in projects:
        all_text = (proj.get("raw_header", "") + " " + " ".join(proj.get("bullets", []))).lower()
        found_techs = []
        for tech in (KNOWN_LANGUAGES | KNOWN_FRAMEWORKS | KNOWN_DATABASES | KNOWN_CLOUD | KNOWN_DEVOPS):
            # word boundary search
            if re.search(r'\b' + re.escape(tech) + r'\b', all_text):
                found_techs.append(normalize_skill_name(tech))
        proj["technologies"] = sorted(list(set(found_techs)))
        
    return projects

def parse_experience(exp_text: str) -> List[Dict[str, Any]]:
    """Parse experience entries from experience section text."""
    if not exp_text:
        return []
    lines = [l.strip() for l in exp_text.split("\n") if l.strip()]
    experiences = []
    current_exp = None
    
    for line in lines:
        is_header = False
        if len(line) < 90 and any(sep in line for sep in [" | ", " at ", " @ ", " - "]) and not line.startswith(("-", "•", "*")):
            is_header = True
            
        if is_header or current_exp is None:
            if current_exp:
                experiences.append(current_exp)
            current_exp = {
                "title_company": line,
                "bullets": []
            }
        else:
            if current_exp:
                cleaned_bullet = re.sub(r'^[-•*\d.]+\s*', '', line).strip()
                current_exp["bullets"].append(cleaned_bullet)
                
    if current_exp:
        experiences.append(current_exp)
    return experiences

def parse_resume(file_bytes: bytes, filename: str) -> ExtractedResumeData:
    """Master resume parsing pipeline that produces structured ExtractedResumeData."""
    raw_text = extract_raw_text(file_bytes, filename)
    sections = segment_sections(raw_text)
    
    # 1. Contact Information
    email_match = EMAIL_REGEX.search(raw_text)
    phone_match = PHONE_REGEX.search(raw_text)
    linkedin_match = LINKEDIN_REGEX.search(raw_text)
    github_match = GITHUB_REGEX.search(raw_text)
    
    # Extract candidate name from top lines of header or raw text
    header_lines = [l.strip() for l in sections.get("header", raw_text[:300]).split("\n") if l.strip()]
    candidate_name = "Candidate"
    for line in header_lines[:3]:
        # Exclude lines that have email, url, phone, or symbols
        if not EMAIL_REGEX.search(line) and not "http" in line and not PHONE_REGEX.search(line) and len(line) < 40:
            if re.match(r'^[A-Za-z\s.\'-]+$', line) and len(line.split()) in [2, 3, 4]:
                candidate_name = line.strip()
                break
                
    # 2. Extract explicit skills
    skills_text = sections.get("skills", "")
    explicit_skills = set()
    if skills_text:
        # Split by commas, bullets, pipes, or newlines
        tokens = re.split(r'[,|•\n\t]+', skills_text)
        for tok in tokens:
            cleaned = re.sub(r'^[-*:\s]+', '', tok).strip()
            # strip category labels like "Languages:", "Tools:"
            if ":" in cleaned:
                parts = cleaned.split(":")
                cleaned = parts[-1].strip()
            if cleaned and len(cleaned) < 35 and not cleaned.lower().startswith("proficient in"):
                explicit_skills.add(normalize_skill_name(cleaned))
                
    # Categorize skills
    prog_langs = []
    frameworks = []
    databases = []
    cloud = []
    devops = []
    
    for s in explicit_skills:
        s_low = s.lower()
        if s_low in KNOWN_LANGUAGES:
            prog_langs.append(s)
        elif s_low in KNOWN_FRAMEWORKS:
            frameworks.append(s)
        elif s_low in KNOWN_DATABASES:
            databases.append(s)
        elif s_low in KNOWN_CLOUD:
            cloud.append(s)
        elif s_low in KNOWN_DEVOPS:
            devops.append(s)
            
    # 3. Parse Projects & Experience
    projects = parse_projects(sections.get("projects", ""))
    experience = parse_experience(sections.get("experience", ""))
    
    # 4. Education & Certs
    education_lines = [l.strip() for l in sections.get("education", "").split("\n") if l.strip()]
    cert_lines = [re.sub(r'^[-•*\s]+', '', l).strip() for l in sections.get("certifications", "").split("\n") if l.strip()]
    achieve_lines = [re.sub(r'^[-•*\s]+', '', l).strip() for l in sections.get("achievements", "").split("\n") if l.strip()]
    
    return ExtractedResumeData(
        full_name=candidate_name,
        email=email_match.group(0) if email_match else None,
        phone=phone_match.group(0) if phone_match else None,
        linkedin=f"linkedin.com/in/{linkedin_match.group(1)}" if linkedin_match else None,
        github=f"github.com/{github_match.group(1)}" if github_match else None,
        professional_summary=sections.get("summary", ""),
        technical_skills=sorted(list(explicit_skills)),
        programming_languages=sorted(list(set(prog_langs))),
        frameworks_libraries=sorted(list(set(frameworks))),
        databases=sorted(list(set(databases))),
        cloud_platforms=sorted(list(set(cloud))),
        devops_tools=sorted(list(set(devops))),
        work_experience=experience,
        projects=projects,
        education=[{"details": l} for l in education_lines],
        certifications=cert_lines,
        achievements=achieve_lines,
        raw_sections=sections
    )
