import { createSlice } from '@reduxjs/toolkit';
import { query } from '../../core/api';
// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  userInformation: {
    selectedWidget: '',
    isOpenUserInfoActionModal: false,
    searchParams: {
      factory: '',
      employeeId: '',
      employeeName: '',
      userId: '',
      state: 'RUNNING'
    }
  },
  userDropdown: []
};

const slice = createSlice({
  name: 'userManagement',
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
    setUserInfoSelectedWidget(state, action) {
      const userSelectedWidget = action.payload;
      state.userInformation.selectedWidget = userSelectedWidget;
    },

    // OPEN USER INFO ACTION MODAL
    openUserInfoActionModal(state) {
      state.userInformation.isOpenUserInfoActionModal = true;
    },

    // HIDE USER INFO ACTION MODAL
    closeUserInfoActionModal(state) {
      state.userInformation.isOpenUserInfoActionModal = false;
    },

    // SEARCH PARAMS EVENT
    setUserInfoSearchParams(state, action) {
      const searchParams = action.payload;
      state.userInformation.searchParams = searchParams;
    },
    // GET USER INFO
    getUserDropdownSuccess(state, action) {
      const userDropdown = action.payload;
      state.userDropdown = userDropdown;
    },
    resetSearchParams(state) {
      const { searchParams } = initialState.userInformation;
      state.userInformation.searchParams = searchParams;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const {
  setUserInfoSelectedWidget,
  openUserInfoActionModal,
  closeUserInfoActionModal,
  setUserInfoSearchParams,
  getUserDropdownSuccess,
  resetSearchParams
} = slice.actions;

// ----------------------------------------------------------------------

export function getUserDropdown(id = null) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      if (id) {
        const response = await query({
          url: '/v1/user/search',
          featureCode: 'user.create',
          params: {
            factoryCode: id
          }
        });
        const userDropdown = response.data.map((user) => ({
          factory: user.pk.factoryCode,
          fullName: user.fullName,
          id: user.factoryPk,
          email: user.email,
          department: user.department.factoryPk,
          departmentCode: user.department.code,
          departmentName: user.department.name,
          employeeId: user.userName,
          employeeNo: user.code,
          mobileNo: user.mobileNumber
        }));
        dispatch(getUserDropdownSuccess(userDropdown));
      } else {
        const response = await query({
          url: '/v1/user/getAll',
          featureCode: 'user.create'
        });
        const userDropdown = response.data.map((user) => ({
          factory: user.pk.factoryCode,
          fullName: user.fullName,
          id: user.factoryPk,
          email: user.email,
          department: user.department.factoryPk,
          departmentCode: user.department.code,
          departmentName: user.department.name,
          employeeId: user.userName,
          employeeNo: user.code,
          mobileNo: user.mobileNumber
        }));
        dispatch(getUserDropdownSuccess(userDropdown));
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
