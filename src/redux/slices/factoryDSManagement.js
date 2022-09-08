import { createSlice } from '@reduxjs/toolkit';
import { query } from '../../core/api';
// ----------------------------------------------------------------------

const curDate = new Date();

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    sympCode: '',
    sympClsCode: '',
    sympName: '',
    level: '',
    productGroup: '',
    processType: '',
    state: ''
  },
  factoryDefectSymptoms: [],
  dsClassCodeDropdown: [],
  dsClassNameDropdown: [],
  dsDetailNameDropdown: [],
  dsDetailCodeDropdown: [],
  registerDSClassNameDropdown: [],
  registerDSDetailNameDropdown: []
};

const slice = createSlice({
  name: 'factoryDSManagement',
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
    getDSClassNameSuccess(state, action) {
      const dsClassNameDropdown = action.payload;
      state.dsClassNameDropdown = dsClassNameDropdown;
    },
    getDSClassCodeSuccess(state, action) {
      const dsClassCodeDropdown = action.payload;
      state.dsClassCodeDropdown = dsClassCodeDropdown;
    },
    getDSDetailNameSuccess(state, action) {
      const dsDetailNameDropdown = action.payload;
      state.dsDetailNameDropdown = dsDetailNameDropdown;
    },
    getDSDetailCodeSuccess(state, action) {
      const dsDetailCodeDropdown = action.payload;
      state.dsDetailCodeDropdown = dsDetailCodeDropdown;
    },
    getRegisterDSClassNameSuccess(state, action) {
      const registerDSClassNameDropdown = action.payload;
      state.registerDSClassNameDropdown = registerDSClassNameDropdown;
    },
    getRegisterDSDetailNameSuccess(state, action) {
      const registerDSDetailNameDropdown = action.payload;
      state.registerDSDetailNameDropdown = registerDSDetailNameDropdown;
    },
    getFactoryDefectSymptomsSuccess(state, action) {
      const factoryDefectSymptoms = action.payload;
      state.factoryDefectSymptoms = factoryDefectSymptoms;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { setSearchParams, resetSearchParams } = slice.actions;
export function getDSClassDropdown() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const { data } = await query({
        url: '/v1/symptom/search',
        featureCode: 'user.create'
      });
      const dsClassNameDropdown = data.map((dsClass) => ({
        factory: dsClass.pk.factoryCode,
        value: dsClass.name,
        label: dsClass.name,
        code: dsClass.code
      }));
      const dsClassCodeDropdown = data.map((dsClass) => ({
        factory: dsClass.pk.factoryCode,
        value: dsClass.code,
        label: dsClass.code
      }));
      const registerDSClassNameDropdown = data.map((dsClass) => ({
        factory: dsClass.pk.factoryCode,
        value: dsClass.factoryPk,
        label: dsClass.name,
        code: dsClass.code
      }));
      dispatch(slice.actions.getRegisterDSClassNameSuccess(registerDSClassNameDropdown));
      dispatch(slice.actions.getDSClassNameSuccess(dsClassNameDropdown));
      dispatch(slice.actions.getDSClassCodeSuccess(dsClassCodeDropdown));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
export function getFactoryDefectSymptoms() {
  console.log('running...')
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const { data } = await query({
        url: '/v1/factory-symptom/search',
        featureCode: 'user.create',
        sympCode: '',
        sympClsCode: '',
        sympName: '',
        sympClsName: '',
        level: '',
        productGroup: '',
        processType: '',
        state: ''
      })
      const dsClassNameDropdown = data.map((dsClass) => ({
        factory: dsClass.pk.factoryCode,
        value: dsClass.name,
        label: dsClass.name,
        code: dsClass.code
      }));
      const dsClassCodeDropdown = data.map((dsClass) => ({
        factory: dsClass.pk.factoryCode,
        value: dsClass.code,
        label: dsClass.code
      }));
      const registerDSClassNameDropdown = data.map((dsClass) => ({
        factory: dsClass.pk.factoryCode,
        value: dsClass.factoryPk,
        label: dsClass.name,
        code: dsClass.code
      }));
      dispatch(slice.actions.getRegisterDSClassNameSuccess(registerDSClassNameDropdown));
      dispatch(slice.actions.getDSClassNameSuccess(dsClassNameDropdown));
      dispatch(slice.actions.getDSClassCodeSuccess(dsClassCodeDropdown));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
export function getDSDetailDropdown() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const { data } = await query({
        url: '/v1/symptom/detail/search',
        featureCode: 'user.create'
      });
      const dsDetailNameDropdown = data.map((dsDetail) => ({
        factory: dsDetail.pk.factoryCode,
        factoryPk: dsDetail.factoryPk,
        value: dsDetail.name,
        label: dsDetail.name,
        code: dsDetail.code,
        dsClassCode: dsDetail.defectSymptomClass.code,
        dsClassName: dsDetail.defectSymptomClass.name
      }));
      const dsDetailCodeDropdown = data.map((dsDetail) => ({
        factory: dsDetail.pk.factoryCode,
        value: dsDetail.code,
        label: dsDetail.code,
        dsClassCode: dsDetail.defectSymptomClass.code,
        dsClassName: dsDetail.defectSymptomClass.name
      }));
      const registerDSDetailNameDropdown = data.map((dsDetail) => ({
        class: dsDetail.defectSymptomClass.factoryPk,
        value: dsDetail.factoryPk,
        label: dsDetail.name,
        code: dsDetail.code
      }));
      dispatch(slice.actions.getRegisterDSDetailNameSuccess(registerDSDetailNameDropdown));
      dispatch(slice.actions.getDSDetailNameSuccess(dsDetailNameDropdown));
      dispatch(slice.actions.getDSDetailCodeSuccess(dsDetailCodeDropdown));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------
