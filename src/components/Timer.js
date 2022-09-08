import React, { useState, useEffect } from 'react';
import { Typography } from '@material-ui/core';
import moment from 'moment';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const Timer = () => {
    const [time, setTime] = useState(moment().format(DATE_TIME_FORMAT));

    useEffect(() => {
        const timerId = setInterval(() => {
            setTime(moment().format(DATE_TIME_FORMAT))
        }, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, [time]);

    return (
        <Typography variant="h4" sx={{ color: 'common.white', mx: 0.5, minWidth: 250, textAlign: 'right' }} noWrap>{time}</Typography>
    );
};

export default Timer;