import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    bio?: string;
    location?: string;
    timezone?: string;
    skills?: Array<{ name: string; level: string }>;
    passions?: string[];
    wantsToLearn?: string[];
    hoursPerWeek?: number;
    remoteOnly?: boolean;
    profileVisibility?: string;
  }) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  fbandotPassword: async (email: string) => {
    const response = await api.post('/api/auth/fbandot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/api/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

// Bandanizations API
export const bandsAPI = {
  create: async (data: {
    name: string;
    slug: string;
    description?: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    country: string;
    isPublic?: boolean;
    shortDescription?: string;
    tags?: string[];
  }) => {
    const response = await api.post('/api/bands', data);
    return response.data;
  },

  getUserBands: async () => {
    const response = await api.get('/api/bands/my-bands');
    return response.data;
  },

  getBand: async (bandId: string) => {
    const response = await api.get(`/api/bands/${bandId}`);
    return response.data;
  },

  updateProfile: async (bandId: string, data: {
    tagline?: string;
    fullDescription?: string;
    coreValues?: any;
    decisionGuidelines?: string;
    inclusionStatement?: string;
    membershipPolicy?: string;
  }) => {
    const response = await api.put(`/api/bands/${bandId}/profile`, data);
    return response.data;
  },
};

// Proposals API
export const proposalsAPI = {
  create: async (bandId: string, data: {
    title: string;
    objective: string;
    description: string;
    rationale: string;
    successCriteria: string;
    financialRequest?: number;
    budgetBreakdown?: any;
    votingPeriodHours?: number;
  }) => {
    const response = await api.post(`/api/bands/${bandId}/proposals`, data);
    return response.data;
  },

  getProposals: async (bandId: string, state?: string) => {
    const url = state 
      ? `/api/bands/${bandId}/proposals?state=${state}`
      : `/api/bands/${bandId}/proposals`;
    const response = await api.get(url);
    return response.data;
  },

  getProposal: async (bandId: string, proposalId: string) => {
    const response = await api.get(`/api/bands/${bandId}/proposals/${proposalId}`);
    return response.data;
  },

  submit: async (bandId: string, proposalId: string) => {
    const response = await api.post(`/api/bands/${bandId}/proposals/${proposalId}/submit`);
    return response.data;
  },

  review: async (bandId: string, proposalId: string, action: 'approve' | 'request_changes', feedback: string) => {
    const response = await api.post(`/api/bands/${bandId}/proposals/${proposalId}/review`, {
      action,
      feedback,
    });
    return response.data;
  },

  vote: async (bandId: string, proposalId: string, vote: 'approve' | 'reject' | 'abstain', comment?: string) => {
    const response = await api.post(`/api/bands/${bandId}/proposals/${proposalId}/vote`, {
      vote,
      comment,
    });
    return response.data;
  },

  finalize: async (bandId: string, proposalId: string) => {
    const response = await api.post(`/api/bands/${bandId}/proposals/${proposalId}/finalize`);
    return response.data;
  },
};

// Projects API
export const projectsAPI = {
  create: async (bandId: string, data: {
    proposalId: string;
    name: string;
    description?: string;
    startDate?: string;
    targetDate?: string;
  }) => {
    const response = await api.post(`/api/bands/${bandId}/projects`, data);
    return response.data;
  },

  getProjects: async (bandId: string, status?: string) => {
    const url = status 
      ? `/api/bands/${bandId}/projects?status=${status}`
      : `/api/bands/${bandId}/projects`;
    const response = await api.get(url);
    return response.data;
  },

  getProject: async (bandId: string, projectId: string) => {
    const response = await api.get(`/api/bands/${bandId}/projects/${projectId}`);
    return response.data;
  },

  update: async (bandId: string, projectId: string, data: any) => {
    const response = await api.put(`/api/bands/${bandId}/projects/${projectId}`, data);
    return response.data;
  },

  delete: async (bandId: string, projectId: string) => {
    const response = await api.delete(`/api/bands/${bandId}/projects/${projectId}`);
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  create: async (bandId: string, projectId: string, data: {
    title: string;
    description?: string;
    priority?: string;
    assignedTo?: string;
    dueDate?: string;
  }) => {
    const response = await api.post(`/api/bands/${bandId}/projects/${projectId}/tasks`, data);
    return response.data;
  },

  getTasks: async (bandId: string, projectId: string, status?: string) => {
    const url = status 
      ? `/api/bands/${bandId}/projects/${projectId}/tasks?status=${status}`
      : `/api/bands/${bandId}/projects/${projectId}/tasks`;
    const response = await api.get(url);
    return response.data;
  },

  getTask: async (bandId: string, projectId: string, taskId: string) => {
    const response = await api.get(`/api/bands/${bandId}/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  },

  update: async (bandId: string, projectId: string, taskId: string, data: any) => {
    const response = await api.put(`/api/bands/${bandId}/projects/${projectId}/tasks/${taskId}`, data);
    return response.data;
  },

  complete: async (bandId: string, projectId: string, taskId: string) => {
    const response = await api.post(`/api/bands/${bandId}/projects/${projectId}/tasks/${taskId}/complete`);
    return response.data;
  },

  delete: async (bandId: string, projectId: string, taskId: string) => {
    const response = await api.delete(`/api/bands/${bandId}/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  },
};

// Captain's Log API
export const captainsLogAPI = {
  getLog: async (
    bandId: string, 
    filters?: {
      entityType?: string;
      actorId?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }
  ) => {
    const params = new URLSearchParams();
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.actorId) params.append('actorId', filters.actorId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const response = await api.get(`/api/bands/${bandId}/captains-log?${params.toString()}`);
    return response.data;
  },

  getEntry: async (bandId: string, entryId: string) => {
    const response = await api.get(`/api/bands/${bandId}/captains-log/${entryId}`);
    return response.data;
  },
};

// AI API
export const aiAPI = {
  generateProposal: async (idea: string, bandId: string, bandContext?: string) => {
    const response = await api.post('/api/ai/generate-proposal', {
      idea,
      bandId,
      bandContext,
    });
    return response.data;
  },

  getBandUsage: async (bandId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/api/ai/bands/${bandId}/usage?${params.toString()}`);
    return response.data;
  },

  generateProfile: async (description: string, bandId: string) => {
    const response = await api.post('/api/ai/generate-profile', {
      description,
      bandId,
    });
    return response.data;
  },
};

// Upload API
export const uploadAPI = {
  uploadImage: async (bandId: string, file: File, title?: string, description?: string) => {
    const formData = new FormData();
    formData.append('image', file);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);

    const response = await api.post(`/api/bands/${bandId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getBandImages: async (bandId: string) => {
    const response = await api.get(`/api/bands/${bandId}/images`);
    return response.data;
  },

  deleteImage: async (bandId: string, imageId: string) => {
    const response = await api.delete(`/api/bands/${bandId}/images/${imageId}`);
    return response.data;
  },

  uploadDocument: async (bandId: string, file: File, title: string, description?: string) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', title);
    if (description) formData.append('description', description);

    const response = await api.post(`/api/bands/${bandId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getBandDocuments: async (bandId: string) => {
    const response = await api.get(`/api/bands/${bandId}/documents`);
    return response.data;
  },

  deleteDocument: async (bandId: string, documentId: string) => {
    const response = await api.delete(`/api/bands/${bandId}/documents/${documentId}`);
    return response.data;
  },
};

export default api;