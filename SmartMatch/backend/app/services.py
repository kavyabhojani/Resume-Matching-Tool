import spacy
from transformers import AutoTokenizer, AutoModel
from sklearn.metrics.pairwise import cosine_similarity
import torch
import re
import numpy as np
from typing import Dict, List, Any
from sentence_transformers import SentenceTransformer
from transformers import pipeline

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Load BERT model
tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
model = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
sentence_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Enhanced skill categories based on reference project
SKILL_CATEGORIES = {
    "PROGRAMMING": [
        "python", "java", "javascript", "c++", "c#", "ruby", "php",
        "swift", "golang", "rust", "scala"
    ],
    "WEB_DEVELOPMENT": [
        "html", "css", "react", "angular", "vue", "node.js", "django",
        "flask", "ruby on rails", "asp.net"
    ],
    "DATA_SCIENCE": [
        "machine learning", "deep learning", "nlp", "computer vision",
        "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy"
    ],
    "CLOUD": [
        "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
        "cloudformation"
    ],
    "DATABASE": [
        "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
        "cassandra"
    ]
}

DEGREE_PATTERNS = {
    "PHD-LEVEL": [r"ph\.?d", r"doctorate", r"doctoral"],
    "MS-LEVEL": [r"master'?s?", r"m\.s\.?", r"m\.sc\.?", r"masters"],
    "BS-LEVEL": [r"bachelor'?s?", r"b\.s\.?", r"b\.sc\.?", r"b\.a\.?", r"baccalaureate", r"ba", r"bsba", r"ba/bs", r"4[- ]?year", r"four[- ]?year", r"college", r"undergraduate", r"university", r"bsc", r"bs", r"be", r"b\.e"]
}


# Enhanced major patterns
MAJOR_PATTERNS = {
    "computer_science": [r"computer\s+science", r"cs"],
    "software_engineering": [r"software\s+engineering", r"se"],
    "data_science": [r"data\s+science", r"ds", r"data\s+analytics"],
    "artificial_intelligence": [r"artificial\s+intelligence", r"ai", r"machine\s+learning"],
    "information_technology": [r"information\s+technology", r"it", r"information\s+systems"]
}

def parse_text(text: str) -> Dict[str, Any]:
    """Enhanced parsing function with categorized skills, education, and experience."""
    doc = nlp(text.lower())
    skills = extract_skills(doc)
    education = extract_education(doc)
    experience = parse_experience(doc)
    context = extract_context(doc)
    return {
        "skills": skills,
        "education": education,
        "experience": experience,
        "context": context
    }

def extract_skills(doc: spacy.tokens.Doc) -> Dict[str, List[str]]:
    """Enhanced skill extraction with categorization."""
    skills = {category: [] for category in SKILL_CATEGORIES}
    
    # Extract skills using pattern matching
    for sentence in doc.sents:
        for category, category_skills in SKILL_CATEGORIES.items():
            for skill in category_skills:
                if skill.lower() in sentence.text.lower():
                    skills[category].append(skill)
    
    # Extract skills using NER
    for ent in doc.ents:
        if ent.label_ in {"PRODUCT", "ORG", "GPE"}:
            # Check if entity might be a technology/tool
            if any(tech_word in ent.text.lower() for tech_word in 
                  ["framework", "language", "tool", "platform", "library"]):
                for category, category_skills in SKILL_CATEGORIES.items():
                    if any(skill.lower() in ent.text.lower() for skill in category_skills):
                        skills[category].append(ent.text)
    
    # Remove duplicates and empty categories
    return {k: list(set(v)) for k, v in skills.items() if v}

def extract_education(doc: spacy.tokens.Doc) -> List[str]:
    """Enhanced education extraction with better degree pattern matching."""
    education = []
    text = doc.text.lower()
    
    # Map degree patterns to human-readable levels
    degree_mapping = {
        "BS-LEVEL": "Bachelor's Degree",
        "MS-LEVEL": "Master's Degree",
        "PHD-LEVEL": "Ph.D."
    }
    
    # Extract degrees using enhanced patterns
    for level, patterns in DEGREE_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                if level in degree_mapping:
                    education.append(degree_mapping[level])
    
    # Remove duplicates
    education = list(set(education))
    
    # If Master's Degree is present, ensure Bachelor's Degree is not considered missing
    if "Master's Degree" in education and "Bachelor's Degree" not in education:
        education.append("Bachelor's Degree")
    
    return education


