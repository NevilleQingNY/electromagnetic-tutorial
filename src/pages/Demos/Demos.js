import React, { useState } from 'react';
import { Box, Drawer, List, Divider, ListItem, ListItemButton, Tooltip, IconButton, Typography, AppBar, Toolbar } from '@mui/material';
import { NavLink, Routes, Route, useParams, Navigate } from 'react-router-dom';
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

const tutorials = [
  {
    label: "Plane Wave Propagation",
    route: "plane_wave_propagation",
    component: <PlaneWave></PlaneWave>
  },
  {
    label: "Reflection from a plane",
    route: "cb_propagation",
    component: <ReflectionPlane></ReflectionPlane>
  },
  {
    label: "Reflection from a slab",
    route: "reflection_from_slab",
    component: <ReflectionSlab></ReflectionSlab>
  },
  {
    label: "Oblique reflection from a plane",
    route: "oblique_reflection",
    component: <ObliqueReflectionPlane></ObliqueReflectionPlane>
  },
  {
    label: "Two ray model",
    route: "two_ray_model",
    component: <TwoRayModel></TwoRayModel>
  },
  {
    label: "Geometrical Optics and UTD",
    route: "geometrical_optics_utd",
    component: <GeometricalOptics></GeometricalOptics>
  },
  {
    label: "Rayleigh and Rician fading",
    route: "rayleigh_rician_fading",
    component: <RayleighRician></RayleighRician>
  },
  {
    label: "Knife-edge diffraction models for rural terrain",
    route: "knife_edge_diffraction",
    component: <KnifeEdgeDiffraction></KnifeEdgeDiffraction>
  },
  {
    label: "3D Tutorial",
    route: "3d_tutorial",
    component: <ThreeDTutorial></ThreeDTutorial>
  }
];

const Demos = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const currentRoute = useParams()['*'];
  console.log(currentRoute);

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
            {/* {id} */}
            {tutorials.find(item => item.route === currentRoute)?.label || 'Plane Wave Propagation'}
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
            {tutorials.map((item, index) => (
              <Tooltip key={index} title={item.label} placement="right">
                <ListItem disablePadding>
                  <ListItemButton
                    component={NavLink}
                    to={`/demos/${item.route}`}
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
                        {item.label}
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
            {tutorials.map((Component, index) => (
              <Route key={index} path={`${Component.route}`} element={Component.component} />
            ))}
            <Route path="/" element={<Navigate to={tutorials[0].route} />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default Demos;
