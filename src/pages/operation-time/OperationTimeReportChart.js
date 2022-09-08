import { Card, CardHeader } from '@material-ui/core';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highcharts3d from 'highcharts/highcharts-3d';
import GlobalChart from '../../components/GlobalChart';

export function OperationTimeChart2(dataChart) {
  highcharts3d(Highcharts);
  const transToSeries = (data) => {
    let series = [];
    const opRate = [];
    const lostRate = [];
    data.forEach((day) => {
      const successRate = day.operationRate;
      opRate.push(successRate);
      lostRate.push(1 - successRate);
    });
    series = [
      {
        name: 'Operation Rate',
        data: opRate
      },
      {
        name: 'Loss Rate',
        data: lostRate
      }
    ];
    return series;
  };
  const getDate = (data) => {
    const date = [];
    data.forEach((day) => {
      let dateFormat = new Date(day.operationDate);
      const offset = dateFormat.getTimezoneOffset();
      dateFormat = new Date(dateFormat.getTime() - offset * 60 * 1000);
      const convertedDate = dateFormat.toISOString().split('T')[0];
      date.push(convertedDate);
    });
    return date;
  };
  const category = getDate(dataChart.data);
  // const series = [
  //   {
  //     name: 'Operation Rate',
  //     data: [59, 42, 42, 42, 42, 42, 42, 42]
  //   },
  //   {
  //     name: 'Loss Rate',
  //     data: [41, 58, 58, 58, 58, 58, 58, 58]
  //   }
  // ];

  const series = transToSeries(dataChart.data);
  const options = {
    credits: false,
    chart: {
      type: 'column',
      options3d: {
        enabled: true,
        alpha: 1,
        beta: 20,
        viewDistance: 25,
        depth: 0
      }
    },
    title: {
      text: 'OPERATION RATE BY DAY'
    },
    xAxis: {
      categories: category
    },
    yAxis: {
      enabled: false
    },
    tooltip: {
      pointFormat:
        '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
      shared: true
    },
    plotOptions: {
      column: {
        stacking: 'percent',
        dataLabels: {
          enabled: true,
          format: '{point.percentage:.0f}%'
        }
      }
    },
    series
  };
  return (
    <Card sx={{ height: '100%' }}>
      {/* <CardHeader
        title="Test chart"
        sx={{ backgroundColor: 'primary.dark', textAlign: 'center', p: 1, color: 'common.white' }}
      /> */}
      <GlobalChart highcharts={Highcharts} options={options} />
    </Card>
  );
}
