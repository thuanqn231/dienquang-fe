import {
    Card, CardHeader
} from '@material-ui/core';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// ----------------------------------------------------------------------
export default function MaintenanceIndex() {
    const series = [{
        name: 'Gases',
        data: [
            {
                name: 'Argon',
                y: 0.9,
                color: '#3498db'
            },
            {
                name: 'Nitrogen',
                y: 78.1,
                color: '#9b59b6'
            },
            {
                name: 'Oxygen',
                y: 20.9,
                color: '#2ecc71'
            },
            {
                name: 'Trace Gases',
                y: 0.1,
                color: '#f1c40f'
            }
        ]
    }]

    const options = {

        credits: false,
        chart: {
            type: 'pie'
        },
        title: {
            verticalAlign: 'middle',
            floating: true,
            text: '65H',
            style: {
                fontSize: '3rem',
                fontWeight: 'bold'
            }
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    format: '{point.name}: {point.percentage:.1f} %'
                },
                innerSize: '70%',
                size: '50%',
                top: 0
            }
        },
        series
    }
    return (
        <Card sx={{ height: '100%' }}>
            <CardHeader title="Maintenance Index" sx={{ backgroundColor: 'primary.dark', textAlign: 'center', p: 1, color: 'common.white' }} />
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
            />
        </Card >
    );
}
