import { createSlice } from '@reduxjs/toolkit';
import { fDate } from '../../utils/formatTime';

// ----------------------------------------------------------------------

const currentDate = fDate(new Date());

const initialState = {
  isLoading: false,
  error: false,
  productionStatus: {
    prodDate: currentDate
  },
  stuffingStatus: {
    prodDate: currentDate
  },
  lineStatus: {
    prodDate: currentDate
  }
};

const slice = createSlice({
  name: 'fmb',
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

    updateProductionStatusDate(state, action) {
      state.productionStatus.prodDate = action.payload;
    },

    updateStuffingStatusDate(state, action) {
      state.stuffingStatus.prodDate = action.payload;
    },
    updateLineStatusDate(state, action) {
      state.lineStatus.prodDate = action.payload;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { updateProductionStatusDate, updateStuffingStatusDate, updateLineStatusDate } = slice.actions;

// ----------------------------------------------------------------------
