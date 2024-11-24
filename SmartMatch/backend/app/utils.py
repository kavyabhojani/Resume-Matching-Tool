import textract

def extract_text_from_file(file):
    """
    Extracts text content from uploaded file.
    :param file: Uploaded file object
    :return: Extracted text as a string
    """
    try:
        # Save file temporarily
        file_path = f"/tmp/{file.filename}"
        file.save(file_path)

        # Extract text using textract
        text = textract.process(file_path).decode("utf-8")

        return text.strip()
    except Exception as e:
        raise RuntimeError(f"Failed to process file: {str(e)}")
