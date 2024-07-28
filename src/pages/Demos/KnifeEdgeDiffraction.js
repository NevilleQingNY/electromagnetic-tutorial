import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Button, Paper,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Container
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
      label: 'Predicted',
      data: [],
      borderColor: 'rgba(255, 205, 86, 1)',
      backgroundColor: 'rgba(255, 205, 86, 0.5)',
      borderWidth: 3,
      pointRadius: 0,
    },
    {
      label: 'Measured',
      data: [],
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderWidth: 3,
      pointRadius: 0,
    }
  ],
});

export default function TerrainPropagation() {
  const [terrainChoice, setTerrainChoice] = useState('Hjorring');
  const [frequency, setFrequency] = useState('144');
  const [loading, setLoading] = useState(false);
  const [EP, setEP] = useState('');
  const [terrainInfo, setTerrainInfo] = useState('');
  const [measuredData, setMeasuredData] = useState('');
  const [chartData, setChartData] = useState(generateInitialData());
  const [chartOptions, setChartOptions] = useState(chartOptionsInit(0, 1.2, 100));
  const [showData, setShowData] = useState(false);

  const handleTerrainChange = (event) => {
    setTerrainChoice(event.target.value);
  };

  const handleFrequencyChange = (event) => {
    setFrequency(event.target.value);
  };

  const handleCalculateFields = async () => {
    const antennaHeight = 10.4;
    const receiverHeight = 2.4;
    const tutorial_type = 'Danish';

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/TerrainServlet`, {
        tutorial_type,
        myData: terrainChoice,
        frequency,
        antennaHeight,
        receiverHeight,
      });
      const data = response.data.message;
      setEP(data[0]);
      setTerrainInfo(data[1]);
      setMeasuredData(data[2]);
      plotTerrain(data[1]);
      plotFields(data[0], data[2]);
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const plotTerrain = (terrainData) => {
    const terrainValues = terrainData.split(' ').map((item, index) => {
      if (index % 2 === 0) {
        return { x: parseFloat(item).toFixed(4), y: parseFloat(terrainData.split(' ')[index + 1]).toFixed(4) };
      }
      return null;
    }).filter(item => item !== null);

    setChartOptions(chartOptionsInit(0, 1.2, 100)); // Update this to correct y-axis limits based on your data
    setChartData({
      labels: terrainValues.map(item => item.x),
      datasets: [
        {
          ...chartData.datasets[0],
          data: terrainValues.map(item => item.y),
          label: 'Terrain',
        },
      ],
    });
  };

  const plotFields = (EPData, measuredData) => {
    const EPValues = EPData.split(' ').map((item, index) => {
      if (index % 2 === 0) {
        return { x: parseFloat(item).toFixed(4), y: parseFloat(EPData.split(' ')[index + 1]).toFixed(4) };
      }
      return null;
    }).filter(item => item !== null);

    const measuredValues = measuredData.split(' ').map((item, index) => {
      if (index % 2 === 0) {
        return { x: parseFloat(item).toFixed(4), y: parseFloat(measuredData.split(' ')[index + 1]).toFixed(4) };
      }
      return null;
    }).filter(item => item !== null);

    setChartOptions(chartOptionsInit(0, 1.2, 100)); // Update this to correct y-axis limits based on your data
    setChartData({
      labels: EPValues.map(item => item.x),
      datasets: [
        {
          ...chartData.datasets[0],
          data: EPValues.map(item => item.y),
          label: 'Predicted',
        },
        {
          ...chartData.datasets[1],
          data: measuredValues.map(item => item.y),
          label: 'Measured',
        },
      ],
    });
  };

  const handleShowData = () => {
    setShowData(true);
  };

  return (
    <Container maxWidth="xl" sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        <Grid xs={12} lg={4}>
          <Typography variant="h6" gutterBottom>Choose Frequency and Profile</Typography>
          <FormControl component="fieldset">
            <FormLabel component="legend">Frequency (MHz)</FormLabel>
            <RadioGroup
              aria-label="frequency"
              name="frequency"
              value={frequency}
              onChange={handleFrequencyChange}
            >
              <FormControlLabel value="144" control={<Radio />} label="144" />
              <FormControlLabel value="435" control={<Radio />} label="435" />
              <FormControlLabel value="970" control={<Radio />} label="970" />
              <FormControlLabel value="1900" control={<Radio />} label="1900" />
            </RadioGroup>
          </FormControl>
          <FormControl component="fieldset">
            <FormLabel component="legend">Profile</FormLabel>
            <RadioGroup
              aria-label="terrain_choice"
              name="terrain_choice"
              value={terrainChoice}
              onChange={handleTerrainChange}
            >
              <FormControlLabel value="Hjorring" control={<Radio />} label="Hjorring" />
              <FormControlLabel value="Hadsund" control={<Radio />} label="Hadsund" />
              <FormControlLabel value="Mjels" control={<Radio />} label="Mjels" />
              <FormControlLabel value="Ravnstru" control={<Radio />} label="Ravnstru" />
              <FormControlLabel value="Jerslev" control={<Radio />} label="Jerslev" />
            </RadioGroup>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleCalculateFields}
            sx={{ marginBottom: 2 }}
          >
            {loading ? (
              <CircularProgress color="inherit" />
            ) : (
              <span>Calculate Fields</span>
            )}
          </Button>
          <p>Click <a href="/data/terrain_information.zip" download>here</a> to download terrain data</p>
        </Grid>
        <Grid xs={12} lg={8}>
          <Typography variant="h6" gutterBottom>Terrain Plot</Typography>
          <Box sx={{ height: '300px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
            <Line data={chartData} options={chartOptions} />
          </Box>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid xs={12}>
          <Button variant="contained" fullWidth onClick={handleShowData} sx={{ marginBottom: 2 }}>
            Show Data
          </Button>
          {showData && (
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
                    <TableCell>EP</TableCell>
                    <TableCell>{EP}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Terrain Info</TableCell>
                    <TableCell>{terrainInfo}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Measured Data</TableCell>
                    <TableCell>{measuredData}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>
      <input id="EP" type="hidden" value={EP} />
      <input id="Terrain_Info" type="hidden" value={terrainInfo} />
      <input id="Measured_Data" type="hidden" value={measuredData} />
    </Container>
  );
}
