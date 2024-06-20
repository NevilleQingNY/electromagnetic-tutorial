import React, { useState } from 'react';
import { Box, Drawer, List, Divider, ListItem, ListItemButton, Tooltip, IconButton, Typography, AppBar, Toolbar } from '@mui/material';
import { NavLink, Routes, Route, useParams } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ListItemContent from '@mui/joy/ListItemContent'; // 确保安装了 @mui/joy

import PlaneWave from './PlaneWave';
import ReflectionPlane from './ReflectionPlane';
import ReflectionSlab from './ReflectionSlab';
import ObliqueReflectionPlane from './ObliqueReflectionPlane';
import TwoRayModel from './TwoRayModel';
import GeometricalOptics from './GeometricalOptics';
import RayleighRician from './RayleighRician';
import KnifeEdgeDiffraction from './KnifeEdgeDiffraction';
import ThreeDTutorial from './ThreeDTutorial';

const drawerWidth = 260;

const tutorialTitles = [
  "Plane Wave Propagation",
  "Reflection from a plane",
  "Reflection from a slab",
  "Oblique reflection from a plane",
  "Two ray model",
  "Geometrical Optics and UTD",
  "Rayleigh and Rician fading",
  "Knife-edge diffraction models for rural terrain",
  "3D Tutorial"
];

const tutorialComponents = [
  PlaneWave,
  ReflectionPlane,
  ReflectionSlab,
  ObliqueReflectionPlane,
  TwoRayModel,
  GeometricalOptics,
  RayleighRician,
  KnifeEdgeDiffraction,
  ThreeDTutorial,
];

const Demos = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const { id } = useParams();
  const selectedTutorial = parseInt(id) || 0;

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* AppBar */}
      <AppBar position="relative" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, boxShadow: 'none' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{ mr: 2 }}
          >
            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap>
            {tutorialTitles[selectedTutorial]}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Drawer */}
        <Drawer
          sx={{
            width: drawerOpen ? drawerWidth : 0,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            transition: 'width 0.3s',
            '& .MuiDrawer-paper': {
              width: drawerOpen ? drawerWidth : 0,
              overflowX: drawerOpen ? 'auto' : 'hidden',
              transition: 'width 0.3s',
              position: 'relative',
              boxSizing: 'border-box',
            },
          }}
          variant="permanent"
          anchor="left"
          open={drawerOpen}
        >
          <Divider />
          <List>
            {tutorialTitles.map((item, index) => (
              <Tooltip key={index} title={item} placement="right">
                <ListItem disablePadding>
                  <ListItemButton
                    component={NavLink}
                    to={`/demos/${index}`}
                    sx={{
                      '&.active': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.dark'
                        },
                      },
                    }}
                  >
                    <ListItemContent>
                      <Typography noWrap>
                        {item}
                      </Typography>
                    </ListItemContent>
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            ))}
          </List>
        </Drawer>

        <Box
          component="main"
          sx={{
            flex: 1,
            bgcolor: 'background.default',
            p: 4,
            transition: 'margin-left 0.3s',
            overflowY: 'auto',
          }}
        >
          <Routes>
            {tutorialComponents.map((Component, index) => (
              <Route key={index} path={`${index}`} element={<Component />} />
            ))}
            <Route path="/" element={<PlaneWave />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default Demos;
