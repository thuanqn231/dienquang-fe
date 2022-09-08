import { Card, CardHeader } from '@material-ui/core';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

function getTimeGap(startTime, endTime, prevTime) {
  let startHour;
  let startMin;
  if (prevTime === '6:00:00') {
    const startFull = startTime.split(':');
    startHour = Number(startFull[0]);
    startMin = Number(startFull[1]);
  }
  else {
    const startFull = startTime.split('T')[1].split('+')[0].split(':');
    startHour = Number(startFull[0]);
    startMin = Number(startFull[1]);
  }
  const endFull = endTime.split('T')[1].split('+')[0].split(':');
  const endHour = Number(endFull[0]);
  const endMin = Number(endFull[1]);
  const start = startHour + startMin / 60;
  const end = endHour + endMin / 60;
  const startText = `${startHour}:${startMin}`;
  const endText = `${endHour}:${endMin}`;
  const timeGap = end - start;
  return { startText, timeGap, endText };
}

function transformTimeDataToNumerical(data, equipList, defaultStart) {
  const result = [];
  for (let i = 0; i < equipList.length;) {
    const equip = equipList[i];
    const equipIndex = i;
    if (typeof data[0] !== 'undefined') {
      for (let j = 0; j < data[0].operationHistoryItems.length;) {
        const equipOperate = data[0].operationHistoryItems[j];
        result[equipIndex] = {
          equip: {
            code: equip.eqIDcode,
            name: equip.eqIDname
          },
          times: []
        };


        if (equip.eqIDcode === equipOperate.equipmentID.code) {
          let prevTime = defaultStart;
          equipOperate.operationTimes.forEach((time, index) => {
            if (time.startTime !== prevTime) {
              const length = getTimeGap(prevTime, time.startTime, prevTime);
              result[equipIndex].times.push({
                startTime: length.startText,
                endTime: length.endText,
                timeGap: length.timeGap,
                status: 'no data',
                lossReason: `undefine`
              });
              if (prevTime === defaultStart) prevTime = time.startTime; else prevTime = time.endTime;
            }
            if (time.operationStatus === 'OPERATION') {

              const length = getTimeGap(time.startTime, time.endTime);
              result[equipIndex].times.push({
                startTime: length.startText,
                endTime: length.endText,
                timeGap: length.timeGap,
                status: 'on',
                lossReason: `${time.lossReason}`
              });
              prevTime = time.endTime;
            } else if (time.operationStatus === 'LOSS') {
              const length = getTimeGap(time.startTime, time.endTime);

              result[equipIndex].times.push({
                startTime: length.startText,
                endTime: length.endText,
                timeGap: length.timeGap,
                status: 'off',
                lossReason: `${time.lossReason}`
              });
              prevTime = time.endTime;
            }

          });
          break;
        } else {
          result[equipIndex].times.push({ status: 'no plan' });
        }
        j += 1;
      }
    } else {
      result[equipIndex] = {
        equip: {
          code: equip.eqIDcode,
          name: equip.eqIDname
        },
        times: [{ status: 'no plan' }]
      };
    }

    i += 1;
  }
  return result;
}

