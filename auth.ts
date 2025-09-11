const COGNITO_DOMAIN = "https://your-domain.auth.us-east-1.amazoncognito.com";
const CLIENT_ID = "xxxxxxxx"; // replace with your App Client ID
const REDIRECT_URI = "http://localhost:3000/";

export function login() {
  window.location.href =
    `${COGNITO_DOMAIN}/oauth2/authorize?response_type=code` +
    `&client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=openid+email+profile`;
}

export function logout() {
  localStorage.clear();
  window.location.href =
    `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(REDIRECT_URI)}`;
}
