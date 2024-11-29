import spacy
from transformers import AutoTokenizer, AutoModel
from sklearn.metrics.pairwise import cosine_similarity
import torch
import re

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Load BERT model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
model = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")

# Define global keyword lists
SKILLS_KEYWORDS = [
    "Python", "SQL", "machine learning", "Kubernetes", "cloud computing",
    "Docker", "Java", "C++", "TensorFlow", "PyTorch", "data engineering", 
    "DevOps", "React", "AI", "NLP", "big data", "databases", "microservices",
    "Agile", "Scrum", "ETL pipelines", "Power BI", "Tableau", "AWS", "GCP", "Azure"
]
EDUCATION_KEYWORDS = [
    "Bachelor", "Master", "PhD", "B.Sc", "M.Sc", "Diploma", "Certification",
    "Associate Degree", "Postgraduate", "Professional Certificate",
    "Doctorate", "High School", "MBA"
]

def parse_text(text):
    """
    Parses text to extract skills, experience, and education using enhanced rules and spaCy NER.
    :param text: Input text (resume or job description)
    :return: Dictionary with extracted information
    """
    # Extract skills and education using keyword matching
    skills = match_keywords(text, SKILLS_KEYWORDS)
    education = extract_education(text)

    # Extract experience
    experience = parse_experience(text)

    # Use spaCy NER for complementary parsing
    doc = nlp(text)
    ner_skills = [ent.text for ent in doc.ents if ent.label_ in {"SKILL", "WORK_OF_ART"}]
    ner_education = [ent.text for ent in doc.ents if ent.label_ == "EDUCATION"]

    # Validate and merge NER results
    ner_skills = [skill for skill in ner_skills if skill.lower() in map(str.lower, SKILLS_KEYWORDS)]
    ner_education = [edu for edu in ner_education if edu.lower() in map(str.lower, EDUCATION_KEYWORDS)]
    skills = list(set(skills + ner_skills))
    education = list(set(education + ner_education))

    return {
        "skills": skills,
        "experience": experience,
        "education": education
    }

def match_keywords(text, keywords):
    """
    Matches keywords in the text using exact, case-insensitive matching.
    Prioritizes multi-word phrases.
    :param text: Input text to search.
    :param keywords: List of keywords to match.
    :return: List of matched keywords.
    """
    # Sort keywords by length (descending) to prioritize multi-word phrases
    keywords = sorted(keywords, key=len, reverse=True)

    matched = []
    for keyword in keywords:
        # Match whole words or phrases
        if re.search(rf'\b{re.escape(keyword)}\b', text, re.IGNORECASE):
            matched.append(keyword)
    return matched

def extract_education(text):
    """
    Extracts education-related information using regex and keyword matching.
    :param text: Input text (resume or job description)
    :return: List of extracted education details.
    """
    education_patterns = [
        r"(Bachelor['s]*\s(?:degree)?)", r"(Master['s]*\s(?:degree)?)", r"(PhD|Doctorate)"
    ]
    education = []
    for pattern in education_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        education.extend(matches)

    # Normalize and deduplicate
    education = list(set([edu.strip().lower().title() for edu in education]))

    # Add results from keyword matching
    education += [edu.lower().title() for edu in match_keywords(text, EDUCATION_KEYWORDS)]
    return list(set(education))  # Deduplicate

def parse_experience(text):
    """
    Parses text to extract years of experience using regex patterns.
    :param text: Input text (resume or job description)
    :return: List of extracted years of experience.
    """
    experience_pattern = r"(\d+)(?:-(\d+))?\s+years?\s+of\s+experience|\bat\s+least\s+(\d+)\s+years"
    matches = re.findall(experience_pattern, text)
    
    experience = []
    for match in matches:
        if match[1]:  # Handle ranges (e.g., "3-5 years")
            experience.append(int(match[0]))  # Lower bound
            experience.append(int(match[1]))  # Upper bound
        elif match[0]:  # Single value (e.g., "3 years")
            experience.append(int(match[0]))
        elif match[2]:  # "at least N years"
            experience.append(int(match[2]))
    return sorted(set(experience))  # Remove duplicates and sort

def get_embeddings(text):
    """
    Converts input text into embedding vector using BERT.
    :param text: Input text (resume or job description)
    :return: Embedding vector
    """
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).detach().numpy()

def calculate_similarity(resume_embedding, job_embedding):
    """
    Calculates similarity score between two embedding vectors.
    :param resume_embedding: Embedding vector of the resume
    :param job_embedding: Embedding vector of the job description
    :return: Similarity score (percentage)
    """
    score = cosine_similarity(resume_embedding, job_embedding)
    return score[0][0] * 100  # Convert to percentage

def gap_analysis(resume_info, job_info):
    """
    Analyzes gaps between resume and job description and provides actionable feedback.
    :param resume_info: Extracted information from resume
    :param job_info: Extracted information from job description
    :return: Dictionary with missing skills, education, experience gap, and feedback
    """
    # Missing skills
    missing_skills = [skill for skill in job_info["skills"] if skill not in resume_info["skills"]]

    # Missing education
    missing_education = [edu for edu in job_info["education"] if edu not in resume_info["education"]]

    # Experience gap
    required_experience = int(job_info["experience"][0]) if job_info["experience"] else 0
    resume_experience = int(resume_info["experience"][0]) if resume_info["experience"] else 0
    experience_gap = max(0, required_experience - resume_experience)

    # Feedback generation
    feedback = {}
    if missing_skills:
        feedback["skills"] = [
            f"Consider learning or gaining experience in {skill}. Platforms like Coursera or Udemy might help."
            for skill in missing_skills
        ]
    if missing_education:
        feedback["education"] = [
            f"Consider obtaining a degree or certification in {edu} to align with job requirements."
            for edu in missing_education
        ]
    if experience_gap > 0:
        feedback["experience"] = [
            f"You are short by {experience_gap} years of experience. Consider taking on freelance projects or internships."
        ]

    return {
        "missing_skills": missing_skills,
        "missing_education": missing_education,
        "experience_gap": experience_gap,
        "feedback": feedback
    }
