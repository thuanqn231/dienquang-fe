import { mutate, query } from '../../core/api';
import { isNullVal } from '../../utils/formatString';
import { parseOrgSearchFactory } from '../../utils/pageConfig';

// * fix buildOperationForSingleScan data map and buildOperationForMergeScan


export const OperationEnum = {
  STOCK_IN: 'D035001',
  STOCK_OUT: 'D035002',
  LINE_ASSIGN: 'D035003',
  EQUIP_ASSIGN: 'D035004',

};

export const OperationCode = {

  D035001: 'STOCK IN',
  D035002: 'STOCK OUT',
  D035003: 'LINE ASSIGN',
  D035004: 'EQUIP ASSIGN',
};

export const ScanLabelEnum = {
  SCAN_LABEL_1: 'SCAN_LABEL_1',
  SCAN_LABEL_2: 'SCAN_LABEL_2'
};

/** handle validate param */

export const handleValidateBeforeProcess = (action, operations, boxNo1, boxNo2) => {
  switch (action) {

    case OperationEnum.STOCK_IN:
      return validateStockIn(operations, boxNo1);
    case OperationEnum.STOCK_OUT:
      return validateStockOut(operations, boxNo1);
    case OperationEnum.LINE_ASSIGN:
      return validateLineAssign(operations, boxNo1);
    case OperationEnum.EQUIP_ASSIGN:
      return validateEquipAssign(operations, boxNo1, boxNo2);
    default:
      throw new Error(`Unknown action ${action}`);
  }
};
const validateStockIn = (operations, boxNo1) => {
  let isValid = true;
  const { STOCK_IN: stockInOperation } = operations;
  const stockInErr = {};
  if (isNullVal(boxNo1)) {
    isValid = false;
    stockInErr.boxNo = 'Label is required';
  }
  if (isNullVal(stockInOperation.storage) || stockInOperation.storage === 'null-null') {
    isValid = false;
    stockInErr.stock = 'Store is required';
  }
  if (isNullVal(stockInOperation.zone) || stockInOperation.zone === 'null-null') {
    isValid = false;
    stockInErr.zone = 'Zone is required';
  }
  if (isNullVal(stockInOperation.bin) || stockInOperation.bin === 'null-null') {
    isValid = false;
    stockInErr.bin = 'Bin is required';
  }
  return { isValid, error: { stockIn: stockInErr } };
}
const validateStockOut = (operations, boxNo1) => {
  let isValid = true;
  const { stockOut: stockOutOperation } = operations;
  const stockOutErr = {};
  if (isNullVal(boxNo1)) {
    isValid = false;
    stockOutErr.boxNo = 'Label is required';
  }
  return { isValid, error: { stockOut: stockOutErr } };
}
const validateLineAssign = (operations, boxNo1) => {
  let isValid = true;
  const { LINE_ASSIGN: lineAssignOperation } = operations;
  const lineAssignErr = {};
  if (isNullVal(boxNo1)) {
    isValid = false;
    lineAssignErr.boxNo = 'Label is required';
  }
  if (isNullVal(lineAssignOperation.line) || lineAssignOperation.line === 'null-null') {
    isValid = false;
    lineAssignErr.line = 'Line is required';
  }
  if (isNullVal(lineAssignOperation.process) || lineAssignOperation.process === 'null-null') {
    isValid = false;
    lineAssignErr.process = 'Process is required';
  }
  if (isNullVal(lineAssignOperation.workStation) || lineAssignOperation.workStation === 'null-null') {
    isValid = false;
    lineAssignErr.workStation = 'Work Station is required';
  }
  return { isValid, error: { lineAssign: lineAssignErr } };
}
const validateEquipAssign = (operations, boxNo1, boxNo2) => {
  let isValid = true;
  const { EQUIP_ASSIGN: equipAssignOperation } = operations;
  const equipAssignErr = {};
  if (isNullVal(boxNo1)) {
    isValid = false;
    equipAssignErr.boxNo1 = 'Label is required';
  }
  if (isNullVal(boxNo2)) {
    isValid = false;
    equipAssignErr.boxNo2 = 'Label target is required';
  }
  return { isValid, error: { equipAssign: equipAssignErr } };
}
/** handle request adjust */

export const handleRequestAdjust = async (action, operations) => {
  switch (action) {
    case OperationEnum.STOCK_IN:
      return handleStockIn(operations);
    case OperationEnum.STOCK_OUT:
      return handleStockOut(operations);
    case OperationEnum.LINE_ASSIGN:
      return handleLineAssign(operations);
    case OperationEnum.EQUIP_ASSIGN:
      return handleEquipAssign(operations);
    default:
      throw new Error(`Unknown action ${action}`);
  }
};



