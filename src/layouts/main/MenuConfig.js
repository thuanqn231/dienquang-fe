import bookOpenFill from '@iconify/icons-eva/book-open-fill';
import fileFill from '@iconify/icons-eva/file-fill';
import homeFill from '@iconify/icons-eva/home-fill';
import { Icon } from '@iconify/react';
// routes
import { PATH_PAGES, PATH_PAGE } from '../../routes/paths';

// ----------------------------------------------------------------------

const ICON_SIZE = {
  width: 22,
  height: 22
};

const menuConfig = [
  {
    title: 'Home',
    id: 'home',
    icon: <Icon icon={homeFill} {...ICON_SIZE} />,
    path: PATH_PAGES.pages.root,
    code: 'C001000'
  },
  {
    title: 'PRODUCTION',
    id: 'production',
    path: PATH_PAGES,
    icon: <Icon icon={bookOpenFill} {...ICON_SIZE} />,
    code: 'C003001',
    children: [
      {
        title: 'Master Data',
        id: 'planning-master-data',
        type: 'subtitle',
        children: [
          {
            title: 'Planning Master Data',
            id: 'planning-master-data-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Operation Hierachy',
                id: 'operation-hierachy-item',
                type: 'item',
                path: PATH_PAGES.pages.MD01010101,
                code: 'MD01010101'
              },
              {
                title: 'Common Code',
                id: 'common_code',
                type: 'item',
                path: PATH_PAGES.pages.MD01010100,
                code: 'MD01010100'
              },
              {
                title: 'Time Management',
                id: 'time-management-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Production Master Data',
            id: 'production-master-data-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Material Master',
                id: 'material-master-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Verification',
                id: 'verification-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Employee Master',
                id: 'employee-master-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'LOB Master',
                id: 'lob-master-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Quality Master Data',
            id: 'quality-master-data-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Inspection Item',
                id: 'inspection-item-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Defect Item',
                id: 'defect-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Resource Master Data',
            id: 'resource-master-data-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Equipment Info',
                id: 'equipment-info-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Spare Part / Consumable',
                id: 'spare-part-consumable-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Mold / JIG Code',
                id: 'mold-jig-code-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Loss Info',
                id: 'loss-info-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Stock Master Data',
            id: 'stock-master-data-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Stock Master',
                id: 'stock-master-data-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Logistic Master Data',
            id: 'logistic-master-data-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Delivery Master',
                id: 'delivery-master-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          }
        ]
      },
      {
        title: 'Planning Management',
        id: 'planning-management',
        type: 'subtitle',
        children: [
          {
            title: 'Demand Management',
            id: 'demand-management-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Demand',
                id: 'demand-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Production Planning',
            id: 'production-planning-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Planning',
                id: 'planning-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          }
        ]
      },
      {
        title: 'Production Management',
        id: 'production-management',
        type: 'subtitle',
        children: [
          {
            title: 'Production Result',
            id: 'production-result-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Production Result',
                id: 'production-result-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Rework Result',
                id: 'rework-result-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Fool Proof Management',
            id: 'fool-proof-management-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Fool Proof',
                id: 'fool-proof-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Loss Time Management',
            id: 'loss-time-management-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Stop Loss Time',
                id: 'stop-loss-time-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'ECN Management',
            id: 'ecn-management-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'ECN Info',
                id: 'ecn-info-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'MRP Management',
            id: 'mrp-management-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'MRP',
                id: 'mrp-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          }
        ]
      },
      {
        title: 'Quality Control',
        id: 'quality-control',
        type: 'subtitle',
        children: [
          {
            title: 'Outgoing Quality Management',
            id: 'outgoing-quality-management-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Outgoing Inspection Result',
                id: 'outgoing-inspection-result-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Process Quality Management',
            id: 'process-quality-management-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Process Defect Record',
                id: 'process-defect-record-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Input Quality Management',
            id: 'input-quality-management-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Input Inspection Result',
                id: 'input-inspection-result-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          }
        ]
      },
      {
        title: 'Resource Management',
        id: 'resource-management',
        type: 'subtitle',
        children: [
          {
            title: 'Operation Efficiency (Loss)',
            id: 'operation-efficiency-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Operation Time',
                id: 'operation-time-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Machine Loss Time',
                id: 'machine-loss-time-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Spare Part / Consumable Stock',
            id: 'spare-part-consumable-stock-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Spare Part / Consumable Stock',
                id: 'spare-part-consumable-stock-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Mold / JIG Management',
            id: 'mold-jig-management-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Mold / JIG',
                id: 'mold-jig-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Maintenance Management',
            id: 'maintenance-management-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Preventive Management',
                id: 'preventive-management-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Breakdown Management',
                id: 'breakdown-management-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Improvement Management',
                id: 'improvement-management-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          }
        ]
      },
      {
        title: 'Stock Management',
        id: 'stock-management',
        type: 'subtitle',
        children: [
          {
            title: 'Stock Management',
            id: 'stock-management-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Semi-finish Good',
                id: 'semi-finish-good-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Material Stock',
                id: 'material-stock-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Finish Good Stock',
                id: 'finish-good-stock-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'JIT Stock',
                id: 'jit-stock-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Stock Adjustment',
                id: 'stock-adjustment-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Material Loss / Scrap',
                id: 'material-loss-scrap-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          }
        ]
      },
      {
        title: 'Logistic Management',
        id: 'logistic-management-management',
        type: 'subtitle',
        children: [
          {
            title: 'Internal Logistic Management',
            id: 'internal-logistic-management-management',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Transfer Order',
                id: 'transfer-order-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Outgoing Logistic Management',
            id: 'outgoing-logistic-management-management',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Outgoing Loading',
                id: 'outgoing-loading-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          }
        ]
      }
    ]
  },
  {
    title: 'LOGISTIC',
    id: 'logistic',
    path: PATH_PAGES,
    icon: <Icon icon={bookOpenFill} {...ICON_SIZE} />,
    code: 'C003001',
    children: [
      {
        title: 'Master Data',
        id: 'logistic-master-data',
        type: 'subtitle',
        children: [
          {
            title: 'Domestic Logistic',
            id: 'domestic-logistic-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Driver',
                id: 'driver-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Vehicle',
                id: 'vehicle-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Inbound / Outbound',
            id: 'inbound-outbound-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Incorterm',
                id: 'incorterm-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          }
        ]
      },
      {
        title: 'Domestic Logistic',
        id: 'logistic-domestic-logistic',
        type: 'subtitle',
        children: [
          {
            title: 'Domestic DO Management',
            id: 'domestic-do-management-subtitle',
            type: 'subtitle',
            children: [
              {
                title: 'Delivery Order Result',
                id: 'delivery-order-result-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          }
        ]
      },
      {
        title: 'Inbound / Outbound',
        id: 'inbound-outbound',
        type: 'subtitle',
        children: [
          {
            title: 'Insurance Management',
            id: 'insurance-management-subtitle',
            type: 'subtitle',
            children: [
              {
                title: 'Insurance Information',
                id: 'insurance-information-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Bill of Landing Management',
            id: 'bill-of-landing-management-subtitle',
            type: 'subtitle',
            children: [
              {
                title: 'B/L Information',
                id: 'bl-information-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Invoice Management',
            id: 'invoice-management-subtitle',
            type: 'subtitle',
            children: [
              {
                title: 'Invoice Information',
                id: 'invoice-information-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Custom Clearance Management',
            id: 'custom-clearance-management-subtitle',
            type: 'subtitle',
            children: [
              {
                title: 'C/C Information',
                id: 'cc-information-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Good Receipt Management (Oversea)',
            id: 'good-receipt-management-oversea-subtitle',
            type: 'subtitle',
            children: [
              {
                title: 'G/R Result',
                id: 'logistic-gr-result-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Good Issue Management (Oversea)',
            id: 'good-issue-management-oversea-subtitle',
            type: 'subtitle',
            children: [
              {
                title: 'G/I Result',
                id: 'logistic-gi-result-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Export DO Management',
            id: 'export-do-management-subtitle',
            type: 'subtitle',
            children: [
              {
                title: 'Delivery Information',
                id: 'delivery-information-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Expense Management',
            id: 'expense-do-management-subtitle',
            type: 'subtitle',
            children: [
              {
                title: 'Expense',
                id: 'expense-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          }
        ]
      }
    ]
  },
  {
    title: 'PURCHASE',
    id: 'purchase',
    path: PATH_PAGES,
    icon: <Icon icon={bookOpenFill} {...ICON_SIZE} />,
    code: 'C003001',
    children: [
      {
        title: 'Master Data',
        id: 'purchase-master-data',
        type: 'subtitle',
        children: [
          {
            title: 'Purchase Master Data',
            id: 'purchase-master-data-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Vendor Information',
                id: 'vendor-information-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'VAT Information',
                id: 'vat-information-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Quotation Master',
                id: 'quotation-master-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Exchange Rate',
                id: 'exchange-rate-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Purchasing Type',
                id: 'purchasing-type-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          }
        ]
      },
      {
        title: 'Domestic / Oversea Purchase',
        id: 'purchase-domestic-logistic',
        type: 'subtitle',
        children: [
          {
            title: 'Purchase Request Management',
            id: 'purchase-request-management-subtitle',
            type: 'subtitle',
            children: [
              {
                title: 'P/R Information',
                id: 'pr-information-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Purchase Order Management',
            id: 'purchase-order-management-subtitle',
            type: 'subtitle',
            children: [
              {
                title: 'P/O Information',
                id: 'po-information-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Good Receipt Management (DOM)',
            id: 'good-receipt-management-dom-subtitle',
            type: 'subtitle',
            children: [
              {
                title: 'G/R Result',
                id: 'purchase-gr-result-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          }
        ]
      }
    ]
  },
  {
    title: 'SALES',
    id: 'sales',
    path: PATH_PAGES,
    icon: <Icon icon={bookOpenFill} {...ICON_SIZE} />,
    code: 'C003001',
    children: [
      {
        title: 'Master Data',
        id: 'sales-master-data',
        type: 'subtitle',
        children: [
          {
            title: 'Sales Master Data',
            id: 'sales-master-data-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'Customer Information',
                id: 'customer-information-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Sales Contract',
                id: 'sales-contract-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Credit Limit',
                id: 'credit-limit-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Promotion',
                id: 'promotion-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Sales Type',
                id: 'sales-type-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          }
        ]
      },
      {
        title: 'Domestic / Oversea Sales',
        id: 'sales-domestic-logistic',
        type: 'subtitle',
        children: [
          {
            title: 'Sales Order Management',
            id: 'sales-order-management-subtitle',
            type: 'subtitle',
            children: [
              {
                title: 'S/O Information',
                id: 'so-information-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          },
          {
            title: 'Good Issue Management (DOM)',
            id: 'good-issue-management-dom-subtitle',
            type: 'subtitle',
            children: [
              {
                title: 'G/I Result',
                id: 'sales-gi-result-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          }
        ]
      }
    ]
  },
  {
    title: 'SYSTEM',
    id: 'system',
    path: PATH_PAGES,
    icon: <Icon icon={bookOpenFill} {...ICON_SIZE} />,
    code: 'C003001',
    children: [
      {
        title: 'Authorization Management',
        id: 'authorization-management',
        type: 'subtitle',
        children: [
          {
            title: 'User Management',
            id: 'user-management-subtitle',
            type: 'subtitle',
            path: PATH_PAGES.root,
            children: [
              {
                title: 'User Information',
                id: 'user-information-item',
                type: 'item',
                path: PATH_PAGES.pages.SM01010101,
                code: 'SM01010101'
              },
              {
                title: 'UI Information',
                id: 'ui-information-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'Role Master',
                id: 'role-master-item',
                type: 'item',
                path: PATH_PAGES.pages.SM01010201
              },
              {
                title: 'Role Group Mapping',
                id: 'role-group-mapping-item',
                type: 'item',
                path: PATH_PAGE.page404
              },
              {
                title: 'User Role Group Mapping',
                id: 'user-role-group-mapping-item',
                type: 'item',
                path: PATH_PAGE.page404
              }
            ]
          }
        ]
      },
      {
        title: 'Approval Management',
        id: 'approval-management',
        type: 'subtitle',
        children: [
          {
            title: 'Approval',
            id: 'approval-item',
            type: 'item',
            path: PATH_PAGES.pages.C003001,
            code: 'C003001'
          }
        ]
      }
    ]
  }
];

export default menuConfig;
