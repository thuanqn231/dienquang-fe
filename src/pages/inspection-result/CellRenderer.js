import React from 'react';
import { styled } from '@material-ui/core/styles';
import { propTypes } from 'react-markdown';
import { makeStyles, createStyles } from '@material-ui/styles';
import { fontWeight } from '@material-ui/system';
import { status } from 'nprogress';

const Button = styled('button')({
  border: 'none',
  backgroundColor: 'inherit',
  color: 'inherit'
});

const useStyles = makeStyles((theme) =>
  createStyles({
    pass: {
      color: 'green',
      fontWeight: 'bold'
    },
    fail: {
      color: 'red',
      fontWeight: 'bold'
    },
    planned: {
      fontWeight: 'bold'
    },
    y: {
      color: '#0e0ee2',
      fontWeight: 'bolder'
    }
  })
);
export function QcResultRenderer(props, isOpenInspectionHistory) {
  const cellValue = props.valueFormatted ? props.valueFormatted : props.value;

  const classes = useStyles();

  return (
    <span>
      <Button className={classes[cellValue?.toLowerCase()]}>{cellValue}</Button>
    </span>
  );
}

QcResultRenderer.propTypes = {
  value: propTypes.string
};
