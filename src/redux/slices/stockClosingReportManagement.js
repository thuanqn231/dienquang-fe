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
    supplier: '',
    stock: '',
    zone: '',
    bin: '',
    label: '',
    lotNo: '',
    stockStatus: '',
    month: curMonth,
    lotNoDisplay: false,
    supplierDisplay: false,
    labelDisplay: false
  }
};

const slice = createSlice({
  name: 'stockClosingReportManagement',
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