function mapToSeriesData(shortdata) {
  // ? series trong này là mảng 2 chiều [[on1, off 1, no plan1], [on2, off 2, no plan2], ...]
  const series = [];
  let prev = 0;

  shortdata.forEach((equip, _index) => {
    equip.times.forEach((time, index) => {
      let temp = series[index];
      if (typeof temp === 'undefined') {

        const a = [
          {
            name: `on-${index + 1}`,
            data: [],
            color: 'green'
          },
          {
            name: `off-${index + 1}`,
            data: [],
            color: 'red'
          },
          {
            name: `no plan-${index + 1}`,
            data: [],
            color: 'gray'
          },
          {
            name: `no data-${index + 1}`,
            data: [],
            color: 'orange'
          }
        ]
        for (let i = prev; i < _index;) {
          a.forEach(item => {
            item.data.push({
              name: `${shortdata[i].equip.code}: ${shortdata[i].equip.name}`,
              y: 0,
              tip: `undefine`
            })
          })
          i += 1;
        }
        temp = a

      }
      if (temp[0].data.length < _index) {
        const count = temp[0].data.length - 1
        for (let i = count + 1; i < _index;) {
          temp.forEach(item => {
            item.data.push({
              name: `${shortdata[i].equip.code}: ${shortdata[i].equip.name}`,
              y: 0,
              tip: `undefine`
            })
          })
          i += 1;
        }

      }
      let tempAll = [];
      if (time.status === 'no data') {
        const _tempOn = {
          name: `on-${index + 1}`,
          data: [
            {
              name: `${equip.equip.code}: ${equip.equip.name}`,
              y: 0,
              tip: `not available`
            },
          ],
          color: 'green'
        };

        const _tempOff = {
          name: `off-${index + 1}`,
          data: [
            {
              name: `${equip.equip.code}: ${equip.equip.name}`,
              y: 0,
              tip: `not available`
            }
          ],
          color: 'red'
        };

        const _tempNoPlan = {
          name: `no plan-${index + 1}`,
          data: [
            {
              name: `${equip.equip.code}: ${equip.equip.name}`,
              y: 0,
              tip: `no plan`
            }
          ],
          color: 'gray'
        };

        const _tempNoData = {
          name: `no data-${index + 1}`,
          data: [
            {
              name: `${equip.equip.code}: ${equip.equip.name}`,
              y: time.timeGap,
              tip: `no data from: ${time.startTime} to ${time.endTime}`
            }
          ],
          color: 'orange'
        }

        if (temp) {
          _tempOn.data = [...temp[0].data, ..._tempOn.data];
          _tempOff.data = [...temp[1].data, ..._tempOff.data];
          _tempNoPlan.data = [...temp[2].data, ..._tempNoPlan.data];
          _tempNoData.data = [...temp[3].data, ..._tempNoData.data];
        }
        tempAll = [_tempOn, _tempOff, _tempNoPlan, _tempNoData];
      }
      else if (time.status === 'no plan') {
        const _tempOn = {
          name: `on-${index + 1}`,
          data: [
            {
              name: `${equip.equip.code}: ${equip.equip.name}`,
              y: 0,
              tip: `not available`
            },
          ],
          color: 'green'
        };

        const _tempOff = {
          name: `off-${index + 1}`,
          data: [
            {
              name: `${equip.equip.code}: ${equip.equip.name}`,
              y: 0,
              tip: `not available`
            }
          ],
          color: 'red'
        };

        const _tempNoPlan = {
          name: `no plan-${index + 1}`,
          data: [
            {
              name: `${equip.equip.code}: ${equip.equip.name}`,
              y: 24,
              tip: `no plan`
            }
          ],
          color: 'gray'
        };
        const _tempNoData = {
          name: `no data-${index + 1}`,
          data: [
            {
              name: `${equip.equip.code}: ${equip.equip.name}`,
              y: 0,
              tip: 'not available'
            }
          ],
          color: 'orange'
        }

        if (temp) {
          _tempOn.data = [...temp[0].data, ..._tempOn.data];
          _tempOff.data = [...temp[1].data, ..._tempOff.data];
          _tempNoPlan.data = [...temp[2].data, ..._tempNoPlan.data];
          _tempNoData.data = [...temp[3].data, ..._tempNoData.data];
        }
        tempAll = [_tempOn, _tempOff, _tempNoPlan, _tempNoData];
      } else if (time.status === 'on') {
        const _tempOn = {
          name: `on-${index + 1}`,
          data: [
            {
              name: `${equip.equip.code}: ${equip.equip.name}`,
              y: time.timeGap,
              tip: `operation time: ${time.startTime} to ${time.endTime}`
            }
          ],
          color: 'green'
        };

        const _tempOff = {
          name: `off-${index + 1}`,
          data: [
            {
              name: `${equip.equip.code}: ${equip.equip.name}`,
              y: 0,
              tip: `not available`
            }
          ],
          color: 'red'
        };

        const _tempNoPlan = {
          name: `no plan-${index + 1}`,
          data: [
            {
              name: `${equip.equip.code}: ${equip.equip.name}`,
              y: 0,
              tip: `not available`
            }
          ],
          color: 'gray'
        };
        const _tempNoData = {
          name: `no data-${index + 1}`,
          data: [
            {
              name: `${equip.equip.code}: ${equip.equip.name}`,
              y: 0,
              tip: 'not available'
            }
          ],
          color: 'orange'
        }

        if (temp) {
          _tempOn.data = [...temp[0].data, ..._tempOn.data];
          _tempOff.data = [...temp[1].data, ..._tempOff.data];
          _tempNoPlan.data = [...temp[2].data, ..._tempNoPlan.data];
          _tempNoData.data = [...temp[3].data, ..._tempNoData.data];
        }
        tempAll = [_tempOn, _tempOff, _tempNoPlan, _tempNoData];
      } else if (time.status === 'off') {
        const _tempOn = {
          name: `on-${index + 1}`,
          data: [
            {
              name: `${equip.equip.code}: ${equip.equip.name}`,
              y: 0,
              tip: `not available`
            }
          ],
          color: 'green'
        };
        const _tempOff = {
          name: `off-${index + 1}`,
          data: [
            {
              name: `${equip.equip.code}: ${equip.equip.name}`,
              y: time.timeGap,
              tip: `stop time: ${time.startTime} to ${time.endTime}.<br/>loss reason: ${time.lossReason}`
            }
          ],
          color: 'red'
        };

        const _tempNoPlan = {
          name: `no plan-${index + 1}`,
          data: [
            {
              name: `${equip.equip.code}: ${equip.equip.name}`,
              y: 0,
              tip: `not available`
            }
          ],
          color: 'gray'
        };
        const _tempNoData = {
          name: `no data-${index + 1}`,
          data: [
            {
              name: `${equip.equip.code}: ${equip.equip.name}`,
              y: 0,
              tip: 'not available'
            }
          ],
          color: 'orange'
        }

        if (temp) {
          _tempOn.data = [...temp[0].data, ..._tempOn.data];
          _tempOff.data = [...temp[1].data, ..._tempOff.data];
          _tempNoPlan.data = [...temp[2].data, ..._tempNoPlan.data];
          _tempNoData.data = [...temp[3].data, ..._tempNoData.data];
        }
        tempAll = [_tempOn, _tempOff, _tempNoPlan, _tempNoData];
      }
      series[index] = tempAll;
    });
    prev = _index;
  });
  return series;
}

