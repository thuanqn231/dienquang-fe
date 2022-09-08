import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const businessPartnerCodeGridConfig = [
    ...defaultFactoryFields,
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "code",
        headerName: "Biz Partner Code",
        colId: "code",
        tooltipField: "code",
        width: 90,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "partnerGroup.name",
        headerName: "Biz Partner Group",
        colId: "partnerGroup.name",
        tooltipField: "partnerGroup.name",
        width: 90,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "type.name",
        headerName: "Biz Partner Type",
        colId: "type.name",
        tooltipField: "type.name",
        width: 90,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "tradeType.name",
        headerName: "Trade Type",
        colId: "tradeType.name",
        tooltipField: "tradeType.name",
        width: 80,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "englishName",
        headerName: "English Name",
        colId: "englishName",
        tooltipField: "englishName",
        width: 130,
        pinned: "left"
    },
    {
        ...defaultColDef,
        suppressMovable: true,
        field: "nationalName",
        headerName: "National Name",
        colId: "nationalName",
        tooltipField: "nationalName",
        width: 130,
        pinned: "left"
    },
    {
        ...defaultColDef,
        field: "address",
        headerName: "Address",
        colId: "address",
        tooltipField: "address",
        width: 130
    },
    {
        ...defaultColDef,
        field: "taxCode",
        headerName: "Tax Code",
        colId: "taxCode",
        tooltipField: "taxCode",
        width: 80
    },
    {
        ...defaultColDef,
        field: "taxAddress",
        headerName: "Tax Address",
        colId: "taxAddress",
        tooltipField: "taxAddress",
        width: 130
    },
    {
        ...defaultColDef,
        field: "phone",
        headerName: "Phone No.",
        colId: "phone",
        tooltipField: "phone",
        width: 80
    },
    {
        ...defaultColDef,
        field: "fax",
        headerName: "Fax No.",
        colId: "fax",
        tooltipField: "fax",
        width: 80
    },
    {
        ...defaultColDef,
        field: "representative",
        headerName: "Representative",
        colId: "representative",
        tooltipField: "representative",
        width: 80
    },
    {
        ...defaultColDef,
        field: "paymentTerm.name",
        headerName: "Payment Term",
        colId: "paymentTerm.name",
        tooltipField: "paymentTerm.name",
        width: 80
    },
    {
        ...defaultColDef,
        field: "email",
        headerName: "Email Address",
        colId: "email",
        tooltipField: "email",
        width: 80
    },
    {
        ...defaultColDef,
        field: "currency.name",
        headerName: "Currency",
        colId: "currency.name",
        tooltipField: "currency.name",
        width: 80
    },
    {
        ...defaultColDef,
        field: "incoterm.name",
        headerName: "Incoterm",
        colId: "incoterm.name",
        tooltipField: "incoterm.name",
        width: 80
    },
    {
        ...defaultColDef,
        field: "vat.name",
        headerName: "VAT",
        colId: "vat.name",
        tooltipField: "vat.name",
        width: 80
    },
    {
        ...defaultColDef,
        field: "pic",
        headerName: "PIC",
        colId: "pic",
        tooltipField: "pic",
        width: 80
    },
    ...defaultAuditFields
];