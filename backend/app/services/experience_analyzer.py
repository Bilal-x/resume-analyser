import re
import random
from datetime import datetime
from typing import List, Optional, Tuple, Dict, Any
from ..models.schemas import (
    ExtractedResumeData, JDRequirement, EmploymentEntry,
    ExperienceEvaluation
)
from .skill_taxonomy import (
    KNOWN_LANGUAGES, KNOWN_FRAMEWORKS, KNOWN_DATABASES,
    KNOWN_CLOUD, KNOWN_DEVOPS, normalize_skill_name
)

EXP_REGEX = re.compile(
    r'(?:(?:minimum|at least|over)\s+)?(\d+(?:\.\d+)?)\+?\s*(?:to|-|–)?\s*(\d+(?:\.\d+)?)?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+hands-on|\s+relevant|\s+professional|\s+software|\s+engineering|\s+work|\s+industry)?(?:\s+experience)?',
    re.IGNORECASE
)

TECH_EXP_REGEX_A = re.compile(
    r'(?:(?:minimum|at least|over)\s+)?(\d+(?:\.\d+)?)\+?\s*(?:to|-|–)?\s*(\d+(?:\.\d+)?)?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+hands-on|\s+relevant|\s+professional)?\s+(?:experience\s+(?:in|with)\s+|development\s+experience\s+in\s+)([a-zA-Z0-9#+.-]+)',
    re.IGNORECASE
)

TECH_EXP_REGEX_B = re.compile(
    r'(?:(?:minimum|at least|over)\s+)?(\d+(?:\.\d+)?)\+?\s*(?:to|-|–)?\s*(\d+(?:\.\d+)?)?\s*(?:years?|yrs?)(?:\s+of)?\s+([a-zA-Z0-9#+.-]+)\s+(?:development\s+|software\s+)?experience',
    re.IGNORECASE
)

FRESHER_JD_TRIGGERS = [
    "fresher", "freshers", "entry level", "entry-level", "junior", "graduate",
    "intern", "internship", "0-1 year", "0-2 years", "no experience required",
    "freshers are welcome", "freshers welcome", "0 years"
]

FRESHER_RESUME_TRIGGERS = [
    "fresher", "recent graduate", "new graduate", "entry level", "student",
    "seeking an entry", "seeking entry-level", "aspiring software engineer"
]

