
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/public/Home";
import Properties from "./pages/public/Properties";
import PropertyDetails from "./pages/public/PropertyDetails";
import Agents from "./pages/public/Agents";
import About from "./pages/public/About";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import ProtectedRoute from "./routes/ProtectedRoute";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PropertyForm from "./pages/agent/PropertyForm";

import { FavoritesProvider } from "./context/FavoritesContext";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import Favorites from "./pages/customer/Favorites";
import CustomerProfile from "./pages/customer/CustomerProfile";
import CustomerInquiries from "./pages/customer/CustomerInquiries";

function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#faf9f6] px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-[#a17b38]">
        404 — Page not found
      </p>

      <h1 className="text-4xl font-bold text-[#20251f]">
        This page doesn't exist yet.
      </h1>

      <Link
        to="/"
        className="rounded-full bg-[#20251f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#343b32]"
      >
        Return home
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <FavoritesProvider>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/about" element={<About />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Customer-only pages */}
          <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/customer/favorites" element={<Favorites />} />
            <Route path="/customer/profile" element={<CustomerProfile />} />
            <Route path="/customer/inquiries" element={<CustomerInquiries />} />
          </Route>

          {/* Agent-only pages */}
          <Route element={<ProtectedRoute allowedRoles={["agent"]} />}>
            <Route path="/agent" element={<AgentDashboard />} />
            <Route
              path="/agent/properties/add"
              element={<PropertyForm />}
            />
            <Route
              path="/agent/properties/:id/edit"
              element={<PropertyForm />}
            />
          </Route>

          {/* Admin-only pages */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route
              path="/admin/properties/add"
              element={<PropertyForm />}
            />
            <Route
              path="/admin/properties/:id/edit"
              element={<PropertyForm />}
            />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </FavoritesProvider>
    </BrowserRouter>
  );
}
