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
    return "Unable to connect to RealEstateConsultDesign. Check that the backend server is running.";
  }

  return fallback;
}

// Login
export async function loginUser(credentials) {
  const { data } = await api.post("/auth/login", credentials);
  return data;
}

// Register without email verification
export async function registerUser(details) {
  const { data } = await api.post("/auth/register", details);
  return data;
}

// Fetch the currently authenticated user
export async function fetchCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data.user;
}

// Request a password reset
export async function requestPasswordReset(email) {
  const { data } = await api.post("/auth/forgot-password", {
    email,
  });
  return data;
}

// Reset password using the reset token
export async function resetPassword(token, password) {
  const { data } = await api.post("/auth/reset-password", {
    token,
    password,
  });
  return data;
}