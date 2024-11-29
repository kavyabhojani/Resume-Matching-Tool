from flask import Blueprint, request, jsonify
from app.services import parse_text, get_embeddings, calculate_similarity, gap_analysis
from app.utils import extract_text_from_file
import logging

routes = Blueprint("routes", __name__)

@routes.route("/analyze", methods=["POST", "OPTIONS"])
def analyze():
    """
    API endpoint to analyze resume and job description.
    :return: Match score, extracted information, and gap analysis with feedback
    """
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        return "", 204
        
    data = request.json
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    resume_text = data.get("resume")
    job_desc_text = data.get("job_description")

    if not resume_text or not job_desc_text:
        return jsonify({"error": "Both resume and job description are required."}), 400

    try:
        # Parse text
        resume_info = parse_text(resume_text)
        job_info = parse_text(job_desc_text)

        # Generate embeddings
        resume_embedding = get_embeddings(resume_text)
        job_embedding = get_embeddings(job_desc_text)

        # Calculate similarity
        match_score = calculate_similarity(resume_embedding, job_embedding)
        match_score = float(match_score)  # Ensure JSON serializable

        # Perform gap analysis with feedback
        gaps = gap_analysis(resume_info, job_info)

        return jsonify({
            "match_score": match_score,
            "resume_info": resume_info,
            "job_info": job_info,
            "gaps": gaps
        })
    except Exception as e:
        logging.error(f"Error in analyze endpoint: {str(e)}", exc_info=True)
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

@routes.route("/upload", methods=["POST", "OPTIONS"])
def upload_files():
    """
    API endpoint to handle file uploads for resumes and job descriptions.
    :return: Extracted text from files
    """
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        return "", 204

    if "resume" not in request.files or "job_description" not in request.files:
        return jsonify({"error": "Both resume and job description files are required."}), 400

    try:
        resume_file = request.files["resume"]
        job_desc_file = request.files["job_description"]

        # Extract text from uploaded files
        resume_text = extract_text_from_file(resume_file)
        job_desc_text = extract_text_from_file(job_desc_file)

        return jsonify({
            "resume_text": resume_text,
            "job_desc_text": job_desc_text
        })
    except Exception as e:
        logging.error(f"Error in upload endpoint: {str(e)}", exc_info=True)
        return jsonify({"error": f"File processing failed: {str(e)}"}), 500