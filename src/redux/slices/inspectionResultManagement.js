import { createSlice } from '@reduxjs/toolkit';
import { getCurrentDate } from '../../utils/formatTime';

// ----------------------------------------------------------------------

const curDate = getCurrentDate();

const initialState = {
  isLoading: false,
  error: false,
  isOpenInspectionHistory: false,
  searchParams: {
    type: 'All',
    from: curDate,
    to: curDate,
    grNo: '',
    order: '',
    qcResult: '',
    materialCode: '',
    materialName: '',
    grType: '',
    state: 'RUNNING',
    approvalStatus: '',
    factoryPks: ''
  },
  inspectionResultHistory: []
};

const slice = createSlice({
  name: 'inspectionResultManagement',
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

    // OPEN GR PLAN ACTION MODAL
    openGRPlanActionModal(state) {
      state.isOpenGRPlanActionModal = true;
    },

    // HIDE GR PLAN ACTION MODAL
    closeGRPlanActionModal(state) {
      state.isOpenGRPlanActionModal = false;
    },

    // OPEN STOCK DETAIL MODAL
    openDetailStockModal(state) {
      state.isOpenDetailStockModal = true;
    },

    // HIDE STOCK DETAIL MODAL
    closeDetailStockModal(state) {
      state.isOpenDetailStockModal = false;
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
    openResultHistory(state, action) {
      state.isOpenInspectionHistory = true;
    },
    closeResultHistory(state, action) {
      state.isOpenInspectionHistory = false;
    },

    setInspectionHistoryResult(state, action) {
      const inspectionResults = action.payload;
      state.inspectionResultHistory = inspectionResults;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const {
  openGRPlanActionModal,
  closeGRPlanActionModal,
  setSearchParams,
  openDetailStockModal,
  closeDetailStockModal,
  openResultHistory,
  closeResultHistory,
  setInspectionHistoryResult,
  resetSearchParams
} = slice.actions;

// ----------------------------------------------------------------------
