import { apiClient, handleApiResponse, handleApiError } from './api';

class ChatService {
  // Get all conversations (updated per newdoc.md)
  async getConversations(params = {}) {
    try {
      const response = await apiClient.get('/chat/chats/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get messages for a chat room (updated per newdoc.md)
  async getMessages(roomId, params = {}) {
    try {
      const response = await apiClient.get(`/chat/chats/${roomId}/`, { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Send a message (updated per newdoc.md)
  async sendMessage(roomId, content, messageType = 'text', attachmentUrl = null) {
    try {
      const response = await apiClient.post('/chat/message/', {
        room_id: roomId,
        content,
        message_type: messageType,
        attachment_url: attachmentUrl,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Create new chat (added per newdoc.md)
  async createNewChat(recipientId, initialMessage = '') {
    try {
      const response = await apiClient.post('/chat/new/', {
        recipient_id: recipientId,
        initial_message: initialMessage,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Mark messages as read (added per newdoc.md)
  async markMessagesAsRead(roomId, messageIds = []) {
    try {
      const response = await apiClient.post('/chat/messages/mark-read/', {
        room_id: roomId,
        message_ids: messageIds,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Send typing indicator
  async sendTypingIndicator(roomId, isTyping) {
    try {
      const response = await apiClient.post('/chat/typing/', {
        room_id: roomId,
        is_typing: isTyping,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // WebSocket connection helper
  getWebSocketUrl(token) {
    return `wss://dev.veyu.autos/ws/chat/?token=${token}`;
  }
}

export default new ChatService();