import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API_URL from '@/config/api';

// Types
export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'meeting' | 'deadline' | 'court' | 'consultation' | 'reminder';
  documentId?: string;
  location: string;
  attendees: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  googleCalendarEventId?: string;
  createdAt: string;
  updatedAt: string;
}

interface EventsState {
  events: Event[];
  loading: boolean;
  error: string | null;
  selectedDate: string | null;
  filters: {
    type: string;
    status: string;
  };
}

const initialState: EventsState = {
  events: [],
  loading: false,
  error: null,
  selectedDate: null,
  filters: {
    type: 'all',
    status: 'all'
  }
};

// Async thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (params?: { date?: string; month?: string; year?: string; type?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.month) queryParams.append('month', params.month);
    if (params?.year) queryParams.append('year', params.year);
    if (params?.type && params.type !== 'all') queryParams.append('type', params.type);
    
    const response = await fetch(`${API_URL}/api/events?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch(`${API_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (!response.ok) throw new Error('Failed to create event');
    const result = await response.json();
    return result.event;
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, updates }: { id: string; updates: Partial<Event> }) => {
    const response = await fetch(`${API_URL}/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update event');
    const result = await response.json();
    return result.event;
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id: string) => {
    const response = await fetch(`${API_URL}/api/events/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete event');
    return id;
  }
);

// Slice
const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch events';
      })
      
      // Create event
      .addCase(createEvent.fulfilled, (state, action) => {
        state.events.push(action.payload);
      })
      
      // Update event
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.events.findIndex(e => e._id === action.payload._id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      
      // Delete event
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter(e => e._id !== action.payload);
      });
  },
});

export const { setSelectedDate, setFilters, clearError } = eventsSlice.actions;
export default eventsSlice.reducer;
