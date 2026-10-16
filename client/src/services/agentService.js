import api from "./api";

export async function fetchPublicAgents() {
  const { data } = await api.get("/agents");
  return data.data || [];
}