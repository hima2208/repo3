import jwtDecode from "jwt-decode";

export interface CognitoIdToken {
  sub: string;
  email?: string;
  "cognito:username"?: string;
  given_name?: string;
  family_name?: string;
  "cognito:groups"?: string[];
  [key: string]: any;
}

export function decodeIdToken(): CognitoIdToken | null {
  const token = localStorage.getItem("id_token");
  if (!token) return null;

  try {
    return jwtDecode<CognitoIdToken>(token);
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
}
