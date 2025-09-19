from flask import Flask, redirect, url_for, session
from authlib.integrations.flask_client import OAuth
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)  # secure random key for sessions

# --- Configure OAuth with Cognito ---
oauth = OAuth(app)
oauth.register(
    name='oidc',
    authority='https://cognito-idp.us-east-1.amazonaws.com/us-east-1_klc8vjxFF',  # <-- replace with your pool ID
    client_id='415dmo02sq91e5c89guoc71kcp',  # <-- replace with your App Client ID
    client_secret='YOUR_CLIENT_SECRET',      # <-- replace with your App Client Secret
    server_metadata_url='https://cognito-idp.us-east-1.amazonaws.com/us-east-1_klc8vjxFF/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email phone profile'
    }
)

# --- Home page ---
@app.route('/')
def index():
    user = session.get('user')
    if user:
        return f"Hello, {user['email']}! <a href='/logout'>Logout</a>"
    return "Welcome! Please <a href='/login'>Login</a>"

# --- Login route ---
@app.route('/login')
def login():
    # redirect_uri must match one of your Allowed Callback URLs in Cognito
    redirect_uri = url_for('authorize', _external=True)
    return oauth.oidc.authorize_redirect(redirect_uri)

# --- Authorization callback ---
@app.route('/authorize')
def authorize():
    token = oauth.oidc.authorize_access_token()
    user = token['userinfo']   # fetch user claims from Cognito
    session['user'] = user
    return redirect(url_for('index'))

# --- Logout ---
@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
