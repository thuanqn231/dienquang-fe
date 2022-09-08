import moment from 'moment';
import { query, mutate } from '../../core/api';
import { capitalizeFirstChar } from '../../utils/formatString';

export const handleVadidateFactory = (factory) => {
    let isValidFactory = true;
    let errFactory = '';
    if (!factory) {
        isValidFactory = false;
        errFactory = 'Factory is required';
    }
    return { isValidFactory, errFactory };
}

export const handleVadidateMaterial = (materialCode) => {
    let isValidMaterial = true;
    let errMaterial = '';
    if (!materialCode) {
        isValidMaterial = false;
        errMaterial = 'Material Code is required';
    }
    return { isValidMaterial, errMaterial };
}

export const handleVadidateSupplier = (supplier) => {
    let isValidSupplier = true;
    let errSupplier = '';
    if (!supplier) {
        isValidSupplier = false;
        errSupplier = 'Supplier is required';
    }
    return { isValidSupplier, errSupplier };
}

export const handleVadidateRemark = (reason, remark) => {
    let isValidRemark = true;
    let errRemark = '';
    if (reason === 'D040003' && !remark) {
        isValidRemark = false;
        errRemark = 'Remark is required';
    }
    return { isValidRemark, errRemark };
}


export const handleVadidateLotNo = (lotNo) => {
    let isValidLotNo = true;
    let errLotNo = '';
    const isValidDate = moment(lotNo.toString().slice(0, -1), "YYYYMMDD", true).isValid();
    const isInteger = Number.isInteger(lotNo);
    if (lotNo !== 0 && (!isInteger || lotNo.toString().length !== 9 || !isValidDate)) {
        isValidLotNo = false;
        errLotNo = 'Wrong Lot No. format. Expected is YYYYMMDDX';
    }
    return { isValidLotNo, errLotNo };
}

export const handleVadidateQty = (qty) => {
    let isValidQty = true;
    let errQty = '';
    const isNumber = !Number.isNaN(qty);
    if (!qty) {
        isValidQty = false;
        errQty = 'Qty is required';
    } else if (!isNumber || qty <= 0) {
        isValidQty = false;
        errQty = 'Qty must be Number and greater than 0';
    }
    return { isValidQty, errQty };
}

const validateRequired = (fieldName, value) => {
    const field = capitalizeFirstChar(fieldName);
    const fieldIsValid = `isValid${field}`;
    const fieldError = `err${field}`;

    let isValid = true;
    let err = '';
    if (!value) {
        isValid = false;
        err = `${field.replace(/([A-Z])/g, " $1")} is required`;
    }
    return { [fieldIsValid]: isValid, [fieldError]: err };
}

export const handleValidateBeforeProcess = (data) => {
    const { factory, part, lineCode, materialCode, qty, objectType, reason, detailReason, lotNo } = data;
    const { isValidFactory, errFactory } = validateRequired('factory', factory);
    const { isValidPart, errPart } = validateRequired('part', part);
    const { isValidLineCode, errLineCode } = validateRequired('lineCode', lineCode);
    const { isValidMaterialCode, errMaterialCode } = validateRequired('materialCode', materialCode);
    const { isValidObjectType, errObjectType } = validateRequired('objectType', objectType);
    const { isValidReason, errReason } = validateRequired('reason', reason);
    const { isValidDetailReason, errDetailReason } = validateRequired('detailReason', detailReason);
    const { isValidQty, errQty } = handleVadidateQty(qty);
    const { isValidLotNo, errLotNo } = handleVadidateLotNo(Number(lotNo));
    return {
        isValid: isValidFactory && isValidPart
            && isValidLineCode && isValidMaterialCode && isValidObjectType && isValidReason && isValidDetailReason && isValidQty && isValidLotNo
        ,
        errorMessage: {
            factory: errFactory,
            part: errPart,
            lineCode: errLineCode,
            materialCode: errMaterialCode,
            objectType: errObjectType,
            reason: errReason,
            detailReason: errDetailReason,
            qty: errQty,
            lotNo: errLotNo
        }
    }
}

export const loadDataLineStockAdj = async (params) => {
    const response = await query({
        url: '/v1/line-stock-adjustment/search',
        featureCode: 'user.create',
        params
    })
        .catch((error) => {
            console.error(error);
        });
    return response?.data || [];
}

export const createLineStockAdj = async (stockAdjustment) => {
    const response = await mutate({
        url: '/v1/line-stock-adjustment/create',
        data: {
            lineStockAdjustment: stockAdjustment
        },
        method: 'post',
        featureCode: 'user.create'
    })
        .catch((error) => {
            console.error(error);
        });
    return response;
}

export const updateLineStockAdj = async (stockAdjustment) => {
    const response = await mutate({
        url: '/v1/line-stock-adjustment/update',
        data: {
            lineStockAdjustment: stockAdjustment
        },
        method: 'post',
        featureCode: 'user.create'
    })
        .catch((error) => {
            console.error(error);
        });
    return response;
}

export const deleteLineStockAdj = async (selectedAdjIds) => {
    const response = await mutate({
        url: '/v1/line-stock-adjustment/delete-multi',
        data: {
            lineStockAdjustmentPKs: selectedAdjIds
        },
        method: 'post',
        featureCode: 'user.create'
    })
        .catch((error) => {
            console.error(error);
        });
    return response;
}

export const loadStockAdj = async (adjPk) => {
    const response = await query({
        url: `/v1/line-stock-adjustment/${adjPk}`,
        featureCode: 'user.create'
    })
        .catch((error) => {
            console.error(error);
        });
    return response?.data || {};
}