import { useEffect } from "react";

const COGNITO_DOMAIN = "https://your-domain.auth.us-east-1.amazoncognito.com";
const CLIENT_ID = "xxxxxxxx"; 
const REDIRECT_URI = "http://localhost:3000/";

export function useAuth() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: CLIENT_ID,
          code,
          redirect_uri: REDIRECT_URI,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.id_token) {
            localStorage.setItem("id_token", data.id_token);
            localStorage.setItem("access_token", data.access_token);
            if (data.refresh_token) {
              localStorage.setItem("refresh_token", data.refresh_token);
            }
            window.history.replaceState({}, document.title, REDIRECT_URI);
          }
        })
        .catch((err) => console.error("Token exchange error", err));
    }
  }, []);
}
