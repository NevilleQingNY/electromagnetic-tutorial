// src/pages/Home/Home.js
import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import cesenatico from '../../assets/images/cesenatico.jpg';

const Home = () => {
  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mobile Radio Propagation for 5G and Beyond
      </Typography>
      <Typography variant="body1" component="p" gutterBottom>
        Welcome to the course tutorial page. Click on the demos tab to access some interactive tutorials.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <img
          src={cesenatico}
          alt="Cesenatico"
          style={{ width: '80%', height: 'auto', maxWidth: '600px', borderRadius: '8px' }}
        />
      </Box>
    </Container>
  );
};

export default Home;
