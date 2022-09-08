import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  roleInformation: {
    selectedWidget: '',
    searchParams: {
      roleCode: '',
      roleName: '',
      state: 'RUNNING'
    }
  }
};

const slice = createSlice({
  name: 'roleManagement',
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
    setRoleInfoSelectedWidget(state, action) {
      const roleInfoSelectedWidget = action.payload;
      state.roleInformation.selectedWidget = roleInfoSelectedWidget;
    },

    // SEARCH PARAMS EVENT
    setRoleInfoSearchParams(state, action) {
      const searchParams = action.payload;
      state.roleInformation.searchParams = searchParams;
    },
    resetSearchParams(state) {
      const { searchParams } = initialState.roleInformation;
      state.roleInformation.searchParams = searchParams;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { setRoleInfoSelectedWidget, setRoleInfoSearchParams, resetSearchParams } = slice.actions;

// ----------------------------------------------------------------------
