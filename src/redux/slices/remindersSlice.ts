import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API_URL from '@/config/api';

// Types
export interface Reminder {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  reminderDate: string;
  termStartDate?: string;
  termEndDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'legal' | 'administrative' | 'client' | 'court' | 'deadline' | 'meeting';
  assignedTo?: string;
  relatedCase?: string;
  contractParty1?: string;
  contractParty2?: string;
  type: 'manual' | 'deadline' | 'court' | 'filing' | 'meeting';
  documentId?: string;
  status: 'active' | 'dismissed' | 'completed' | 'snoozed';
  extractedContext?: string;
  googleCalendarEventId?: string;
  createdAt: string;
  updatedAt: string;
}

interface RemindersState {
  reminders: Reminder[];
  todayReminders: Reminder[];
  loading: boolean;
  error: string | null;
  filters: {
    status: string;
    type: string;
    priority: string;
  };
}

const initialState: RemindersState = {
  reminders: [],
  todayReminders: [],
  loading: false,
  error: null,
  filters: {
    status: 'active',
    type: 'all',
    priority: 'all'
  }
};

// Async thunks
export const fetchReminders = createAsyncThunk(
  'reminders/fetchReminders',
  async (params?: { status?: string; type?: string; priority?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params?.type && params.type !== 'all') queryParams.append('type', params.type);
    if (params?.priority && params.priority !== 'all') queryParams.append('priority', params.priority);
    
    const response = await fetch(`${API_URL}/api/reminders?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch reminders');
    return response.json();
  }
);

export const fetchTodayReminders = createAsyncThunk(
  'reminders/fetchTodayReminders',
  async () => {
    const response = await fetch(`${API_URL}/api/reminders/today`);
    if (!response.ok) throw new Error('Failed to fetch today\'s reminders');
    return response.json();
  }
);

export const createReminder = createAsyncThunk(
  'reminders/createReminder',
  async (reminderData: Omit<Reminder, '_id' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch(`${API_URL}/api/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reminderData),
    });
    if (!response.ok) throw new Error('Failed to create reminder');
    const result = await response.json();
    return result.reminder;
  }
);

export const updateReminder = createAsyncThunk(
  'reminders/updateReminder',
  async ({ id, updates }: { id: string; updates: Partial<Reminder> }) => {
    const response = await fetch(`${API_URL}/api/reminders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update reminder');
    const result = await response.json();
    return result.reminder;
  }
);

export const dismissReminder = createAsyncThunk(
  'reminders/dismissReminder',
  async (id: string) => {
    const response = await fetch(`${API_URL}/api/reminders/${id}/dismiss`, {
      method: 'PUT',
    });
    if (!response.ok) throw new Error('Failed to dismiss reminder');
    const result = await response.json();
    return result.reminder;
  }
);

export const snoozeReminder = createAsyncThunk(
  'reminders/snoozeReminder',
  async ({ id, snoozeUntil }: { id: string; snoozeUntil: string }) => {
    const response = await fetch(`${API_URL}/api/reminders/${id}/snooze`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snoozeUntil }),
    });
    if (!response.ok) throw new Error('Failed to snooze reminder');
    const result = await response.json();
    return result.reminder;
  }
);

export const deleteReminder = createAsyncThunk(
  'reminders/deleteReminder',
  async (id: string) => {
    const response = await fetch(`${API_URL}/api/reminders/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete reminder');
    return id;
  }
);

// Slice
const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reminders
      .addCase(fetchReminders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.loading = false;
        state.reminders = action.payload;
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reminders';
      })
      
      // Fetch today's reminders
      .addCase(fetchTodayReminders.fulfilled, (state, action) => {
        state.todayReminders = action.payload;
      })
      
      // Create reminder
      .addCase(createReminder.fulfilled, (state, action) => {
        state.reminders.unshift(action.payload);
      })
      
      // Update reminder
      .addCase(updateReminder.fulfilled, (state, action) => {
        const index = state.reminders.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reminders[index] = action.payload;
        }
      })
      
      // Dismiss reminder
      .addCase(dismissReminder.fulfilled, (state, action) => {
        const index = state.reminders.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reminders[index] = action.payload;
        }
      })
      
      // Snooze reminder
      .addCase(snoozeReminder.fulfilled, (state, action) => {
        const index = state.reminders.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reminders[index] = action.payload;
        }
      })
      
      // Delete reminder
      .addCase(deleteReminder.fulfilled, (state, action) => {
        state.reminders = state.reminders.filter(r => r._id !== action.payload);
      });
  },
});

export const { setFilters, clearError } = remindersSlice.actions;
export default remindersSlice.reducer;
