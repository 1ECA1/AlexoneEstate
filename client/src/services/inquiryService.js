
import api from "./api";

export async function createPropertyInquiry(propertyId, payload) {
  const { data } = await api.post(
    `/inquiries/property/${propertyId}`,
    payload
  );

  return data.data;
}

export async function fetchMyInquiries() {
  const { data } = await api.get("/inquiries/customer");
  return data.data;
}

export async function fetchAgentInquiries() {
  const { data } = await api.get("/inquiries/agent");
  return data.data;
}

export async function respondToInquiry(id, payload) {
  const { data } = await api.patch(
    `/inquiries/agent/${id}`,
    payload
  );

  return data.data;
}
