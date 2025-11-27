import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/api';

// Async thunks
export const fetchAuctions = createAsyncThunk(
  'auctions/fetchAll',
  async (activeOnly = true, { rejectWithValue }) => {
    try {
      const data = await api.getAuctions(activeOnly);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAuction = createAsyncThunk(
  'auctions/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const data = await api.getAuction(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const placeBid = createAsyncThunk(
  'auctions/placeBid',
  async ({ auctionId, walletAddress, amount }, { dispatch, rejectWithValue }) => {
    try {
      await api.placeBid(auctionId, walletAddress, amount);
      dispatch(fetchAuction(auctionId));
      return { auctionId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  auctions: [],
  currentAuction: null,
  loading: false,
  actionLoading: false,
  error: null,
};

const auctionsSlice = createSlice({
  name: 'auctions',
  initialState,
  reducers: {
    clearCurrentAuction: (state) => {
      state.currentAuction = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all auctions
      .addCase(fetchAuctions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctions.fulfilled, (state, action) => {
        state.loading = false;
        state.auctions = action.payload;
      })
      .addCase(fetchAuctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single auction
      .addCase(fetchAuction.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAuction.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAuction = action.payload;
      })
      .addCase(fetchAuction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Place bid
      .addCase(placeBid.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(placeBid.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentAuction, clearError } = auctionsSlice.actions;
export default auctionsSlice.reducer;

// Selectors
export const selectAuctions = (state) => state.auctions.auctions;
export const selectCurrentAuction = (state) => state.auctions.currentAuction;
export const selectAuctionsLoading = (state) => state.auctions.loading;
export const selectAuctionsError = (state) => state.auctions.error;
