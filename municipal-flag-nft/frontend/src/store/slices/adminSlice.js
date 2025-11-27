import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/api';

// Async thunks
export const authenticate = createAsyncThunk(
  'admin/authenticate',
  async (adminKey, { rejectWithValue }) => {
    try {
      const stats = await api.getAdminStats(adminKey);
      return { stats, adminKey };
    } catch (error) {
      return rejectWithValue('Invalid admin key');
    }
  }
);

export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { adminKey } = getState().admin;
      const data = await api.getAdminStats(adminKey);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAdminCountries = createAsyncThunk(
  'admin/fetchCountries',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.getCountries(false);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const seedDemoData = createAsyncThunk(
  'admin/seedDemo',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { adminKey } = getState().admin;
      await api.seedDemoData(adminKey);
      dispatch(fetchAdminStats());
      dispatch(fetchAdminCountries());
      return 'Demo data seeded successfully!';
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleCountryVisibility = createAsyncThunk(
  'admin/toggleVisibility',
  async ({ countryId, isVisible }, { getState, dispatch, rejectWithValue }) => {
    try {
      const { adminKey } = getState().admin;
      await api.updateCountry(countryId, { is_visible: !isVisible }, adminKey);
      dispatch(fetchAdminCountries());
      return { countryId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  authenticated: false,
  adminKey: null,
  stats: null,
  countries: [],
  loading: false,
  message: null,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    logout: (state) => {
      state.authenticated = false;
      state.adminKey = null;
      state.stats = null;
      state.countries = [];
    },
    clearMessage: (state) => {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Authenticate
      .addCase(authenticate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(authenticate.fulfilled, (state, action) => {
        state.loading = false;
        state.authenticated = true;
        state.adminKey = action.payload.adminKey;
        state.stats = action.payload.stats;
      })
      .addCase(authenticate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch stats
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Fetch countries
      .addCase(fetchAdminCountries.fulfilled, (state, action) => {
        state.countries = action.payload;
      })
      // Seed demo data
      .addCase(seedDemoData.pending, (state) => {
        state.loading = true;
        state.message = null;
      })
      .addCase(seedDemoData.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(seedDemoData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle visibility
      .addCase(toggleCountryVisibility.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { logout, clearMessage } = adminSlice.actions;
export default adminSlice.reducer;

// Selectors
export const selectAdminAuthenticated = (state) => state.admin.authenticated;
export const selectAdminStats = (state) => state.admin.stats;
export const selectAdminCountries = (state) => state.admin.countries;
export const selectAdminLoading = (state) => state.admin.loading;
export const selectAdminMessage = (state) => state.admin.message;
export const selectAdminError = (state) => state.admin.error;
