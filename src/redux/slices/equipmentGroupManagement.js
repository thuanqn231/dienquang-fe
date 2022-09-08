import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    factory: '',
    paramCode: '',
    paramName: '',
    state: 'RUNNING'
  }
};

const slice = createSlice({
  name: 'equipmentGroupManagement',
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

    // SELECT WIDGET EVENT
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
