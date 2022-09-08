import { createSlice } from '@reduxjs/toolkit';
import { isEmpty } from 'lodash-es';
import { query } from '../../core/api';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  isOpenMaterialActionModal: false,
  searchParams: {
    factory: '',
    materialCode: '',
    materialId: '',
    materialName: '',
    materialDescription: '',
    materialType: '',
    materialGroup: '',
    mrp: '',
    status: '',
    state: 'RUNNING'
  },
  materialDropdown: [],
  approvedBOMDropdown: []
};

const slice = createSlice({
  name: 'materialMaster',
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

    // OPEN USER INFO ACTION MODAL
    openMaterialActionModal(state) {
      state.isOpenMaterialActionModal = true;
    },

    // HIDE USER INFO ACTION MODAL
    closeMaterialActionModal(state) {
      state.isOpenMaterialActionModal = false;
    },

    // Get Material Dropdown Success
    getMaterialDropdownSuccess(state, action) {
      const materialDropdown = action.payload;
      state.materialDropdown = materialDropdown;
    },

    // Get Approved BOM Dropdown Success
    getApprovedBOMDropdownSuccess(state, action) {
      const approvedBOMDropdown = action.payload;
      state.approvedBOMDropdown = approvedBOMDropdown;
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
export const { setSearchParams, openMaterialActionModal, closeMaterialActionModal, resetSearchParams } = slice.actions;

// ----------------------------------------------------------------------

export function getMaterialDropdown() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: '/v1/material/search',
        featureCode: 'user.create',
        params: {
          material: JSON.stringify({})
        }
      });
      const materialDropdown = response.data.map((material) => ({
        factory: material.pk.factoryCode,
        value: material.factoryPk,
        label: `${material.code} (${material.materialId})`,
        materialDescription: material.description,
        materialSpec: material.spec,
        materialMainUnit: material.mainUnit.name,
        materialId: material.materialId,
        materialCode: material.code,
        materialName: material.name,
        materialType: material.materialType
      }));
      dispatch(slice.actions.getMaterialDropdownSuccess([{ value: '', label: '' }, ...materialDropdown]));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getApprovedBOMDropdown() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: '/v1/bom/bom/parent-code',
        featureCode: 'user.create'
      });
      if (!isEmpty(response.data)) {
        const approvedBOMDropdown = response.data.map((bom) => ({
          value: bom.factoryPk,
          label: `${bom.parentCode.code} (Version: ${bom.bomVersionParent})`,
          factory: bom.pk.factoryCode,
          version: bom.bomVersionParent,
          materialPk: bom.parentCode.factoryPk,
          materialDescription: bom.parentCode.description,
          materialSpec: bom.parentCode.spec,
          materialMainUnit: bom.parentCode.mainUnit.name,
          materialId: bom.parentCode.materialId,
          materialCode: bom.parentCode.code,
          materialStock: bom.parentCode.name,
          validFrom: bom.validFrom,
          testQty: bom.testQtyParent ? bom.testQtyParent : 0
        }));
        dispatch(slice.actions.getApprovedBOMDropdownSuccess([{ value: '', label: '' }, ...approvedBOMDropdown]));
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
