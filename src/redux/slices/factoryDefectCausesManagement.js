import { createSlice } from '@reduxjs/toolkit';
import { query } from '../../core/api';

// ----------------------------------------------------------------------

const curDate = new Date();

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    causeClsCode: '',
    causeClsName: '',
    causeCode: '',
    causeName: '',
    productGroup: '',
    processType: '',
    state: ''
  },
  causesClNameDropdown: [],
  defectCausesNameDropdown: []
};

const slice = createSlice({
  name: 'factoryDefectCauseManagement',
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
    getCausesClNameDropdownSuccess(state, action) {
      const causesClNameDropdown = action.payload
      state.causesClNameDropdown = causesClNameDropdown
    },
    getDefectCausesNameDropdownSuccess(state, action) {
      const defectCausesNameDropdown = action.payload
      state.defectCausesNameDropdown = defectCausesNameDropdown
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { setSearchParams, resetSearchParams } = slice.actions;

export function getFactoryDefectCause() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const { data } = await query({
        url: '/v1/factory-defect-cause/search',
        featureCode: 'user.create',
        params: {
          sympClsCode: '',
          sympClsName: '',
          sympCode: '',
          sympName: '',
          productGroup: '',
          processType: '',   
          state: 'RUNNING',
        }
      })
      console.log(data)
      const defectCause = data.map((dsClass) => ({
        code: dsClass.defectCauseDetail.code,
        value: dsClass.defectCauseDetail.factoryPk,
        label: dsClass.defectCauseDetail.name
      }));
      const causesClName = data.map((dsClass) => ({
        defectCause: dsClass.defectCauseDetail.defectCauseClass.code,
        value: dsClass.defectCauseDetail.defectCauseClass.factoryPk,
        label: dsClass.defectCauseDetail.defectCauseClass.name,
        code: dsClass.defectCauseDetail.defectCauseClass.code
      }));
      
      dispatch(slice.actions.getCausesClNameDropdownSuccess(causesClName));
      dispatch(slice.actions.getDefectCausesNameDropdownSuccess(defectCause));
      // dispatch(slice.actions.getDSClassCodeSuccess(dsClassCodeDropdown));
    } catch (error) {
      console.log(error)
      dispatch(slice.actions.hasError(error));
    }
  };
}
