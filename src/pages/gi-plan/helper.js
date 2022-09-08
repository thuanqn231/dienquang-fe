import ReactDOMServer from 'react-dom/server';

export const generateProductionGiHtml = async (datas, type) => {
    let header = <div>
        <p>Dear Sirs/Madams,</p>
        <p>Please refer and approve the Production G/I Plan with details below:</p>
    </div>
    if (type === 'teco') {
        header = <div>
            <p>Dear Sirs/Madams,</p>
            <p>{`The Production G/I Plan with Plan ID: ${datas[0]?.planId} was TECO, please refer with details below:`}</p>
        </div>
    }

    return ReactDOMServer.renderToStaticMarkup(
        <div>
            {header}
            <table key="production-gi-html-generate" style={{ borderCollapse: 'collapse', width: '100%' }} border="1">
                <thead>
                    <tr style={{ backgroundColor: 'yellowgreen' }}>
                        <th>Factory</th>
                        <th>Plan Date</th>
                        <th>Plan ID</th>
                        <th>Prod. Order No.</th>
                        <th>Material ID</th>
                        <th>Material Code</th>
                        <th>Material Desc.</th>
                        <th>Line Code</th>
                        <th>Line Name</th>
                        <th>MRP Controller</th>
                        <th>Plan Qty</th>
                        <th>Prod. Plan Qty</th>
                        <th>Prod. Result Qty</th>
                        <th>Unit</th>
                        <th>Process Type</th>
                        <th>G/I Type</th>
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
                            <td>{data?.material?.materialId}</td>
                            <td>{data?.material?.code}</td>
                            <td>{data?.material?.description}</td>

                            <td>{data?.line?.code}</td>
                            <td>{data?.line?.name}</td>
                            <td>{data?.material?.mrp?.name}</td>
                            <td>{data?.planQty}</td>
                            <td>{data?.productionOrder?.planQty}</td>
                            <td>{data?.productionOrder?.actualQty || '0'}</td>
                            <td>{data?.material?.mainUnit?.name}</td>
                            <td>{data?.line?.processType?.name}</td>
                            <td>{data?.giType?.name}</td>
                            <td>{data?.remark}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p>Thanks and Best Regards.</p>
        </div>
    )
}

export const generateShippingGiHtml = async (datas, type) => {
    let header = <div>
        <p>Dear Sirs/Madams,</p>
        <p>Please refer and approve the Shipping G/I Plan with details below:</p>
    </div>
    if (type === 'teco') {
        header = <div>
            <p>Dear Sirs/Madams,</p>
            <p>{`The Shipping G/I Plan with Plan ID: ${datas[0]?.planId} was TECO, please refer with details below:`}</p>
        </div>
    }

    return ReactDOMServer.renderToStaticMarkup(
        <div>
            {header}
            <table key="shipping-gi-html-generate" style={{ borderCollapse: 'collapse', width: '100%' }} border="1">
                <thead>
                    <tr style={{ backgroundColor: 'yellowgreen' }}>
                        <th>Factory</th>
                        <th>Plan Date</th>
                        <th>Plan ID</th>
                        <th>SO No.</th>
                        <th>Material ID</th>
                        <th>Material Code</th>
                        <th>Material Desc.</th>
                        <th>Unit</th>
                        <th>MRP Controller</th>
                        <th>Plan Qty</th>
                        <th>Supplier</th>
                        <th>G/I Type</th>
                        <th>Remark</th>
                    </tr>
                </thead>
                <tbody>
                    {datas.map((data) => (
                        <tr key={data?.factoryPk}>
                            <td>{data?.pk?.factoryName}</td>
                            <td>{data?.planDate}</td>
                            <td>{data?.planId}</td>
                            <td>{data?.soNo}</td>
                            <td>{data?.material?.materialId}</td>
                            <td>{data?.material?.code}</td>
                            <td>{data?.material?.description}</td>
                            <td>{data?.material?.mainUnit?.name}</td>
                            <td>{data?.material?.mrp?.name}</td>
                            <td>{data?.planQty}</td>
                            <td>{data?.supplier?.nationalName}</td>
                            <td>{data?.giType?.name}</td>
                            <td>{data?.remark}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p>Thanks and Best Regards.</p>
        </div>
    )
}