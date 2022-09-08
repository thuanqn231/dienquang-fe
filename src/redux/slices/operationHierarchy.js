import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  selectedWidget: '',
  searchParams: {
    factoryCode: '',
    factoryName: '',
    plantCode: '',
    plantName: '',
    teamCode: '',
    teamName: '',
    groupCode: '',
    groupName: '',
    partCode: '',
    partName: '',
    lineCode: '',
    lineName: '',
    processType: '',
    productGroup: '',
    processCode: '',
    processName: '',
    prodPlan: '',
    wsCode: '',
    wsName: '',
    rank: '',
    state: 'RUNNING'
  }
};

const slice = createSlice({
  name: 'operationHierarchy',
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
    setSelectedWidget(state, action) {
      const selectedWidget = action.payload;
      state.selectedWidget = selectedWidget;
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
export const { setSelectedWidget, setSearchParams, resetSearchParams } = slice.actions;

// ----------------------------------------------------------------------