MONTH_NAME_TO_INT = {
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

def parse_date_to_month_index(date_str: Optional[str], default_month: int = 1) -> Optional[int]:
    """Convert YYYY-MM or YYYY string into absolute month index (year * 12 + month)."""
    if not date_str:
        return None
    cleaned = str(date_str).strip()
    # Check YYYY-MM
    m_ym = re.match(r'^(\d{4})-(\d{1,2})$', cleaned)
    if m_ym:
        y, m = int(m_ym.group(1)), int(m_ym.group(2))
        if 1970 <= y <= 2100 and 1 <= m <= 12:
            return y * 12 + m
    # Check YYYY
    m_y = re.match(r'^(\d{4})$', cleaned)
    if m_y:
        y = int(m_y.group(1))
        if 1970 <= y <= 2100:
            return y * 12 + default_month
    return None

def merge_month_intervals(intervals: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
    """
    Merge overlapping or contiguous month intervals to prevent double-counting.
    Example: Job A (Jan 2022 - Dec 2023) and Job B (Jul 2023 - Jun 2025)
    Overlapping 6 months are merged and counted exactly once.
    """
    if not intervals:
        return []
    # Filter valid intervals where end >= start
    valid = [(s, e) for s, e in intervals if s is not None and e is not None and e >= s]
    if not valid:
        return []
    sorted_intervals = sorted(valid, key=lambda x: (x[0], x[1]))
    merged = [sorted_intervals[0]]
    for start, end in sorted_intervals[1:]:
        prev_start, prev_end = merged[-1]
        if start <= prev_end + 1:
            # Overlapping or contiguous interval
            merged[-1] = (prev_start, max(prev_end, end))
        else:
            merged.append((start, end))
    return merged

def calculate_merged_duration_months(intervals: List[Tuple[int, int]]) -> int:
    """Calculate total distinct months across merged intervals."""
    merged = merge_month_intervals(intervals)
    return sum(end - start + 1 for start, end in merged)

def extract_jd_experience_details(
    jd_text: str,
    requirements: List[JDRequirement],
    job_title: str
) -> Tuple[Optional[float], Optional[float], str, Optional[str], bool]:
    """
    Extract JD experience requirements:
    Returns (min_years, max_years, exp_type, required_technology, internships_accepted)
    """
    combined_text = (jd_text + " " + job_title).lower()

    internships_accepted = any(
        trig in combined_text for trig in [
            "internships welcome", "internships accepted", "internship counts",
            "freshers are welcome", "freshers welcome", "interns welcome"
        ]
    )

    if any(trig in combined_text for trig in FRESHER_JD_TRIGGERS):
        return 0.0, 1.0, "general", None, True

    # Check for technology-specific experience pattern (e.g., "2 years of Python experience")
    all_known = KNOWN_LANGUAGES | KNOWN_FRAMEWORKS | KNOWN_DATABASES | KNOWN_CLOUD | KNOWN_DEVOPS
    for rgx in [TECH_EXP_REGEX_A, TECH_EXP_REGEX_B]:
        tech_matches = rgx.findall(jd_text)
        for m in tech_matches:
            try:
                val = float(m[0])
                tech_candidate = m[2].strip().lower()
                # Exact match against known technology vocabulary
                if tech_candidate in all_known:
                    norm_tech = normalize_skill_name(tech_candidate)
                    return val, None, "technology_specific", norm_tech, internships_accepted
            except (ValueError, IndexError):
                pass

    # Check for general experience regex
    matches = EXP_REGEX.findall(jd_text)
    found_years = []
    max_years = None
    for m in matches:
        try:
            val1 = float(m[0])
            if 0.5 <= val1 <= 20:
                found_years.append(val1)
            if m[1]:
                val2 = float(m[1])
                if 0.5 <= val2 <= 20:
                    max_years = val2
        except (ValueError, IndexError):
            pass

    if found_years:
        return max(found_years), max_years, "general", None, internships_accepted

    # Check JD requirements structured fields
    req_years = [
        r.minimum_experience_years for r in requirements
        if r.minimum_experience_years and r.minimum_experience_years > 0
    ]
    if req_years:
        return max(req_years), None, "general", None, internships_accepted

    # Title seniority heuristics
    title_low = job_title.lower()
    if any(w in title_low for w in ["lead", "staff", "principal", "architect", "director", "head"]):
        return 7.0, None, "general", None, internships_accepted
    if "senior" in title_low or "sr." in title_low:
        return 5.0, None, "general", None, internships_accepted
    if "mid" in title_low or "intermediate" in title_low:
        return 3.0, None, "general", None, internships_accepted
    if any(w in title_low for w in ["junior", "jr.", "entry", "intern", "associate", "trainee"]):
        return 0.0, 1.0, "general", None, True

    return 2.0, None, "general", None, internships_accepted

def evaluate_professional_experience(
    resume_data: ExtractedResumeData,
    jd_text: str,
    requirements: List[JDRequirement],
    job_title: str = "",
    current_year: int = 2026,
    current_month: int = 10
) -> ExperienceEvaluation:
    """
    Deterministic professional experience evaluation engine.
    Follows Task 4 rules:
    1. Only calculate from designated Work Experience / Employment History section.
    2. Never count education, graduation dates, or academic/personal projects.
    3. Separate internships from regular employment.
    4. Merge overlapping employment intervals (no double counting).
    5. When Work Experience section is missing:
       total_experience_months = None, relevant_experience_months = None, experience_status = "not_available".
    """
    min_years, max_years, exp_type, req_tech, internships_accepted = extract_jd_experience_details(
        jd_text, requirements, job_title
    )

    # Check whether an actual designated Work Experience section exists
    raw_sections = resume_data.raw_sections or {}
    has_work_exp_section = bool(raw_sections.get("experience"))
    work_entries: List[EmploymentEntry] = getattr(resume_data, "structured_work_experience", []) or []

    # If structured entries are empty but raw_sections has experience or work_experience has legacy dicts
    if not work_entries and resume_data.work_experience:
        from .parser import parse_structured_experience
        exp_text = raw_sections.get("experience", "")
        if exp_text:
            work_entries = parse_structured_experience(exp_text, source_section="Work Experience")

    # RULE 1.6: MISSING EXPERIENCE SECTION
    if not has_work_exp_section or not work_entries:
        methodology = (
            "No designated Work Experience or Employment History section was identified in the resume. "
            "Under strict deterministic evaluation rules, educational background, graduation dates, "
            "and project dates are never counted toward professional experience. "
            "The experience dimension is excluded from weighted scoring without penalty."
        )
        return ExperienceEvaluation(
            jd_required_years=min_years,
            jd_max_years=max_years,
            jd_experience_type=exp_type,
            jd_required_technology=req_tech,
            jd_internships_accepted=internships_accepted,
            total_experience_months=None,
            relevant_experience_months=None,
            internship_months=0,
            experience_status="not_available",
            experience_gap_months=None,
            employment_history=[],
            calculation_methodology=methodology,
            confidence_level="High",
            is_excluded_from_scoring=True,
            warnings=[
                "Professional work experience could not be verified from the resume.",
                "Experience dimension excluded from scoring and redistributed to remaining dimensions."
            ]
        )

    # PART 1: Process eligible employment records
    regular_intervals: List[Tuple[int, int]] = []
    internship_intervals: List[Tuple[int, int]] = []
    relevant_intervals: List[Tuple[int, int]] = []
    warnings: List[str] = []
    has_ambiguous_date = False

    for entry in work_entries:
        # Check for ambiguous dates
        if entry.is_uncertain_date or not entry.start_date:
            has_ambiguous_date = True
            warnings.append(f"Ambiguous or missing date range for '{entry.job_title} at {entry.company}'.")
            continue

        start_idx = parse_date_to_month_index(entry.start_date, default_month=1)
        if entry.is_current:
            end_idx = current_year * 12 + current_month
        else:
            end_idx = parse_date_to_month_index(entry.end_date, default_month=12)

        if not start_idx or not end_idx or end_idx < start_idx:
            has_ambiguous_date = True
            warnings.append(f"Invalid date range ({entry.start_date} to {entry.end_date}) for '{entry.job_title}'.")
            continue

        interval = (start_idx, end_idx)

        # Distinguish internships from regular employment
        if entry.employment_type == "Internship":
            internship_intervals.append(interval)
            if internships_accepted:
                regular_intervals.append(interval)
        else:
            regular_intervals.append(interval)

        # Relevant technology match
        is_relevant = False
        if exp_type == "technology_specific" and req_tech:
            req_tech_low = req_tech.lower()
            techs_low = [t.lower() for t in entry.relevant_technologies]
            bullets_text = " ".join(entry.responsibilities).lower()
            if (
                req_tech_low in entry.job_title.lower() or
                req_tech_low in techs_low or
                re.search(r'\b' + re.escape(req_tech_low) + r'\b', bullets_text)
            ):
                is_relevant = True
        else:
            # For general software engineering roles, professional employment is relevant
            is_relevant = (entry.employment_type != "Internship" or internships_accepted)

        if is_relevant:
            relevant_intervals.append(interval)

    # Deterministic interval merging
    total_months = calculate_merged_duration_months(regular_intervals)
    internship_months = calculate_merged_duration_months(internship_intervals)
    relevant_months = calculate_merged_duration_months(relevant_intervals)

    # If candidate had entries but none had valid dates
    if not regular_intervals and not internship_intervals:
        methodology = "Work experience entries were found, but dates were missing or ambiguous. No dates were fabricated."
        return ExperienceEvaluation(
            jd_required_years=min_years,
            jd_max_years=max_years,
            jd_experience_type=exp_type,
            jd_required_technology=req_tech,
            jd_internships_accepted=internships_accepted,
            total_experience_months=None,
            relevant_experience_months=None,
            internship_months=0,
            experience_status="unable_to_verify",
            experience_gap_months=None,
            employment_history=work_entries,
            calculation_methodology=methodology,
            confidence_level="Low",
            is_excluded_from_scoring=True,
            warnings=warnings or ["Employment dates could not be verified."]
        )

    # Determine status & gap
    required_months = int((min_years or 0.0) * 12)
    gap_months: Optional[int] = None

    if min_years == 0.0:
        status = "meets_requirement"
        gap_months = 0
    else:
        # Evaluate based on technology-specific vs general requirement
        target_eval_months = relevant_months if exp_type == "technology_specific" else total_months
        if target_eval_months >= required_months:
            status = "meets_requirement"
            gap_months = 0
        elif total_months >= required_months and relevant_months < required_months:
            # Meets general tenure, but lacks specific technology tenure
            status = "partially_meets_requirement"
            gap_months = max(0, required_months - relevant_months)
        elif total_months > 0:
            status = "does_not_meet_requirement"
            gap_months = max(0, required_months - target_eval_months)
        else:
            status = "does_not_meet_requirement"
            gap_months = required_months

    # Confidence calculation
    confidence = "High"
    if has_ambiguous_date:
        confidence = "Medium"

    # Explainable calculation methodology
    job_summaries = []
    for e in work_entries:
        date_str = f"{e.start_date or 'Unknown'} to {'Present' if e.is_current else (e.end_date or 'Unknown')}"
        job_summaries.append(f"{e.job_title} at {e.company} ({e.employment_type}, {date_str})")

    methodology = (
        f"Calculated exclusively from {len(work_entries)} Work Experience section entries. "
        f"Overlapping employment periods merged deterministically into {total_months} months ({total_months/12.0:.1f} yrs) "
        f"of total professional experience. "
    )
    if internship_months > 0:
        methodology += f"Internships: {internship_months} months tracked separately. "
    if exp_type == "technology_specific" and req_tech:
        methodology += (
            f"Target technology '{req_tech}' experience: {relevant_months} months ({relevant_months/12.0:.1f} yrs). "
        )
    if gap_months and gap_months > 0:
        methodology += f"Identified experience gap: {gap_months} months vs JD requirement ({required_months} months)."

    return ExperienceEvaluation(
        jd_required_years=min_years,
        jd_max_years=max_years,
        jd_experience_type=exp_type,
        jd_required_technology=req_tech,
        jd_internships_accepted=internships_accepted,
        total_experience_months=total_months,
        relevant_experience_months=relevant_months,
        internship_months=internship_months,
        experience_status=status,
        experience_gap_months=gap_months,
        employment_history=work_entries,
        calculation_methodology=methodology,
        confidence_level=confidence,
        is_excluded_from_scoring=False,
        warnings=warnings
    )

def extract_jd_experience(jd_text: str, requirements: List[JDRequirement], job_title: str) -> float:
    """Extract required years of experience (backward compatible float return)."""
    min_years, _, _, _, _ = extract_jd_experience_details(jd_text, requirements, job_title)
    return min_years if min_years is not None else 2.0

def extract_resume_experience(resume_data: ExtractedResumeData, raw_text: str = "") -> float:
    """
    Deterministic extraction of candidate's professional years of experience.
    CRITICAL: Never extracts from Education, Graduation dates, or Academic/Personal Projects.
    """
    raw_sections = resume_data.raw_sections or {}
    has_exp_section = bool(raw_sections.get("experience"))
    if not has_exp_section and not resume_data.structured_work_experience and not resume_data.work_experience:
        return 0.0

    eval_result = evaluate_professional_experience(
        resume_data=resume_data,
        jd_text="",
        requirements=[],
        job_title=""
    )
    if eval_result.total_experience_months is not None:
        return round(eval_result.total_experience_months / 12.0, 1)
    return 0.0

def assess_experience(req_years: float, found_years: float) -> str:
    """Generate professional assessment comparing required vs found years."""
    if req_years == 0.0:
        if found_years == 0.0:
            return "Early-Career Match: Perfect for entry-level / fresher expectations."
        return f"Experienced for Role: Candidate brings {found_years:.1f} yrs experience to a role welcoming entry-level talent."

    diff = found_years - req_years
    if diff >= 1.0:
        return f"Strong Seniority Fit: Candidate has {found_years:.1f} yrs vs {req_years:.1f}+ yrs required (well qualified)."
    elif diff >= -0.5:
        return f"Close Experience Alignment: Candidate has {found_years:.1f} yrs vs {req_years:.1f}+ yrs required (meets baseline)."
    elif found_years <= 1.0 and req_years >= 3.0:
        return f"Significant Seniority Gap: Role demands {req_years:.1f}+ yrs experienced professional; candidate is early-career ({found_years:.1f} yrs)."
    else:
        return f"Experience Delta: Candidate has {found_years:.1f} yrs vs {req_years:.1f}+ yrs required (shortfall of {abs(diff):.1f} yrs)."

def generate_creative_summary(overall_score: float, req_years: float, found_years: float, candidate_name: Optional[str] = None) -> str:
    """Generate punchy, human, witty summary that rotates and captures the real match situation."""
    # Scenario A: Fresher/Junior applying to Senior/Experienced JD (5+ yrs or 3+ yrs)
    if found_years <= 1.0 and req_years >= 3.0:
        fresher_vs_senior_pool = [
            f"Buddy, they are clearly looking for an experienced veteran with {req_years:.0f}+ years in the trenches. You're not their best fit right now, but love the ambition!",
            f"Whoa champion! This JD is hunting for an experienced engineer with {req_years:.0f}+ years of production battle scars, while your resume says fresh out of the gate. Respect the hustle, but an HR screener will probably ghost this one.",
            f"Reality check time: they're asking for senior firepower ({req_years:.0f}+ yrs) and you're bringing fresh enthusiasm to a senior battlefield. Don't take it personally — aim for roles where your raw talent actually gets celebrated!",
            f"Hold your horses! They want a seasoned senior engineer who's survived {req_years:.0f}+ years of production outages. You've got great raw talent, but this JD is strictly looking for heavyweights.",
            f"Shooting for the stars is awesome, but they literally asked for {req_years:.0f}+ years of experienced senior war stories you haven't lived yet. Aim for Junior or Associate roles first and dominate there!"
        ]
        return random.choice(fresher_vs_senior_pool)

    # Scenario B: Overqualified senior candidate applying to junior/fresher role
    if found_years >= 5.0 and req_years <= 1.5:
        overqualified_pool = [
            f"Honestly? You're wildly overqualified for this gig ({found_years:.0f} yrs vs entry-level). You could probably teach the hiring manager a thing or two — make sure you won't get bored out of your mind!",
            f"Overkill alert! You brought a bazooka to a knife fight. With {found_years:.0f} years under your belt, they'll either snap you up in seconds or panic that you'll cost double their budget.",
            f"You're playing on easy mode here! Your {found_years:.0f} years of engineering dwarfs what they asked for. Expect quick callbacks if their salary matches your caliber."
        ]
        return random.choice(overqualified_pool)

    # Scenario C: Dream High-Score Match (>= 7.5)
    if overall_score >= 7.5:
        high_match_pool = [
            "Hot damn! You check their boxes like you ghostwrote their JD. Polish those project metrics and expect recruiter slide-ins.",
            "Chef's kiss! You're basically their dream candidate on paper. Review their culture tips and go crush the behavioral round.",
            "Green flags all over! Your demonstrated project depth and seniority line up with exactly what they're crying out for. Go get that offer!",
            "Bulls-eye! You bring the exact weapons they asked for. Walk into that interview with your head held high."
        ]
        return random.choice(high_match_pool)

    # Scenario D: Moderate / Running Chance (5.0 - 7.4)
    if overall_score >= 5.0:
        moderate_match_pool = [
            "Decent puncher's chance! You've got the core technical chops, but you're hiding your light under a bushel. Connect your project bullets to their keywords and you're in the running.",
            "You're in the race, but it's a tight pack! Your tech foundation is solid, but you'll need to demonstrate real depth on a couple of their mandatory tools.",
            "Solid contender with a few blind spots. Beef up your quantifiable impact numbers and you can easily turn this into an interview."
        ]
        return random.choice(moderate_match_pool)

    # Scenario E: Low Match (< 5.0)
    low_match_pool = [
        "Oof, square peg in a round hole here. They're demanding stack A and you're flexing stack B. Might want to pivot or re-aim your ammo for this one.",
        "Tough sell, chief! Your resume is telling a completely different story from what this job needs. Either re-tune your bullets for this niche or scout better-aligned roles.",
        "Not quite vibing with this JD. The core skills they care about most barely show up in your projects. Don't waste application rounds without tailoring your resume!"
    ]
    return random.choice(low_match_pool)
