import { createSlice } from '@reduxjs/toolkit';
import { query } from '../../core/api';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  unitIdDropdown: [],
  searchParams: {
    unitID: '',
    unitName: '',
    state: 'RUNNING'
  }
};

const slice = createSlice({
  name: 'unitIDManagement',
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

    getUnitIdDropdownSuccess(state, action) {
      const unitIdDropdown = action.payload;
      state.unitIdDropdown = unitIdDropdown;
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
export function getUnitIdDropdown() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: '/v1/unit-id/search',
        featureCode: 'user.create',
        params: {
          state: 'RUNNING'
        }
      });
      const unitIdDropdown = response.data.map((unitId) => ({
        value: unitId.factoryPk,
        factory: unitId.pk.factoryCode,
        label: unitId.name
      }));
      dispatch(slice.actions.getUnitIdDropdownSuccess([{ value: '', label: '' }, ...unitIdDropdown]));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
