import ReactDOMServer from 'react-dom/server';

export const generatePurchaseGrHtml = async (datas, type) => {
    let header = <div>
        <p>Dear Sirs/Madams,</p>
        <p>Please refer and approve the Purchase G/R Plan with details below:</p>
    </div>
    if (type === 'teco') {
        header = <div>
            <p>Dear Sirs/Madams,</p>
            <p>{`The Purchase G/R Plan with Plan ID: ${datas[0]?.planId} was TECO, please refer with details below:`}</p>
        </div>
    }
    return ReactDOMServer.renderToStaticMarkup(
        <div>
            {header}
            <table key="purchase-gr-plan-html-generate" style={{ borderCollapse: 'collapse', width: '100%' }} border="1">
                <thead>
                    <tr style={{ backgroundColor: 'yellowgreen' }}>
                        <th>Factory</th>
                        <th>Plan Date</th>
                        <th>Plan ID</th>
                        <th>Pur. Order No.</th>
                        <th>Material ID</th>
                        <th>Material Code</th>
                        <th>Material Desc.</th>
                        <th>Unit</th>
                        <th>MRP Controller</th>
                        <th>Plan Qty</th>
                        <th>Supplier</th>
                        <th>G/R Type</th>
                        <th>Remark</th>
                    </tr>
                </thead>
                <tbody>
                    {datas.map((data) => (
                        <tr key={data?.factoryPk}>
                            <td>{data?.pk?.factoryName}</td>
                            <td>{data?.planDate}</td>
                            <td>{data?.planId}</td>
                            <td>{data?.purOrderNo}</td>
                            <td>{data?.material?.materialId}</td>
                            <td>{data?.material?.code}</td>
                            <td>{data?.material?.description}</td>
                            <td>{data?.material?.mainUnit?.name}</td>
                            <td>{data?.material?.mrp?.name}</td>
                            <td>{data?.planQty}</td>
                            <td>{data?.supplier?.nationalName}</td>
                            <td>{data?.grType?.name}</td>
                            <td>{data?.remark}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p>Thanks and Best Regards.</p>
        </div>
    )
};

export const generateProductionGrHtml = async (datas, type) => {
    let header = <div>
        <p>Dear Sirs/Madams,</p>
        <p>Please refer and approve the Production G/R Plan with details below:</p>
    </div>
    console.log("type", type);
    if (type === 'teco') {
        header = <div>
            <p>Dear Sirs/Madams,</p>
            <p>{`The Production G/R Plan with Plan ID: ${datas[0]?.planId} was TECO, please refer with details below:`}</p>
        </div>
    }
    return ReactDOMServer.renderToStaticMarkup(
        <div>
            {header}
            <table key="production-gr-plan-html-generate" style={{ borderCollapse: 'collapse', width: '100%' }} border="1">
                <thead>
                    <tr style={{ backgroundColor: 'yellowgreen' }}>
                        <th>Factory</th>
                        <th>Plan Date</th>
                        <th>Plan ID</th>
                        <th>Prod. Order No.</th>
                        <th>Material ID</th>
                        <th>Material Code</th>
                        <th>Material Desc.</th>
                        <th>Material Version</th>
                        <th>Line Code</th>
                        <th>Line Name</th>
                        <th>MRP Controller</th>
                        <th>Plan Qty</th>
                        <th>Prod. Plan Qty</th>
                        <th>Prod. Result Qty</th>
                        <th>Unit</th>
                        <th>Process Type</th>
                        <th>G/R Type</th>
                        <th>Remark</th>
                    </tr>
                </thead>
                <tbody>
                    {datas.map((data) => (
                        <tr key={data?.factoryPk}>
                            <td>{data?.pk?.factoryName}</td>
                            <td>{data?.planDate}</td>
                            <td>{data?.planId}</td>
                            <td>{data?.productionOrder?.prodOrderNo}</td>
                            <td>{data?.productionOrder?.modelId?.parentCode?.materialId}</td>
                            <td>{data?.productionOrder?.modelId?.parentCode?.code}</td>
                            <td>{data?.productionOrder?.modelId?.parentCode?.description}</td>
                            <td>{data?.productionOrder?.modelId?.bomVersionParent}</td>
                            <td>{data?.productionOrder?.line?.code}</td>
                            <td>{data?.productionOrder?.line?.name}</td>
                            <td>{data?.productionOrder?.modelId?.parentCode?.mrp?.name}</td>
                            <td>{data?.planQty}</td>
                            <td>{data?.productionOrder?.planQty}</td>
                            <td>{data?.productionOrder?.actualQty}</td>
                            <td>{data?.productionOrder?.modelId?.parentCode?.mainUnit?.name}</td>
                            <td>{data?.productionOrder?.process?.name}</td>
                            <td>{data?.grType?.name}</td>
                            <td>{data?.remark}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p>Thanks and Best Regards.</p>
        </div>
    );
}