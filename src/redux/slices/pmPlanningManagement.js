import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------
const curDate = new Date();

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    factory: '',
    from: curDate,
    to: curDate,
    equipCode: '',
    equipIdCode: '',
    equipIdName: '',
    planId: '',
    state: 'RUNNING'
  }
};

const slice = createSlice({
  name: 'pmPlanningManagement',
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
    },
  }
});

// Reducer
export default slice.reducer;

// Actions  
export const { setSearchParams, resetSearchParams } = slice.actions;

// ----------------------------------------------------------------------
