import { apiClient, handleApiResponse, handleApiError } from './api';

class OrderService {
  // Get all orders (dealer/admin)
  async getOrders(params = {}) {
    try {
      const response = await apiClient.get('/admin/dealership/orders/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get single order details
  async getOrderById(orderId) {
    try {
      const response = await apiClient.get(`/admin/dealership/orders/${orderId}/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get customer's orders
  async getMyOrders(params = {}) {
    try {
      const response = await apiClient.get('/listings/my-orders/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get single order (customer view)
  async getMyOrderById(orderId) {
    try {
      const response = await apiClient.get(`/listings/my-orders/${orderId}/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      const response = await apiClient.patch(`/admin/dealership/orders/${orderId}/`, {
        order_status: status
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Complete order
  async completeOrder(orderId) {
    try {
      const response = await apiClient.post(`/admin/dealership/orders/${orderId}/complete/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Cancel order (POST method - for dealers/admin)
  async cancelOrder(orderId, reason = '') {
    try {
      const response = await apiClient.post(`/admin/dealership/orders/${orderId}/cancel/`, {
        reason
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Delete/Cancel order (DELETE method - for customers)
  async deleteOrder(orderId) {
    try {
      const response = await apiClient.delete(`/listings/orders/${orderId}/cancel/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Pay remaining balance (for pay-after-inspection orders)
  async payRemainingBalance(orderId, paymentMethod, paymentReference = null) {
    try {
      const response = await apiClient.post(`/orders/${orderId}/pay-balance/`, {
        payment_method: paymentMethod,
        payment_reference: paymentReference
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Verify balance payment
  async verifyBalancePayment(orderId, reference) {
    try {
      const response = await apiClient.post(`/orders/${orderId}/verify-balance-payment/`, {
        reference
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get order statistics (dealer/admin)
  async getOrderStatistics(params = {}) {
    try {
      const response = await apiClient.get('/admin/dealership/orders/statistics/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Export orders to CSV
  async exportOrders(params = {}) {
    try {
      const response = await apiClient.get('/admin/dealership/orders/export/', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get order timeline/history
  async getOrderTimeline(orderId) {
    try {
      const response = await apiClient.get(`/orders/${orderId}/timeline/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Add note to order
  async addOrderNote(orderId, note) {
    try {
      const response = await apiClient.post(`/admin/dealership/orders/${orderId}/notes/`, {
        note
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Contact customer about order
  async contactCustomer(orderId, message, contactMethod = 'email') {
    try {
      const response = await apiClient.post(`/admin/dealership/orders/${orderId}/contact/`, {
        message,
        contact_method: contactMethod
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get order invoice
  async getOrderInvoice(orderId) {
    try {
      const response = await apiClient.get(`/orders/${orderId}/invoice/`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  // Download order invoice
  async downloadOrderInvoice(orderId) {
    try {
      const blob = await this.getOrderInvoice(orderId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order_${orderId}_invoice.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      throw error;
    }
  }

  // ==================== Inspection-Based Order Creation ====================

  /**
   * Create order after inspection payment
   * @param {Object} orderData - Order data
   * @param {string} orderData.inspection_id - Inspection ID (required)
   * @param {string} orderData.listing_id - Listing ID (required)
   * @param {string} orderData.delivery_address - Delivery address
   * @param {string} orderData.delivery_date - Preferred delivery date
   * @param {string} orderData.notes - Additional notes
   */
  async createOrderFromInspection(orderData) {
    try {
      const response = await apiClient.post('/listings/orders/', orderData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get inspection status for order creation
   * @param {string} inspectionId - Inspection ID
   */
  async getInspectionOrderStatus(inspectionId) {
    try {
      const response = await apiClient.get(`/inspections/${inspectionId}/order-status/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== Inspection Document Generation ====================

  /**
   * Generate inspection document after order creation
   * @param {string} orderId - Order ID
   * @param {Object} options - Document generation options
   */
  async generateInspectionDocument(orderId, options = {}) {
    try {
      const response = await apiClient.post(`/orders/${orderId}/generate-inspection-document/`, options);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get inspection document for order
   * @param {string} orderId - Order ID
   */
  async getOrderInspectionDocument(orderId) {
    try {
      const response = await apiClient.get(`/orders/${orderId}/inspection-document/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Download inspection document
   * @param {string} documentId - Document ID
   */
  async downloadInspectionDocument(documentId) {
    try {
      const response = await apiClient.get(`/inspections/documents/${documentId}/download/`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get inspection document preview
   * @param {string} documentId - Document ID
   */
  async getInspectionDocumentPreview(documentId) {
    try {
      const response = await apiClient.get(`/inspections/documents/${documentId}/preview/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }
}

export default new OrderService();
