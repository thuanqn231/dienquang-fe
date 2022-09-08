import { createSlice } from '@reduxjs/toolkit';
import { getCurrentDate } from '../../utils/formatTime'

// ----------------------------------------------------------------------

const validFrom = new Date(2022, 0, 1);
const validTo = new Date(2099, 11, 31);

const initialState = {
  isLoading: false,
  error: false,
  isOpenBOMActionModal: false,
  searchParams: {
    factory: '',
    searchBy: 'top',
    materialCode: '',
    materialName: '',
    version: '',
    from: validFrom,
    to: validTo,
    bomStatus: 'APPROVED',
    state: 'RUNNING'
  }
};

const slice = createSlice({
  name: 'bomEcnManagement',
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

    // OPEN USER INFO ACTION MODAL
    openBOMActionModal(state) {
      state.isOpenBOMActionModal = true;
    },

    // HIDE USER INFO ACTION MODAL
    closeBOMActionModal(state) {
      state.isOpenBOMActionModal = false;
    },

    // SET SEARCH PARAMS
    setSearchParams(state, action) {
      const searchParams = action.payload;
      state.searchParams = searchParams;
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
export const { openBOMActionModal, closeBOMActionModal, setSearchParams, resetSearchParams } = slice.actions;

// ----------------------------------------------------------------------
