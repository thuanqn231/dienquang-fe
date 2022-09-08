import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Card,
    Container,
    DialogActions,
    Grid,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Stack,
    TextField,
    Typography,
    Tooltip,
    IconButton,
} from '@material-ui/core';
import { render } from 'react-dom';
import Highcharts from 'highcharts/highstock';

import { styled } from '@material-ui/styles';
import { MBreadcrumbs } from '../../components/@material-extend';
import GlobalChart from '../../components/GlobalChart';




LossTimeReportChart.propTypes = {
    links: PropTypes.array,
    pageCode: PropTypes.string,
    action: PropTypes.node,
    heading: PropTypes.string,
    moreLink: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    sx: PropTypes.object,
    activeLast: PropTypes.bool,
  };


const ContainerChart = styled(Container)({
    width: '100%',
    height: '50%',
    border: '2px solid #00AB55',
    maxWidth: 'none',
    padding: 0,
    margin: 0
  });

export default function LossTimeReportChart({data, pageCode, activeLast, ...other }) {
  
  return (
      <>
        <ContainerChart>
            <GlobalChart
                options={data.optionsStock}
                highcharts={Highcharts}
            />
        </ContainerChart>
        <ContainerChart> 
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <GlobalChart
                        options={data.optionsPieType}
                        highcharts={Highcharts}
                    />
                </Grid>
                <Grid item xs={4}>
                    <GlobalChart
                        options={data.optionsPieClass}
                        highcharts={Highcharts}
                    />
                </Grid>
                <Grid item xs={4}>
                    <GlobalChart
                        options={data.optionsPieDetail}
                        highcharts={Highcharts}
                    />
                </Grid>        
            </Grid>  
        </ContainerChart>
        
      </>
  )
}
