import api from "./api";
import { normalizeProperty } from "../utils/normalizeProperty";

export async function fetchProperties() {
  const { data } = await api.get("/properties");
  return data.data.map(normalizeProperty);
}

export async function fetchPropertyById(id) {
  const { data } = await api.get(`/properties/${id}`);
  return normalizeProperty(data.data);
}

export async function fetchMyProperties() {
  const { data } = await api.get("/properties/my-listings");
  return data.data.map(normalizeProperty);
}

export async function createProperty(propertyData) {
  const { data } = await api.post("/properties", propertyData);
  return normalizeProperty(data.data);
}

export async function updateProperty(id, propertyData) {
  const { data } = await api.put(`/properties/${id}`, propertyData);
  return normalizeProperty(data.data);
}

export async function deleteProperty(id) {
  const { data } = await api.delete(`/properties/${id}`);
  return data;
}

export async function uploadPropertyImages(files) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  const { data } = await api.post("/uploads/properties", formData);

  return data.images;
}