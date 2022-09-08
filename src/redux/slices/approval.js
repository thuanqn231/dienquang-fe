import { createSlice } from '@reduxjs/toolkit';
import { mutate, query } from '../../core/api';

// ----------------------------------------------------------------------

function objFromArray(array, key = 'factoryPk') {
  return array.reduce((accumulator, current) => {
    accumulator[current[key]] = current;
    return accumulator;
  }, {});
}

const initialState = {
  isLoading: false,
  error: false,
  approvals: { byId: {}, allIds: [] },
  approval: {},
  unreadApproval: {},
  labels: [],
  selectedApprovalId: null,
  hideApprovalList: false,
  hideApprovalSidebar: false,
  selectedSidebarItem: "submission",
  isOpenApprovalActionModal: false,
  isOpenApprovalDetail: false,
  searchKeyword: '',
  sidebarMapParams: {
    submission: {
      documentStates: ['OPEN', 'NOTIFIED', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'RECALL']
    },
    postponed: {
      documentStates: ['REJECTED']
    },
    pending: {
      documentStates: ['NOTIFIED', 'IN_PROGRESS'],
      approvalStates: ['NOTIFIED', 'READ'],
      approvalMemberTypes: ['APPROVER', 'CONSENT'],
    },
    approved: {
      documentStates: ['APPROVED', 'IN_PROGRESS'],
      approvalMemberTypes: ['APPROVER', 'CONSENT'],
      approvalStates: ["APPROVED", 'CONSENT'],
    },
    notification: {
      documentStates: ['NOTIFIED', 'OPEN', 'NOTIFIED', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'RECALL'],
      approvalStates: ['NOTIFIED', 'READ'],
      approvalMemberTypes: ['NOTIFICATION']
    }
  }
};

const slice = createSlice({
  name: 'approval',
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

    // GET APPROVALS
    getApprovalsSuccess(state, action) {
      const approvals = action.payload;
      state.isLoading = false;
      state.selectedApprovalId = null;
      state.approvals.byId = objFromArray(approvals);
      state.approvals.allIds = Object.keys(state.approvals.byId);
    },

    // GET APPROVAL
    getApprovalSuccess(state, action) {
      const approval = action.payload;
      state.isLoading = false;
      state.approval = approval;
    },

    // GET UNREAD APPROVAL
    getUnreadApprovalSuccess(state, action) {
      const unread = action.payload;
      state.isLoading = false;
      state.unreadApproval = unread;
    },

    actionApprovalSuccess(state) {
      state.isLoading = false;
      state.selectedApprovalId = null;
      state.isOpenApprovalActionModal = false;
    },

    // GET MAIL
    getMailSuccess(state, action) {
      const mail = action.payload;

      state.mails.byId[mail.id] = mail;
      if (!state.mails.allIds.includes(mail.id)) {
        state.mails.allIds.push(mail.id);
      }
    },
    // SELECT EVENT
    selectApproval(state, action) {
      const approvalId = action.payload;
      state.selectedApprovalId = approvalId;
    },

    // SELECT EVENT
    setSelectedSidebarItem(state, action) {
      const sidebarItem = action.payload;
      state.selectedSidebarItem = sidebarItem;
    },

    // HIDE APPROVAL LIST EVENT
    setHideApprovalList(state, action) {
      state.hideApprovalList = action.payload;
    },

    // HIDE APPROVAL SIDEBAR EVENT
    setHideApprovalSidebar(state, action) {
      state.hideApprovalSidebar = action.payload;
    },

    // OPEN APPROVAL ACTION MODAL
    openApprovalActionModal(state) {
      state.isOpenApprovalActionModal = true;
    },

    // HIDE APPROVAL ACTION MODAL
    closeApprovalActionModal(state) {
      state.isOpenApprovalActionModal = false;
    },

    // OPEN APPROVAL DETAIL MODAL
    openApprovalDetailModal(state) {
      state.isOpenApprovalDetail = true;
    },

    // HIDE APPROVAL DETAIL MODAL
    closeApprovalDetailModal(state) {
      state.isOpenApprovalDetail = false;
    },

    // SEARCH KEYWORD EVENT
    setSearchKeyword(state, action) {
      const keyword = action.payload;
      state.searchKeyword = keyword;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { selectApproval, setHideApprovalList, setSelectedSidebarItem, openApprovalActionModal, closeApprovalActionModal, setSearchKeyword, setHideApprovalSidebar, openApprovalDetailModal, closeApprovalDetailModal } = slice.actions;


// ----------------------------------------------------------------------

export function getApprovals(params) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await mutate({
        url: '/document-request/get-by-criteria',
        data: params,
        method: 'post',
        featureCode: 'code.create'
      })
      dispatch(getUnreadApproval());
      dispatch(slice.actions.getApprovalsSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getIncomeApprovals(params) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await mutate({
        url: '/document-request/get-by-approval-criteria',
        data: params,
        method: 'post',
        featureCode: 'code.create'
      })
      dispatch(getUnreadApproval());
      dispatch(slice.actions.getApprovalsSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getApprovalById(approvalId) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: `/document-request/${approvalId}`,
        featureCode: 'code.create'
      })
      dispatch(slice.actions.getApprovalSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getUnreadApproval() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await query({
        url: `/document-request/count-unread`,
        featureCode: 'code.create'
      })
      dispatch(slice.actions.getUnreadApprovalSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