const requestAdjust = async (request) => {
  const res = await mutate({
    url: '/v1/equipment-location/stock-in',
    data: request,
    method: 'post',
    featureCode: 'user.create'
  });

  return res;
};
const handleStockIn = async (operations) => {
  const stockInRequest = {
    equipmentLocation: {
      equipmentID: {
        factoryPk: operations?.STOCK_IN?.equipIDPk
      },
      bin: {
        factoryPk: operations?.STOCK_IN?.bin
      }
    }
  }
  const res = await mutate({
    url: '/v1/equipment-location/stock-in',
    data: stockInRequest,
    method: 'post',
    featureCode: 'user.create'
  });
  return res;
}
const handleStockOut = async (operations) => {
  const stockOutRequest = {
    equipmentLocation: {
      equipmentID: {
        factoryPk: operations?.STOCK_OUT?.equipIDPk
      }
    }
  }
  const res = await mutate({
    url: '/v1/equipment-location/stock-out',
    data: stockOutRequest,
    method: 'post',
    featureCode: 'user.create'
  });
  return res;
}
const handleLineAssign = async (operations) => {
  const lineAssignRequest = {
    equipmentLocation: {
      equipmentID: {
        factoryPk: operations?.LINE_ASSIGN?.equipIDPk
      },
      workStation: {
        factoryPk: operations?.LINE_ASSIGN?.workStation
      }
    }
  }
  const res = await mutate({
    url: '/v1/equipment-location/line-assign',
    data: lineAssignRequest,
    method: 'post',
    featureCode: 'user.create'
  });
  return res;
}
const handleEquipAssign = async (operations) => {
  const equipAssignRequest = {
    equipmentLocation: {
      equipmentID: {
        factoryPk: operations?.EQUIP_ASSIGN?.equipIDPk1
      },
      equipmentIDTarget: {
        factoryPk: operations?.EQUIP_ASSIGN?.equipIDPk2
      }
    }
  }
  const res = await mutate({
    url: '/v1/equipment-location/equip-assign',
    data: equipAssignRequest,
    method: 'post',
    featureCode: 'user.create'
  });
  return res;
}
/** handle query stock movement */

export const handleQueryStockMovement = async (scanType, boxNo, action, operations) => {
  console.log('boxNo', boxNo);
  const res = await mutate({
    url: `v1/equipment-location/scan`,
    featureCode: 'user.create',
    data: {
      equipmentID: {
        code: boxNo
      }
    },
    method: 'post'
  });
  const { data } = res;
  if (scanType === undefined) {
    return buildOperationForSingleScan(data, operations, action);
  }
  return buildOperationForMergeScan(data, operations, scanType);
};

const buildOperationForMergeScan = (data, operations, scanType) => {
  let queryOperations;
  if (scanType === ScanLabelEnum.SCAN_LABEL_1) {
    queryOperations = {
      ...operations.EQUIP_ASSIGN,
      unitName1: data?.equipmentID?.equipmentCode?.unit?.name,
      unitPk1: data?.equipmentID?.equipmentCode?.unit?.factoryPk,
      equipIDCode1: data?.equipmentID?.code,
      equipIDName1: data?.equipmentID?.name,
      equipIDSpec1: data?.equipmentID?.equipmentSpec,
      equipIDPk1: data?.equipmentID?.factoryPk,
      factoryPk1: data?.factoryPk,
      storage1: data?.bin?.zone?.stock?.factoryPk,
      zone1: data?.bin?.zone?.factoryPk,
      bin1: data?.bin?.factoryPk,
      line1: data?.workStation?.process?.line?.factoryPk,
      process1: data?.workStation?.process?.factoryPk,
      workStation1: data?.workStation?.factoryPk,

    };
  } else {
    queryOperations = {
      ...operations.EQUIP_ASSIGN,
      unitName2: data?.equipmentID?.equipmentCode?.unit?.name,
      unitPk2: data?.equipmentID?.equipmentCode?.unit?.factoryPk,
      equipIDCode2: data?.equipmentID?.code,
      equipIDName2: data?.equipmentID?.name,
      equipIDSpec2: data?.equipmentID?.equipmentSpec,
      equipIDPk2: data?.equipmentID?.factoryPk,
      factoryPk2: data?.factoryPk,
      storage2: data?.bin?.zone?.stock?.factoryPk,
      zone2: data?.bin?.zone?.factoryPk,
      bin2: data?.bin?.factoryPk,
      line2: data?.workStation?.process?.line?.factoryPk,
      process2: data?.workStation?.process?.factoryPk,
      workStation2: data?.workStation?.factoryPk,
    };
  }

  return {
    ...operations,
    EQUIP_ASSIGN: queryOperations
  };
};

const buildOperationForSingleScan = (data, operations, action) => {
  const queryOperations = {
    unitName: data?.equipmentID?.equipmentCode?.unit?.name,
    unitPk: data?.equipmentID?.equipmentCode?.unit?.factoryPk,
    equipIDCode: data?.equipmentID?.code,
    equipIDName: data?.equipmentID?.name,
    equipIDSpec: data?.equipmentID?.equipmentSpec,
    equipIDPk: data?.equipmentID?.factoryPk,
    factoryPk: data?.factoryPk
  }
  switch (action) {

    case OperationEnum.STOCK_IN: {
      queryOperations.storage = data?.bin?.zone?.stock?.factoryPk === 'null-null' ? undefined : data?.bin?.zone?.stock?.factoryPk;
      queryOperations.zone = data?.bin?.zone?.factoryPk === 'null-null' ? undefined : data?.bin?.zone?.factoryPk;
      queryOperations.bin = data?.bin?.factoryPk === 'null-null' ? undefined : data?.bin?.factoryPk;
      return {
        ...operations,
        STOCK_IN: queryOperations
      }
    }
    case OperationEnum.STOCK_OUT: {
      queryOperations.storage = data?.bin?.zone?.stock?.factoryPk
      queryOperations.zone = data?.bin?.zone?.factoryPk
      queryOperations.bin = data?.bin?.factoryPk
      return {
        ...operations,
        STOCK_OUT: queryOperations
      }
    }
    case OperationEnum.LINE_ASSIGN: {
      queryOperations.line = data?.workStation?.process?.line?.factoryPk === 'null-null' ? undefined : data?.workStation?.process?.line?.factoryPk;
      queryOperations.process = data?.workStation?.process?.factoryPk === 'null-null' ? undefined : data?.workStation?.process?.factoryPk;
      queryOperations.workStation = data?.workStation?.factoryPk === 'null-null' ? undefined : data?.workStation?.factoryPk;
      return {
        ...operations,
        LINE_ASSIGN: queryOperations
      }
    }
    default:
      throw new Error(`Unknown action ${action}`);
  }
};


