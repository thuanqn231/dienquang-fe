import { createSlice } from '@reduxjs/toolkit';
import { fDate } from '../../utils/formatTime';

// ----------------------------------------------------------------------
const currentDate = new Date()
const curDate = fDate(currentDate);
const lastWeekDate = fDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    from: lastWeekDate,
    to: curDate,
    appStatus: '',
    prodStatus: '',
    planID: '',
    PONo: '',
    POType: '',
    modelCode: '',
    modelName: '',
    topModel: '',
    processType: '',
    workStation: '',
    finalYn: '',
    reflect: '',
    state: 'RUNNING'
  },
};

const slice = createSlice({
  name: 'productionResult',
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

    getProductionOrderDropdownSuccess(state, action) {
      const productionOrderDropdown = action.payload;
      state.productionOrderDropdown = productionOrderDropdown;
    },

    getPlanDropdownSucces(state, action) {
      const planDropdown = action.payload;
      state.planDropdown = planDropdown;
    },

    getProductionOrderChildDropdownSuccess(state, action) {
      const productionOrderChildDropdown = action.payload;
      state.productionOrderChildDropdown = productionOrderChildDropdown;
    },
    getPlanDropDownWithDiffPOSuccess(state, action) {
      const planDropDownWithDiffPOSuccess = action.payload;
      state.planDropdownWPo = planDropDownWithDiffPOSuccess;
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