import { createSlice } from '@reduxjs/toolkit';
import { query } from '../../core/api';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    factory: '',
    lossType: '',
    classification: '',
    lossDetailCls: '',
    lossItem: '',
    user: '',
    state: 'RUNNING'
  },
  lossPICDropDown: [],
  allDataPIC: []
};

const slice = createSlice({
  name: 'lossPicManagement',
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

    getLossPICDropdownSuccess(state, action) {
      const losPICDropDown = action.payload;
      state.losPICDropDown = losPICDropDown;
    },
    getAllDataPICSuccess(state, action) {
      const allDataPIC = action.payload;
      state.allDataPIC = allDataPIC;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { setSearchParams, resetSearchParams } = slice.actions;

export function getLossPICDropdown() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const { data } = await query({
        url: '/v1/loss-pic/search',
        featureCode: 'user.create',
        params: {
          // lossType: searchParams.lossType,
          // classification: searchParams.classification,
          // lossCls: searchParams.lossDetailCls,
          // lossItem: searchParams.lossItem,
          // user: searchParams.user,
          // state: searchParams.state,
          // factoryPks: searchParams.factoryPks
        }
      });
      const lossPICDropdown = data.map((lossPIC) => ({
        value: lossPIC.factoryPk,
        factoryPk: lossPIC.user.pk.factoryCode,
        label: `${lossPIC.user.fullName} (${lossPIC.user.lastName})`,
        position: lossPIC.user.department.name
      }));
      dispatch(slice.actions.getLossPICDropdownSuccess(lossPICDropdown));
      dispatch(slice.actions.getAllDataPICSuccess(data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
