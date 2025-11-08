const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default API_URL;

// API endpoint builders
export const api = {
  reminders: {
    getAll: (params?: Record<string, string>) => 
      `${API_URL}/api/reminders${params ? '?' + new URLSearchParams(params).toString() : ''}`,
    getById: (id: string) => `${API_URL}/api/reminders/${id}`,
    getToday: () => `${API_URL}/api/reminders/today`,
    create: () => `${API_URL}/api/reminders`,
    update: (id: string) => `${API_URL}/api/reminders/${id}`,
    delete: (id: string) => `${API_URL}/api/reminders/${id}`,
    dismiss: (id: string) => `${API_URL}/api/reminders/${id}/dismiss`,
    snooze: (id: string) => `${API_URL}/api/reminders/${id}/snooze`,
  },
  documents: {
    getAll: (params?: Record<string, string>) => 
      `${API_URL}/api/documents${params ? '?' + new URLSearchParams(params).toString() : ''}`,
    getById: (id: string) => `${API_URL}/api/documents/${id}`,
    create: () => `${API_URL}/api/documents`,
    update: (id: string) => `${API_URL}/api/documents/${id}`,
    delete: (id: string) => `${API_URL}/api/documents/${id}`,
  },
  events: {
    getAll: (params?: Record<string, string>) => 
      `${API_URL}/api/events${params ? '?' + new URLSearchParams(params).toString() : ''}`,
    getById: (id: string) => `${API_URL}/api/events/${id}`,
    create: () => `${API_URL}/api/events`,
    update: (id: string) => `${API_URL}/api/events/${id}`,
    delete: (id: string) => `${API_URL}/api/events/${id}`,
  },
  health: () => `${API_URL}/api/health`,
};
