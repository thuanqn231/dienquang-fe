import { createSlice } from '@reduxjs/toolkit';
import { fToDate } from '../../utils/formatTime';

// ----------------------------------------------------------------------

const curMonth = new Date();

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    materialType: '',
    materialCode: '',
    materialId: '',
    materialDesc: '',
    month: curMonth,
    searchType: 'line'
  }
};

const slice = createSlice({
  name: 'lineStockReportManagement',
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
export const { setSearchParams, resetSearchParams } = slice.actions;

// ----------------------------------------------------------------------
