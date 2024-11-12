from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_mail import Mail, Message
from flask_uploads import UploadSet, configure_uploads, IMAGES, DOCUMENTS
from flask_cors import CORS
import logging
import os

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure app using environment variables
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your_secret_key')
app.config['UPLOADS_DEFAULT_DEST'] = '/app/uploads/'
app.config['UPLOADED_FILES_DEST'] = '/app/uploads/'
app.config['UPLOADED_FILES_ALLOW'] = IMAGES + ('mp4', 'avi', 'mkv')
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true'
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')

# Initialize extensions
mail = Mail(app)
files = UploadSet('files')
configure_uploads(app, files)

import json  # Import json for parsing JSON data

@app.route('/submit', methods=['POST'])
def submit():
    # Get form data
    name = request.form.get('name')
    surname = request.form.get('surname')
    email = request.form.get('email')
    phone = request.form.get('phone')
    message = request.form.get('message')
    
    # Parse category data
    categories_json = request.form.get('categories')  # Categories data as a JSON string
    try:
        categories = json.loads(categories_json) if categories_json else []
    except json.JSONDecodeError:
        app.logger.error("Invalid JSON format for categories")
        categories = []

    # Format category data for email
    category_details = ""
    for category in categories:
        category_details += f"\nCategory: {category['category']}\n"
        for item in category['items']:
            category_details += f"  - {item['name']}: {item['count']}\n"

    # Handle file uploads
    uploaded_files = request.files.getlist('files')
    saved_files = []
    for file in uploaded_files:
        if file and files.file_allowed(file, file.filename):
            filename = files.save(file)
            file_path = os.path.join(app.config['UPLOADS_DEFAULT_DEST'], filename)
            saved_files.append(filename)
            app.logger.debug(f"File saved at {file_path}")
        else:
            app.logger.debug("File not allowed or not present")

    # Prepare email with form data and categories
    msg = Message('New Form Submission', recipients=[os.environ.get('MAIL_USERNAME')])
    msg.body = (
        f"Name: {name}\n"
        f"Surname: {surname}\n"
        f"Email: {email}\n"
        f"Phone: {phone}\n"
        f"Message: {message}\n"
        f"\nCategory Details:\n{category_details}"
    )

    # Attach files with error handling
    for filename in saved_files:
        file_path = os.path.join(app.config['UPLOADS_DEFAULT_DEST'], filename)
        app.logger.debug(f"Looking for file at: {file_path}")
        if os.path.exists(file_path):
            with app.open_resource(file_path) as fp:
                msg.attach(filename, 'application/octet-stream', fp.read())
        else:
            app.logger.error(f"File {filename} not found at {file_path}")

    mail.send(msg)
    return jsonify(status="success", message="Form submitted successfully")

    return jsonify(status="success", message="Form submitted successfully")



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
