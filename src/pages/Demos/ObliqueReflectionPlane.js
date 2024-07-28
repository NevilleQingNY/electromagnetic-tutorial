import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Slider, Button, Paper, TableContainer,
  Table, TableHead, TableRow, TableCell, TableBody, Container, Radio, Modal
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend,
} from 'chart.js';
import axios from 'axios';

import scenario1Perp from '../../assets/images/Scenario1_perp.png';
import scenario1Par from '../../assets/images/Scenario1_par.png';
import scenario2Perp from '../../assets/images/Scenario2_perp.png';
import scenario2Par from '../../assets/images/Scenario2_par.png';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const generateInitialData = () => ({
  labels: [],
  datasets: [
    {
      label: 'abs(ref coeff)',
      data: [],
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 3,
      pointRadius: 0,
      yAxisID: 'y',
    },
    {
      label: 'abs(trans coeff)',
      data: [],
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 3,
      pointRadius: 0,
      yAxisID: 'y',
    },
    {
      label: 'real(theta_t)',
      data: [],
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 3,
      pointRadius: 0,
      yAxisID: 'y1',
    }
  ],
});

const chartOptionsInit = () => ({
  scales: {
    x: {
      type: 'linear',
      position: 'bottom',
      title: {
        display: true,
        text: 'theta_i',
      },
      ticks: {
        stepSize: 1,
      },
    },
    y: {
      type: 'linear',
      title: {
        display: true,
        text: 'gamma, T',
      },
      ticks: {
        stepSize: 0.25,
      },
      position: 'left',
    },
    y1: {
      type: 'linear',
      title: {
        display: true,
        text: 'theta_t',
      },
      position: 'right',
    },
  },
  animation: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (context) {
          return `(${context.raw.x.toFixed(3)}, ${context.raw.y.toFixed(3)})`;
        }
      }
    }
  },
  hover: {
    mode: 'nearest',
    intersect: true
  },
});

const materialSettings = {
  'vacuum': { name: 'Vacuum', epsilon: 1, conductivity: 0 },
  'silicon': { name: 'Silicon', epsilon: 12, conductivity: 0.0 },
  'soil-wet': { name: 'Soil (wet)', epsilon: 3, conductivity: 0.0010 },
  'soil-dry': { name: 'Soil (dry)', epsilon: 3, conductivity: 0.0001 },
  'concrete': { name: 'Concrete', epsilon: 10, conductivity: 0.0035 },
};

const scenarios = {
  vacuum: {
    perpendicular: scenario1Perp,
    parallel: scenario1Par
  },
  material: {
    perpendicular: scenario2Perp,
    parallel: scenario2Par
  }
};

