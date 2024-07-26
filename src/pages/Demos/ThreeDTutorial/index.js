// App.js
import React, { useEffect, useRef, useState } from 'react';
import { Button, Grid, Paper, Typography } from '@mui/material';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { useCalculation } from './hooks/useCalculation';
import { useContextMenu } from './hooks/useContextMenu';
import { useObjectAdder } from './hooks/useObjectAdder';
import ContextMenu from './components/ContextMenu';

function App() {
  const mountRef = useRef(null);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [dragControls, setDragControls] = useState(null);
  const [orbitControls, setOrbitControls] = useState(null);

  useEffect(() => {
    // 场景设置
    const newScene = new THREE.Scene();

    // 相机设置
    const newCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    newCamera.position.set(5, 5, 5);
    newCamera.lookAt(0, 0, 0);

    // 渲染器设置
    const newRenderer = new THREE.WebGLRenderer();
    newRenderer.setSize(window.innerWidth * 0.75, window.innerHeight * 0.8);
    mountRef.current.appendChild(newRenderer.domElement);

    // 轨道控制器
    const newOrbitControls = new OrbitControls(newCamera, newRenderer.domElement);

    // 拖拽控制器
    const newDragControls = new DragControls([], newCamera, newRenderer.domElement);

    // 处理拖拽事件
    newDragControls.addEventListener('dragstart', () => {
      newOrbitControls.enabled = false;
    });

    newDragControls.addEventListener('dragend', () => {
      newOrbitControls.enabled = true;
    });

    // 添加网格辅助线
    const gridHelper = new THREE.GridHelper(10, 10);
    newScene.add(gridHelper);

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    newScene.add(ambientLight);

    // 添加平行光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    newScene.add(directionalLight);

    // 渲染循环
    const animate = () => {
      requestAnimationFrame(animate);
      newOrbitControls.update();
      newRenderer.render(newScene, newCamera);
    };
    animate();

    // 更新状态
    setScene(newScene);
    setCamera(newCamera);
    setRenderer(newRenderer);
    setDragControls(newDragControls);
    setOrbitControls(newOrbitControls);

    // 清理函数
    return () => {
      mountRef.current.removeChild(newRenderer.domElement);
    };
  }, []);

  const { contextMenu, closeContextMenu } = useContextMenu(scene, camera, renderer);
  const addObject = useObjectAdder(scene, dragControls);
  const calculate = useCalculation(scene);

  const handleMenuItemClick = (type) => {
    if (contextMenu) {
      addObject(type, contextMenu.position);
      closeContextMenu();
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={9}>
        <div ref={mountRef} style={{ width: '100%', height: '80vh' }} />
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper elevation={3} style={{ padding: '20px' }}>
          <Typography variant="h6">控制面板</Typography>
          <Button variant="contained" onClick={calculate}>计算</Button>
        </Paper>
      </Grid>
      <ContextMenu 
        contextMenu={contextMenu}
        onClose={closeContextMenu}
        onItemClick={handleMenuItemClick}
      />
    </Grid>
  );
}

export default App;