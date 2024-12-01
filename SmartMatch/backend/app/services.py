import spacy
from transformers import AutoTokenizer, AutoModel
from sklearn.metrics.pairwise import cosine_similarity
import torch
import re
import numpy as np
from typing import Dict, List, Any

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Load BERT model
tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
model = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")

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

# Enhanced degree patterns
DEGREE_PATTERNS = {
    "PHD-LEVEL": [r"ph\.?d", r"doctorate", r"doctoral"],
    "MS-LEVEL": [r"master'?s?", r"m\.s\.", r"m\.sc\."],
    "BS-LEVEL": [r"bachelor'?s?", r"b\.s\.", r"b\.sc\.", r"b\.a\."]
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
    """
    Enhanced text parsing function that extracts skills, education, and experience
    using improved pattern matching and classification.
    """
    doc = nlp(text.lower())
    
    # Extract skills with categorization
    skills = extract_skills(doc)
    
    # Extract education with improved pattern matching
    education = extract_education(doc)
    
    # Extract experience with better number recognition
    experience = parse_experience(doc)
    
    # Extract additional contextual information
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
    
    # Extract degrees using enhanced patterns
    for level, patterns in DEGREE_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                education.append(level)
                
    # Extract majors using enhanced patterns
    majors = []
    for field, patterns in MAJOR_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                majors.append(field)
                
    return list(set(education)) + list(set(majors))

def parse_experience(doc: spacy.tokens.Doc) -> List[int]:
    """Enhanced experience extraction with better number recognition."""
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
    
    return sorted(set(experience)) if experience else []

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
    """Generate embeddings using BERT with better text preprocessing."""
    # Clean and preprocess text
    text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
    text = re.sub(r'[^\w\s]', ' ', text)  # Remove punctuation
    
    # Generate embeddings
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    outputs = model(**inputs)
    
    # Use mean pooling for better representation
    attention_mask = inputs['attention_mask']
    token_embeddings = outputs.last_hidden_state
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    embeddings = torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)
    
    return embeddings.detach().numpy()

def calculate_similarity(resume_embedding: np.ndarray, job_embedding: np.ndarray) -> float:
    """Calculate similarity with enhanced scoring."""
    # Calculate cosine similarity
    base_score = float(cosine_similarity(resume_embedding, job_embedding)[0][0])
    
    # Scale score to percentage and round to 1 decimal
    score = round(base_score * 100, 1)
    
    # Ensure score is between 0 and 100
    return max(0, min(score, 100))


def gap_analysis(resume_info: Dict, job_info: Dict) -> Dict:
    """Enhanced gap analysis with better feedback generation and empty value handling."""
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
    
    # Analyze skill gaps with categories
    job_skills = set(job_info.get("skills", [])) if isinstance(job_info.get("skills"), list) else set()
    resume_skills = set(resume_info.get("skills", [])) if isinstance(resume_info.get("skills"), list) else set()
    
    missing = job_skills - resume_skills
    if missing:
        gaps["missing_skills"] = list(missing)
        gaps["feedback"]["skills"] = [
            f"Consider gaining experience in {skill}" for skill in missing
        ]
    
    # Analyze education gaps - Handle potential None or non-list values
    job_education = set(job_info.get("education", [])) if isinstance(job_info.get("education"), list) else set()
    resume_education = set(resume_info.get("education", [])) if isinstance(resume_info.get("education"), list) else set()
    
    missing_education = job_education - resume_education
    if missing_education:
        gaps["missing_education"] = list(missing_education)
        for edu in missing_education:
            if "LEVEL" in str(edu):
                gaps["feedback"]["education"].append(
                    f"Consider pursuing a {str(edu).replace('-LEVEL', '').lower()} degree"
                )
            else:
                gaps["feedback"]["education"].append(
                    f"Consider studying {str(edu).lower()}"
                )
    
    # Analyze experience gap - Handle empty sequences and None values
    try:
        job_exp = max(job_info.get("experience", [0]) or [0])
    except (ValueError, TypeError):
        job_exp = 0
        
    try:
        resume_exp = max(resume_info.get("experience", [0]) or [0])
    except (ValueError, TypeError):
        resume_exp = 0
    
    if job_exp > resume_exp:
        gap = job_exp - resume_exp
        gaps["experience_gap"] = gap
        gaps["feedback"]["experience"].append(
            f"You need {gap} more years of experience. Consider:"
            f"\n- Taking on more responsibilities in your current role"
            f"\n- Working on relevant side projects"
            f"\n- Contributing to open source projects"
        )
    
    return gaps