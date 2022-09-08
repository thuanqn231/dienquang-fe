import { mutate, query } from '../../core/api';
import { isNullVal } from '../../utils/formatString';
import { parseOrgSearchFactory } from '../../utils/pageConfig';

export const OperationEnum = {
  SPLIT: 'D026003',
  MERGE: 'D026004',
  BLOCK_RELEASE: 'D026005',
  ADJUST: 'D026006',
  GI_WT_PO: 'D026007',
  GR_WT_PO: 'D026008',
  STOCK_MOVE: 'D026009'
};

export const OperationCode = {
  D026003: 'SPLIT',
  D026004: 'MERGE',
  D026005: 'BLOCK/RELEASE',
  D026006: 'ADJUST',
  D026007: 'GI WITHOUT PO',
  D026008: 'GR WITHOUT PO',
  D026009: 'STOCK MOVE'
};

export const ScanLabelEnum = {
  SCAN_LABEL_1: 'SCAN_LABEL_1',
  SCAN_LABEL_2: 'SCAN_LABEL_2'
};

/** handle validate param */

export const handleValidateBeforeProcess = (action, operations, boxNo1, boxNo2) => {
  switch (action) {
    case OperationEnum.SPLIT:
      return validateSplit(operations, boxNo1);
    case OperationEnum.MERGE:
      return validateMerge(operations, boxNo1, boxNo2);
    case OperationEnum.BLOCK_RELEASE:
      return validateBlock(operations, boxNo1);
    case OperationEnum.ADJUST:
      return validateAdjust(operations, boxNo1);
    case OperationEnum.GI_WT_PO:
      return validateGiWtPo(operations, boxNo1);
    case OperationEnum.GR_WT_PO:
      return validateGrWtPo(operations, boxNo1);
    case OperationEnum.STOCK_MOVE:
      return validateStockMove(operations, boxNo1);
    default:
      throw new Error(`Unknown action ${action}`);
  }
};

const validateSplit = (operations, boxNo1) => {
  let isValid = true;
  const { split: splitOperation } = operations;
  const splitErr = {};
  if (!boxNo1) {
    isValid = false;
    splitErr.boxNo = 'Label is required';
  }
  if (splitOperation.stockQty1 <= 0) {
    isValid = false;
    splitErr.stockQty1 = 'Label 1 Qty must be greater than 0';
  }
  if (splitOperation.stockQty1 >= splitOperation.stockQty) {
    isValid = false;
    splitErr.stockQty1 = 'Label 1 Qty must be less than Original Label Qty';
  }

  return { isValid, error: { split: splitErr } };
};

const validateMerge = (operations, boxNo1, boxNo2) => {
  let isValid = true;
  const { merge: mergeOperation } = operations;
  const mergeErr = {};
  if (isNullVal(boxNo1)) {
    isValid = false;
    mergeErr.boxNo1 = 'Label 1 is required';
  }
  if (isNullVal(boxNo2)) {
    isValid = false;
    mergeErr.boxNo2 = 'Label 2 is required';
  }
  if (isNullVal(mergeOperation.stockMerge)) {
    isValid = false;
    mergeErr.stockMerge = 'Merged Label Storage is required';
  }
  if (isNullVal(mergeOperation.zoneMerge)) {
    isValid = false;
    mergeErr.zoneMerge = 'Merged Label Zone is required';
  }
  if (isNullVal(mergeOperation.binMerge)) {
    isValid = false;
    mergeErr.binMerge = 'Merged Label Bin is required';
  }
  if (
    !isNullVal(mergeOperation.factoryPk1) &&
    !isNullVal(mergeOperation.factoryPk2) &&
    mergeOperation.factoryPk1 === mergeOperation.factoryPk2
  ) {
    isValid = false;
    mergeErr.boxNo1 = 'Label 1 must be different than Label 2';
    mergeErr.boxNo2 = 'Label 2 must be different than Label 1';
  }

  return { isValid, error: { merge: mergeErr } };
};

const validateBlock = (operations, boxNo1) => {
  let isValid = true;
  const { block: blockOperation } = operations;
  const blockErr = {};
  if (isNullVal(blockOperation.reason)) {
    isValid = false;
    blockErr.reason = 'Reason is required';
  }
  if (isNullVal(blockOperation.detailReason)) {
    isValid = false;
    blockErr.detailReason = 'Reason Detail is required';
  }
  if (isNullVal(boxNo1)) {
    isValid = false;
    blockErr.boxNo = 'Label is required';
  }

  return { isValid, error: { block: blockErr } };
};

