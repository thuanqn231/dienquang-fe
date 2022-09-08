import { createSlice } from '@reduxjs/toolkit';
import { query } from '../../core/api';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    lossType: '',
    classification: '',
    lossCls: '',
    lossItem: '',
    lossCause: '',
    productivity: 'Y',
    state: 'RUNNING'
  },
  lossCause: [],
  allLossCause: [],
  lossMasterDropdown: [],
  lossCategoryDropdown: [],
  lossClassificationDropdown: [],
  lossDetailClsDropDown: [],
  allLossMasterDropdown: []
};

const slice = createSlice({
  name: 'lossManagerment',
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

    // Get Loss Master Group Dropdown Success

    getLossMasterDropDownSuccess(state, action) {
      const lossMasterDropdown = action.payload;
      state.lossMasterDropdown = lossMasterDropdown;
    },

    getLossCategoryDropdownSuccess(state, action) {
      const lossCategoryDropdown = action.payload;
      state.lossCategoryDropdown = lossCategoryDropdown;
    },

    getLossClassificationDropdownSuccess(state, action) {
      const lossClassificationDropdown = action.payload;
      state.lossClassificationDropdown = lossClassificationDropdown;
    },

    getLossDetailClsDropdownSuccess(state, action) {
      const lossDetailClsDropdown = action.payload;
      state.lossDetailClsDropDown = lossDetailClsDropdown;
    },

    getAllLossMasterSuccess(state, action) {
      const allLossMasterDropdown = action.payload;
      state.allLossMasterDropdown = allLossMasterDropdown;
    },

    resetSearchParams(state) {
      const { searchParams } = initialState;
      state.searchParams = searchParams;
    },

    getLossCauseSuccess(state, action) {
      const lossCause = action.payload;
      state.lossCause = lossCause;
    },

    getLossAllCauseSuccess(state, action) {
      const allLossCause = action.payload;
      state.allLossCause = allLossCause;
    }

    // Get Business Partner Code Dropdown Success
    // getBizPartnerCodeDropdownSuccess(state, action) {
    //   const bizPartnerCodeDropdown = action.payload;
    //   state.bizPartnerCodeDropdown = bizPartnerCodeDropdown;
    // }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { setSearchParams, resetSearchParams } = slice.actions;

// ----------------------------------------------------------------------

export function getLossMasterDropdown() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: '/v1/loss/master/search',
        featureCode: 'user.create',
        params: {
          state: 'RUNNING'
        }
      });

      const lossMasterDropdown = response.data.map((lossMaster) => ({
        value: lossMaster.factoryPk,
        factory: lossMaster.pk.factoryCode,
        label: `${lossMaster.lossItem}`,
        description: lossMaster.description
      }));
      const lossCategoryDropdown = response.data.map((lossCategory) => ({
        value: lossCategory.factoryPk,
        factory: lossCategory.pk.factoryCode,
        label: `${lossCategory.lossType.name}`,
        description: lossCategory.lossType.description,
        code: lossCategory.lossType.code
      }));
      const lossClassificationDropdown = response.data.map((lossClassification) => ({
        value: lossClassification.factoryPk,
        factory: lossClassification.pk.factoryCode,
        label: `${lossClassification.classification.name}`,
        description: lossClassification.classification.description,
        code: lossClassification.classification.code
      }));
      const lossDetailClsDropDown = response.data.map((lossDetailCls) => ({
        value: lossDetailCls.factoryPk,
        factory: lossDetailCls.pk.factoryCode,
        label: `${lossDetailCls.lossCls.name}`,
        description: lossDetailCls.lossCls.description,
        code: lossDetailCls.lossCls.code
      }));
      const allLossMaster = response.data;
      dispatch(slice.actions.getAllLossMasterSuccess(allLossMaster));
      dispatch(slice.actions.getLossMasterDropDownSuccess(lossMasterDropdown));
      dispatch(slice.actions.getLossCategoryDropdownSuccess(lossCategoryDropdown));
      dispatch(slice.actions.getLossClassificationDropdownSuccess(lossClassificationDropdown));
      dispatch(slice.actions.getLossDetailClsDropdownSuccess(lossDetailClsDropDown));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getLossCauseDropdown() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: '/v1/loss/cause/search',
        featureCode: 'user.create',
        params: {}
      });

      const getLossCause = response.data.map((lossCause) => ({
        value: lossCause.factoryPk,
        label: lossCause.lossCause,
        code: lossCause.lossType.code
      }));

      dispatch(slice.actions.getLossAllCauseSuccess(response.data));
      dispatch(slice.actions.getLossCauseSuccess(getLossCause));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
