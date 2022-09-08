import { createSlice } from '@reduxjs/toolkit';
import { getCurrentDate } from '../../utils/formatTime'

// ----------------------------------------------------------------------

const curDate = new Date();

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    planDateFrom: curDate,
    planDateTo: curDate,
    appStatus: '',
    giStatus: '',
    planId: '',
    grNo: '',
    poNo: '',
    materialCode: '',
    materialName: '',
    supplier: '',
    giType: '',
    state: 'RUNNING'
  }
};

const slice = createSlice({
  name: 'giPlanManagement',
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
export const { openGRPlanActionModal, closeGRPlanActionModal, setSearchParams, resetSearchParams } = slice.actions;

// ----------------------------------------------------------------------