function convert2Dto1D(series) {
  const arr1d = [].concat(...series);
  return arr1d;
}

function genOpt(respondWidth, defaultStart = '') {
  const options = {
    chart: {
      type: 'bar',
      inverted: false,
      width: respondWidth
    },
    credits: {
      enabled: false
    },
    title: {
      text: 'OPERATION TIME CHART'
    },
    xAxis: {
      categories: ['equip1', 'equip2', 'equip3', 'equip4']
    },
    yAxis: {
      min: 0,
      title: {
        text: 'time'
      },
      floor: 0,
      ceiling: 24,
      reversedStacks: false,
      labels: {
        formatter: function format() {
          let realHour = 0;
          let realMin = '00';
          if (defaultStart === '') {
            realHour = this.value + 6;
            if (realHour >= 24) realHour -= 24;
          } else {
            const [hour, min] = defaultStart.trim().split(':');
            realHour = Number(this.value) + Number(hour);
            realMin = min;
            if (realHour >= 24) realHour -= 24;
          }

          return `${realHour}:${realMin}`;
        }
      }
    },
    tooltip: {
      formatter: function format() {
        return `${this.point.name} <br/>${this.point.tip}`;
      }
    },
    legend: {
      reversed: true,
      enabled: false
    },
    plotOptions: {
      series: {
        stacking: 'normal'
      }
    }
  };
  return options;
}

export function OperationTimeChart1(props) {
  const shortdata = transformTimeDataToNumerical(props.data, props.equipList, props.defaultStart);
  const series2D = mapToSeriesData(shortdata);
  const series = convert2Dto1D(series2D);
  const options = genOpt(props.respondWidth, props.defaultStart);

  options.xAxis.categories = shortdata.map((item) => item.equip.code);
  options.series = series;
  return (
    <Card sx={{ height: '100%' }}>
      {/* <CardHeader
        title="Test chart"
        sx={{ backgroundColor: 'primary.dark', textAlign: 'center', p: 1, color: 'common.white' }}
      /> */}
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Card>
  );
}
