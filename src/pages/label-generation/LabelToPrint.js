import { Box, CardContent, Grid, Paper, Typography } from '@material-ui/core';
import moment from 'moment';
import * as React from "react";
import { styled } from '@material-ui/core/styles';
import QRCode from "react-qr-code";
import Watermark from 'react-awesome-watermark';

const StyledWatermark = styled(Watermark)({
    margin: '0 auto',
    '& .inner-watermark': {
        width: '100%',
        height: '100%',
        border: '1px solid #ccc',
        fontSize: '20px',
        textAlign: 'center',
        lineHeight: 2
    },
});
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
        const { labelToPrint, printType, labelType, widgetName, withWatermark } = this.props;
        let labelToPrintSorted;
        if (printType === 'asc') {
            labelToPrintSorted = labelToPrint.sort(this.compareAsc);
        } else {
            labelToPrintSorted = labelToPrint.sort(this.compareDesc);
        }
        return (
            <CardContent sx={{ my: (widgetName === 'Purchase Label' || widgetName === 'Manual Label') ? 0.25 : 0.5, py: (widgetName === 'Purchase Label' || widgetName === 'Manual Label') ? 0.25 : 0.5 }}>
                {
                    widgetName === 'Production Label' &&
                    <ProductionLabel labels={labelToPrintSorted} labelType={labelType} />
                }
                {
                    (widgetName === 'Purchase Label' || widgetName === 'Manual Label') &&
                    <BoxLabel labels={labelToPrintSorted} withWatermark={withWatermark} widgetName={widgetName} />
                }
            </CardContent>
        );
    }
}

const Typo = ({ header, info, widgetName }) => (
    <Typography component='div' sx={{ fontSize: (widgetName === 'Purchase Label' || widgetName === 'Manual Label') ? '0.5rem' : '0.6rem' }}>{`${header}: `} <Box fontWeight='fontWeightMedium' display='inline'>{`${info}`}</Box></Typography>
)

const BoxLabel = ({ labels, withWatermark, widgetName }) => (
    labels.map((label) => {
        const { epassNo, grNo, qty } = label;
        const lotNoSeq = epassNo.slice(-11);
        const lotNo = lotNoSeq.slice(0, 7);
        const seq = lotNoSeq.slice(-4);
        return (
            <>
                <div className="page-break" />
                <Grid item xs={12} key={epassNo}>
                    <Paper variant="outlined" sx={{ my: 0, py: 0, textAlign: 'center' }}>
                        {
                            withWatermark &&
                            <StyledWatermark
                                text="CHECKED"
                                style={{
                                    width: 500,
                                    height: 140,
                                    fontSize: 64,
                                    rotate: -15
                                }}
                                position={{
                                    x: 115,
                                    y: 170
                                }}
                            >
                                <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                        <QRCode value={epassNo} size={128} level='H' />
                                    </Grid>
                                    <Grid item xs={8}>
                                        <Box sx={{ textAlign: 'left' }}>
                                            <Typo header='Model' info={label.model} widgetName={widgetName}/>
                                            <Typo header='Supplier' info={label.line} widgetName={widgetName}/>
                                            <Typo header='Date' info={moment().format('YYYY-MM-DD HH:mm')} widgetName={widgetName}/>
                                            <Typography sx={{ fontSize: '0.5rem' }} component='div'>Seq: <Box fontWeight='fontWeightMedium' display='inline'>{`${seq}`}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Box> No: <Box fontWeight='fontWeightMedium' display='inline'>{`${grNo}`}</Box></Typography>
                                            <Typography sx={{ fontSize: '0.5rem' }} component='div'>Lot No.: <Box fontWeight='fontWeightMedium' display='inline'>{`${lotNo}`}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Box> Qty: <Box fontWeight='fontWeightMedium' display='inline'>{`${qty}`}</Box></Typography>
                                            <Typography sx={{ fontSize: '0.5rem' }} component='div'><Box fontWeight='fontWeightMedium' display='inline'>{`${epassNo}`}</Box></Typography>
                                        </Box>
                                    </Grid>

                                </Grid>
                            </StyledWatermark>
                        }
                        {
                            !withWatermark &&
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <QRCode value={epassNo} size={64} />
                                </Grid>
                                <Grid item xs={8}>
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Typo header='Model' info={label.model} widgetName={widgetName}/>
                                        <Typo header='Supplier' info={label.line} widgetName={widgetName}/>
                                        <Typo header='Date' info={moment().format('YYYY-MM-DD HH:mm')} widgetName={widgetName}/>
                                        <Typography sx={{ fontSize: '0.5rem' }} component='div'>Seq: <Box fontWeight='fontWeightMedium' display='inline'>{`${seq}`}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Box> No: <Box fontWeight='fontWeightMedium' display='inline'>{`${grNo}`}</Box></Typography>
                                        <Typography sx={{ fontSize: '0.5rem' }} component='div'>Lot No.: <Box fontWeight='fontWeightMedium' display='inline'>{`${lotNo}`}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Box> Qty: <Box fontWeight='fontWeightMedium' display='inline'>{`${qty}`}</Box></Typography>
                                        <Typography sx={{ fontSize: '0.5rem' }} component='div'><Box fontWeight='fontWeightMedium' display='inline'>{`${epassNo}`}</Box></Typography>
                                    </Box>
                                </Grid>

                            </Grid>
                        }
                    </Paper>
                </Grid>
            </>
        )
    })
)

const ProductionLabel = ({ labels, labelType }) => (
    labels.map((label) => {
        const { epassNo } = label;
        const lotNoSeq = epassNo.slice(-11);
        const lotNo = lotNoSeq.slice(0, 7);
        const seq = lotNoSeq.slice(-4);
        return (
            <>
                <div className="page-break" />
                <Grid item xs={12} key={epassNo}>
                    <Paper variant="outlined" sx={{ my: 0, py: 0, textAlign: 'center' }} >
                        <Grid container spacing={2}>
                            <Grid item xs={labelType === 'long' ? 4 : 12}>
                                <QRCode value={epassNo} size={64} />
                            </Grid>
                            {
                                labelType === 'long' && <Grid item xs={8}>
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Typo header='Model' info={label.model} />
                                        <Typo header='Line' info={label.line} />
                                        <Typo header='Date' info={moment().format('YYYY-MM-DD')} />
                                        <Typography sx={{ fontSize: '0.6rem' }} component='div'>Lot: <Box fontWeight='fontWeightMedium' display='inline'>{`${lotNo}`}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Box> Seq: <Box fontWeight='fontWeightMedium' display='inline'>{`${seq}`}</Box></Typography>
                                        <Typo header='PO No.' info={label.poNo} />
                                    </Box>
                                </Grid>
                            }

                        </Grid>
                    </Paper>
                </Grid>
            </>
        )
    })
)

const LabelToPrint = React.forwardRef((props, ref) => <LabelToPrintClass ref={ref} labelToPrint={props.labelToPrint} printType={props.printType} labelType={props.labelType} widgetName={props.widgetName} withWatermark={props.withWatermark} />);
export default LabelToPrint;
