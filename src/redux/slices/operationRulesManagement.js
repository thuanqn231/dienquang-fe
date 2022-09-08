import { createSlice } from '@reduxjs/toolkit';
import { query } from '../../core/api';
import { getCurrentDate } from '../../utils/formatTime'

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    rules: '',
    state: 'RUNNING',
    factoryPks: '',
    plantPks: '',
    teamPks: '',
    groupPks: '',
    partPks: '',
    linePks: '',
    processPks: '',
    workStationPks: '',
  },
  rulesDropdown: []
};

const slice = createSlice({
  name: 'operationRulesManagement',
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
    getRulesDropdownSuccess(state, action) {
      const EquipmentDropdown = action.payload;
      state.equipmentDropdown = EquipmentDropdown;
    },
    resetSearchParams(state) {
      const { searchParams } = initialState;
      state.searchParams = searchParams;
    }
  }
});
export default slice.reducer;

export const { setSearchParams, resetSearchParams } = slice.actions;

export function getRulesDropdown() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        // * url: to get rules
        url: '/v1/equipment-id/search',
        featureCode: 'user.create',
        params: {}
      });
      const rulesDropdown = [];
      response.data.forEach((equipID) => {
        const temp = {
          eqIDcode: equipID.code,
          eqIDname: equipID.name,
          eqCode: equipID.equipmentCode.code
        };
        rulesDropdown.push(temp);
      });
      dispatch(slice.actions.getRulesDropdownSuccess(rulesDropdown));
    } catch (error) {
      console.error(error);
      dispatch(slice.actions.hasError(error));
    }
  };
}