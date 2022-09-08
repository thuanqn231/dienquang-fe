import React, { useEffect, useState } from "react";
import { Typography } from '@material-ui/core';
import moment from 'moment';

export default function CountdownTimer({ seconds, timeout, setTimeout }) {
  const [time, setTime] = useState(seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((time) => {
        if (time === 0) {
          setTimeout(true);
          clearInterval(timer);
          return 0;
        }
        return time - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (

    <Typography variant="h4" sx={{ color: 'common.white', mx: 0.5, minWidth: 250, textAlign: 'center' }} noWrap>
      {!timeout ? `Time left: ${`${Math.floor(time / 60)}`.padStart(2, 0)}:
      ${`${time % 60}`.padStart(2, 0)}` : `Time out`}
    </Typography>

  );
}
