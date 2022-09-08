import Highcharts, { chart } from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import PropTypes from 'prop-types';


export default function GlobalChart({options, highcharts, ...props}){
        highcharts.setOptions({
            colors: ['#4C4D4F', '#F7941D', '#F1592A', '#3AB54A', '#0F75BD', '#004A8B', '#92278F', '#EF59A1', '#BF1E2E'],
            });
    
    return <HighchartsReact highcharts={highcharts} options = {options} {...props} />
}


GlobalChart.propTypes = {
    options: PropTypes.object
};
