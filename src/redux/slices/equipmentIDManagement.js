import { createSlice } from '@reduxjs/toolkit';
import { query } from '../../core/api';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    factory: '',
    code: '',
    equipmentCode: '',
    name: '',
    serial: '',
    asset: '',
    rfidCode: '',
    status: '',
    model: '',
    state: 'RUNNING'
  },
  equipmentIdDropdown: [],
  allEquipmentId: []
};

const slice = createSlice({
  name: 'equipmentIDManagement',
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

    getEquimentIdDropDownSuccess(state, action) {
      const equipmentIdDropdown = action.payload;
      state.equipmentIdDropdown = equipmentIdDropdown;
    },
    getAllEquipmentIdSuccess(state, action) {
      const allEquipmentId = action.payload;
      state.allEquipmentId = allEquipmentId;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { setSearchParams, resetSearchParams } = slice.actions;

// ----------------------------------------------------------------------

export function getEquipmentIdDropdown() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: '/v1/equipment-id/search',
        featureCode: 'user.create',
        params: {
          state: 'RUNNING'
        }
      });

      const equipmentIdDropDwon = response.data.map((equipmentId) => ({
        value: equipmentId.factoryPk,
        factory: equipmentId.pk.factoryCode,
        label: `${equipmentId.code}`,
        name: equipmentId.name,
        workStation: equipmentId.equipmentWorkStation.factoryPk
      }));
      dispatch(slice.actions.getEquimentIdDropDownSuccess(equipmentIdDropDwon));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getAllEquipmentId() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: '/v1/equipment-id/search',
        featureCode: 'user.create',
        params: {
          state: 'RUNNING'
        }
      });
      const { data } = response;
      const allEquipmentId = data.map((equipmentId) => ({
        value: equipmentId?.factoryPk,
        factory: equipmentId?.pk?.factoryCode,
        label: equipmentId?.code,
        name: equipmentId?.name,
        workStation: {
          value: equipmentId?.equipmentWorkStation?.factoryPk,
          label: equipmentId?.equipmentWorkStation?.name
        },
        equipCode: {
          value: equipmentId?.equipmentCode?.factoryPk,
          label: equipmentId?.equipmentCode?.name,
          code: equipmentId?.equipmentCode?.code,
         
        },
        lineCode: {
          value: equipmentId?.equipmentLine?.factoryPk,
          label: equipmentId?.equipmentLine?.name
        },
        part: {
          value: equipmentId.equipmentPart?.factoryPk,
          label: equipmentId.equipmentPart?.name  
        },
        processCode: {
          value: equipmentId.equipmentProcess?.factoryPk,
          label: equipmentId.equipmentProcess?.code
        },
        equipSpec: equipmentId?.equipmentSpec
      }));
      dispatch(slice.actions.getAllEquipmentIdSuccess(allEquipmentId));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
