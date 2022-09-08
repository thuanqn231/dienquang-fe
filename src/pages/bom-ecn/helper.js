import ReactDOMServer from 'react-dom/server';
import { isEmpty, get } from 'lodash-es';
import { fDateTime } from '../../utils/formatTime';

export const generateBOMMarkup = async (datas, bizPartnerCodeDropdown) => {
    if (!isEmpty(datas)) {
        return ReactDOMServer.renderToStaticMarkup(
            <div>
                <p>Dear Sirs/Madams,</p>
                <p>Please refer and approve the BOM with details below:</p>
                <table key="bom-html-generate" style={{ borderCollapse: 'collapse', width: '100%' }} border="1">
                    <thead>
                        <tr style={{ backgroundColor: 'yellowgreen' }}>
                            <th>No.</th>
                            <th>Factory</th>
                            <th>Level</th>
                            <th>Top Model</th>
                            <th>Version</th>
                            <th>Parent Code</th>
                            <th>Child Code</th>
                            <th>Matr. Description</th>
                            <th>Matr. Type</th>
                            <th>Stand Qty</th>
                            <th>Loss(%)</th>
                            <th>Test Qty</th>
                            <th>Unit</th>
                            <th>Valid From</th>
                            <th>Proc. Type</th>
                            <th>Detail Proc. Type</th>
                            <th>MRP Type</th>
                            <th>Matr. Group</th>
                            <th>Matr. Spec</th>
                            <th>Dev. Status</th>
                            <th>Revision Drawing</th>
                            <th>Supplier</th>
                            <th>Remark</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datas.map((data, idx) => (
                            <tr key={data?.factoryPk}>
                                <td>{idx + 1}</td>
                                <td>{data?.pk?.factoryName}</td>
                                <td>{data?.level}</td>
                                <td>{data?.topCode?.code}</td>
                                <td>{data?.bomVersion}</td>
                                <td>{data?.parentCode?.code}</td>
                                <td>{data?.childCode?.code}</td>
                                <td>{data?.childCode?.description}</td>
                                <td>{data?.childCode?.materialType?.name}</td>
                                <td>{data?.standQty}</td>
                                <td>{data?.loss}</td>
                                <td>{data?.testQty}</td>
                                <td>{data?.childCode?.mainUnit?.name}</td>
                                <td>{fDateTime(data?.validFrom)}</td>
                                <td>{data?.childCode?.prodType?.name}</td>
                                <td>{data?.childCode?.detailProc?.name}</td>
                                <td>{data?.childCode?.mrpType?.name}</td>
                                <td>{data?.childCode?.materialGroup?.name}</td>
                                <td>{data?.childCode?.spec}</td>
                                <td>{data?.devStatus?.name}</td>
                                <td>{data?.revisionDrawing}</td>
                                <td>{data?.supplier.split(' | ').filter((v) => v !== '').map((v) => get(bizPartnerCodeDropdown.find((o = {}) => o.value === v), 'label')).join(' | ')}</td>
                                <td>{data?.remark}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p>Thanks and Best Regards.</p>
            </div>
        );
    }
    return null;
};

export const generateECNMarkup = async (datas, bizPartnerCodeDropdown) => {
    if (!isEmpty(datas)) {
        return ReactDOMServer.renderToStaticMarkup(
            <div>
                <p>Dear Sirs/Madams,</p>
                <p>Please refer and approve the ECN with details below:</p>
                <table key="ecn-html-generate" style={{ borderCollapse: 'collapse', width: '100%' }} border="1">
                    <thead>
                        <tr style={{ backgroundColor: 'yellowgreen' }}>
                            <th>Factory</th>
                            <th>EC No</th>
                            <th>EC Type</th>
                            <th>Version</th>
                            <th>Parent Code</th>
                            <th>Child Code</th>
                            <th>Matr. Description</th>
                            <th>Matr. Type</th>
                            <th>Stand Qty</th>
                            <th>Loss(%)</th>
                            <th>Test Qty</th>
                            <th>Unit</th>
                            <th>Valid From</th>
                            <th>Valid To</th>
                            <th>Proc. Type</th>
                            <th>Detail Proc. Type</th>
                            <th>MRP Type</th>
                            <th>Matr. Group</th>
                            <th>Matr. Spec</th>
                            <th>Dev. Status</th>
                            <th>Revision Drawing</th>
                            <th>Supplier</th>
                            <th>Remark</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datas.map((data, idx) => (
                            <tr key={data?.factoryPk}>
                                <td>{data?.pk?.factoryName}</td>
                                <td>{data?.ecNo}</td>
                                <td>{data?.ecType}</td>
                                <td>{data?.ecVersion}</td>
                                <td>{data?.parentCode?.code}</td>
                                <td>{data?.childCode?.code}</td>
                                <td>{data?.childCode?.description}</td>
                                <td>{data?.childCode?.materialType?.name}</td>
                                <td>{data?.standQty}</td>
                                <td>{data?.loss}</td>
                                <td>{data?.testQty}</td>
                                <td>{data?.childCode?.mainUnit?.name}</td>
                                <td>{fDateTime(data?.validFrom)}</td>
                                <td>{fDateTime(data?.validTo)}</td>
                                <td>{data?.childCode?.prodType?.name}</td>
                                <td>{data?.childCode?.detailProc?.name}</td>
                                <td>{data?.childCode?.mrpType?.name}</td>
                                <td>{data?.childCode?.materialGroup?.name}</td>
                                <td>{data?.childCode?.spec}</td>
                                <td>{data?.devStatus?.name}</td>
                                <td>{data?.revisionDrawing}</td>
                                <td>{data?.supplier.split(' | ').filter((v) => v !== '').map((v) => get(bizPartnerCodeDropdown.find((o = {}) => o.value === v), 'label')).join(' | ')}</td>
                                <td>{data?.remark}</td>
                                <td>{data?.action}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p>Thanks and Best Regards.</p>
            </div>
        );
    }
    return null;
};