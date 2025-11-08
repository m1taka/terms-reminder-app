import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API_URL from '@/config/api';

// Types
export interface Document {
  _id: string;
  filename: string;
  originalName: string;
  description: string;
  category: 'contract' | 'legal' | 'administrative' | 'court' | 'other';
  tags: string[];
  size: number;
  mimetype: string;
  uploadDate: string;
  extractedDates: Array<{
    date: string;
    type: string;
    context: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface DocumentsState {
  documents: Document[];
  loading: boolean;
  error: string | null;
  filters: {
    category: string;
    tag: string;
    search: string;
  };
}

const initialState: DocumentsState = {
  documents: [],
  loading: false,
  error: null,
  filters: {
    category: 'all',
    tag: '',
    search: ''
  }
};

// Async thunks
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (params?: { category?: string; tag?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.category && params.category !== 'all') queryParams.append('category', params.category);
    if (params?.tag) queryParams.append('tag', params.tag);
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await fetch(`${API_URL}/api/documents?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (id: string) => {
    const response = await fetch(`${API_URL}/api/documents/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete document');
    return id;
  }
);

// Slice
const documentsSlice = createSlice({
  name: 'documents',
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
      // Fetch documents
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch documents';
      })
      
      // Delete document
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter(d => d._id !== action.payload);
      });
  },
});

export const { setFilters, clearError } = documentsSlice.actions;
export default documentsSlice.reducer;
