import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const TabsMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    navigate(newValue);
  };

  // Handle dynamic value based on location
  const value = location.pathname.startsWith('/demos')
    ? '/demos'
    : location.pathname.startsWith('/tutorials')
    ? '/tutorials'
    : '/';

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="navigation tabs"
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Home" value="/" />
        <Tab label="Interactive Demos" value="/demos" />
        <Tab label="Tutorials" value="/tutorials" />
      </Tabs>
    </Box>
  );
};

export default TabsMenu;
