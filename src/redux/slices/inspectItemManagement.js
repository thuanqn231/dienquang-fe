import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const curDate = new Date();

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    detail: {
      stateDetail: 'RUNNING',
      inspCode: '',
      inspName: '',
      inspClsCode: '',
      inspType: '',
    },
    class: {
      stateClass: 'RUNNING',
      inspClsCode: '',
      inspClsName: '',
      inspType: '',
    }
  }
};

const slice = createSlice({
  name: 'inspectItemManagement',
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
