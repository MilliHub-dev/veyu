import { apiClient } from './api';

const supportService = {
  // Tickets
  async listTickets(params = {}) {
    const response = await apiClient.get('/support/tickets/', { params });
    return response.data;
  },

  async createTicket(data) {
    const response = await apiClient.post('/support/tickets/', data);
    return response.data;
  },

  async getTicket(id) {
    const response = await apiClient.get(`/support/tickets/${id}/`);
    return response.data;
  },

  async updateTicket(id, data) {
    const response = await apiClient.patch(`/support/tickets/${id}/`, data);
    return response.data;
  },

  async deleteTicket(id) {
    const response = await apiClient.delete(`/support/tickets/${id}/`);
    return response.data;
  },

  async assignStaff(ticketId, staffIds) {
    const response = await apiClient.post(`/support/tickets/${ticketId}/assign_staff/`, {
      staff_ids: staffIds
    });
    return response.data;
  },

  async removeStaff(ticketId, staffIds) {
    const response = await apiClient.post(`/support/tickets/${ticketId}/remove_staff/`, {
      staff_ids: staffIds
    });
    return response.data;
  },

  // Tags
  async listTags() {
    const response = await apiClient.get('/support/tags/');
    return response.data;
  },

  async createTag(name) {
    const response = await apiClient.post('/support/tags/create/', { name });
    return response.data;
  },

  // Categories
  async listCategories() {
    const response = await apiClient.get('/support/categories/');
    return response.data;
  },

  async createCategory(name) {
    const response = await apiClient.post('/support/categories/create/', { name });
    return response.data;
  },

  // Statistics
  async getStats() {
    const response = await apiClient.get('/support/stats/');
    return response.data;
  }
};

export default supportService;
