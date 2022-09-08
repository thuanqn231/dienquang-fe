import { createSlice } from '@reduxjs/toolkit';
import { query } from '../../core/api';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    factory: '',
    mrpCode: '',
    mrpName: '',
    state: 'RUNNING'
  },
  mrpDropdown: []
};

const slice = createSlice({
  name: 'mrpManagement',
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

    getMrpDropdownSuccess(state, action) {
      const mrpDropdown = action.payload;
      state.mrpDropdown = mrpDropdown;
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
export function getMrpDropdown() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: '/v1/mrp/search',
        featureCode: 'user.create',
        params: {
          state: 'RUNNING',
        }
      });
      const mrpDropdown = response.data.map((mrp) => ({
        factory: mrp.pk.factoryCode,
        value: mrp.factoryPk,
        label: mrp.name
      }));
      dispatch(slice.actions.getMrpDropdownSuccess(mrpDropdown));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