const validateAdjust = (operations, boxNo1) => {
  let isValid = true;
  const { adjust: adjustOperation } = operations;
  const adjustErr = {};
  if (isNullVal(adjustOperation.reason)) {
    isValid = false;
    adjustErr.reason = 'Reason is required';
  }
  if (isNullVal(adjustOperation.detailReason)) {
    isValid = false;
    adjustErr.detailReason = 'Reason Detail is required';
  }
  if (isNullVal(boxNo1)) {
    isValid = false;
    adjustErr.boxNo = 'Label is required';
  }
  if (adjustOperation.stockQty <= 0) {
    isValid = false;
    adjustErr.stockQty = 'Label Qty must be greater than 0';
  }

  return { isValid, error: { adjust: adjustErr } };
};

const validateGiWtPo = (operations, boxNo1) => {
  let isValid = true;
  const { giWtPo: giWtPoOperation } = operations;
  const giWtPoErr = {};
  if (isNullVal(giWtPoOperation.reason)) {
    isValid = false;
    giWtPoErr.reason = 'Reason is required';
  }
  if (isNullVal(giWtPoOperation.detailReason)) {
    isValid = false;
    giWtPoErr.detailReason = 'Reason Detail is required';
  }
  if (isNullVal(boxNo1)) {
    isValid = false;
    giWtPoErr.boxNo = 'Label is required';
  }
  if (giWtPoOperation.stockQty <= 0) {
    isValid = false;
    giWtPoErr.stockQty = 'Label Qty must be greater than 0';
  }

  return { isValid, error: { giWtPo: giWtPoErr } };
};

const validateGrWtPo = (operations, boxNo1) => {
  let isValid = true;
  const { grWtPo: grWtPoOperation } = operations;
  const grWtPoErr = {};
  if (isNullVal(grWtPoOperation.reason)) {
    isValid = false;
    grWtPoErr.reason = 'Reason is required';
  }
  if (isNullVal(grWtPoOperation.detailReason)) {
    isValid = false;
    grWtPoErr.detailReason = 'Reason Detail is required';
  }
  if (isNullVal(boxNo1)) {
    isValid = false;
    grWtPoErr.boxNo = 'Label is required';
  }
  if (isNullVal(grWtPoOperation.stock)) {
    isValid = false;
    grWtPoErr.stock = 'Storage is required';
  }
  if (isNullVal(grWtPoOperation.zone)) {
    isValid = false;
    grWtPoErr.zone = 'Zone is required';
  }
  if (isNullVal(grWtPoOperation.bin)) {
    isValid = false;
    grWtPoErr.bin = 'Bin is required';
  }

  return { isValid, error: { grWtPo: grWtPoErr } };
};

const validateStockMove = (operations, boxNo1) => {
  let isValid = true;
  const { stockMove: stockMoveOperation } = operations;
  const stockMoveErr = {};
  if (isNullVal(boxNo1)) {
    isValid = false;
    stockMoveErr.boxNo = 'Label is required';
  }
  if (isNullVal(stockMoveOperation.stock)) {
    isValid = false;
    stockMoveErr.stock = 'Storage is required';
  }
  if (isNullVal(stockMoveOperation.zone)) {
    isValid = false;
    stockMoveErr.zone = 'Zone is required';
  }
  if (isNullVal(stockMoveOperation.bin)) {
    isValid = false;
    stockMoveErr.bin = 'Bin is required';
  }

  return { isValid, error: { stockMove: stockMoveErr } };
};

/** handle request adjust */

export const handleRequestAdjust = async (action, operations) => {
  switch (action) {
    case OperationEnum.SPLIT:
      return handleSplit(operations);
    case OperationEnum.MERGE:
      return handleMerge(operations);
    case OperationEnum.BLOCK_RELEASE:
      return handleBlockRelease(operations);
    case OperationEnum.ADJUST:
      return handleAdjust(operations);
    case OperationEnum.STOCK_MOVE:
      return handleStockMove(operations);
    case OperationEnum.GR_WT_PO:
      return handleGrWtPo(operations);
    case OperationEnum.GI_WT_PO:
      return handleGiWtPo(operations);
    default:
      throw new Error(`Unknown action ${action}`);
  }
};

const handleSplit = async (operations) => {
  const splitRequest = {
    multiAdjustmentParameter: {
      sourceStockMovement: {
        factoryPk: operations?.split?.factoryPk,
        label: {
          lotNo: operations?.split?.lotNo1
        }
      },
      targetStockMovement: {
        stockQty: operations?.split?.stockQty2,
        lotNo: operations?.split?.lotNo1
      }
    },
    operationType: OperationEnum.SPLIT
  };
  return requestAdjust(splitRequest);
};

const handleStockMove = async (operations) => {
  const stockMoveRequest = {
    singleAdjustmentParameter: {
      stockMovement: {
        factoryPk: operations?.stockMove?.factoryPk,
        bin: {
          factoryPk: operations?.stockMove?.bin
        }
      }
    },
    operationType: OperationEnum.STOCK_MOVE
  };
  return requestAdjust(stockMoveRequest);
};

