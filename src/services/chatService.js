import { apiClient, handleApiResponse, handleApiError } from './api';

class ChatService {
  // Get all conversations
  async getConversations(params = {}) {
    try {
      const response = await apiClient.get('/chat/conversations/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get messages for a conversation
  async getMessages(conversationId, params = {}) {
    try {
      const response = await apiClient.get(`/chat/conversations/${conversationId}/messages/`, { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Send a text message
  async sendMessage(conversationId, message, metadata = {}, replyTo = null, temporaryId = null) {
    try {
      const response = await apiClient.post('/chat/messages/', {
        conversation_id: conversationId,
        message,
        type: 'text',
        metadata,
        reply_to: replyTo,
        temporary_id: temporaryId,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Send media message
  async sendMediaMessage(conversationId, file, type = 'image', caption = '') {
    try {
      const formData = new FormData();
      formData.append('conversation_id', conversationId);
      formData.append('type', type);
      formData.append('file', file);
      formData.append('caption', caption);

      const response = await apiClient.post('/chat/messages/media/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId, messageIds) {
    try {
      const response = await apiClient.post('/chat/messages/mark-read/', {
        conversation_id: conversationId,
        message_ids: messageIds,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Send typing indicator
  async sendTypingIndicator(conversationId, isTyping) {
    try {
      const response = await apiClient.post('/chat/typing/', {
        conversation_id: conversationId,
        is_typing: isTyping,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // WebSocket connection helper
  getWebSocketUrl(token) {
    return `wss://dev.veyu.cc/ws/chat/?token=${token}`;
  }
}

export default new ChatService();