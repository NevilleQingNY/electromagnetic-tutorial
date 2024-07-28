import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Slider, Button, Paper, TableContainer,
  Table, TableHead, TableRow, TableCell, TableBody, Container, Modal
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend,
} from 'chart.js';
import axios from 'axios';

import utdImage from '../../assets/images/newUTD.png';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const generateInitialData = () => ({
  labels: [],
  datasets: [
    {
      label: 'incident',
      data: [],
      borderColor: 'rgba(255, 205, 86, 1)',
      backgroundColor: 'rgba(255, 205, 86, 0.5)',
      borderWidth: 3,
      pointRadius: 0,
    },
    {
      label: 'reflected',
      data: [],
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderWidth: 3,
      pointRadius: 0,
    },
    {
      label: 'GO',
      data: [],
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderWidth: 3,
      pointRadius: 0,
    },
    {
      label: 'total',
      data: [],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderWidth: 3,
      pointRadius: 0,
    },
    {
      label: 'Diff',
      data: [],
      borderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.5)',
      borderWidth: 3,
      pointRadius: 0,
    }
  ],
});

const chartOptionsInit = (minY, maxY) => ({
  scales: {
    x: {
      type: 'linear',
      position: 'bottom',
      title: {
        display: true,
        text: 'Angle',
      },
      min: -5,
      max: 5,
      ticks: {
        stepSize: 1
      }
    },
    y: {
      type: 'linear',
      title: {
        display: true,
        text: 'Field Value',
      },
      min: minY,
      max: maxY,
      ticks: {
        stepSize: 0.25
      }
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

export default function UTDModel() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [frequency, setFrequency] = useState(1);
  const [txHeight, setTxHeight] = useState(100);
  const [rxDistance, setRxDistance] = useState(300);
  const [epsilon, setEpsilon] = useState(2);
  const [loading, setLoading] = useState(false);
  const [formatData, setFormatData] = useState(null);
  const [startShowPlot, setStartShowPlot] = useState(false);
  const [chartOptions, setChartOptions] = useState(chartOptionsInit(-1, 1));
  const [chartData, setChartData] = useState(generateInitialData());
  const [ISB, setISB] = useState(null);
  const [RSB, setRSB] = useState(null);
  const [showData, setShowData] = useState(false);

  const validateNumber = (value, min, max) => {
    if (!value) return min;
    const numberValue = parseFloat(value);
    return isNaN(numberValue) ? min : Math.min(Math.max(numberValue, min), max);
  };

  const handleInputChange = (setter, min, max) => (event) => {
    setter(validateNumber(event.target.value, min, max));
  };

  const handleSliderChange = (setter) => (_, newValue) => {
    setter(newValue);
  };

  const handleCalculateDiffraction = async () => {
    const parameters = new URLSearchParams({
      TX_height: (txHeight / 100).toString(),
      frequency: frequency.toString(),
      RX_distance: (rxDistance / 100).toString(),
      epsilon: epsilon.toString()
    });
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/newUTDServlet`, parameters, {
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
      const number_of_points = parseInt(formatData[0], 10);
      const min_value = parseFloat(formatData[1]);
      const max_value = parseFloat(formatData[2]);
      const ISB = parseFloat(formatData[3]).toFixed(5);
      const RSB = parseFloat(formatData[4]).toFixed(5);

      const incident_field = [];
      const reflected_field = [];
      const GO_field = [];
      const D_field = [];
      const total_field = [];

      for (let i = 0; i < number_of_points; i++) {
        incident_field.push({ x: parseFloat(formatData[i + 5]), y: parseFloat(formatData[i + 5 + number_of_points]) });
        reflected_field.push({ x: parseFloat(formatData[i + 5]), y: parseFloat(formatData[i + 5 + 2 * number_of_points]) });
        GO_field.push({ x: parseFloat(formatData[i + 5]), y: parseFloat(formatData[i + 5 + 3 * number_of_points]) });
        D_field.push({ x: parseFloat(formatData[i + 5]), y: parseFloat(formatData[i + 5 + 4 * number_of_points]) });
        total_field.push({ x: parseFloat(formatData[i + 5]), y: parseFloat(formatData[i + 5 + 5 * number_of_points]) });
      }

      setChartOptions(chartOptionsInit(1.1 * min_value, 0.9 * max_value));
      setChartData({
        labels: Array.from({ length: number_of_points }, (_, i) => i),
        datasets: [
          { ...chartData.datasets[0], data: incident_field },
          { ...chartData.datasets[1], data: reflected_field },
          { ...chartData.datasets[2], data: GO_field },
          { ...chartData.datasets[3], data: total_field },
          { ...chartData.datasets[4], data: D_field }
        ]
      });
      setISB(ISB);
      setRSB(RSB);
      setStartShowPlot(false);
    }
  }, [startShowPlot, formatData]);

  const handleShowData = () => {
    setShowData(true);
  };

  const commonInputProps = { fullWidth: true, variant: 'outlined', margin: 'normal' };

  return (
    <Container maxWidth="xl" sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        <Grid xs={12} lg={6}>
          <Typography variant="h6" gutterBottom>Adjust Parameters</Typography>
          <Box sx={{ flex: 1, marginBottom: 2 }}>
            <TextField
              label="Transmitter height (cm)"
              value={txHeight}
              onChange={handleInputChange(setTxHeight, 1, 1000)}
              {...commonInputProps}
            />
            <Slider
              value={txHeight}
              onChange={handleSliderChange(setTxHeight)}
              min={1}
              max={1000}
              valueLabelDisplay="auto"
            />
            <TextField
              label="Frequency in GHz"
              value={frequency}
              onChange={handleInputChange(setFrequency, 1, 10)}
              {...commonInputProps}
            />
            <Slider
              value={frequency}
              onChange={handleSliderChange(setFrequency)}
              min={1}
              max={10}
              valueLabelDisplay="auto"
            />
            <TextField
              label="Receiver point displacement (cm)"
              value={rxDistance}
              onChange={handleInputChange(setRxDistance, 1, 1000)}
              {...commonInputProps}
            />
            <Slider
              value={rxDistance}
              onChange={handleSliderChange(setRxDistance)}
              min={1}
              max={1000}
              valueLabelDisplay="auto"
            />
            <TextField
              label="Relative permittivity of scatterer"
              value={epsilon}
              onChange={handleInputChange(setEpsilon, 2, 20)}
              {...commonInputProps}
            />
            <Slider
              value={epsilon}
              onChange={handleSliderChange(setEpsilon)}
              min={2}
              max={20}
              valueLabelDisplay="auto"
            />
          </Box>
          <Box sx={{ marginBottom: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleCalculateDiffraction}
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
              src={utdImage}
              alt="Geometric Optics and Uniform Theory of Diffraction"
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
                <img src={utdImage} alt="Geometric Optics and Uniform Theory of Diffraction" style={{ width: '100%', height: 'auto' }} />
              </Box>
            </Modal>
          </Box>
        </Grid>
        <Grid xs={12}>
          <Typography variant="h6" gutterBottom>Result Plot</Typography>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
            <Line data={chartData} options={chartOptions} />
          </Box>
        </Grid>
        <Grid xs={12}>
          <Button disabled={!formatData} variant="contained" fullWidth onClick={handleShowData} sx={{ marginBottom: 2 }}>
            Show Data
          </Button>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Parameter</TableCell>
                    <TableCell>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Incident Shadow Boundary</TableCell>
                    <TableCell>{showData ? ISB : '-'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Reflection Shadow Boundary</TableCell>
                    <TableCell>{showData ? RSB : '-'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
        </Grid>
      </Grid>
      <input id="UTD_answer" type="hidden" value={formatData ? formatData.join(' ') : ''} />
    </Container>
  );
}