export default function ObliqueReflection() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [conductivity, setConductivity] = useState(0);
  const [epsilon, setEpsilon] = useState(1);
  const [frequency, setFrequency] = useState(100);
  const [selectedScenario, setSelectedScenario] = useState('vacuum');
  const [selectedPolarisation, setSelectedPolarisation] = useState('perpendicular');
  const [loading, setLoading] = useState(false);
  const [formatData, setFormatData] = useState(null);
  const [startShowPlot, setStartShowPlot] = useState(false);
  const [chartOptions, setChartOptions] = useState(chartOptionsInit());
  const [chartData, setChartData] = useState(generateInitialData());

  const handleScenarioChange = (event) => {
    setSelectedScenario(event.target.value);
  };

  const handlePolarisationChange = (event) => {
    setSelectedPolarisation(event.target.value);
  };

  const validateNumber = (value, min, max) => {
    if (!value) return min;
    const numberValue = parseFloat(value);
    return isNaN(numberValue) ? min : Math.min(Math.max(numberValue, min), max);
  };

  const handleInputChange = (setter, min, max) => (event) => {
    setter(validateNumber(event.target.value, min, max));
  };

  const handleFrequencyInputChange = (setter, min, max) => (event) => {
    if (!event.target.value || isNaN(event.target.value)) return setter(0);
    setter(Math.min(max, event.target.value));
  };

  const handleSliderChange = (setter) => (_, newValue) => {
    setter(newValue);
  };

  const handleCalculateReflectionCoefficients = async () => {
    setFrequency(Math.max(100, frequency)); // Ensure frequency is at least 100
    const parameters = new URLSearchParams({
      conductivity: (conductivity / 10000).toString(), // Ensure all values are strings
      epsilon: epsilon.toString(),
      frequency: frequency.toString(),
      polarisation: selectedPolarisation,
      scenario: selectedScenario,
      width: '0',
      tutorial_value: '4'
    });
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/reflectionServlet`, parameters, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const data = Array.isArray(response?.data?.message) ? response.data.message[0].split(' ') : [];
      setFormatData(data.map(item => parseFloat(item)));
      setStartShowPlot(true);
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startShowPlot && formatData) {
      const number_of_angles = parseInt(formatData[0], 10);
      const ref_coeff = [];
      const t_coeff = [];
      const theta_t = [];

      for (let i = 0; i < number_of_angles; i++) {
        theta_t.push({ x: parseFloat(formatData[i + 1]), y: parseFloat(formatData[i + 1 + number_of_angles]) });
        ref_coeff.push({ x: parseFloat(formatData[i + 1]), y: parseFloat(formatData[i + 1 + 2 * number_of_angles]) });
        t_coeff.push({ x: parseFloat(formatData[i + 1]), y: parseFloat(formatData[i + 1 + 3 * number_of_angles]) });
      }

      const xMax = Math.max(...ref_coeff.map(d => d.x), ...t_coeff.map(d => d.x), ...theta_t.map(d => d.x));
      const xMin = Math.min(...ref_coeff.map(d => d.x), ...t_coeff.map(d => d.x), ...theta_t.map(d => d.x));
      const yMax = Math.max(...ref_coeff.map(d => d.y), ...t_coeff.map(d => d.y));
      const y1Max = Math.max(...theta_t.map(d => d.y));

      setChartOptions(prevOptions => ({
        ...prevOptions,
        scales: {
          ...prevOptions.scales,
          x: {
            ...prevOptions.scales.x,
            min: xMin,
            max: xMax,
          },
          y: {
            ...prevOptions.scales.y,
            max: yMax,
          },
          y1: {
            ...prevOptions.scales.y1,
            max: y1Max,
          },
        },
      }));

      setChartData({
        labels: ref_coeff.map(point => point.x),
        datasets: [
          { ...chartData.datasets[0], data: ref_coeff },
          { ...chartData.datasets[1], data: t_coeff },
          { ...chartData.datasets[2], data: theta_t }
        ]
      });
      setStartShowPlot(false);
    }
  }, [startShowPlot, formatData]);

  const commonInputProps = { fullWidth: true, variant: 'outlined', margin: 'normal' };

  return (
    <Container maxWidth="xl" sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        <Grid xs={12} lg={6}>
          <Typography variant="h6" gutterBottom>Adjust Parameters & Materials</Typography>
          <Box sx={{ flex: 1, marginBottom: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Adjust Parameters</Typography>
            <TextField
              label="Conductivity Value (×10⁻⁴)"
              value={conductivity}
              onChange={handleInputChange(setConductivity, 0, 9999)}
              {...commonInputProps}
            />
            <Slider
              value={conductivity}
              onChange={handleSliderChange(setConductivity)}
              min={0}
              max={9999}
              valueLabelDisplay="auto"
            />
            <TextField
              label="Relative Permittivity Value"
              value={epsilon}
              onChange={handleInputChange(setEpsilon, 1, 30)}
              {...commonInputProps}
            />
            <Slider
              value={epsilon}
              onChange={handleSliderChange(setEpsilon)}
              min={1}
              max={30}
              valueLabelDisplay="auto"
            />
            <TextField
              label="Frequency in MHz"
              value={frequency}
              onChange={handleFrequencyInputChange(setFrequency, 100, 1000)}
              {...commonInputProps}
            />
            <Slider
              value={frequency}
              onChange={handleSliderChange(setFrequency)}
              min={100}
              max={1000}
              valueLabelDisplay="auto"
            />
          </Box>
          <Box sx={{ marginBottom: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleCalculateReflectionCoefficients}
              sx={{ marginBottom: 2 }}
            >
              {loading ? (
                <CircularProgress color="inherit" />
              ) : (
                <span>Compute</span>
              )}
            </Button>
          </Box>
        </Grid>
        <Grid xs={12} md={6} lg={6}>
          <Box sx={{ width: '100%', cursor: 'pointer', textAlign: 'center' }}>
            <img
              src={scenarios[selectedScenario][selectedPolarisation]}
              alt="Wave propagation"
              style={{ maxWidth: '100%', height: '100%' }}
              onClick={handleOpen}
            />
            <Modal
              open={open}
              onClose={handleClose}
              closeAfterTransition
              aria-labelledby="image-modal-title"
              aria-describedby="image-modal-description"
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80%',
                  maxWidth: '800px',
                  bgcolor: 'background.paper',
                  border: '2px solid #000',
                  boxShadow: 24,
                  p: 4,
                }}
              >
                <img src={scenarios[selectedScenario][selectedPolarisation]} alt="Wave propagation" style={{ width: '100%', height: 'auto' }} />
              </Box>
            </Modal>
          </Box>
        </Grid>
        <Grid xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Choose a Scenario</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Scenario</TableCell>
                  <TableCell>Choose</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Incident wave in vacuum</TableCell>
                  <TableCell>
                    <Radio
                      checked={selectedScenario === 'vacuum'}
                      onChange={handleScenarioChange}
                      value="vacuum"
                      name="scenario-radio-button"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Incident wave in material</TableCell>
                  <TableCell>
                    <Radio
                      checked={selectedScenario === 'material'}
                      onChange={handleScenarioChange}
                      value="material"
                      name="scenario-radio-button"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Choose a Polarisation</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Polarisation</TableCell>
                  <TableCell>Choose</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Perpendicular</TableCell>
                  <TableCell>
                    <Radio
                      checked={selectedPolarisation === 'perpendicular'}
                      onChange={handlePolarisationChange}
                      value="perpendicular"
                      name="polarisation-radio-button"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Parallel</TableCell>
                  <TableCell>
                    <Radio
                      checked={selectedPolarisation === 'parallel'}
                      onChange={handlePolarisationChange}
                      value="parallel"
                      name="polarisation-radio-button"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid xs={12}>
          <Typography variant="h6" gutterBottom>Result Plot</Typography>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
            <Line data={chartData} options={chartOptions} />
          </Box>
        </Grid>
      </Grid>
      <input id="reflection_answer" type="hidden" value={formatData ? formatData.join(' ') : ''} />
    </Container>
  );
}
