import { createSlice } from '@reduxjs/toolkit';
import { query } from '../../core/api';
import { getCurrentDate } from '../../utils/formatTime'

const curDate = getCurrentDate();

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    from: curDate,
    to: curDate,
    equipmentIDCode: '',
    equipmentIDName: '',
    equipmentCode: '',
    factoryPks: '',
    plantPks: '',
    teamPks: '',
    groupPks: '',
    partPks: '',
    linePks: '',
    processPks: '',
    workStationPks: '',
    refresh: 0
  },
  equipmentDropdown: [],
  equipmentCodeDropdown: []
};

const slice = createSlice({
  name: 'operationTimeManagement',
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
    getEquipmentDropdownSuccess(state, action) {
      const EquipmentDropdown = action.payload;
      state.equipmentDropdown = EquipmentDropdown;
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

export function getEquipmentDropdown() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: '/v1/equipment-id/search',
        featureCode: 'user.create',
        params: {}
      });
      const equipmentIDDropdown = [];
      response.data.forEach((equipID) => {
        const temp = {
          eqIDcode: equipID.code,
          eqIDname: equipID.name,
          eqCode: equipID.equipmentCode.code
        };
        equipmentIDDropdown.push(temp);
      });
      dispatch(slice.actions.getEquipmentDropdownSuccess(equipmentIDDropdown));
    } catch (error) {
      console.error(error);
      dispatch(slice.actions.hasError(error));
    }
  };
}
