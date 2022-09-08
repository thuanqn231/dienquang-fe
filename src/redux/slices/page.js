import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  hideMenu: false,
  activeTabs: [
    {
      pageCode: 'menu.dashboard',
      path: "/pages/C002000",
      label: "Dashboard",
      closeable: false
    }
  ],
  selectedWidget: {},
  searchParams: {},
  fmb: {
    hideMenu: true
  }
};

const slice = createSlice({
  name: 'page',
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

    // APPEND NEW TAB
    appendNewActiveTabSuccess(state, action) {
      state.isLoading = false;
      state.activeTabs = [...state.activeTabs, action.payload];
    },

    // DELETE TAB
    deleteActiveTabSuccess(state, action) {
      state.activeTabs = action.payload;
    },

    // UPDATE TAB
    updateActiveTabSuccess(state, action) {
      state.activeTabs = action.payload;
    },

    // UPDATE HIDE MENU
    updateHideMenu(state, action) {
      state.hideMenu = action.payload;
    },

    // UPDATE SELECTED WIDGET
    updateSelectedWidget(state, action) {
      state.selectedWidget = action.payload;
    },

    // UPDATE SELECTED WIDGET
    updateSearchParams(state, action) {
      state.searchParams = action.payload;
    },

    // UPDATE HIDE MENU
    updateHideMenuFmb(state, action) {
      state.fmb.hideMenu = action.payload;
    }

  }
});

// Reducer
export default slice.reducer;

// Actions
export const { deleteActiveTabSuccess, updateHideMenu, updateHideMenuFmb, updateSearchParams } = slice.actions;

// ----------------------------------------------------------------------

export function appendNewActiveTab(tab) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      dispatch(slice.actions.appendNewActiveTabSuccess(tab));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function updateActiveTab(tab) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      dispatch(slice.actions.updateActiveTabSuccess(tab));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function setSelectedWidget(widget) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      dispatch(slice.actions.updateSelectedWidget(widget));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
