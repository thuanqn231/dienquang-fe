import { createSlice } from '@reduxjs/toolkit';
import { query } from '../../core/api';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    code: '',
    name: '',
    state: 'RUNNING',
    partnerGroup: '',
    type: '',
    partnerCode: '',
    englishName: '',
    nationalName: '',
    tradeType: '',
    taxCode: ''
  },
  bizPartnerGroupDropdown: [],
  bizPartnerCodeDropdown: [],
  bizPartnerCodeSingleDropdown: []
};

const slice = createSlice({
  name: 'bizPartnerManagement',
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

    // Get Business Partner Group Dropdown Success
    getBizPartnerGroupDropdownSuccess(state, action) {
      const bizPartnerGroupDropdown = action.payload;
      state.bizPartnerGroupDropdown = bizPartnerGroupDropdown;
    },

    // Get Business Partner Code Dropdown Success
    getBizPartnerCodeDropdownSuccess(state, action) {
      const bizPartnerCodeDropdown = action.payload;
      state.bizPartnerCodeDropdown = bizPartnerCodeDropdown;
    },

    getBizPartnerCodeSingleDropdownSuccess(state, action) {
      const bizPartnerCodeSingleDropdown = action.payload;
      state.bizPartnerCodeSingleDropdown = bizPartnerCodeSingleDropdown;
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

export function getBizPartnerGroupDropdown() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: '/v1/partner/group/search',
        featureCode: 'user.create',
        params: {
          state: 'RUNNING'
        }
      });
      const bizPartnerGroupDropdown = response.data.map((bizGroup) => ({
        value: bizGroup.factoryPk,
        factory: bizGroup.pk.factoryCode,
        label: `${bizGroup.name} (${bizGroup.code})`,
        description: bizGroup.description
      }));
      dispatch(slice.actions.getBizPartnerGroupDropdownSuccess(bizPartnerGroupDropdown));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
export function getBizPartnerCodeDropdown() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: '/v1/partner/code/search',
        featureCode: 'user.create',
        params: {
          state: 'RUNNING'
        }
      });
      const bizPartnerCodeDropdown = response.data.map((bizCode) => ({
        value: bizCode.factoryPk,
        factory: bizCode.pk.factoryCode,
        label: bizCode.nationalName,
        type: bizCode.type.code
      }));
      dispatch(slice.actions.getBizPartnerCodeDropdownSuccess(bizPartnerCodeDropdown));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
export function getBizPartnerCodeSingleDropdown() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: '/v1/partner/code/search',
        featureCode: 'user.create',
        params: {
          state: 'RUNNING'
        }
      });
      const bizPartnerCodeDropdown = response.data.map((bizCode) => ({
        value: bizCode.factoryPk,
        factory: bizCode.pk.factoryCode,
        label: bizCode.nationalName,
        type: bizCode.type.code
      }));
      dispatch(slice.actions.getBizPartnerCodeSingleDropdownSuccess(bizPartnerCodeDropdown));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
