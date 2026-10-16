import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Wrap routes with this to require login, and optionally certain roles.
// Example: <ProtectedRoute allowedRoles={["agent", "admin"]} />
export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading, isLoggedIn } = useAuth();
  const location = useLocation();

  // We are still checking a saved login with the server. Do not redirect yet,
  // or a refresh would always bounce a logged-in user to the login page.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f6] text-sm text-stone-500">
        Checking your session...
      </div>
    );
  }

  // Not logged in: go to login, and remember where they were heading
  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  // Logged in, but the wrong role for this page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}