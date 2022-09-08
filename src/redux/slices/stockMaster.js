import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  isOpenStockActionModal: false,
  searchParams: {
    factory: '',
    stockCode: '',
    stockName: '',
    stockType: '',
    zoneCode: '',
    zoneName: '',
    stockId: '',
    zoneId: '',
    binCode: '',
    state: 'RUNNING'
  }
};

const slice = createSlice({
  name: 'stockMaster',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // OPEN USER INFO ACTION MODAL
    openStockActionModal(state) {
      state.isOpenStockActionModal = true;
    },

    // HIDE USER INFO ACTION MODAL
    closeStockActionModal(state) {
      state.isOpenStockActionModal = false;
    },

    // SET SEARCH PARAMS
    setSearchParams(state, action) {
      const searchParams = action.payload;
      state.searchParams = searchParams;
    },
    resetSearchParams(state) {
      const { searchParams } = initialState;
      state.searchParams = searchParams;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { openStockActionModal, closeStockActionModal, setSearchParams, resetSearchParams } = slice.actions;

// ----------------------------------------------------------------------
