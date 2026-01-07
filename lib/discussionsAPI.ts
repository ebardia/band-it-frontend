import api from './api';

export const discussionsAPI = {
  // Get all discussions for a band
  getDiscussions: (bandId: string) => {
    return api.get(`/api/bands/${bandId}/discussions`);
  },

  // Get single discussion with comments
  getDiscussion: (bandId: string, discussionId: string) => {
    return api.get(`/api/bands/${bandId}/discussions/${discussionId}`);
  },

  // Create discussion
  createDiscussion: (bandId: string, data: { title: string; body: string }) => {
    return api.post(`/api/bands/${bandId}/discussions`, data);
  },

  // Update discussion
  updateDiscussion: (bandId: string, discussionId: string, data: { title: string; body: string }) => {
    return api.put(`/api/bands/${bandId}/discussions/${discussionId}`, data);
  },

  // Delete discussion
  deleteDiscussion: (bandId: string, discussionId: string) => {
    return api.delete(`/api/bands/${bandId}/discussions/${discussionId}`);
  },

  // Add comment
  addComment: (bandId: string, discussionId: string, data: { body: string; parentCommentId?: string }) => {
    return api.post(`/api/bands/${bandId}/discussions/${discussionId}/comments`, data);
  },

  // Update comment
  updateComment: (bandId: string, discussionId: string, commentId: string, data: { body: string }) => {
    return api.put(`/api/bands/${bandId}/discussions/${discussionId}/comments/${commentId}`, data);
  },

  // Delete comment
  deleteComment: (bandId: string, discussionId: string, commentId: string) => {
    return api.delete(`/api/bands/${bandId}/discussions/${discussionId}/comments/${commentId}`);
  },
};