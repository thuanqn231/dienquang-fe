import { Box, Stack, Tab, Tabs } from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';
import PersonPinIcon from '@material-ui/icons/PersonPin';
import { useState } from 'react';

// ----------------------------------------------------------------------

const SIMPLE_TAB = [
  { value: '2', icon: <FavoriteIcon />, label: 'Item Two', disabled: false },
  { value: '3', icon: <PersonPinIcon />, label: 'Item Three', disabled: true }
];

// ----------------------------------------------------------------------

export default function AccountTabsChild() {
  const [valueScrollable, setValueScrollable] = useState('1');

  const handleChangeScrollable = (event, newValue) => {
    setValueScrollable(newValue);
  };

  return (
    <Stack spacing={3} direction={{ xs: 'column', md: 'row' }}>
      <Box
        sx={{
          flexGrow: 1,
          width: '100%',
          maxWidth: "lg",
          px: 3
        }}
      >
        <Tabs
          allowScrollButtonsMobile
          value={valueScrollable}
          variant="scrollable"
          scrollButtons="auto"
          onChange={handleChangeScrollable}
        >
          {SIMPLE_TAB.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} disabled={tab.disabled} />
          ))}
        </Tabs>
        {SIMPLE_TAB.map((tab) => {
          const isMatched = tab.value === valueScrollable;
          return isMatched &&
            <Box sx={{ py: 2, px: 1 }} key={tab.value}>
              {tab.component}
            </Box>;
        })}
      </Box>
    </Stack>
  );
}
