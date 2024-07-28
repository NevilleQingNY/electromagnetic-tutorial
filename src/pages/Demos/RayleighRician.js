import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Slider, Button, Paper, TableContainer,
  Table, TableHead, TableRow, TableCell, TableBody, Container, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend,
} from 'chart.js';
import axios from 'axios';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const chartOptionsInit = (minY, maxY, maxX) => ({
  scales: {
    x: {
      type: 'linear',
      position: 'bottom',
      title: {
        display: true,
        text: 'X',
      },
      min: 0,
      max: maxX,
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

const generateInitialData = () => ({
  labels: [],
  datasets: [
    {
      label: 'rayleigh',
      data: [],
      borderColor: 'rgba(255, 205, 86, 1)',
      backgroundColor: 'rgba(255, 205, 86, 0.5)',
      borderWidth: 3,
      pointRadius: 0,
    },
    {
      label: 'sampled rayleigh',
      data: [],
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderWidth: 3,
      pointRadius: 0,
    },
    {
      label: 'rician',
      data: [],
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderWidth: 3,
      pointRadius: 0,
    },
    {
      label: 'sampled rician',
      data: [],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderWidth: 3,
      pointRadius: 0,
    }
  ],
});

export default function RayleighDistribution() {
  const [scatterers, setScatterers] = useState(5);
  const [samples, setSamples] = useState(1000);
  const [losPower, setLosPower] = useState(-100);
  const [nlosPower, setNlosPower] = useState(-20);
  const [loading, setLoading] = useState(false);
  const [formatData, setFormatData] = useState(null);
  const [chartData, setChartData] = useState(generateInitialData());
  const [chartOptions, setChartOptions] = useState(chartOptionsInit(0, 1.2, 100));
  const [plotType, setPlotType] = useState('pdf');
  const [K, setK] = useState(null);
  const [sigma, setSigma] = useState(null);
  const [s, setS] = useState(null);
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

  const handleCalculateRayleighDistribution = async () => {
    const parameters = new URLSearchParams({
      no_of_scatterers: scatterers.toString(),
      no_of_samples: samples.toString(),
      LOS_power_in_dBm: losPower.toString(),
      NLOS_power_in_dBm: nlosPower.toString()
    });
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/rayleighServlet`, parameters, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const data = Array.isArray(response?.data?.message) ? response.data.message[0].split(' ') : [];
      setFormatData(data.map(item => parseFloat(item)));
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const updateChart = (data, type) => {
    const number_of_bins = parseInt(data[0], 10);
    const the_max_input = parseFloat(data[1]);
    const the_max_output = parseFloat(data[2]);
    const K_factor = parseFloat(data[3]).toFixed(5);
    const sigma = parseFloat(data[4]).toFixed(5);
    const s = parseFloat(data[5]).toFixed(5);

    const rayleigh_values = [];
    const empirical_rayleigh_values = [];
    const rician_values = [];
    const empirical_rician_values = [];
    const rayleigh_cdf = [];
    const rician_cdf = [];
    const empirical_rayleigh_cdf = [];
    const empirical_rician_cdf = [];

    for (let i = 0; i < number_of_bins; i++) {
      rayleigh_values.push({ x: parseFloat(data[i + 6]), y: parseFloat(data[i + 6 + number_of_bins]) });
      empirical_rayleigh_values.push({ x: parseFloat(data[i + 6]), y: parseFloat(data[i + 6 + 2 * number_of_bins]) });
      rician_values.push({ x: parseFloat(data[i + 6]), y: parseFloat(data[i + 6 + 3 * number_of_bins]) });
      empirical_rician_values.push({ x: parseFloat(data[i + 6]), y: parseFloat(data[i + 6 + 4 * number_of_bins]) });

      empirical_rayleigh_cdf.push({ x: parseFloat(data[i + 6]), y: parseFloat(data[i + 6 + 5 * number_of_bins]) });
      rayleigh_cdf.push({ x: parseFloat(data[i + 6]), y: parseFloat(data[i + 6 + 6 * number_of_bins]) });
      empirical_rician_cdf.push({ x: parseFloat(data[i + 6]), y: parseFloat(data[i + 6 + 7 * number_of_bins]) });
      rician_cdf.push({ x: parseFloat(data[i + 6]), y: parseFloat(data[i + 6 + 8 * number_of_bins]) });
    }

    setK(K_factor);
    setSigma(sigma);
    setS(s);

    if (type === 'pdf') {
      setChartOptions(chartOptionsInit(0, the_max_output, the_max_input));
      setChartData({
        labels: Array.from({ length: number_of_bins }, (_, i) => i),
        datasets: [
          { ...chartData.datasets[0], data: rayleigh_values },
          { ...chartData.datasets[1], data: empirical_rayleigh_values },
          { ...chartData.datasets[2], data: rician_values },
          { ...chartData.datasets[3], data: empirical_rician_values }
        ]
      });
    } else {
      setChartOptions(chartOptionsInit(0, 1, the_max_input));
      setChartData({
        labels: Array.from({ length: number_of_bins }, (_, i) => i),
        datasets: [
          { ...chartData.datasets[0], data: rayleigh_cdf },
          { ...chartData.datasets[1], data: empirical_rayleigh_cdf },
          { ...chartData.datasets[2], data: rician_cdf },
          { ...chartData.datasets[3], data: empirical_rician_cdf }
        ]
      });
    }
  };

  useEffect(() => {
    if (formatData) {
      updateChart(formatData, plotType);
    }
  }, [formatData]);

  useEffect(() => {
    if (formatData) {
      updateChart(formatData, plotType);
    }
  }, [plotType]);

  const handleShowData = () => {
    setShowData(true);
  };

  const commonInputProps = { fullWidth: true, variant: 'outlined', margin: 'normal' };

  return (
    <Container maxWidth="xl" sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        <Grid xs={12} lg={4}>
          <Typography variant="h6" gutterBottom>Adjust Parameters</Typography>
          <Box sx={{ flex: 1, marginBottom: 2 }}>
            <TextField
              label="Number of scatterers"
              value={scatterers}
              onChange={handleInputChange(setScatterers, 2, 999)}
              {...commonInputProps}
            />
            <Slider
              value={scatterers}
              onChange={handleSliderChange(setScatterers)}
              min={2}
              max={999}
              valueLabelDisplay="auto"
            />
            <TextField
              label="Number of samples"
              value={samples}
              onChange={handleInputChange(setSamples, 100, 50000)}
              {...commonInputProps}
            />
            <Slider
              value={samples}
              onChange={handleSliderChange(setSamples)}
              min={100}
              max={50000}
              valueLabelDisplay="auto"
            />
            <TextField
              label="NLOS power in dBm"
              value={nlosPower}
              onChange={handleInputChange(setNlosPower, -20, 30)}
              {...commonInputProps}
            />
            <Slider
              value={nlosPower}
              onChange={handleSliderChange(setNlosPower)}
              min={-20}
              max={30}
              valueLabelDisplay="auto"
            />
            <TextField
              label="LOS power in dBm"
              value={losPower}
              onChange={handleInputChange(setLosPower, -100, 30)}
              {...commonInputProps}
            />
            <Slider
              value={losPower}
              onChange={handleSliderChange(setLosPower)}
              min={-100}
              max={30}
              valueLabelDisplay="auto"
            />
          </Box>
          <Box sx={{ marginBottom: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleCalculateRayleighDistribution}
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
        <Grid xs={12} lg={8}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Toggle between outputs</FormLabel>
            <RadioGroup
              row
              aria-label="plotType"
              name="row-radio-buttons-group"
              value={plotType}
              onChange={(e) => setPlotType(e.target.value)}
            >
              <FormControlLabel value="pdf" control={<Radio />} label="Probability density function" />
              <FormControlLabel value="cdf" control={<Radio />} label="Cumulative distribution function" />
            </RadioGroup>
          </FormControl>
          <Typography variant="h6" gutterBottom>Result Plot</Typography>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
            <Line data={chartData} options={chartOptions} />
          </Box>
        </Grid>

        <Grid xs={12}>
          <Button variant="contained" fullWidth onClick={handleShowData} sx={{ marginBottom: 2 }}>
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
                  <TableCell>K factor</TableCell>
                  <TableCell>{showData ? K : '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>sigma</TableCell>
                  <TableCell>{showData ? sigma : '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>s</TableCell>
                  <TableCell>{showData ? s : '-'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
      <input id="rayleigh_answer" type="hidden" value={formatData ? formatData.join(' ') : ''} />
    </Container>
  );
}
