import { configureStore } from '@reduxjs/toolkit';
import remindersReducer from './slices/remindersSlice';
import eventsReducer from './slices/eventsSlice';
import documentsReducer from './slices/documentsSlice';
import aiReducer from './slices/aiSlice';

export const store = configureStore({
  reducer: {
    reminders: remindersReducer,
    events: eventsReducer,
    documents: documentsReducer,
    ai: aiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
