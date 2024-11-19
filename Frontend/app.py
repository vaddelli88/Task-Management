from flask import Flask, request, jsonify, render_template, redirect, url_for, send_from_directory, session
from flask_cors import CORS
import os

app = Flask(__name__, 
    static_folder='static',
    template_folder='templates'
)
CORS(app)

# Add a secret key for session management
app.secret_key = 'your-secret-key-here'  # Change this to a secure random key

# Add this route to serve static files
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/login')
def login():
    return render_template('login.html')

# Update the dashboard route to handle username
@app.route('/<username>')
def user_dashboard(username):
    # You might want to add some validation here
    return render_template('user_dashboard.html', username=username)

# Add a logout route
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# Add an error handler for 404
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)