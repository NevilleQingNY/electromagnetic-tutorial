// src/pages/Home/Home.js
import React from 'react';
import { Container, Typography, Box, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const tutorials = [
  { number: 1, title: 'Plane Wave Propagation', tutorialLink: '/tutorials/T1.pdf', solutionsLink: '/tutorials/T1_solutions.pdf' },
  { number: 2, title: 'Reflection from a plane / slab', tutorialLink: '/tutorials/T2.pdf', solutionsLink: '/tutorials/T2_solutions.pdf' },
  { number: 3, title: 'Oblique reflection from a plane / slab', tutorialLink: '/tutorials/T3.pdf', solutionsLink: '/tutorials/T3_solutions.pdf' },
  { number: 4, title: 'UTD, Two ray and fading models', tutorialLink: '/tutorials/T4.pdf', solutionsLink: '/tutorials/T4_solutions.pdf' },
];

const Home = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        European School of Antennas - Short Range Radio Propagation: Theory, Models and Future Applications
      </Typography>

      <Box sx={{ my: 4 }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="tutorial table">
            <TableHead>
              <TableRow>
                <TableCell>Tutorial Number</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Solutions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tutorials.map((row) => (
                <TableRow key={row.number}>
                  <TableCell>{row.number}</TableCell>
                  <TableCell>
                    <Link href={row.tutorialLink} target="_blank" rel="noopener noreferrer" underline="hover">
                      {row.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={row.solutionsLink} target="_blank" rel="noopener noreferrer" underline="hover">
                      Solutions
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default Home;
