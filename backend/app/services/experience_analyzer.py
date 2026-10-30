import re
import random
from typing import List, Optional, Tuple
from ..models.schemas import ExtractedResumeData, JDRequirement

EXP_REGEX = re.compile(
    r'(?:(?:minimum|at least|over)\s+)?(\d+(?:\.\d+)?)\+?\s*(?:to|-|–)?\s*(\d+(?:\.\d+)?)?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+hands-on|\s+relevant|\s+professional|\s+software|\s+engineering|\s+work|\s+industry)?(?:\s+experience)?',
    re.IGNORECASE
)

DATE_RANGE_REGEX = re.compile(
    r'(?:(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(20\d\d|19\d\d)\s*(?:-|–|—|to)\s*(present|current|now|(?:(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(20\d\d|19\d\d))',
    re.IGNORECASE
)

FRESHER_JD_TRIGGERS = [
    "fresher", "freshers", "entry level", "entry-level", "junior", "graduate",
    "intern", "internship", "0-1 year", "0-2 years", "no experience required"
]

FRESHER_RESUME_TRIGGERS = [
    "fresher", "recent graduate", "new graduate", "entry level", "student",
    "seeking an entry", "seeking entry-level", "aspiring software engineer"
]

def extract_jd_experience(jd_text: str, requirements: List[JDRequirement], job_title: str) -> float:
    """Extract required years of experience from JD text and requirements."""
    jd_lower = (jd_text + " " + job_title).lower()
    
    # Check if explicitly for freshers
    if any(trig in jd_lower for trig in FRESHER_JD_TRIGGERS):
        return 0.0

    # Search for explicit experience patterns in JD
    matches = EXP_REGEX.findall(jd_text)
    found_years = []
    for m in matches:
        try:
            val1 = float(m[0])
            if 0.5 <= val1 <= 20:
                found_years.append(val1)
            if m[1]:
                val2 = float(m[1])
                if 0.5 <= val2 <= 20:
                    found_years.append(val2)
        except ValueError:
            pass
            
    if found_years:
        # Return maximum stated minimum requirement (e.g. "5+ years")
        return max(found_years)
        
    # Check requirements minimum_experience_years
    req_years = [r.minimum_experience_years for r in requirements if r.minimum_experience_years and r.minimum_experience_years > 0]
    if req_years:
        return max(req_years)

    # Heuristic based on seniority title
    title_lower = job_title.lower()
    if any(w in title_lower for w in ["lead", "staff", "principal", "architect", "director", "head"]):
        return 7.0
    if "senior" in title_lower or "sr." in title_lower:
        return 5.0
    if "mid" in title_lower or "intermediate" in title_lower:
        return 3.0
    if any(w in title_lower for w in ["junior", "jr.", "entry", "intern", "associate", "trainee"]):
        return 0.0

    return 2.0  # Default software engineer baseline

def extract_resume_experience(resume_data: ExtractedResumeData, raw_text: str) -> float:
    """Extract candidate's demonstrated years of experience."""
    combined_text = (
        (resume_data.professional_summary or "") + "\n" +
        (raw_text or "")
    )
    combined_lower = combined_text.lower()

    # Check for direct claim in professional summary first (e.g. "6+ years of experience")
    summary = resume_data.professional_summary or ""
    summary_matches = EXP_REGEX.findall(summary)
    for m in summary_matches:
        try:
            val = float(m[0])
            if 1.0 <= val <= 35:
                return val
        except ValueError:
            pass

    # Calculate experience from date ranges in work experience
    date_matches = DATE_RANGE_REGEX.findall(raw_text)
    years_spans = []
    current_year = 2026.0

    for m in date_matches:
        start_year = float(m[1])
        end_str = m[2].lower()
        if any(w in end_str for w in ["present", "current", "now"]):
            end_year = current_year
        elif m[4]:
            end_year = float(m[4])
        else:
            end_year = start_year + 1.0

        if 1990 <= start_year <= current_year and start_year <= end_year <= current_year + 1:
            span = end_year - start_year
            years_spans.append(max(0.5, span))

    if years_spans:
        # Sum spans with realistic cap or take duration from earliest job to latest
        total_span = sum(years_spans)
        return min(round(total_span, 1), 30.0)

    # Check education year if no explicit work history
    if resume_data.education:
        edu_text = " ".join([str(e) for e in resume_data.education])
        edu_years = re.findall(r'\b(20\d\d|19\d\d)\b', edu_text)
        if edu_years:
            latest_edu_year = max([int(y) for y in edu_years])
            if latest_edu_year >= 2024:
                return 0.0  # Recent graduate
            years_since_grad = max(0.0, current_year - latest_edu_year)
            return min(round(years_since_grad, 1), 25.0)

    # Check if fresher indicators present
    if any(trig in combined_lower for trig in FRESHER_RESUME_TRIGGERS):
        return 0.0

    # If has work experience entries but no clear dates, assume ~1.5 years per entry
    if resume_data.work_experience:
        return min(round(len(resume_data.work_experience) * 1.5, 1), 15.0)

    return 0.0  # Default fresher / no commercial experience detected

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
