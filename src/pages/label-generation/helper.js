import moment from 'moment';

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
    if (!lotNo) {
        isValidLotNo = false;
        errLotNo = 'Lot No. is required';
    } else if (!isInteger || lotNo.toString().length !== 9 || !isValidDate) {
        isValidLotNo = false;
        errLotNo = 'Wrong Lot No. format. Expected is YYYYMMDDX';
    }
    return { isValidLotNo, errLotNo };
}

export const handleVadidateLabelQty = (lableQty) => {
    let isValidLabelQty = true;
    let errLabelQty = '';
    const isInteger = Number.isInteger(lableQty);
    if (!lableQty) {
        isValidLabelQty = false;
        errLabelQty = 'Label Qty is required';
    } else if (!isInteger || lableQty <= 0) {
        isValidLabelQty = false;
        errLabelQty = 'Label Qty must be Integer and greater than 0.';
    }
    return { isValidLabelQty, errLabelQty };
}

export const handleVadidatePackageQty = (lableQty, packageQty) => {
    let isValidPackageQty = true;
    let errPackageQty = '';
    const isInteger = Number.isInteger(packageQty);
    if (!packageQty) {
        isValidPackageQty = false;
        errPackageQty = 'Package Qty is required';
    } else if (!isInteger || packageQty <= 0) {
        isValidPackageQty = false;
        errPackageQty = 'Package Qty must be Integer and greater than 0.';
    } else if (lableQty % packageQty !== 0) {
        isValidPackageQty = false;
        errPackageQty = 'Package Qty must be divisible by Package Qty'
    }
    return { isValidPackageQty, errPackageQty };
}

export const handleVadidateReason = (reason) => {
    let isValidReason = true;
    let errReason = '';
    if (!reason) {
        isValidReason = false;
        errReason = 'Reason is required';
    }
    return { isValidReason, errReason };
}

export const handleValidateBeforeProcess = (data, type) => {
    if (type === 'D050001') {
        const { factory, materialCode, lotNo, supplier, lableQty, packageQty, reason, remark } = data;
        const { isValidFactory, errFactory } = handleVadidateFactory(factory);
        const { isValidMaterial, errMaterial } = handleVadidateMaterial(materialCode);
        const { isValidSupplier, errSupplier } = handleVadidateSupplier(supplier);
        const { isValidRemark, errRemark } = handleVadidateRemark(reason, remark);
        const { isValidLabelQty, errLabelQty } = handleVadidateLabelQty(Number(lableQty));
        const { isValidPackageQty, errPackageQty } = handleVadidatePackageQty(Number(lableQty), Number(packageQty));
        const { isValidLotNo, errLotNo } = handleVadidateLotNo(Number(lotNo));
        const { isValidReason, errReason } = handleVadidateReason(reason);
        return {
            isValid: isValidFactory && isValidMaterial && isValidSupplier && isValidRemark && isValidLabelQty && isValidPackageQty && isValidLotNo && isValidReason,
            errorMessage: {
                factory: errFactory,
                materialCode: errMaterial,
                supplier: errSupplier,
                remark: errRemark,
                lableQty: errLabelQty,
                packageQty: errPackageQty,
                lotNo: errLotNo,
                reason: errReason,
            }
        }
    }
    return { isValid: true, errorMessage: {} };
}