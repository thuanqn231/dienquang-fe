import { createSlice } from '@reduxjs/toolkit';
import { fDate } from '../../utils/formatTime';

// ----------------------------------------------------------------------
const currentDate = new Date()
const curDate = fDate(currentDate);
const lastWeekDate = fDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));

const initialState = {
  isLoading: false,
  error: false,
  info: {
    email: '',
    oldPassword: '',
    newPassword: '',
    code: ''
  },
};

const slice = createSlice({
  name: 'resetPassword',
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
    setInfo(state, action) {
      const info = action.payload;
      state.info = info;
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
export const { setInfo, resetSearchParams } = slice.actions;
// ----------------------------------------------------------------------