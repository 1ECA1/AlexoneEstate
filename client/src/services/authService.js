
import api from "./api";

// Turns an Axios error into a message safe to show the user.
export function getErrorMessage(
  error,
  fallback = "Something went wrong. Please try again."
) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.request) {
    return "Unable to connect to HavenEstate. Check that the backend server is running.";
  }

  return fallback;
}

export async function loginUser(credentials) {
  const { data } = await api.post("/auth/login", credentials);
  return data;
}

export async function registerUser(details) {
  const { data } = await api.post("/auth/register", details);
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data.user;
}

export async function verifyEmail(token) {
  const { data } = await api.get("/auth/verify-email", {
    params: { token },
  });
  return data;
}

export async function resendVerification(email) {
  const { data } = await api.post("/auth/resend-verification", {
    email,
  });
  return data;
}

export async function requestPasswordReset(email) {
  const { data } = await api.post("/auth/forgot-password", {
    email,
  });
  return data;
}

export async function resetPassword(token, password) {
  const { data } = await api.post("/auth/reset-password", {
    token,
    password,
  });
  return data;
}