def parse_experience(doc: spacy.tokens.Doc) -> List[int]:
    """
    Enhanced experience extraction with better number recognition.
    """
    experience = []

    # Common experience patterns
    patterns = [
        r"(\d+)\+?\s*(?:-\s*\d+)?\s*years?(?:\s+of)?\s+experience",
        r"at least (\d+)\s*years?(?:\s+of)?\s+experience",
        r"minimum (?:of\s+)?(\d+)\s*years?(?:\s+of)?\s+experience"
    ]

    text = doc.text.lower()

    # Extract years of experience
    for pattern in patterns:
        matches = re.finditer(pattern, text)
        for match in matches:
            years = int(match.group(1))
            experience.append(years)

    return sorted(set(experience)) if experience else [0]

def extract_context(doc: spacy.tokens.Doc) -> Dict[str, List[str]]:
    """Extract additional contextual information from the text."""
    context = {
        "tools": [],
        "platforms": [],
        "methodologies": [],
        "industries": []
    }
    
    # Common contextual patterns
    context_patterns = {
        "tools": [r"using (\w+)", r"experience with (\w+)", r"knowledge of (\w+)"],
        "platforms": [r"on (\w+ platform)", r"(\w+) platform", r"(\w+) environment"],
        "methodologies": [r"(agile|scrum|waterfall|kanban)", r"(ci/cd|devops)"],
        "industries": [r"in ([\w\s]+) industry", r"([\w\s]+) sector"]
    }
    
    text = doc.text.lower()
    
    # Extract context using patterns
    for category, patterns in context_patterns.items():
        for pattern in patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                context[category].append(match.group(1))
    
    return {k: list(set(v)) for k, v in context.items() if v}

def get_embeddings(text: str) -> np.ndarray:
    """
    Generate sentence embeddings using SentenceTransformer.
    :param text: Input text (resume or job description).
    :return: 1D embedding vector.
    """
    # Clean text
    text = re.sub(r'\s+', ' ', text).strip()

    # Generate embeddings as a 1D array
    return sentence_model.encode(text, convert_to_numpy=True)

from sklearn.preprocessing import normalize

def calculate_similarity(resume_embedding: np.ndarray, job_embedding: np.ndarray, weights: dict = None) -> float:
    """
    Calculate similarity with weighted scoring and normalized embeddings.
    :param resume_embedding: Embedding of the resume.
    :param job_embedding: Embedding of the job description.
    :param weights: Dictionary with weights for skills, education, and experience.
    :return: Weighted similarity score.
    """
    # Normalize embeddings
    resume_embedding = normalize(resume_embedding.reshape(1, -1))
    job_embedding = normalize(job_embedding.reshape(1, -1))

    # Calculate base similarity
    base_similarity = cosine_similarity(resume_embedding, job_embedding)[0][0]

    # Use weights to adjust scoring
    weighted_score = base_similarity * (weights.get("overall", 1.0) if weights else 1.0)

    # Ensure the score is scaled to 100 and is between 0 and 100
    return max(0, min(weighted_score * 100, 100))

def semantic_skill_matching(resume_skills: List[str], job_skills: List[str]) -> float:
    """
    Calculate the semantic similarity between resume skills and job skills.
    :param resume_skills: List of skills extracted from the resume.
    :param job_skills: List of skills extracted from the job description.
    :return: Semantic similarity score (0 to 1).
    """
    if not resume_skills or not job_skills:
        return 0.0

    # Generate embeddings for skills
    resume_skill_embeddings = sentence_model.encode(resume_skills, convert_to_numpy=True)
    job_skill_embeddings = sentence_model.encode(job_skills, convert_to_numpy=True)

    # Compute pairwise similarity
    similarity_matrix = cosine_similarity(resume_skill_embeddings, job_skill_embeddings)

    # Average the maximum similarities for better matching
    max_similarity = similarity_matrix.max(axis=1).mean()

    return max_similarity

