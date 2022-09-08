import { createSlice } from '@reduxjs/toolkit';
import { getCurrentDate } from '../../utils/formatTime'

// ----------------------------------------------------------------------

const curDate = getCurrentDate();

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    equipmentCode: '',
    equipmentIDCode: '',
    equipmentIDName: '',
    targetEquipId: '',

    storage: '',
    zone: '',
    bin: '',
    line: '',
    process: '',
    workStation: '',
  },
  operations: {
    STOCK_IN: {
      equipIDCode: '',
      equipIDName: '',
      equipIDSpec: '',
      equipIDPk: '',
      unitName: '',
      unitPK: '',
      storage: '',
      zone: '',
      bin: ''
    },
    STOCK_OUT: {
      equipIDCode: '',
      equipIDName: '',
      equipIDSpec: '',
      equipPk: '',
      unitName: '',
      unitPK: '',
      storage: '',
      zone: '',
      bin: ''
    },
    LINE_ASSIGN: {
      equipIDCode: '',
      equipIDName: '',
      equipIDSpec: '',
      equipIDPk: '',
      unitName: '',
      unitPK: '',
      line: '',
      process: '',
      workStation: ''
    },
    EQUIP_ASSIGN: {
      equipIDPk1: '',
      equipIDPk2: '',
      equipIDCode1: '',
      equipIDName1: '',
      equipIDSpec1: '',
      equipIDCode2: '',
      equipIDName2: '',
      equipIDSpec2: '',
    }
  }
};

const slice = createSlice({
  name: 'equipmentLocationManagement',
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

    // SET OPERATIONS
    setOperations(state, action) {
      const operations = action.payload;
      state.operations = operations;
    },

    resetSearchParams(state) {
      const { searchParams } = initialState;
      state.searchParams = searchParams;
    },

    resetOperation(state) {
      const { operations } = initialState;
      state.operations = operations;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { setSearchParams, setOperations, resetSearchParams, resetOperation } = slice.actions;

// ----------------------------------------------------------------------
