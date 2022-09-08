import { createSlice } from '@reduxjs/toolkit';
import { query } from '../../core/api';
import { fDate } from '../../utils/formatTime'

// ----------------------------------------------------------------------
const curDate = new Date();

const date = new Date();
const fromSearch = new Date(date.getFullYear(), date.getMonth() - 3, date.getDate());
const toSearch = new Date(date.getFullYear(), date.getMonth() + 3, date.getDate());

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    fromDate: fDate(curDate),
    toDate: fDate(curDate),
    aprStatus: '',
    prodStatus: '',
    planId: '',
    poNo: '',
    poType: '',
    modelCode: '',
    modelName: '',
    topModel: '',
    process: '',
    state: 'RUNNING'
  },
  productionOrderDropdown: [],
  productionOrderChildDropdown: [],
  planDropdown: [],
  planDropdownWPo: []
};

const slice = createSlice({
  name: 'productionOrder',
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

    getProductionOrderDropdownSuccess(state, action) {
      const productionOrderDropdown = action.payload;
      state.productionOrderDropdown = productionOrderDropdown;
    },

    getPlanDropdownSucces(state, action) {
      const planDropdown = action.payload;
      state.planDropdown = planDropdown;
    },

    getProductionOrderChildDropdownSuccess(state, action) {
      const productionOrderChildDropdown = action.payload;
      state.productionOrderChildDropdown = productionOrderChildDropdown;
    },
    getPlanDropDownWithDiffPOSuccess(state, action) {
      const planDropDownWithDiffPOSuccess = action.payload;
      state.planDropdownWPo = planDropDownWithDiffPOSuccess;
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
export function getPlanDropDown() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: '/v1/productionOrder/search',
        featureCode: 'user.create',
        params: {
          from: fromSearch,
          to: toSearch,
          aprStatus: 'D018003'
        }
      });
      const productionOrderDropdown = response.data.map((prodOrder) => ({
        factory: prodOrder.pk.factoryCode,
        code: prodOrder.modelId.parentCode.code,
        value: prodOrder.factoryPk,
        label: prodOrder.modelId.parentCode.code
      }));
      dispatch(slice.actions.getPlanDropdownSucces([{ value: '', label: '' }, ...productionOrderDropdown]));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getPlanDropDownWithDiffPO() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: '/v1/productionOrder/search',
        featureCode: 'user.create',
        params: {
          from: fromSearch,
          to: toSearch,
          aprStatus: 'D018003'
        }
      });
      const productionOrderDropdown = response.data.map((prodOrder) => ({
        factory: prodOrder.pk.factoryCode,
        code: prodOrder.modelId.parentCode.code,
        value: prodOrder.factoryPk,
        label: `${prodOrder.modelId.parentCode.code} (${prodOrder.prodOrderNo})`
      }));
      dispatch(slice.actions.getPlanDropDownWithDiffPOSuccess([{ value: '', label: '' }, ...productionOrderDropdown]));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getProductionOrderDropdown() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: '/v1/productionOrder/search',
        featureCode: 'user.create',
        params: {
          from: fromSearch,
          to: toSearch,
          aprStatus: 'D018003'
        }
      });
      const productionOrderDropdown = response.data.map((prodOrder) => ({
        factory: prodOrder.pk.factoryCode,
        value: prodOrder.factoryPk,
        label: prodOrder.prodOrderNo,
        materialCode: prodOrder.modelId.parentCode.code,
        bomVersionParent: prodOrder.modelId.bomVersionParent,
        materialDescription: prodOrder.modelId.parentCode.description,
        materialId: prodOrder.modelId.parentCode.materialId,
        line: prodOrder.line.name,
        linePk: prodOrder.line.factoryPk,
        poPlanQty: prodOrder.planQty,
        poActualQty: prodOrder.actualQty,
        process: prodOrder.process.name,
        processByLinePk: prodOrder.line.processType.code
      }));
      dispatch(slice.actions.getProductionOrderDropdownSuccess([{ value: '', label: '' }, ...productionOrderDropdown]));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getProductionOrderChidDropdown() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: '/v1/productionOrder/search',
        featureCode: 'user.create',
        params: {
          from: fromSearch,
          to: toSearch,
          aprStatus: 'D018003'
        }
      });
      const productionOrderChildDropdown = response.data.map((prodOrder) => ({
        factory: prodOrder.pk.factoryCode,
        value: prodOrder.factoryPk,
        label: prodOrder.prodOrderNo,
        materialCode: prodOrder.modelId.childCode.code,
        bomVersion: prodOrder.modelId.bomVersion,
        materialDescription: prodOrder.modelId.childCode.description,
        materialId: prodOrder.modelId.childCode.materialId,
        line: prodOrder.line.name,
        linePk: prodOrder.line.factoryPk,
        process: prodOrder.line.processType.code
      }));
      dispatch(
        slice.actions.getProductionOrderChildDropdownSuccess([
          { value: '', label: '' },
          ...productionOrderChildDropdown
        ])
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
