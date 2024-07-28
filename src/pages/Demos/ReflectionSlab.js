import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Slider, Button, Paper, TableContainer,
  Table, TableHead, TableRow, TableCell, TableBody, Container, Radio
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import CircularProgress from '@mui/material/CircularProgress';

import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement, PointElement, LinearScale, CategoryScale,
  Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const generateInitialData = () => ({
  labels: [],
  datasets: [
    {
      label: 'Region1',
      data: [],
      fill: false,
      backgroundColor: 'rgb(75, 192, 192)',
      borderColor: 'rgba(75, 192, 192, 1)',
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 0,
      order: 3
    },
    {
      label: 'Slab',
      data: [],
      fill: false,
      backgroundColor: 'rgb(255, 99, 132)',
      borderColor: 'rgba(255, 99, 132, 1)',
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 0,
      order: 2
    },
    {
      label: 'Region3',
      data: [],
      fill: false,
      backgroundColor: 'rgb(54, 162, 235)',
      borderColor: 'rgba(54, 162, 235, 1)',
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 0,
      order: 1
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
        text: 'z',
      },
      min: -3,
      max: 3
    },
    y: {
      type: 'linear',
      title: {
        display: true,
        text: 'E',
      },
    },
  },
  animation: false,
});

export default function PlaneWaveSlab() {


  const [conductivity, setConductivity] = useState(0);
  const [epsilon, setEpsilon] = useState(1);
  const [frequency, setFrequency] = useState(100);
  const [width, setWidth] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [loading, setLoading] = useState(false);
  const [formatData, setFormatData] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [startShowPlot, setStartShowPlot] = useState(false);
  const [countDownValue, setCountDownValue] = useState(0);
  const [plotProcess, setPlotProcess] = useState(-1);
  const [chartOptions, setChartOptions] = useState(chartOptionsInit());
  const [chartData, setChartData] = useState(generateInitialData());

  const materialSettings = {
    'vacuum': { name: 'Vacuum', epsilon: 1, conductivity: 0 },
    'silicon': { name: 'Silicon', epsilon: 12, conductivity: 0.0 },
    'soil-wet': { name: 'Soil (wet)', epsilon: 3, conductivity: 0.0010 },
    'soil-dry': { name: 'Soil (dry)', epsilon: 3, conductivity: 0.0001 },
    'concrete': { name: 'Concrete', epsilon: 10, conductivity: 0.0035 },
  };

  const handleMaterialChange = (event) => {
    const material = event.target.value;
    setSelectedMaterial(material);

    if (materialSettings[material]) {
      setEpsilon(materialSettings[material].epsilon);
      setConductivity(materialSettings[material].conductivity * 10000);
    }
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

  const handleCalculatePropagation = async () => {
    setFrequency(Math.max(100, frequency)); // Ensure frequency is at least 100
    const parameters = new URLSearchParams({
      conductivity: (conductivity / 10000).toString(), // Ensure all values are strings
      epsilon: epsilon.toString(),
      frequency: frequency.toString(),
      polarisation: '',
      scenario: '',
      width: (width / 1000).toString(),
      tutorial_value: '3'
    });
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/reflectionServlet`, parameters, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const data = Array.isArray(response?.data?.message) ? response.data.message[0].split(' ') : [];
      setFormatData(data.map(item => parseFloat(item).toFixed(5)));
      setStartShowPlot(true);
      setPlotProcess(0);
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startShowPlot && formatData) {
      setPlotProcess(0);
      setChartOptions((prev) => {
        const newOption = { ...prev };
        newOption.scales.y.min = parseFloat(formatData[0]);
        newOption.scales.y.max = parseFloat(formatData[1]);
        return newOption;
      });
    }
  }, [startShowPlot, formatData]);

  const showData = () => {
    if (formatData) {
      setTableData({
        wavelength: formatData[4],
        impedance_real: formatData[5],
        impedance_imag: formatData[6],
        reflection_coefficient_real: formatData[7],
        reflection_coefficient_imag: formatData[8],
        transmission_coefficient_real: formatData[9],
        transmission_coefficient_imag: formatData[10],
      });
    }
  };

  useEffect(() => {
    if (formatData && plotProcess < formatData[3] * 5) {
      const timerId = setTimeout(() => {
        setPlotProcess((prev) => prev + 1);
        setCountDownValue(Math.floor((5 * formatData[3] - plotProcess) * 250 / 1000));
        const the_time_count = plotProcess % formatData[3] + 1;
        const region1Field = [];
        const region2Field = [];
        const region3Field = [];
        for (let i = 0; i < formatData[2]; i++) {
          const x = parseFloat(formatData[i + 11]);
          const y_region1 = parseFloat(formatData[i + 11 + (the_time_count * formatData[2])]);
          if (x < 0.0) {
            region1Field.push({ x, y: y_region1 });
          } else if (x >= 0.0 && x < width / 1000.0) {
            const y_region2 = parseFloat(formatData[i + 11 + (the_time_count * formatData[2]) + formatData[3] * formatData[2]]);
            region2Field.push({ x, y: y_region2 });
          } else {
            const y_region3 = parseFloat(formatData[i + 11 + (the_time_count * formatData[2]) + 2 * formatData[3] * formatData[2]]);
            region3Field.push({ x, y: y_region3 });
          }
        }

        setChartData((prevData) => ({
          ...prevData,
          labels: region1Field.map((point) => point.x),
          datasets: prevData.datasets.map((dataset, index) => {
            if (index === 0) return { ...dataset, data: region1Field };
            if (index === 1) return { ...dataset, data: region2Field };
            if (index === 2) return { ...dataset, data: region3Field };
            return dataset;
          }),
        }));
      }, 250);

      return () => clearTimeout(timerId);
    } else {
      setStartShowPlot(false);
    }
  }, [plotProcess, formatData]);

  const commonInputProps = { fullWidth: true, variant: 'outlined', margin: 'normal' };

  return (
    <Container maxWidth="xl" sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        <Grid xs={12} md={6} lg={6}>
          <Typography variant="h6" gutterBottom>Adjust Parameters & Materials</Typography>
          <Box sx={{ flex: 1, marginBottom: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Adjust Parameters</Typography>
            <TextField
              label="Conductivity Value (×10⁻⁴)"
              value={conductivity}
              onChange={handleInputChange(setConductivity, 0, 999)}
              {...commonInputProps}
            />
            <Slider
              value={conductivity}
              onChange={handleSliderChange(setConductivity)}
              min={0}
              max={999}
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
            <TextField
              label="Width in mm"
              value={width}
              onChange={handleInputChange(setWidth, 0, 1000)}
              {...commonInputProps}
            />
            <Slider
              value={width}
              onChange={handleSliderChange(setWidth)}
              min={0}
              max={1000}
              valueLabelDisplay="auto"
            />
          </Box>
          <Box sx={{ marginBottom: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleCalculatePropagation}
              sx={{ marginBottom: 2 }}
            >
              {loading ? (
                <CircularProgress color="inherit" />
              ) : (
                <span>Show Waves</span>
              )}
            </Button>
          </Box>
        </Grid>
        <Grid xs={12} md={6} lg={6}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>Some Common Materials</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Material</TableCell>
                    <TableCell>Relative Permittivity</TableCell>
                    <TableCell>Conductivity</TableCell>
                    <TableCell>Choose</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(materialSettings).map(([key, { name, epsilon, conductivity }]) => (
                    <TableRow key={key}>
                      <TableCell>{name}</TableCell>
                      <TableCell>{epsilon}</TableCell>
                      <TableCell>{conductivity.toExponential(1)}</TableCell>
                      <TableCell>
                        <Radio
                          checked={selectedMaterial === key}
                          onChange={handleMaterialChange}
                          value={key}
                          name="material-radio-button"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>
        <Grid xs={12} lg={6}>
          <Typography variant="h6" gutterBottom>Result Plot</Typography>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
            <Line data={chartData} options={chartOptions} />
            <p>Animation time remaining: {countDownValue} seconds</p>
            {(formatData && !startShowPlot) && (
              <Box sx={{ display: 'flex', gap: '10px' }}>
                <Button variant="contained" onClick={() => { setPlotProcess(-1); setStartShowPlot(true); }}>Play Again</Button>
                <Button variant="outlined" onClick={showData}>Show Data</Button>
              </Box>
            )}
          </Box>
        </Grid>
        <Grid xs={12} lg={6}>
          <Typography variant="h6" gutterBottom>Wave Properties</Typography>
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
                  <TableCell>Wavelength</TableCell>
                  <TableCell><div id="wavelength">{tableData?.wavelength || '---'}</div></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Impedance</TableCell>
                  <TableCell><div id="impedance">{tableData ? `${tableData.impedance_real} + j${tableData.impedance_imag}` : '---'}</div></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Reflection Coefficient</TableCell>
                  <TableCell><div id="reflection_coefficient">{tableData ? `${tableData.reflection_coefficient_real} + j${tableData.reflection_coefficient_imag}` : '---'}</div></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Transmission Coefficient</TableCell>
                  <TableCell><div id="transmission_coefficient">{tableData ? `${tableData.transmission_coefficient_real} + j${tableData.transmission_coefficient_imag}` : '---'}</div></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
      <input id="reflection_answer" type="hidden" value={formatData ? formatData.join(' ') : ''} />
    </Container>
  );
}
