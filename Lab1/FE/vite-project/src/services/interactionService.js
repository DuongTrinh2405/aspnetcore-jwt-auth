import api from "./api";

// ==============================
// GET ALL (có paging)
// ==============================
export const getInteractions = (page = 1, pageSize = 10) => {
  return api.get(`/interactions?page=${page}&pageSize=${pageSize}`);
};

// ==============================
// GET BY ID
// ==============================
export const getInteractionById = (id) => {
  return api.get(`/interactions/${id}`);
};

// ==============================
// GET BY CUSTOMER
// ==============================
export const getInteractionsByCustomer = (customerId, page = 1, pageSize = 10) => {
  return api.get(
    `/interactions/customer/${customerId}?page=${page}&pageSize=${pageSize}`
  );
};

// ==============================
// GET BY PROPERTY
// ==============================
export const getInteractionsByProperty = (propertyId, page = 1, pageSize = 10) => {
  return api.get(
    `/interactions/property/${propertyId}?page=${page}&pageSize=${pageSize}`
  );
};

// ==============================
// CREATE
// ==============================
export const createInteraction = (data) => {
  return api.post("/interactions", data);
};

// ==============================
// UPDATE
// ==============================
export const updateInteraction = (id, data) => {
  return api.put(`/interactions/${id}`, data);
};

// ==============================
// DELETE
// ==============================
export const deleteInteraction = (id) => {
  return api.delete(`/interactions/${id}`);
};