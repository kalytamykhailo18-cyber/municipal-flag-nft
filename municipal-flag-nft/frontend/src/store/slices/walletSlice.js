import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  isMetaMaskInstalled,
  connectWallet as web3Connect,
  getCurrentAddress,
  onAccountsChanged,
  onChainChanged,
  removeListeners,
} from '../../services/web3';
import { createOrGetUser } from '../../services/api';

// Async thunks
export const connectWallet = createAsyncThunk(
  'wallet/connect',
  async (_, { rejectWithValue }) => {
    try {
      if (!isMetaMaskInstalled()) {
        throw new Error('Please install MetaMask to use this application');
      }
      const result = await web3Connect();

      // Create or get user from backend
      let user = null;
      try {
        user = await createOrGetUser(result.address);
      } catch (apiError) {
        console.warn('Could not sync with backend:', apiError.message);
      }

      return {
        address: result.address,
        balance: result.balance,
        user,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkConnection = createAsyncThunk(
  'wallet/checkConnection',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      if (isMetaMaskInstalled()) {
        const currentAddress = await getCurrentAddress();
        if (currentAddress) {
          return dispatch(connectWallet()).unwrap();
        }
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const refreshBalance = createAsyncThunk(
  'wallet/refreshBalance',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { address } = getState().wallet;
      if (address && isMetaMaskInstalled()) {
        const result = await web3Connect();
        return result.balance;
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  address: null,
  balance: null,
  user: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  isMetaMaskInstalled: typeof window !== 'undefined' && typeof window.ethereum !== 'undefined',
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    disconnect: (state) => {
      state.address = null;
      state.balance = null;
      state.user = null;
      state.isConnected = false;
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setMetaMaskInstalled: (state, action) => {
      state.isMetaMaskInstalled = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Connect wallet
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.isConnected = true;
        state.address = action.payload.address;
        state.balance = action.payload.balance;
        state.user = action.payload.user;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.payload;
      })
      // Check connection
      .addCase(checkConnection.pending, (state) => {
        state.isConnecting = true;
      })
      .addCase(checkConnection.fulfilled, (state) => {
        state.isConnecting = false;
      })
      .addCase(checkConnection.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.payload;
      })
      // Refresh balance
      .addCase(refreshBalance.fulfilled, (state, action) => {
        if (action.payload) {
          state.balance = action.payload;
        }
      });
  },
});

export const { disconnect, updateUser, clearError, setMetaMaskInstalled } = walletSlice.actions;
export default walletSlice.reducer;

// Selectors
export const selectWallet = (state) => state.wallet;
export const selectAddress = (state) => state.wallet.address;
export const selectIsConnected = (state) => state.wallet.isConnected;
export const selectUser = (state) => state.wallet.user;