const handleGrWtPo = async (operations) => {
  const grWtPoRequest = {
    singleAdjustmentParameter: {
      stockMovement: {
        label: {
          factoryPk: operations?.grWtPo?.labelPk
        },
        bin: {
          factoryPk: operations?.grWtPo?.bin
        }
      },
      line: {
        factoryPk: operations?.grWtPo?.linePk
      },
      reason: {
        code: operations.grWtPo.reason
      },
      reasonDetail: operations.grWtPo.detailReason
    },
    operationType: OperationEnum.GR_WT_PO
  };
  return requestAdjust(grWtPoRequest);
};

const handleAdjust = async (operations) => {
  const adjustRequest = {
    singleAdjustmentParameter: {
      stockMovement: {
        factoryPk: operations?.adjust?.factoryPk,
        stockQty: operations?.adjust?.stockQty
      },
      reason: {
        code: operations.adjust.reason
      },
      reasonDetail: operations.adjust.detailReason
    },
    operationType: OperationEnum.ADJUST
  };
  return requestAdjust(adjustRequest);
};

const handleGiWtPo = async (operations) => {
  const giWtPoRequest = {
    singleAdjustmentParameter: {
      stockMovement: {
        factoryPk: operations?.giWtPo?.factoryPk,
        stockQty: operations?.giWtPo?.stockQty
      },
      line: {
        factoryPk: operations?.giWtPo?.linePk
      },
      reason: {
        code: operations.giWtPo.reason
      },
      reasonDetail: operations.giWtPo.detailReason
    },
    operationType: OperationEnum.GI_WT_PO
  };
  return requestAdjust(giWtPoRequest);
};

const handleBlockRelease = async (operations) => {
  const blockReleaseRequest = {
    singleAdjustmentParameter: {
      stockMovement: {
        factoryPk: operations?.block?.factoryPk
      },
      reason: {
        code: operations.block.reason
      },
      reasonDetail: operations.block.detailReason
    },
    operationType: OperationEnum.BLOCK_RELEASE
  };
  return requestAdjust(blockReleaseRequest);
};

const handleMerge = async (operations) => {
  const mergeRequest = {
    multiAdjustmentParameter: {
      sourceStockMovement: {
        factoryPk: operations?.merge?.factoryPk1,
        label: {
          lotNo: operations?.merge?.lotNoMerge,
        },
        bin: {
          factoryPk: operations?.merge?.binMerge
        }
      },
      targetStockMovement: {
        factoryPk: operations?.merge?.factoryPk2
      }
    },
    operationType: OperationEnum.MERGE
  };
  return requestAdjust(mergeRequest);
};

const requestAdjust = async (request) => {
  const res = await mutate({
    url: '/v1/stock-movement/adjustment',
    data: request,
    method: 'post',
    featureCode: 'user.create'
  });

  return res;
};

/** handle query stock movement */

export const handleQueryStockMovement = async (scanType, boxNo, action, operations) => {
  const queryByLabel = scanType === 'SCAN_BY_LABEL';
  const res = await query({
    url: `/v1/stock-movement/scan?labelNo=${boxNo}&queryByLabel=${queryByLabel}`,
    featureCode: 'user.create'
  });
  const { data } = res;
  console.log({data});
  if (scanType === undefined || scanType === 'SCAN_BY_LABEL') {
    return buildOperationForSingleScan(data, operations, action);
  }
  return buildOperationForMergeScan(data, operations, scanType);
};

