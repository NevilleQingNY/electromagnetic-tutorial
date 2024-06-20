import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

const ToolBar = ({ addLight, addReceiver, addBuilding }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [buildingDimensions, setBuildingDimensions] = useState({ width: 1, height: 1, depth: 1 });

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBuildingDimensions(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleAddBuilding = () => {
    const { width, height, depth } = buildingDimensions;
    addBuilding(width, height, depth);
    handleDialogClose();
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={addLight}>
            Add Light
          </Button>
          <Button color="inherit" onClick={addReceiver}>
            Add Receiver
          </Button>
          <Button color="inherit" onClick={handleDialogOpen}>
            Add Building
          </Button>
        </Toolbar>
      </AppBar>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Add Building</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Width"
            name="width"
            type="number"
            fullWidth
            value={buildingDimensions.width}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Height"
            name="height"
            type="number"
            fullWidth
            value={buildingDimensions.height}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Depth"
            name="depth"
            type="number"
            fullWidth
            value={buildingDimensions.depth}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddBuilding} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ToolBar;
