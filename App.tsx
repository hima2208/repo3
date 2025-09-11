import React, { useEffect } from "react";
import { Button, Box, Paper, Typography } from "@mui/material";
import jwtDecode from "jwt-decode";

// --- Cognito config ---
const COGNITO_DOMAIN = "https://your-domain.auth.us-east-1.amazoncognito.com";
const CLIENT_ID = "xxxxxxxx"; // replace with your App Client ID
const REDIRECT_URI = "http://localhost:3000/";

// --- Types for JWT ---
interface CognitoIdToken {
  sub: string;
  email?: string;
  "cognito:username"?: string;
  given_name?: string;
  family_name?: string;
  "cognito:groups"?: string[];
  [key: string]: any;
}

// --- Login / Logout ---
function login() {
  window.location.href =
    `${COGNITO_DOMAIN}/oauth2/authorize?response_type=code` +
    `&client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=openid+email+profile`;
}

function logout() {
  localStorage.clear();
  window.location.href =
    `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(REDIRECT_URI)}`;
}

// --- Token exchange + decode ---
function useAuth() {
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

function decodeIdToken(): CognitoIdToken | null {
  const token = localStorage.getItem("id_token");
  if (!token) return null;
  try {
    return jwtDecode<CognitoIdToken>(token);
  } catch {
    return null;
  }
}

// --- Main App ---
function App() {
  useAuth();
  const idToken = localStorage.getItem("id_token");
  const user = decodeIdToken();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
      }}
    >
      <Paper
        elevation={3}
        sx={{ p: 4, width: 400, borderRadius: "16px", textAlign: "center" }}
      >
        {!idToken ? (
          <>
            <Typography variant="h5" gutterBottom>
              Welcome 👋
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please sign in to continue
            </Typography>
            <Button fullWidth variant="contained" color="primary" onClick={login}>
              Login with Cognito
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Welcome, {user?.given_name || user?.["cognito:username"]}
            </Typography>
            {user?.email && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {user.email}
              </Typography>
            )}
            <Button fullWidth variant="outlined" color="secondary" onClick={logout}>
              Logout
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default App;
