import { createSlice } from '@reduxjs/toolkit';
import { getCurrentDate } from '../../utils/formatTime'

// ----------------------------------------------------------------------

const curDate = getCurrentDate();

const initialState = {
  isLoading: false,
  error: false,
  isOpenGRPlanActionModal: false,
  reprintReason: '',
  searchParams: {
    planDateFrom: curDate,
    planDateTo: curDate,
    poType: '',
    grType: '',
    planId: '',
    purOrderNo: '',
    prodOrderNo: '',
    materialCode: '',
    materialName: '',
    unitID: '',
    status: '',
    generatedId: '',
    generatedFrom: curDate,
    generatedTo: curDate,
    lotNo: '',
    boxNo: '',
    supplier: '',
    manualMaterialCode: '',
    manualMaterialName: '',
    state: 'RUNNING'
  }
};

const slice = createSlice({
  name: 'labelGenerateManagement',
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
