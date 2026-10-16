import api from "./api";
import { normalizeProperty } from "../utils/normalizeProperty";

export async function fetchAdminProperties() {
  const { data } = await api.get("/admin/properties");
  return data.data.map(normalizeProperty);
}

export async function setPropertyApproval(id, approvalStatus) {
  const { data } = await api.patch(`/properties/${id}/approval`, {
    approvalStatus,
  });
  return normalizeProperty(data.data);
}

export async function fetchUsers() {
  const { data } = await api.get("/admin/users");
  return data.data;
}

export async function setUserActive(id, isActive) {
  const { data } = await api.patch(`/admin/users/${id}/status`, { isActive });
  return data.data;
}

// Fetch all property inquiries for the admin dashboard.
export async function fetchAdminInquiries() {
  const { data } = await api.get("/inquiries/admin");
  return data.data;
}

// Save an admin reply and/or update the inquiry status.
export async function respondToInquiryAsAdmin(id, updates) {
  const { data } = await api.patch(`/inquiries/admin/${id}`, updates);
  return data.data;
}