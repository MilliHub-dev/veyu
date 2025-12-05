import { apiClient, handleApiResponse, handleApiError } from './api';

/**
 * Inspection Service
 * Handles all vehicle inspection operations according to newdoc.md Sections 7-10
 * Includes inspection management, photos, documents, and digital signatures
 */
class InspectionService {
  // ==================== 7.1 Inspection Management ====================

  /**
   * List inspections
   * @param {Object} params - Query parameters
   * @param {string} params.status - draft|in_progress|completed|signed|archived
   * @param {string} params.type - pre_purchase|pre_rental|maintenance|insurance
   * @param {string} params.vehicle_id - Filter by vehicle
   * @param {string} params.date_from - Start date
   * @param {string} params.date_to - End date
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   */
  async listInspections(params = {}) {
    try {
      const response = await apiClient.get('/inspections/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Create inspection
   * @param {Object} inspectionData - Inspection data
   */
  async createInspection(inspectionData) {
    try {
      const response = await apiClient.post('/inspections/', inspectionData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get inspection detail
   * @param {string} inspectionId - Inspection ID
   */
  async getInspectionDetail(inspectionId) {
    try {
      const response = await apiClient.get(`/inspections/${inspectionId}/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Update inspection
   * @param {string} inspectionId - Inspection ID
   * @param {Object} inspectionData - Updated inspection data
   */
  async updateInspection(inspectionId, inspectionData) {
    try {
      const response = await apiClient.put(`/inspections/${inspectionId}/`, inspectionData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Delete inspection
   * @param {string} inspectionId - Inspection ID
   */
  async deleteInspection(inspectionId) {
    try {
      const response = await apiClient.delete(`/inspections/${inspectionId}/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Complete inspection
   * @param {string} inspectionId - Inspection ID
   */
  async completeInspection(inspectionId) {
    try {
      const response = await apiClient.post(`/inspections/${inspectionId}/complete/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== 7.2 Photos ====================

  /**
   * Upload inspection photo
   * @param {string} inspectionId - Inspection ID
   * @param {Object} photoData - Photo data
   * @param {string} photoData.category - Photo category
   * @param {File} photoData.image - Image file
   * @param {string} photoData.description - Photo description
   */
  async uploadPhoto(inspectionId, photoData) {
    try {
      const formData = new FormData();
      formData.append('category', photoData.category);
      formData.append('image', photoData.image);
      if (photoData.description) {
        formData.append('description', photoData.description);
      }

      const response = await apiClient.post(
        `/inspections/${inspectionId}/photos/`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get inspection photos
   * @param {string} inspectionId - Inspection ID
   */
  async getPhotos(inspectionId) {
    try {
      const response = await apiClient.get(`/inspections/${inspectionId}/photos/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Delete inspection photo
   * @param {string} inspectionId - Inspection ID
   * @param {string} photoId - Photo ID
   */
  async deletePhoto(inspectionId, photoId) {
    try {
      const response = await apiClient.delete(`/inspections/${inspectionId}/photos/${photoId}/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== 7.3 Documents ====================

  /**
   * Generate document
   * @param {string} inspectionId - Inspection ID
   * @param {Object} options - Generation options
   * @param {string} options.template_type - standard|detailed|legal
   * @param {boolean} options.include_photos - Include photos
   * @param {boolean} options.include_recommendations - Include recommendations
   * @param {string} options.language - Language code (default: en)
   * @param {Array} options.compliance_standards - Compliance standards
   */
  async generateDocument(inspectionId, options = {}) {
    try {
      const response = await apiClient.post(
        `/inspections/${inspectionId}/generate-document/`,
        options
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get document preview
   * @param {string} documentId - Document ID
   */
  async getDocumentPreview(documentId) {
    try {
      const response = await apiClient.get(`/inspections/documents/${documentId}/preview/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Download document
   * @param {string} documentId - Document ID
   */
  async downloadDocument(documentId) {
    try {
      const response = await apiClient.get(`/inspections/documents/${documentId}/download/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Sign document
   * @param {string} documentId - Document ID
   * @param {Object} signatureData - Signature data
   * @param {Object} signatureData.signature_data - Signature details
   * @param {string} signatureData.signature_data.signature_image - Base64 signature image
   * @param {string} signatureData.signature_data.signature_method - drawn|typed|uploaded
   * @param {Object} signatureData.signature_data.coordinates - Signature coordinates
   * @param {string} signatureData.signature_field_id - Signature field ID
   */
  async signDocument(documentId, signatureData) {
    try {
      const response = await apiClient.post(
        `/inspections/documents/${documentId}/sign/`,
        signatureData
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== 7.4 Statistics & Templates ====================

  /**
   * Get inspection statistics
   * @param {Object} params - Query parameters
   */
  async getInspectionStats(params = {}) {
    try {
      const response = await apiClient.get('/inspections/stats/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get inspection templates
   */
  async getInspectionTemplates() {
    try {
      const response = await apiClient.get('/inspections/templates/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Validate inspection data
   * @param {Object} data - Inspection data to validate
   */
  async validateInspectionData(data) {
    try {
      const response = await apiClient.get('/inspections/validate/', {
        params: { data: JSON.stringify(data) },
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== 8. Digital Signatures ====================

  /**
   * Validate signature
   * @param {Object} signatureData - Signature data to validate
   */
  async validateSignature(signatureData) {
    try {
      const response = await apiClient.post('/inspections/signatures/validate/', signatureData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Check signature permission
   * @param {string} documentId - Document ID
   */
  async checkSignaturePermission(documentId) {
    try {
      const response = await apiClient.get(
        `/inspections/signatures/documents/${documentId}/permission-check/`
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get signature status
   * @param {string} documentId - Document ID
   */
  async getSignatureStatus(documentId) {
    try {
      const response = await apiClient.get(
        `/inspections/signatures/documents/${documentId}/status/`
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get signature audit trail
   * @param {string} documentId - Document ID
   */
  async getSignatureAuditTrail(documentId) {
    try {
      const response = await apiClient.get(
        `/inspections/signatures/documents/${documentId}/audit-trail/`
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Verify signature
   * @param {string} signatureId - Signature ID
   */
  async verifySignature(signatureId) {
    try {
      const response = await apiClient.post(`/inspections/signatures/${signatureId}/verify/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Resend signature notification
   * @param {string} signatureId - Signature ID
   */
  async resendSignatureNotification(signatureId) {
    try {
      const response = await apiClient.post(
        `/inspections/signatures/${signatureId}/resend-notification/`
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Reject signature
   * @param {string} signatureId - Signature ID
   * @param {string} reason - Rejection reason
   */
  async rejectSignature(signatureId, reason) {
    try {
      const response = await apiClient.post(`/inspections/signatures/${signatureId}/reject/`, {
        reason,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get bulk signature status
   * @param {Array<number>} documentIds - Array of document IDs
   */
  async getBulkSignatureStatus(documentIds) {
    try {
      const response = await apiClient.post('/inspections/signatures/bulk-status/', {
        document_ids: documentIds,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== 9. Frontend Integration APIs ====================

  /**
   * Collect inspection data (frontend helper)
   * @param {Object} inspectionData - Complete inspection data
   */
  async collectInspectionData(inspectionData) {
    try {
      const response = await apiClient.post('/inspections/frontend/collect-data/', inspectionData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Generate document preview (frontend)
   * @param {string} inspectionId - Inspection ID
   * @param {Object} options - Preview options
   */
  async generateDocumentPreview(inspectionId, options = {}) {
    try {
      const response = await apiClient.post(
        `/inspections/frontend/inspections/${inspectionId}/generate-preview/`,
        options
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Submit signature (frontend)
   * @param {string} documentId - Document ID
   * @param {Object} signatureData - Signature data
   */
  async submitSignature(documentId, signatureData) {
    try {
      const response = await apiClient.post(
        `/inspections/frontend/documents/${documentId}/submit-signature/`,
        signatureData
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Retrieve document (frontend)
   * @param {string} documentId - Document ID
   */
  async retrieveDocument(documentId) {
    try {
      const response = await apiClient.get(`/inspections/frontend/documents/${documentId}/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get inspection status (frontend)
   * @param {string} inspectionId - Inspection ID
   */
  async getInspectionStatus(inspectionId) {
    try {
      const response = await apiClient.get(
        `/inspections/frontend/inspections/${inspectionId}/status/`
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Upload photo (frontend)
   * @param {string} inspectionId - Inspection ID
   * @param {FormData} photoData - Photo form data
   */
  async uploadPhotoFrontend(inspectionId, photoData) {
    try {
      const response = await apiClient.post(
        `/inspections/frontend/inspections/${inspectionId}/upload-photo/`,
        photoData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get form schema (frontend)
   */
  async getFormSchema() {
    try {
      const response = await apiClient.get('/inspections/frontend/form-schema/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== 10. Document Management ====================

  /**
   * Check document access
   * @param {string} documentId - Document ID
   */
  async checkDocumentAccess(documentId) {
    try {
      const response = await apiClient.get(
        `/inspections/management/documents/${documentId}/access-check/`
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get version history
   * @param {string} documentId - Document ID
   */
  async getVersionHistory(documentId) {
    try {
      const response = await apiClient.get(
        `/inspections/management/documents/${documentId}/versions/`
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get document audit trail
   * @param {string} documentId - Document ID
   * @param {Object} params - Query parameters
   */
  async getDocumentAuditTrail(documentId, params = {}) {
    try {
      const response = await apiClient.get(
        `/inspections/management/documents/${documentId}/audit-trail/`,
        { params }
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Search documents
   * @param {Object} searchCriteria - Search criteria
   */
  async searchDocuments(searchCriteria) {
    try {
      const response = await apiClient.post(
        '/inspections/management/documents/search/',
        searchCriteria
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Check retention status
   * @param {string} documentId - Document ID
   */
  async checkRetentionStatus(documentId) {
    try {
      const response = await apiClient.get(
        `/inspections/management/documents/${documentId}/retention-status/`
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Archive document
   * @param {string} documentId - Document ID
   * @param {string} reason - Archive reason
   */
  async archiveDocument(documentId, reason) {
    try {
      const response = await apiClient.post(
        `/inspections/management/documents/${documentId}/archive/`,
        { reason }
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Run retention cleanup (Admin only)
   */
  async runRetentionCleanup() {
    try {
      const response = await apiClient.post('/inspections/management/documents/retention-cleanup/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Share document
   * @param {string} documentId - Document ID
   * @param {Object} shareData - Share data
   * @param {string} shareData.email - Recipient email
   * @param {string} shareData.permission_level - view|download
   * @param {number} shareData.expiry_hours - Expiry in hours
   */
  async shareDocument(documentId, shareData) {
    try {
      const response = await apiClient.post(
        `/inspections/management/documents/${documentId}/share/`,
        shareData
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * List document shares
   * @param {string} documentId - Document ID
   */
  async listDocumentShares(documentId) {
    try {
      const response = await apiClient.get(
        `/inspections/management/documents/${documentId}/shares/`
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Revoke share
   * @param {string} documentId - Document ID
   * @param {string} shareToken - Share token
   */
  async revokeShare(documentId, shareToken) {
    try {
      const response = await apiClient.post(
        `/inspections/management/documents/${documentId}/revoke-share/`,
        { share_token: shareToken }
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== Payment Integration ====================

  /**
   * Get inspection fee quote
   * @param {Object} quoteData - Quote data
   * @param {string} quoteData.inspection_type - pre_purchase|pre_rental|maintenance|insurance
   * @param {number} quoteData.vehicle_id - Vehicle ID (optional)
   */
  async getInspectionQuote(quoteData) {
    try {
      const response = await apiClient.post('/inspections/quote/', quoteData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Pay for inspection
   * @param {string} inspectionId - Inspection ID
   * @param {Object} paymentData - Payment data
   * @param {string} paymentData.payment_method - wallet|bank
   * @param {number} paymentData.amount - Amount to pay
   */
  async payForInspection(inspectionId, paymentData) {
    try {
      const response = await apiClient.post(`/inspections/${inspectionId}/pay/`, paymentData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Verify Paystack payment for inspection
   * @param {string} inspectionId - Inspection ID
   * @param {Object} verificationData - Verification data
   * @param {string} verificationData.reference - Paystack reference
   */
  async verifyInspectionPayment(inspectionId, verificationData) {
    try {
      const response = await apiClient.post(`/inspections/${inspectionId}/verify-payment/`, verificationData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== Helper Methods ====================

  // ==================== Inspection Booking (Checkout Integration) ====================

  /**
   * Book inspection during checkout
   * @param {Object} bookingData - Booking data
   * @param {string} bookingData.listing_id - Listing ID
   * @param {string} bookingData.preferred_date - Preferred date (YYYY-MM-DD)
   * @param {string} bookingData.preferred_time - Preferred time (HH:MM)
   * @param {string} bookingData.inspection_type - pre_purchase|pre_rental
   */
  async bookInspection(bookingData) {
    try {
      const response = await apiClient.post('/listings/checkout/inspection/', bookingData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get inspection slip
   * @param {string} slipReference - Slip reference number
   */
  async getInspectionSlip(slipReference) {
    try {
      const response = await apiClient.get(`/inspections/slips/${slipReference}/`);
      // Return full response to preserve success flag
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Download inspection slip as PDF
   * @param {string} slipReference - Slip reference number
   */
  async downloadInspectionSlip(slipReference) {
    try {
      const response = await apiClient.get(`/inspections/slips/${slipReference}/download/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Verify inspection slip (for dealers)
   * @param {Object} verificationData - Verification data
   * @param {string} verificationData.slip_number - Slip number to verify
   * @param {string} verificationData.qr_code_data - QR code data (alternative to slip_number)
   */
  async verifyInspectionSlip(verificationData) {
    try {
      const response = await apiClient.post('/inspections/slips/verify/', verificationData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Regenerate inspection slip
   * @param {string} inspectionId - Inspection ID
   */
  async regenerateInspectionSlip(inspectionId) {
    try {
      const response = await apiClient.post(`/inspections/${inspectionId}/regenerate-slip/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== Helper Methods ====================

  /**
   * Prepare inspection form data
   * @param {Object} inspectionData - Inspection data
   * @returns {Object} Formatted inspection data
   */
  prepareInspectionData(inspectionData) {
    return {
      vehicle: inspectionData.vehicle_id,
      inspector: inspectionData.inspector_id,
      customer: inspectionData.customer_id,
      dealer: inspectionData.dealer_id,
      inspection_type: inspectionData.inspection_type,
      exterior_data: inspectionData.exterior || {},
      interior_data: inspectionData.interior || {},
      engine_data: inspectionData.engine || {},
      mechanical_data: inspectionData.mechanical || {},
      safety_data: inspectionData.safety || {},
      inspector_notes: inspectionData.notes || '',
      recommended_actions: inspectionData.recommendations || [],
    };
  }

  /**
   * Get inspection status label
   * @param {string} status - Status code
   * @returns {string} Human-readable label
   */
  getInspectionStatusLabel(status) {
    const labels = {
      draft: 'Draft',
      in_progress: 'In Progress',
      completed: 'Completed',
      signed: 'Signed',
      archived: 'Archived',
    };
    return labels[status] || status;
  }

  /**
   * Get condition label
   * @param {string} condition - Condition code
   * @returns {string} Human-readable label
   */
  getConditionLabel(condition) {
    const labels = {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
    };
    return labels[condition] || condition;
  }

  /**
   * Get signature method label
   * @param {string} method - Signature method
   * @returns {string} Human-readable label
   */
  getSignatureMethodLabel(method) {
    const labels = {
      drawn: 'Hand Drawn',
      typed: 'Typed',
      uploaded: 'Uploaded',
    };
    return labels[method] || method;
  }
}

export default new InspectionService();
