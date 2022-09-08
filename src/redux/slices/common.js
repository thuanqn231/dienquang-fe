import { is, keys, path, pipe } from 'ramda';
import { createSlice } from '@reduxjs/toolkit';
import { query } from '../../core/api';


// ----------------------------------------------------------------------
const initialState = {
  commonCodes: [],
  lossCommon: [],
  shiftCommon: [],
  typeCommon: [],
  groupCommon: [],
  devStatusCommon: [],
  workingTypeCommon: [],
  operationHierachy: 0,
};

const slice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    // GET Common Codes
    getCommonCodesSuccess(state, action) {
      state.commonCodes = action.payload;
    },
    getLossCommonSuccess(state, action) {
      state.lossCommon = action.payload;
    },
    getShiftCommonSuccess(state, action) {
      state.shiftCommon = action.payload;
    },
    getGroupCommonSuccess(state, action) {
      state.groupCommon = action.payload;
    },
    getTypeCommonSuccess(state, action) {
      state.typeCommon = action.payload;
    },
    getWorkingTypeCommonCode(state, action) {
      state.workingTypeCommon = action.payload;
    },
    getDevStatusCommonSuccess(state, action) {
      state.devStatusCommon = action.payload;
    },
    operationHierachy(state, action) {
      state.operationHierachy = action.payload;
    }

  }
});

// Reducer
export default slice.reducer;
// Actions
export const { operationHierachy } = slice.actions;
// ----------------------------------------------------------------------

function mapDataToItems(data = []) {
  return data.map((item = {}) => ({
    label: item.CODENM || item['IPX_COMMONCODE.CODENM'],
    value: item.CODEID || item['IPX_COMMONCODE.CODEID']
  }));
}

function mapCommonCode(codes) {
  const commonCodes = { codes: {} };
  codes.forEach((code) => {
    const key = pipe(keys, (_keys) => is(Array, _keys) && is(String, _keys[0]) && _keys[0])(code);

    if (key) {
      commonCodes.codes[key] = pipe(path([key, 'CODES']), mapDataToItems)(code);
    }
  });

  return commonCodes;
}
export const SET_COMMON_CODE = '[COMMON] COMMON CODE';
/**
 * Set User Data
 */
export function setCommonCodeData(codes) {
  return (dispatch) => {
    /*
    Set Common Code Data
     */
    dispatch(slice.actions.getCommonCodesSuccess(mapCommonCode(codes)?.codes));
  };
}

export function getLossCommonCode() {
  return async (dispatch) => {
    try {
      const res = await query({
        url: '/v1/common_code/search',
        featureCode: 'user.create',
        params: {
          commonCode: JSON.stringify({
            groupId: "D036000"
          })
        }
      })

      const lossCommonCode = res.data.map(e => ({
        value: e.code,
        label: e.name,
        groupId: e.groupId,
        description: e.description,
        groupName: e.groupName,
        rank: e.rank,
        state: e.state
      }))
      dispatch(slice.actions.getLossCommonSuccess(lossCommonCode));

    } catch (error) {
      console.error(error.message)
    }
  };
}

export function getDevStatusCommon() {
  return async (dispatch) => {
    try {
      const res = await query({
        url: '/v1/common_code/search',
        featureCode: 'user.create',
        params: {
          commonCode: JSON.stringify({
            groupId: "D017000"
          })
        }
      })

      const devStatusCommonCode = res.data.map(e => ({
        value: e.code,
        label: e.name,
        groupId: e.groupId,
        description: e.description,
        groupName: e.groupName,
        rank: e.rank,
        state: e.state
      }))
      dispatch(slice.actions.getDevStatusCommonSuccess(devStatusCommonCode));

    } catch (error) {
      console.error(error.message)
    }
  };
}

export function getGroupCommonCode() {
  return async (dispatch) => {
    try {
      const res = await query({
        url: '/v1/common_code/search',
        featureCode: 'user.create',
        params: {
          commonCode: JSON.stringify({
            groupId: "D002000"
          })
        }
      })

      const lossCommonCode = res.data.map(e => ({
        value: e.code,
        label: e.name,
        groupId: e.groupId,
        description: e.description,
        groupName: e.groupName,
        rank: e.rank,
        state: e.state
      }))
      dispatch(slice.actions.getGroupCommonSuccess(lossCommonCode));

    } catch (error) {
      console.error(error.message)
    }
  };
}

export function getWorkingTypeCommonCode() {
  return async (dispatch) => {
    try {
      const res = await query({
        url: '/v1/common_code/search',
        featureCode: 'user.create',
        params: {
          commonCode: JSON.stringify({
            groupId: "D046000"
          })
        }
      })
      const lossCommonCode = res.data.map(e => ({
        value: e.code,
        label: e.name,
        groupId: e.groupId,
        description: e.description,
        groupName: e.groupName,
        rank: e.rank,
        state: e.state
      }))
      dispatch(slice.actions.getWorkingTypeCommonCode(lossCommonCode));

    } catch (error) {
      console.error(error.message)
    }
  };
}
export function getShiftCodeDropdown() {
  return async (dispatch) => {
    try {
      const res = await query({
        url: '/v1/common_code/search',
        featureCode: 'user.create',
        params: {
          commonCode: JSON.stringify({
            groupId: "D001000"
          })
        }
      })
      const shiftCommonCode = res.data.map(e => ({
        value: e.code,
        label: e.name,
        groupId: e.groupId,
        description: e.description,
        groupName: e.groupName,
        rank: e.rank,
        state: e.state
      }))
      dispatch(slice.actions.getShiftCommonSuccess(shiftCommonCode));

    } catch (error) {
      console.error(error.message)
    }
  };
}
export function getTypeCodeDropdown() {
  return async (dispatch) => {
    try {
      const res = await query({
        url: '/v1/common_code/search',
        featureCode: 'user.create',
        params: {
          commonCode: JSON.stringify({
            groupId: "D045000"
          })
        }
      })
      const typeCommonCode = res.data.map(e => ({
        value: e.code,
        label: e.name,
        groupId: e.groupId,
        description: e.description,
        groupName: e.groupName,
        rank: e.rank,
        state: e.state
      }))
      dispatch(slice.actions.getTypeCommonSuccess(typeCommonCode));

    } catch (error) {
      console.error(error.message)
    }
  };
}
