import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';

const useStyles = makeStyles(() =>
  createStyles({
    urgent: {
      color: '#FF4842',
      fontWeight: 'bold'
    },
    high: {
      color: '#ff8100',
      fontWeight: 'bold'
    },
    normal: {
      color: '#1890FF',
      fontWeight: 'bold'
    }
  })
);
export function PriorityCellRenderer(props) {
  const cellValue = props.valueFormatted ? props.valueFormatted : props.value;
  const classes = useStyles();

  return (
    <span className={classes[cellValue.toLowerCase()]}>{cellValue}</span>
  );
}
