import { createSlice } from '@reduxjs/toolkit';
import { filter } from 'lodash';
import { query } from '../../core/api';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  userList: [],
  isOpenModal: false,
  selectedUserId: null,
};

const slice = createSlice({
  name: 'user',
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

    // DELETE USERS
    deleteUser(state, action) {
      const deleteUser = filter(state.userList, (user) => user.id !== action.payload);
      state.userList = deleteUser;
    },

    // GET MANAGE USERS
    getUserListSuccess(state, action) {
      state.isLoading = false;
      state.userList = action.payload;
    },

    // SELECT USER
    selectUser(state, action) {
      const userId = action.payload;
      state.isOpenModal = true;
      state.selectedUserId = userId;
    },

    // OPEN MODAL
    openModal(state) {
      state.isOpenModal = true;
    },

    // CLOSE MODAL
    closeModal(state) {
      state.isOpenModal = false;
      state.selectedUserId = null;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { onToggleFollow, deleteUser, openModal, closeModal, selectUser } = slice.actions;

// ----------------------------------------------------------------------

export function getUserList() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params = {
        'IPX_USER.FLAG': 'Y'
      };
      const response = await query({
        url: 'listIpxUser',
        params: {
          jsondata: JSON.stringify(params),
        },
      });
  
      // const response = await axios.get('/api/user/manage-users');
      dispatch(slice.actions.getUserListSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

