import { createSlice } from '@reduxjs/toolkit';
import { getCurrentDate } from '../../utils/formatTime'

// ----------------------------------------------------------------------

const curDate = getCurrentDate();

const initialState = {
  isLoading: false,
  error: false,
  isOpenGRPlanActionModal: false,
  isOpenDetailStockModal: false,
  searchParams: {
    type: 'All',
    fromDate: curDate,
    toDate: curDate,
    giNo: '',
    order: '',
    materialCode: '',
    materialName: '',
    giType: '',
    mrp: '',
    stockStatus: '',
    supplier: '',
    stock: '',
    zone: '',
    bin: '',
    state: 'RUNNING',
    isLotNo: false,
    isSupplier: false,
    isBoxNo: false
  }
};

const slice = createSlice({
  name: 'giResultManagement',
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
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { openGRPlanActionModal, closeGRPlanActionModal, setSearchParams, openDetailStockModal, closeDetailStockModal } = slice.actions;

// ----------------------------------------------------------------------