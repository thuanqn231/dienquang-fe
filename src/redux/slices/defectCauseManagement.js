import { createSlice } from '@reduxjs/toolkit';
import { query } from '../../core/api';

// ----------------------------------------------------------------------

const curDate = new Date();

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    detail: {
      stateDetail: 'RUNNING',
      causeCode: '',
      causeName: '',
      causeClsCode: ''
    },
    class: {
      stateClass: 'RUNNING',
      causeClsCode: '',
      causeClsName: '',
    }
  },
  defectCauseDropdown: [],
  defectCauseDetailDropdown: []
};

const slice = createSlice({
  name: 'defectSymptomManagement',
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

    resetSearchParams(state) {
      const { searchParams } = initialState;
      state.searchParams = searchParams;
    },

    getCauseSuccess(state, action) {
      const causeDropdown = action.payload
      state.defectCauseDropdown = causeDropdown
    },

    getCauseDetailSuccess(state, action) {
      const causeDetailDropdown = action.payload
      state.defectCauseDetailDropdown = causeDetailDropdown
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { setSearchParams, resetSearchParams } = slice.actions;


export function getDefectCause() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: '/v1/cause/search',
        featureCode: 'user.create',
        method: 'GET',
        params: {
          classYn: '',
          sympClsCode: '',
          sympClsName: '',
        }
      });
      const causeDropdown = response.data.map((detail) => ({
        // factory: prodOrder.pk.factoryCode,
        pk:detail.pk,
        code: detail.code,
        value: detail.code,
        label: detail.name
      }));
      dispatch(slice.actions.getCauseSuccess([...causeDropdown]));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getDefectCauseDetail() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: '/v1/cause/detail/search',
        featureCode: 'user.create',
        method: 'GET',
        params: {
          stateDetail: '',
          causeCode: '',
          causeName: '',
          causeClsCode: '',
          sympClsCode: ''
        }
      });
      const causeDetailDropdown = response.data.map((cause) => ({
        factoryPk: cause.factoryPk,
        pk:cause.pk,
        code: cause.code,
        value: cause.code,
        label: cause.name,
        codeDefectCause: cause.defectCauseClass
      }));
      dispatch(slice.actions.getCauseDetailSuccess([...causeDetailDropdown]));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------
