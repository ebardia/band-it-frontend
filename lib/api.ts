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

  forgotPassword: async (email: string) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/api/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

// Organizations API
export const organizationsAPI = {
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
    const response = await api.post('/api/organizations', data);
    return response.data;
  },

  getUserOrgs: async () => {
    const response = await api.get('/api/organizations/my-organizations');
    return response.data;
  },

  getOrg: async (orgId: string) => {
    const response = await api.get(`/api/organizations/${orgId}`);
    return response.data;
  },
};

// Proposals API
export const proposalsAPI = {
  create: async (orgId: string, data: {
    title: string;
    objective: string;
    description: string;
    rationale: string;
    successCriteria: string;
    financialRequest?: number;
    budgetBreakdown?: any;
    votingPeriodHours?: number;
  }) => {
    const response = await api.post(`/api/organizations/${orgId}/proposals`, data);
    return response.data;
  },

  getProposals: async (orgId: string, state?: string) => {
    const url = state 
      ? `/api/organizations/${orgId}/proposals?state=${state}`
      : `/api/organizations/${orgId}/proposals`;
    const response = await api.get(url);
    return response.data;
  },

  getProposal: async (orgId: string, proposalId: string) => {
    const response = await api.get(`/api/organizations/${orgId}/proposals/${proposalId}`);
    return response.data;
  },

  submit: async (orgId: string, proposalId: string) => {
    const response = await api.post(`/api/organizations/${orgId}/proposals/${proposalId}/submit`);
    return response.data;
  },

  review: async (orgId: string, proposalId: string, action: 'approve' | 'request_changes', feedback: string) => {
    const response = await api.post(`/api/organizations/${orgId}/proposals/${proposalId}/review`, {
      action,
      feedback,
    });
    return response.data;
  },

  vote: async (orgId: string, proposalId: string, vote: 'approve' | 'reject' | 'abstain', comment?: string) => {
    const response = await api.post(`/api/organizations/${orgId}/proposals/${proposalId}/vote`, {
      vote,
      comment,
    });
    return response.data;
  },

  finalize: async (orgId: string, proposalId: string) => {
    const response = await api.post(`/api/organizations/${orgId}/proposals/${proposalId}/finalize`);
    return response.data;
  },
};

// Projects API
export const projectsAPI = {
  create: async (orgId: string, data: {
    proposalId: string;
    name: string;
    description?: string;
    startDate?: string;
    targetDate?: string;
  }) => {
    const response = await api.post(`/api/organizations/${orgId}/projects`, data);
    return response.data;
  },

  getProjects: async (orgId: string, status?: string) => {
    const url = status 
      ? `/api/organizations/${orgId}/projects?status=${status}`
      : `/api/organizations/${orgId}/projects`;
    const response = await api.get(url);
    return response.data;
  },

  getProject: async (orgId: string, projectId: string) => {
    const response = await api.get(`/api/organizations/${orgId}/projects/${projectId}`);
    return response.data;
  },

  update: async (orgId: string, projectId: string, data: any) => {
    const response = await api.put(`/api/organizations/${orgId}/projects/${projectId}`, data);
    return response.data;
  },

  delete: async (orgId: string, projectId: string) => {
    const response = await api.delete(`/api/organizations/${orgId}/projects/${projectId}`);
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  create: async (orgId: string, projectId: string, data: {
    title: string;
    description?: string;
    priority?: string;
    assignedTo?: string;
    dueDate?: string;
  }) => {
    const response = await api.post(`/api/organizations/${orgId}/projects/${projectId}/tasks`, data);
    return response.data;
  },

  getTasks: async (orgId: string, projectId: string, status?: string) => {
    const url = status 
      ? `/api/organizations/${orgId}/projects/${projectId}/tasks?status=${status}`
      : `/api/organizations/${orgId}/projects/${projectId}/tasks`;
    const response = await api.get(url);
    return response.data;
  },

  getTask: async (orgId: string, projectId: string, taskId: string) => {
    const response = await api.get(`/api/organizations/${orgId}/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  },

  update: async (orgId: string, projectId: string, taskId: string, data: any) => {
    const response = await api.put(`/api/organizations/${orgId}/projects/${projectId}/tasks/${taskId}`, data);
    return response.data;
  },

  complete: async (orgId: string, projectId: string, taskId: string) => {
    const response = await api.post(`/api/organizations/${orgId}/projects/${projectId}/tasks/${taskId}/complete`);
    return response.data;
  },

  delete: async (orgId: string, projectId: string, taskId: string) => {
    const response = await api.delete(`/api/organizations/${orgId}/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  },
};

// Captain's Log API
export const captainsLogAPI = {
  getLog: async (
    orgId: string, 
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
    
    const response = await api.get(`/api/organizations/${orgId}/captains-log?${params.toString()}`);
    return response.data;
  },

  getEntry: async (orgId: string, entryId: string) => {
    const response = await api.get(`/api/organizations/${orgId}/captains-log/${entryId}`);
    return response.data;
  },
};

export default api;