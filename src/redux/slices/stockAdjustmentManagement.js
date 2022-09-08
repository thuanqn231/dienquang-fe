import { createSlice } from '@reduxjs/toolkit';
import { getCurrentDate } from '../../utils/formatTime';

// ----------------------------------------------------------------------

const curDate = getCurrentDate();

const initialState = {
  isLoading: false,
  error: false,
  searchParams: {
    materialType: '',
    fromDate: curDate,
    toDate: curDate,
    materialCode: '',
    materialId: '',
    materialDesc: '',
    supplier: '',
    stock: '',
    zone: '',
    bin: '',
    label: '',
    lotNo: '',
    stockStatus: '',
    state: 'RUNNING',
    isLotNo: false,
    isSupplier: false,
    isBoxNo: false,
    isStockStatus: false
  },
  operations: {
    split: {
      boxNo: '',
      labelQty: 0,
      materialPk: 'null-null',
      materialId: '',
      materialCode: '',
      materialDesc: '',
      unit: '',
      lotNo: '',
      supplier: '',
      stock: '',
      zone: '',
      bin: '',
      labelQty1: 0,
      lotNo1: '',
      labelNo1: '',
      labelQty2: 0,
      lotNo2: '',
      labelNo2: ''
    },
    merge: {
      boxNo1: '',
      labelQty1: 0,
      materialPk1: 'null-null',
      materialId1: '',
      materialCode1: '',
      materialDesc1: '',
      unit1: '',
      lotNo1: '',
      supplier1: '',
      stock1: '',
      zone1: '',
      bin1: '',
      boxNo2: '',
      labelQty2: 0,
      materialPk2: 'null-null',
      materialId2: '',
      materialCode2: '',
      materialDesc2: '',
      unit2: '',
      lotNo2: '',
      supplier2: '',
      stock2: '',
      zone2: '',
      bin2: '',
      stockMerge: '',
      zoneMerge: '',
      binMerge: '',
      lotNoMerge: '',
      labelNoMerge: ''
    },
    block: {
      boxNo: '',
      labelQty: 0,
      materialPk: 'null-null',
      materialId: '',
      materialCode: '',
      materialDesc: '',
      unit: '',
      lotNo: '',
      supplier: '',
      stock: '',
      zone: '',
      bin: '',
      reason: '',
      reasonDetail: ''
    },
    adjust: {
      boxNo: '',
      labelQty: 0,
      materialPk: 'null-null',
      materialId: '',
      materialCode: '',
      materialDesc: '',
      unit: '',
      lotNo: '',
      supplier: '',
      stock: '',
      zone: '',
      bin: '',
      reason: '',
      reasonDetail: ''
    },
    stockMove: {
      boxNo: '',
      labelQty: 0,
      materialPk: 'null-null',
      materialId: '',
      materialCode: '',
      materialDesc: '',
      unit: '',
      lotNo: '',
      supplier: '',
      stock: '',
      zone: '',
      bin: ''
    },
    grWtPo: {
      boxNo: '',
      labelQty: 0,
      materialPk: 'null-null',
      materialId: '',
      materialCode: '',
      materialDesc: '',
      unit: '',
      lotNo: '',
      supplier: '',
      stock: '',
      zone: '',
      bin: '',
      reason: '',
      reasonDetail: '',
      lineCode: '',
      lineName: ''
    }
  }
};

const slice = createSlice({
  name: 'stockAdjustmentManagement',
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

    // SET SEARCH PARAMS
    setSearchParams(state, action) {
      const searchParams = action.payload;
      state.searchParams = searchParams;
    },

    // SET OPERATIONS
    setOperations(state, action) {
      const operations = action.payload;
      state.operations = operations;
    },

    resetSearchParams(state) {
      const { searchParams } = initialState;
      state.searchParams = searchParams;
    },

    resetOperation(state) {
      const { operations } = initialState;
      state.operations = operations;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { setSearchParams, setOperations, resetSearchParams, resetOperation } = slice.actions;

// ----------------------------------------------------------------------
