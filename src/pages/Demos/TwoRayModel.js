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
  LineElement, PointElement, LinearScale, CategoryScale, LogarithmicScale, Title, Tooltip, Legend,
} from 'chart.js';
import axios from 'axios';

import twoRayImage from '../../assets/images/Two_ray.png';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, LogarithmicScale, Title, Tooltip, Legend);

const generateInitialData = () => ({
  labels: [],
  datasets: [
    {
      label: 'free space',
      data: [],
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 3,
      pointRadius: 0,
    },
    {
      label: 'two ray path loss',
      data: [],
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 3,
      pointRadius: 0,
    },
    {
      label: 'r to the power of 4 loss',
      data: [],
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 3,
      pointRadius: 0,
    }
  ],
});

const chartOptionsInit = (minX, maxX) => ({
  scales: {
    x: {
      type: 'linear',
      position: 'bottom',
      title: {
        display: true,
        text: 'Distance',
      },
      min: minX,
      max: maxX,
    },
    y: {
      type: 'linear',
      title: {
        display: true,
        text: 'Path Loss',
      },
      position: 'left',
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

export default function TwoRayModel() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [frequency, setFrequency] = useState(100);
  const [txHeight, setTxHeight] = useState(10);
  const [rxHeight, setRxHeight] = useState(2);
  const [loading, setLoading] = useState(false);
  const [formatData, setFormatData] = useState(null);
  const [startShowPlot, setStartShowPlot] = useState(false);
  const [chartOptions, setChartOptions] = useState(chartOptionsInit(0, 10000));
  const [chartData, setChartData] = useState(generateInitialData());
  const [breakPoint, setBreakPoint] = useState(null);
  const [breakPointLog, setBreakPointLog] = useState(null);
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

  const handleCalculatePathLoss = async () => {
    const parameters = new URLSearchParams({
      frequency: frequency.toString(),
      TX_height: txHeight.toString(),
      RX_height: rxHeight.toString()
    });
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/TwoRayServlet`, parameters, {
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
      const distances = [];
      const free_space_path_loss = [];
      const two_ray_path_loss = [];
      const r_4_path_loss = [];

      for (let i = 0; i < number_of_points; i++) {
        distances.push(parseFloat(formatData[i + 3]));
        free_space_path_loss.push({ x: parseFloat(formatData[i + 3]), y: parseFloat(formatData[i + 3 + number_of_points]) });
        two_ray_path_loss.push({ x: parseFloat(formatData[i + 3]), y: parseFloat(formatData[i + 3 + 2 * number_of_points]) });
        r_4_path_loss.push({ x: parseFloat(formatData[i + 3]), y: parseFloat(formatData[i + 3 + 3 * number_of_points]) });
      }

      const maxX = Math.max(...distances);
      const minX = Math.min(...distances);

      setChartOptions(chartOptionsInit(minX, maxX));
      setChartData({
        labels: distances,
        datasets: [
          { ...chartData.datasets[0], data: free_space_path_loss },
          { ...chartData.datasets[1], data: two_ray_path_loss },
          { ...chartData.datasets[2], data: r_4_path_loss }
        ]
      });
      setBreakPoint(parseFloat(formatData[1]).toFixed(5));
      setBreakPointLog(parseFloat(formatData[2]).toFixed(5));
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
              label="Frequency in MHz"
              value={frequency}
              onChange={handleInputChange(setFrequency, 100, 300)}
              {...commonInputProps}
            />
            <Slider
              value={frequency}
              onChange={handleSliderChange(setFrequency)}
              min={100}
              max={300}
              valueLabelDisplay="auto"
            />
            <TextField
              label="Transmitter Height"
              value={txHeight}
              onChange={handleInputChange(setTxHeight, 1, 100)}
              {...commonInputProps}
            />
            <Slider
              value={txHeight}
              onChange={handleSliderChange(setTxHeight)}
              min={1}
              max={100}
              valueLabelDisplay="auto"
            />
            <TextField
              label="Receiver Height"
              value={rxHeight}
              onChange={handleInputChange(setRxHeight, 1, 10)}
              {...commonInputProps}
            />
            <Slider
              value={rxHeight}
              onChange={handleSliderChange(setRxHeight)}
              min={1}
              max={10}
              valueLabelDisplay="auto"
            />
          </Box>
          <Box sx={{ marginBottom: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleCalculatePathLoss}
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
              src={twoRayImage}
              alt="Two Ray Model"
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
                <img src={twoRayImage} alt="Two Ray Model" style={{ width: '100%', height: 'auto' }} />
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
                    <TableCell>Break Point</TableCell>
                    <TableCell>{showData ? breakPoint : '-'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>log10(Break Point)</TableCell>
                    <TableCell>{showData ? breakPointLog : '-'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
        </Grid>
      </Grid>
      <input id="two_ray_answer" type="hidden" value={formatData ? formatData.join(' ') : ''} />
    </Container>
  );
}
