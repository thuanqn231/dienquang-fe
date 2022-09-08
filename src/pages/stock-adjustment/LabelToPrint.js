import { Box, CardContent, Grid, Paper, Typography } from '@material-ui/core';
import moment from 'moment';
import * as React from "react";
import QRCode from "react-qr-code";
import useLocales from '../../hooks/useLocales';

export class LabelToPrintClass extends React.PureComponent {
    canvasEl;

    constructor(props) {
        super(props);
        this.state = { checked: false };
    }


    componentDidMount() {
    }

    handleCheckboxOnChange = () =>
        this.setState((preValue) => ({ ...preValue, checked: !preValue.checked }));

    setRef = (ref) => (this.canvasEl = ref);

    compareAsc = (a, b) => {
        if (a.epassNo < b.epassNo) {
            return -1;
        }
        if (a.epassNo > b.epassNo) {
            return 1;
        }
        return 0;
    }

    compareDesc = (a, b) => {
        if (a.epassNo < b.epassNo) {
            return 1;
        }
        if (a.epassNo > b.epassNo) {
            return -1;
        }
        return 0;
    }

    render() {
        const { labelToPrint, printType, labelType, widgetName } = this.props;
        let labelToPrintSorted;
        if (printType === 'asc') {
            labelToPrintSorted = labelToPrint.sort(this.compareAsc);
        } else {
            labelToPrintSorted = labelToPrint.sort(this.compareDesc);
        }
        return (
            <CardContent>
                {widgetName === 'Production Label' &&
                    <ProductionLabel labels={labelToPrintSorted} labelType={labelType} />
                }
                {
                    widgetName === 'Purchase Label' &&
                    <BoxLabel labels={labelToPrintSorted} />
                }
            </CardContent>
        );
    }
}

const Typo = ({ header, info }) => (
    <Typography component='div'>{`${header}: `} <Box fontWeight='fontWeightMedium' display='inline'>{`${info}`}</Box></Typography>
)

const BoxLabel = ({ labels }) => {
    const { translate } = useLocales();
    return labels.map((label) => {
        const { epassNo, grNo, qty } = label;
        const lotNoSeq = epassNo.slice(-11);
        const lotNo = lotNoSeq.slice(0, 7);
        const seq = lotNoSeq.slice(-4);
        return (
            <>
                <div style={{ pageBreakBefore: "always" }} />
                <Grid item xs={12} key={epassNo} sx={{ py: 2.5 }}>
                    <Paper variant="outlined" sx={{ my: 2.5, py: 2.5, textAlign: 'center' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <QRCode value={epassNo} size={128} level='H' />
                            </Grid>
                            <Grid item xs={8}>
                                <Box sx={{ textAlign: 'left' }}>
                                    <Typo header='Model' info={label.model} />
                                    <Typo header='Supplier' info={label.line} />
                                    <Typo header='Date' info={moment().format('YYYY-MM-DD HH:mm')} />
                                    <Typography component='div'>{translate(`typo.seq`)}: <Box fontWeight='fontWeightMedium' display='inline'>{`${seq}`}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Box> {translate(`typo.no`)}: <Box fontWeight='fontWeightMedium' display='inline'>{`${grNo}`}</Box></Typography>
                                    <Typography component='div'>{translate(`typo.lot_no`)}.: <Box fontWeight='fontWeightMedium' display='inline'>{`${lotNo}`}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Box> {translate(`typo.qty`)}: <Box fontWeight='fontWeightMedium' display='inline'>{`${qty}`}</Box></Typography>
                                    <Typography component='div'><Box fontWeight='fontWeightMedium' display='inline'>{`${epassNo}`}</Box></Typography>
                                </Box>
                            </Grid>

                        </Grid>
                    </Paper>
                </Grid>
            </>
        )
    })
}

const ProductionLabel = ({ labels, labelType }) => {
    const { translate } = useLocales();
    return labels.map((label) => {
        const { epassNo } = label;
        const lotNoSeq = epassNo.slice(-11);
        const lotNo = lotNoSeq.slice(0, 7);
        const seq = lotNoSeq.slice(-4);
        return (
            <>
                <div style={{ pageBreakBefore: "always" }} />

                <Grid item xs={12} key={epassNo} sx={{ py: 2.5 }}>
                    <Paper variant="outlined" sx={{ my: 2.5, py: 2.5, textAlign: 'center' }} >
                        <Grid container spacing={2}>
                            <Grid item xs={labelType === 'long' ? 4 : 12}>
                                <QRCode value={epassNo} size={128} level='H' />
                            </Grid>
                            {
                                labelType === 'long' && <Grid item xs={8}>
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Typo header='Model' info={label.model} />
                                        <Typo header='Line' info={label.line} />
                                        <Typo header='Date' info={moment().format('YYYY-MM-DD')} />
                                        <Typography component='div'>{translate(`typo.lot`)}: <Box fontWeight='fontWeightMedium' display='inline'>{`${lotNo}`}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Box> {translate(`typo.seq`)}: <Box fontWeight='fontWeightMedium' display='inline'>{`${seq}`}</Box></Typography>
                                    </Box>
                                </Grid>
                            }

                        </Grid>
                    </Paper>
                </Grid>
            </>
        )
    })
}

const LabelToPrint = React.forwardRef((props, ref) => <LabelToPrintClass ref={ref} labelToPrint={props.labelToPrint} printType={props.printType} labelType={props.labelType} widgetName={props.widgetName} />);
export default LabelToPrint;
