import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const curDate = new Date();

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    operationFrom: curDate,
    operationTo: curDate,
    operationType: '',
    objectType: '',
    reason: '',
    materialId: '',
    materialCode: '',
    materialName: '',
    storage: '',
    registerId: '',
    lotNo: '',
    state: 'RUNNING'
  },
  lineStockAdjustment: {
    factoryPk: 'null-null',
    factory: '',
    part: '',
    lineName: '',
    lineCode: '',
    lotNo: '',
    supplier: '',
    materialCode: '',
    materialName: '',
    materialId: '',
    materialDesc: '',
    unit: '',
    qty: 0,
    objectType: '',
    reason: '',
    detailReason: ''
  },
  errorMessage: {
    factory: '',
    part: '',
    lineName: '',
    lineCode: '',
    lotNo: '',
    supplier: '',
    materialCode: '',
    materialName: '',
    materialId: '',
    materialDesc: '',
    unit: '',
    qty: '',
    objectType: '',
    reason: '',
    detailReason: ''
  }
};

const slice = createSlice({
  name: 'lineStockAdjustmentManagement',
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

    setLineStockAdjustment(state, action) {
      const lineStockAdjustment = action.payload;
      state.lineStockAdjustment = lineStockAdjustment;
    },

    resetLineStockAdjustment(state) {
      const { lineStockAdjustment } = initialState;
      state.lineStockAdjustment = lineStockAdjustment;
    },

    setErrorMessage(state, action) {
      const errorMessage = action.payload;
      state.errorMessage = errorMessage;
    },

    resetErrorMessage(state) {
      const { errorMessage } = initialState;
      state.errorMessage = errorMessage;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { setSearchParams, resetSearchParams, resetErrorMessage, resetLineStockAdjustment, setLineStockAdjustment, setErrorMessage } = slice.actions;

// ----------------------------------------------------------------------
