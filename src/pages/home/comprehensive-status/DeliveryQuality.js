import {
    Card, CardHeader, Typography
} from '@material-ui/core';
import { merge } from 'lodash';
import ReactApexChart from 'react-apexcharts';
import { BaseOptionChart } from '../../../components/charts';
import useLocales from '../../../hooks/useLocales';

// ----------------------------------------------------------------------
const CHART_DATA = [];
export default function DeliveryQuality() {
    const { translate, currentLang } = useLocales();
    const chartOptions = merge(BaseOptionChart(), {
        chart: {
            sparkline: { enabled: true },
            height: '100%'
        },
        legend: { show: false },
        plotOptions: {
            bar: {
                hollow: { size: '80%' },
                track: {
                    margin: 0,
                    strokeWidth: '97%'
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    show: true,
                    width: 2,
                    colors: ['transparent']
                },
                xaxis: {
                    categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                },
                yaxis: {
                    title: {
                        text: '$ (thousands)'
                    }
                },
                fill: {
                    opacity: 1
                },
                tooltip: {
                    y: {
                        formatter: (val) => `$${val} thousands`
                    }
                }
            }
        }
    });
    return (
        <Card sx={{ height: '100%' }}>
            <CardHeader title="Delivery Quality" sx={{ backgroundColor: 'primary.dark', textAlign: 'center', p: 1, color: 'common.white' }} />
            <Typography variant="h3" color="textSecondary" textAlign="center">{translate(`typo.RMA_0ppm`)}</Typography>
            <ReactApexChart type="bar" series={CHART_DATA} options={chartOptions} />
        </Card>
    );
}
