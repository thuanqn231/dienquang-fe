import ReactDOMServer from 'react-dom/server';
import { fDateTime } from '../../utils/formatTime';

export const generateProductionOrderHtml = async (datas, type) => {
    let header = <div>
        <p>Dear Sirs/Madams,</p>
        <p>Please refer and approve the Production Order with details below:</p>
    </div>
    if (type === 'teco') {
        header = <div>
            <p>Dear Sirs/Madams,</p>
            <p>{`The Production Order with Plan ID: ${datas[0]?.planId} was TECO, please refer with details below:`}</p>
        </div>
    }
    return ReactDOMServer.renderToStaticMarkup(
        <div>
            {header}
            <table key="bom-html-generate" style={{ borderCollapse: 'collapse', width: '100%' }} border="1">
                <thead>
                    <tr style={{ backgroundColor: 'yellowgreen' }}>
                        <th>Factory</th>
                        <th>Plan Date</th>
                        <th>Line Code</th>
                        <th>Line Name</th>
                        <th>Model ID</th>
                        <th>Model Code</th>
                        <th>Model Desc.</th>
                        <th>Model Version</th>
                        <th>PO Type</th>
                        <th>Plan Start Time</th>
                        <th>Plan End Time</th>
                        <th>Plan Qty</th>
                        <th>Tact Time</th>
                        <th>Plant</th>
                        <th>Operation</th>
                        <th>Process Type</th>
                        <th>Plan ID</th>
                        <th>Top Model</th>
                    </tr>
                </thead>
                <tbody>
                    {datas.map((data) => (
                        <tr key={data?.factoryPk}>
                            <td>{data?.pk?.factoryName}</td>
                            <td>{data?.planDate}</td>
                            <td>{data?.line?.code}</td>
                            <td>{data?.line?.name}</td>
                            <td>{data?.modelId?.parentCode?.materialId}</td>
                            <td>{data?.modelId?.parentCode?.code}</td>
                            <td>{data?.modelId?.parentCode?.description}</td>
                            <td>{data?.modelId?.bomVersionParent}</td>
                            <td>{data?.poType?.name}</td>
                            <td>{fDateTime(data?.startTime)}</td>
                            <td>{fDateTime(data?.endTime)}</td>
                            <td>{data?.planQty}</td>
                            <td>{data?.tactTime}</td>
                            <td>{data?.plant?.name}</td>
                            <td>{data?.operation}</td>
                            <td>{data?.process?.name}</td>
                            <td>{data?.planId}</td>
                            <td>{data?.topModel?.parentCode?.code}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p>Thanks and Best Regards.</p>
        </div>
    )
}