from app import create_app
from app.routes import routes  # Import the blueprint from routes.py
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create the app
app = create_app()

# Register the routes blueprint
app.register_blueprint(routes)

# Run the app
if __name__ == "__main__":
    app.run(debug=True)
