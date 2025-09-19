import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string; // Changed from Date to string
}

interface AIState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  currentQuery: string;
}

const initialState: AIState = {
  messages: [
    {
      id: '1',
      content: 'Hello! I\'m your AI terms reminder assistant. I can help you analyze contracts, track important deadlines, and provide insights about your terms and obligations. How can I assist you today?',
      isUser: false,
      timestamp: new Date().toISOString() // Changed to ISO string
    }
  ],
  loading: false,
  error: null,
  currentQuery: ''
};

// Async thunks
export const sendMessage = createAsyncThunk(
  'ai/sendMessage',
  async (message: string) => {
    const response = await fetch('http://localhost:5000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    const result = await response.json();
    return result.response;
  }
);

export const analyzeDocument = createAsyncThunk(
  'ai/analyzeDocument',
  async (documentId: string) => {
    const response = await fetch(`http://localhost:5000/api/ai/analyze/${documentId}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to analyze document');
    const result = await response.json();
    return result.analysis;
  }
);

export const summarizeDocuments = createAsyncThunk(
  'ai/summarizeDocuments',
  async (documentIds: string[]) => {
    const response = await fetch('http://localhost:5000/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentIds }),
    });
    if (!response.ok) throw new Error('Failed to summarize documents');
    const result = await response.json();
    return result.summary;
  }
);

// Slice
const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setCurrentQuery: (state, action: PayloadAction<string>) => {
      state.currentQuery = action.payload;
    },
    addUserMessage: (state, action: PayloadAction<string>) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: action.payload,
        isUser: true,
        timestamp: new Date().toISOString()
      };
      state.messages.push(newMessage);
    },
    clearMessages: (state) => {
      state.messages = [initialState.messages[0]]; // Keep the welcome message
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const aiMessage: Message = {
          id: Date.now().toString(),
          content: action.payload,
          isUser: false,
          timestamp: new Date().toISOString()
        };
        state.messages.push(aiMessage);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send message';
      })
      
      // Analyze document
      .addCase(analyzeDocument.fulfilled, (state, action) => {
        const aiMessage: Message = {
          id: Date.now().toString(),
          content: `Document Analysis:\n\n${action.payload}`,
          isUser: false,
          timestamp: new Date().toISOString()
        };
        state.messages.push(aiMessage);
      })
      
      // Summarize documents
      .addCase(summarizeDocuments.fulfilled, (state, action) => {
        const aiMessage: Message = {
          id: Date.now().toString(),
          content: `Document Summary:\n\n${action.payload}`,
          isUser: false,
          timestamp: new Date().toISOString()
        };
        state.messages.push(aiMessage);
      });
  },
});

export const { setCurrentQuery, addUserMessage, clearMessages, clearError } = aiSlice.actions;
export default aiSlice.reducer;