const buildOperationForMergeScan = (data, operations, scanType) => {
  let queryOperations;
  const labelInfo = data?.stockMovements[0];
  if (scanType === ScanLabelEnum.SCAN_LABEL_1) {
    queryOperations = {
      ...operations.merge,
      factoryPk1: labelInfo?.factoryPk,
      boxNo1: labelInfo?.boxNo,
      stockQty1: labelInfo?.stockQty,
      materialPk1: labelInfo?.label?.labelDetail?.material?.factoryPk,
      materialId1: labelInfo?.label?.labelDetail?.material?.materialId,
      materialCode1: labelInfo?.label?.labelDetail?.material?.code,
      materialDesc1: labelInfo?.label?.labelDetail?.material?.description,
      unit1: labelInfo?.label?.labelDetail?.material?.mainUnit?.name,
      lotNo1: labelInfo?.label?.labelDetail?.lotNo,
      supplier1: labelInfo?.label?.labelDetail?.supplier?.englishName,
      stock1: labelInfo?.bin?.zone?.stock?.name,
      zone1: labelInfo?.bin?.zone?.name,
      bin1: labelInfo?.bin?.name,
      stockMerge: labelInfo?.bin?.zone?.stock?.factoryPk,
      zoneMerge: labelInfo?.bin?.zone?.factoryPk,
      binMerge: labelInfo?.bin?.factoryPk,
      lotNoMerge: labelInfo?.label?.labelDetail?.lotNo
    };
  } else {
    queryOperations = {
      ...operations.merge,
      factoryPk2: labelInfo?.factoryPk,
      boxNo2: labelInfo?.boxNo,
      stockQty2: labelInfo?.stockQty,
      materialPk2: labelInfo?.label?.labelDetail?.material?.factoryPk,
      materialId2: labelInfo?.label?.labelDetail?.material?.materialId,
      materialCode2: labelInfo?.label?.labelDetail?.material?.code,
      materialDesc2: labelInfo?.label?.labelDetail?.material?.description,
      unit2: labelInfo?.label?.labelDetail?.material?.mainUnit?.name,
      lotNo2: labelInfo?.label?.labelDetail?.lotNo,
      supplier2: labelInfo?.label?.labelDetail?.supplier?.englishName,
      stock2: labelInfo?.bin?.zone?.stock?.name,
      zone2: labelInfo?.bin?.zone?.name,
      bin2: labelInfo?.bin?.name
    };
  }

  queryOperations.disableLotNoMerge = data?.allowChangeLotNo !== 'Y';

  return {
    ...operations,
    merge: queryOperations
  };
};

const buildOperationForSingleScan = (data, operations, action) => {
  const labelInfo = data?.stockMovements[0];
  const queryOperations = {
    factoryPk: labelInfo?.factoryPk,
    labelPk: labelInfo?.label?.factoryPk,
    boxNo: labelInfo?.label?.labelNo,
    stockQty: labelInfo?.stockQty,
    materialPk: labelInfo?.label?.labelDetail?.material?.factoryPk,
    materialId: labelInfo?.label?.labelDetail?.material?.materialId,
    materialCode: labelInfo?.label?.labelDetail?.material?.code,
    materialDesc: labelInfo?.label?.labelDetail?.material?.description,
    unit: labelInfo?.label?.labelDetail?.material?.mainUnit?.name,
    lotNo: labelInfo?.label?.labelDetail?.lotNo,
    supplier: labelInfo?.label?.labelDetail?.supplier?.englishName,
    stock: labelInfo?.bin?.zone?.stock?.name,
    zone: labelInfo?.bin?.zone?.name,
    bin: labelInfo?.bin?.name,
    stockQty1: 0,
    lotNo1: '',
    labelNo1: '',
    lineName: ''
  };

  switch (action) {
    case OperationEnum.BLOCK_RELEASE:
      return {
        ...operations,
        block: queryOperations
      };
    case OperationEnum.ADJUST:
      return {
        ...operations, 
        adjust: queryOperations
      };
    case OperationEnum.GI_WT_PO:
      return {
        ...operations,
        giWtPo: queryOperations
      };
    case OperationEnum.GR_WT_PO: {
      queryOperations.stockQty = labelInfo?.label?.qty;
      return {
        ...operations,
        grWtPo: queryOperations
      };
    }
    case OperationEnum.STOCK_MOVE: {
      queryOperations.stock = labelInfo?.bin?.zone?.stock?.factoryPk;
      queryOperations.zone = labelInfo?.bin?.zone?.factoryPk;
      queryOperations.bin = labelInfo?.bin?.factoryPk;
      return {
        ...operations,
        stockMove: queryOperations
      };
    }
    case OperationEnum.SPLIT: {
      queryOperations.disableLotNo1 = data?.allowChangeLotNo !== 'Y';
      queryOperations.lotNo1 = labelInfo?.label?.lotNo;
      queryOperations.lotNo2 = labelInfo?.label?.lotNo;
      return {
        ...operations,
        split: queryOperations
      };
    }
    default:
      throw new Error(`Unknown action ${action}`);
  }
};

export const handleQueryAdjustmentHistory = (searchParams, parseSelectedTree) => {
  const detailParam = {
    materialCode: searchParams.materialCode,
    operationNo: searchParams.operationNo,
    supplier: searchParams.supplier,
    label: searchParams.label,
    lotNo: searchParams.lotNo,
    operationType: searchParams.operationTypeSearch
  };
  if (searchParams?.materialType) {
    detailParam.materialType = searchParams?.materialType;
  }
  if (searchParams?.storage) {
    detailParam.storage = searchParams?.storage;
  }
  if (searchParams?.zone) {
    detailParam.zone = searchParams?.zone;
  }
  if (searchParams?.bin) {
    detailParam.bin = searchParams?.bin;
  }
  parseOrgSearchFactory(detailParam, parseSelectedTree);
  return query({
    url: '/v1/stock-movement/adjustment-history',
    featureCode: 'user.create',
    params: detailParam
  });
};
