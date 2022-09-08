import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------
const currentDate = new Date()
const initialState = {
  isLoading: false,
  error: false,
  searchParamsWorkForm: {
    workFormNo: '',
    workFormName: '',
    shift: ''
  },
  searchParamsWorkCalendar: {
    from: currentDate,
    to: currentDate,
    group: '',
    final: '',
    shift: ''
  }
};

const slice = createSlice({
  name: 'workCalendarManagement',
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
    setParamsWorkForm(state, action) {
      const searchParams = action.payload;
      state.searchParamsWorkForm = searchParams;
    },
    setParamsWorkCalendar(state, action) {
      const searchParams = action.payload;
      state.searchParamsWorkCalendar = searchParams;
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
export const { setParamsWorkForm, setParamsWorkCalendar,  resetSearchParams } = slice.actions;

// ----------------------------------------------------------------------
