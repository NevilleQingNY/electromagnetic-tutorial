import React from 'react';
import { Menu, MenuItem } from '@mui/material';

const ContextMenu = ({ contextMenu, onClose, onItemClick }) => {
  return (
    <Menu
      open={contextMenu !== null}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
    >
      <MenuItem onClick={() => onItemClick('transmitter')}>添加发射器</MenuItem>
      <MenuItem onClick={() => onItemClick('receiver')}>添加接收器</MenuItem>
      <MenuItem onClick={() => onItemClick('building')}>添加建筑物</MenuItem>
    </Menu>
  );
};

export default ContextMenu;