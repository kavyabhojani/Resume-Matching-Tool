import pytest
from app.services import parse_text, gap_analysis, calculate_similarity

def test_parse_text():
    text = """
    We are looking for a Senior Data Engineer with 3-5 years of experience in Python, AWS, and ETL pipelines.
    The candidate should have a Bachelor's degree and familiarity with Agile methodologies.
    """
    result = parse_text(text)

    # Assertions for skills
    assert "Python" in result["skills"]
    assert "AWS" in result["skills"]
    assert "ETL pipelines" in result["skills"]

    # Assertions for education
    assert "Bachelor'S Degree" in result["education"]  # Title case match


def test_calculate_similarity():
    # Sample embeddings (pretend they're from BERT)
    resume_embedding = [[0.1, 0.2, 0.3]]
    job_embedding = [[0.1, 0.2, 0.3]]

    # Calculate similarity
    score = calculate_similarity(resume_embedding, job_embedding)

    # Check for a perfect match with tolerance
    assert score == pytest.approx(100.0, rel=1e-6)

def test_gap_analysis():
    resume_info = {
        "skills": ["Python", "AWS"],
        "experience": [3],
        "education": ["Bachelor"]
    }
    job_info = {
        "skills": ["Python", "Kubernetes", "AWS"],
        "experience": [5],
        "education": ["Master"]
    }

    result = gap_analysis(resume_info, job_info)

    # Assertions for missing skills
    assert "Kubernetes" in result["missing_skills"]

    # Assertions for missing education
    assert "Master" in result["missing_education"]

    # Assertions for experience gap
    assert result["experience_gap"] == 2