def calculate_combined_score(resume_info: Dict, job_info: Dict, weights: Dict[str, float] = None) -> float:
    """
    Calculate a combined score based on skills, education, and experience.
    """
    if weights is None:
        weights = {"skills": 0.6, "education": 0.2, "experience": 0.2}

    # Skills match
    skill_score = semantic_skill_matching(
        sum(resume_info.get("skills", {}).values(), []),
        sum(job_info.get("skills", {}).values(), [])
    )

    # Education match
    education_match = len(
        set(resume_info.get("education", [])) & set(job_info.get("education", []))
    ) / max(1, len(job_info.get("education", [])))

    # Experience match - handle division by zero
    job_experience = max(job_info.get("experience", [0]))
    resume_experience = max(resume_info.get("experience", [0]))
    if job_experience > 0:
        experience_match = min(1.0, resume_experience / job_experience)
    else:
        experience_match = 0.0  # No experience required, so no match possible

    # Combine scores with weights
    combined_score = (
        skill_score * weights["skills"] +
        education_match * weights["education"] +
        experience_match * weights["experience"]
    )

    return round(combined_score * 100, 2)

def generate_predefined_feedback(missing_skills: List[str], category: str) -> List[str]:
    """
    Generate predefined feedback for missing skills.
    
    Args:
        missing_skills (list): List of missing skills.
        category (str): Skill category for the feedback.
    
    Returns:
        list: Predefined feedback for each missing skill.
    """
    feedback_templates = {
        "DATA_SCIENCE": "{skill} is an essential tool in the data science domain. Familiarize yourself with it by exploring online courses or tutorials.",
        "PROGRAMMING": "Mastering {skill} can significantly enhance your programming capabilities. Consider building small projects to practice.",
        "WEB_DEVELOPMENT": "{skill} is widely used in web development. Practice it by contributing to open-source projects or creating your own websites.",
        "CLOUD": "Gaining experience in {skill} can boost your cloud computing skills. Try hands-on labs or certifications.",
        "DATABASE": "{skill} is a valuable database skill. Practice it by designing and querying your own databases."
    }
    feedbacks = []
    for skill in missing_skills:
        template = feedback_templates.get(category, "Learning {skill} will enhance your skills in this category.")
        feedbacks.append(template.format(skill=skill))
    return feedbacks


def gap_analysis(resume_info: Dict, job_info: Dict) -> Dict:
    """
    Enhanced gap analysis with predefined feedback.
    """
    gaps = {
        "missing_skills": [],
        "missing_education": [],
        "experience_gap": 0,
        "feedback": {
            "skills": [],
            "education": [],
            "experience": []
        }
    }

    # Skill gap analysis
    for category, job_skills in job_info.get("skills", {}).items():
        resume_skills = resume_info.get("skills", {}).get(category, [])
        missing_skills = set(job_skills) - set(resume_skills)
        if missing_skills:
            gaps["missing_skills"].extend(missing_skills)
            skill_feedback = generate_predefined_feedback(list(missing_skills), category)
            gaps["feedback"]["skills"].extend(skill_feedback)

    # Education gap analysis
    job_education = set(job_info.get("education", []))
    resume_education = set(resume_info.get("education", []))
    if "Master's Degree" in resume_education:
        job_education.discard("Bachelor's Degree")
    missing_education = job_education - resume_education
    if missing_education:
        gaps["missing_education"] = list(missing_education)
        gaps["feedback"]["education"].extend(
            [f"Consider pursuing {edu} to meet job requirements." for edu in missing_education]
        )

    # Experience gap analysis
    required_experience = max(job_info.get("experience", [0]), default=0)
    resume_experience = max(resume_info.get("experience", [0]), default=0)
    experience_gap = max(0, required_experience - resume_experience)
    gaps["experience_gap"] = experience_gap
    if experience_gap > 0:
        gaps["feedback"]["experience"].append(
            f"You need {experience_gap} more years of experience to match this role."
        )

    return gaps
