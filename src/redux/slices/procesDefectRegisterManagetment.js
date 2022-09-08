import { createSlice } from '@reduxjs/toolkit';
import { getCurrentDate } from '../../utils/formatTime';

// ----------------------------------------------------------------------

const curDate = getCurrentDate();

export const initialState = {
  isLoading: false,
  error: false,
  registrations: {
    serial: {
      epassNo: '',
      poNo: '',
      factoryPk: '',
      modelId: '',
      modelCode: '',
      modelDesc: '',
      modelName: '',
      lotNo: '',
      part: '',
      line: '',
      process: '',
      workStation: '',
      symptClass: '',
      symptName: '',
      symptCode: '',
      symptPk: '',
      factory: ''
    },
    model: {
      poNo: '',
      factoryPk: '',
      defectQuantity: '',
      modelId: '',
      modelCode: '',
      modelDesc: '',
      modelName: '',
      lotNo: '',
      part: '',
      line: '',
      process: '',
      workStation: '',
      symptClass: '',
      symptName: '',
      symptCode: '',
      symptPk: '',
      factory: ''
    }
  }
};

const slice = createSlice({
  name: 'processDefectRegisterManagement',
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

    // SET OPERATIONS
    setRegistration(state, action) {
      const registrations = action.payload;
      state.registrations = registrations;
    },

    resetRegistration(state) {
      const { registrations } = initialState;
      state.registrations = registrations;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { setRegistration, resetRegistration } = slice.actions;

// ----------------------------------------------------------------------
