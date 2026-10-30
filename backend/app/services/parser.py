import re
import os
import fitz  # PyMuPDF
from docx import Document
from io import BytesIO
from typing import Dict, List, Any, Tuple, Optional
from datetime import datetime
from ..models.schemas import ExtractedResumeData, EmploymentEntry
from .skill_taxonomy import normalize_skill_name, KNOWN_LANGUAGES, KNOWN_FRAMEWORKS, KNOWN_DATABASES, KNOWN_CLOUD, KNOWN_DEVOPS

EMAIL_REGEX = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')
PHONE_REGEX = re.compile(r'(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}')
LINKEDIN_REGEX = re.compile(r'linkedin\.com/in/([a-zA-Z0-9_-]+)', re.IGNORECASE)
GITHUB_REGEX = re.compile(r'github\.com/([a-zA-Z0-9_-]+)', re.IGNORECASE)

# Standard section header triggers - strictly separate professional experience from education, projects, certs
SECTION_PATTERNS = {
    "summary": re.compile(r'^\s*(professional\s+summary|summary|profile|about\s+me|objective)[\s:\-]*$', re.IGNORECASE),
    "skills": re.compile(r'^\s*(technical\s+skills|skills|technologies|core\s+competencies|tools\s+&\s+technologies|skills\s+&\s+abilities)[\s:\-]*$', re.IGNORECASE),
    "experience": re.compile(r'^\s*(work\s+experience|professional\s+experience|employment\s+history|career\s+history|work\s+history|relevant\s+experience|experience)[\s:\-]*$', re.IGNORECASE),
    "internships": re.compile(r'^\s*(internships|internship\s+experience)[\s:\-]*$', re.IGNORECASE),
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

MONTH_LOOKUP = {
    "jan": 1, "january": 1,
    "feb": 2, "february": 2,
    "mar": 3, "march": 3,
    "apr": 4, "april": 4,
    "may": 5,
    "jun": 6, "june": 6,
    "jul": 7, "july": 7,
    "aug": 8, "august": 8,
    "sep": 9, "sept": 9, "september": 9,
    "oct": 10, "october": 10,
    "nov": 11, "november": 11,
    "dec": 12, "december": 12,
}

DATE_NUMERIC_RANGE_REGEX = re.compile(
    r'\b(0?[1-9]|1[0-2])[/\-.](20\d\d|19\d\d)\s*(?:-|–|—|to)\s*(present|current|now|ongoing|(?:(0?[1-9]|1[0-2])[/\-.])?(20\d\d|19\d\d))\b',
    re.IGNORECASE
)

DATE_WORDS_RANGE_REGEX = re.compile(
    r'\b(?:([a-zA-Z]{3,9})[.,]?\s+)?(20\d\d|19\d\d)\s*(?:-|–|—|to)\s*(present|current|now|ongoing|(?:([a-zA-Z]{3,9})[.,]?\s+)?(20\d\d|19\d\d))\b',
    re.IGNORECASE
)

def extract_dates_from_text(text: str, current_year: int = 2026, current_month: int = 10) -> Tuple[Optional[str], Optional[str], bool, Optional[int], bool]:
    """
    Extract start_date, end_date, is_current, duration_months, is_uncertain_date.
    Never invents missing dates.
    """
    # 1. Try numeric MM/YYYY - MM/YYYY or MM/YYYY - Present
    m_num = DATE_NUMERIC_RANGE_REGEX.search(text)
    if m_num:
        s_m = int(m_num.group(1))
        s_y = int(m_num.group(2))
        start_date = f"{s_y:04d}-{s_m:02d}"
        end_raw = m_num.group(3).lower()
        if any(w in end_raw for w in ["present", "current", "now", "ongoing"]):
            is_current = True
            end_date = None
            duration = (current_year * 12 + current_month) - (s_y * 12 + s_m) + 1
            return start_date, end_date, is_current, max(duration, 1), False
        else:
            e_m = int(m_num.group(4)) if m_num.group(4) else 12
            e_y = int(m_num.group(5))
            end_date = f"{e_y:04d}-{e_m:02d}"
            duration = (e_y * 12 + e_m) - (s_y * 12 + s_m) + 1
            if duration > 0:
                return start_date, end_date, False, duration, False
            return start_date, end_date, False, None, True

    # 2. Try word month ranges (e.g. Jan 2022 - Dec 2023 or 2022 - 2024 or Jan 2022 - Present)
    m_words = DATE_WORDS_RANGE_REGEX.search(text)
    if m_words:
        s_m_raw = m_words.group(1)
        s_y = int(m_words.group(2))
        has_s_month = bool(s_m_raw and s_m_raw.lower()[:3] in MONTH_LOOKUP)
        s_m = MONTH_LOOKUP.get(s_m_raw.lower()[:3], 1) if s_m_raw else 1
        start_date = f"{s_y:04d}-{s_m:02d}" if has_s_month else f"{s_y:04d}"
        
        end_raw = m_words.group(3).lower()
        if any(w in end_raw for w in ["present", "current", "now", "ongoing"]):
            is_current = True
            end_date = None
            duration = (current_year * 12 + current_month) - (s_y * 12 + s_m) + 1
            return start_date, end_date, is_current, max(duration, 1), False
        else:
            e_m_raw = m_words.group(4)
            e_y = int(m_words.group(5))
            has_e_month = bool(e_m_raw and e_m_raw.lower()[:3] in MONTH_LOOKUP)
            e_m = MONTH_LOOKUP.get(e_m_raw.lower()[:3], 12) if e_m_raw else 12
            end_date = f"{e_y:04d}-{e_m:02d}" if has_e_month else f"{e_y:04d}"
            
            if has_s_month and has_e_month:
                duration = (e_y * 12 + e_m) - (s_y * 12 + s_m) + 1
            elif not has_s_month and not has_e_month:
                duration = (e_y - s_y) * 12
            else:
                duration = (e_y * 12 + e_m) - (s_y * 12 + s_m) + 1
                
            if duration > 0:
                return start_date, end_date, False, duration, False
            elif duration == 0:
                # Same year no months (e.g. 2022 - 2022) -> uncertain
                return start_date, end_date, False, None, True
            else:
                return start_date, end_date, False, None, True

    # Ambiguous or no valid date range detected
    return None, None, False, None, True

def parse_structured_experience(exp_text: str, source_section: str = "Work Experience") -> List[EmploymentEntry]:
    """Parse distinct employment records with deterministic dates and metadata."""
    if not exp_text:
        return []
        
    lines = [l.strip() for l in exp_text.split("\n") if l.strip()]
    raw_entries = []
    current_entry = None
    
    for line in lines:
        is_header = False
        # If line contains separators or date patterns, treat as role header
        if len(line) < 110 and any(sep in line for sep in [" | ", " at ", " @ ", " - "]) and not line.startswith(("-", "•", "*")):
            is_header = True
        elif DATE_WORDS_RANGE_REGEX.search(line) or DATE_NUMERIC_RANGE_REGEX.search(line):
            is_header = True
            
        if is_header or current_entry is None:
            if current_entry:
                raw_entries.append(current_entry)
            current_entry = {
                "header_lines": [line],
                "bullets": []
            }
        else:
            if current_entry:
                cleaned_bullet = re.sub(r'^[-•*\d.]+\s*', '', line).strip()
                current_entry["bullets"].append(cleaned_bullet)
                
    if current_entry:
        raw_entries.append(current_entry)
        
    structured_entries: List[EmploymentEntry] = []
    
    for entry in raw_entries:
        all_header = " ".join(entry["header_lines"])
        bullet_text = " ".join(entry["bullets"])
        combined_text = all_header + " " + bullet_text
        
        # 1. Dates
        start_date, end_date, is_current, duration_months, is_uncertain = extract_dates_from_text(all_header)
        if is_uncertain and bullet_text:
            # Try finding date in first bullet if not in header
            s_d, e_d, is_c, dur, unc = extract_dates_from_text(entry["bullets"][0] if entry["bullets"] else "")
            if not unc:
                start_date, end_date, is_current, duration_months, is_uncertain = s_d, e_d, is_c, dur, unc
                
        # 2. Employment Type (detect internships and contracts explicitly)
        combined_lower = combined_text.lower()
        if re.search(r'\b(intern|internship|co-op|apprentice|trainee)\b', combined_lower):
            emp_type = "Internship"
        elif re.search(r'\b(contract|contractor|freelance|consultant)\b', combined_lower):
            emp_type = "Contract"
        elif re.search(r'\b(part-time|part time)\b', combined_lower):
            emp_type = "Part-time"
        else:
            emp_type = "Full-time"
            
        # 3. Job Title and Company
        cleaned_header = DATE_WORDS_RANGE_REGEX.sub('', all_header)
        cleaned_header = DATE_NUMERIC_RANGE_REGEX.sub('', cleaned_header).strip(" ,|-–—()[]")
        
        job_title = "Software Engineer"
        company = "Company"
        
        if " at " in cleaned_header:
            parts = cleaned_header.split(" at ", 1)
            job_title = parts[0].strip()
            company = parts[1].split("|")[0].split("-")[0].strip()
        elif " @ " in cleaned_header:
            parts = cleaned_header.split(" @ ", 1)
            job_title = parts[0].strip()
            company = parts[1].split("|")[0].split("-")[0].strip()
        elif " | " in cleaned_header:
            parts = cleaned_header.split(" | ")
            job_title = parts[0].strip()
            company = parts[1].strip() if len(parts) > 1 else "Company"
        elif " - " in cleaned_header:
            parts = cleaned_header.split(" - ", 1)
            job_title = parts[0].strip()
            company = parts[1].strip()
        else:
            job_title = cleaned_header if cleaned_header else "Engineer"
            
        # Clean stray artifacts
        job_title = job_title.strip(" ,|-–—()[]")
        company = company.strip(" ,|-–—()[]")
        
        # 4. Technologies used
        found_techs = []
        for tech in (KNOWN_LANGUAGES | KNOWN_FRAMEWORKS | KNOWN_DATABASES | KNOWN_CLOUD | KNOWN_DEVOPS):
            if re.search(r'\b' + re.escape(tech) + r'\b', combined_lower):
                found_techs.append(normalize_skill_name(tech))
                
        structured_entries.append(
            EmploymentEntry(
                job_title=job_title or "Engineer",
                company=company or "Company",
                employment_type=emp_type,
                start_date=start_date,
                end_date=end_date,
                is_current=is_current,
                duration_months=duration_months,
                source_section=source_section,
                relevant_technologies=sorted(list(set(found_techs))),
                responsibilities=entry["bullets"],
                is_uncertain_date=is_uncertain
            )
        )
        
    return structured_entries

def parse_experience(exp_text: str) -> List[Dict[str, Any]]:
    """Parse experience entries from experience section text (legacy dict format)."""
    structured = parse_structured_experience(exp_text)
    return [
        {
            "title_company": f"{e.job_title} at {e.company}",
            "job_title": e.job_title,
            "company": e.company,
            "employment_type": e.employment_type,
            "start_date": e.start_date,
            "end_date": e.end_date,
            "is_current": e.is_current,
            "duration_months": e.duration_months,
            "bullets": e.responsibilities,
            "technologies": e.relevant_technologies
        }
        for e in structured
    ]

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
            
    # 3. Parse Projects & Experience (strictly isolated)
    projects = parse_projects(sections.get("projects", ""))
    exp_text = sections.get("experience", "")
    structured_exp = parse_structured_experience(exp_text, source_section="Work Experience")
    legacy_exp = [
        {
            "title_company": f"{e.job_title} at {e.company}",
            "job_title": e.job_title,
            "company": e.company,
            "employment_type": e.employment_type,
            "start_date": e.start_date,
            "end_date": e.end_date,
            "is_current": e.is_current,
            "duration_months": e.duration_months,
            "bullets": e.responsibilities,
            "technologies": e.relevant_technologies
        }
        for e in structured_exp
    ]
    
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
        work_experience=legacy_exp,
        structured_work_experience=structured_exp,
        projects=projects,
        education=[{"details": l} for l in education_lines],
        certifications=cert_lines,
        achievements=achieve_lines,
        raw_sections=sections
    )
