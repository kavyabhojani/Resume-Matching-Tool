import tempfile
import os
from werkzeug.utils import secure_filename
import logging
from PyPDF2 import PdfReader
from pathlib import Path

def extract_text_from_file(file):
    """
    Extracts text content from uploaded file.
    :param file: Uploaded file object
    :return: Extracted text as a string
    """
    if not file or not file.filename:
        raise ValueError("No file provided")

    logging.info(f"Processing file: {file.filename}")

    try:
        # Get file extension
        file_ext = os.path.splitext(file.filename)[1].lower()

        # Create a temporary file
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = os.path.join(temp_dir, secure_filename(file.filename))
            file.save(temp_path)

            # Process based on file type
            if file_ext == '.pdf':
                # Handle PDF files
                reader = PdfReader(temp_path)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            elif file_ext == '.txt':
                # Handle text files
                with open(temp_path, 'r', encoding='utf-8') as f:
                    text = f.read()
            else:
                raise ValueError(f"Unsupported file type: {file_ext}")

            return text.strip()
            
    except Exception as e:
        logging.error(f"Error in extract_text_from_file: {str(e)}", exc_info=True)
        raise RuntimeError(f"Failed to process file {file.filename}: {str(e)}")