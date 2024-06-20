import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import ToolBar from './ToolBar';

const ThreeScene = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const [sceneObjects, setSceneObjects] = useState({ light: null, receiver: null, line: null });
  const sceneObjectsRef = useRef(sceneObjects);
  const orbitControlsRef = useRef(null);
  const dragControlsRef = useRef(null);
  const objectsRef = useRef([]);

  const updateLine = useCallback((light, receiver) => {
    if (light && receiver) {
      drawLine(light.position, receiver.position);
    }
  }, []);

  useEffect(() => {
    sceneObjectsRef.current = sceneObjects;
  }, [sceneObjects]);

  useEffect(() => {
    const scene = sceneRef.current;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControlsRef.current = orbitControls;

    const dragControls = new DragControls(objectsRef.current, camera, renderer.domElement);
    dragControlsRef.current = dragControls;

    dragControls.addEventListener('dragstart', () => {
      orbitControls.enabled = false;
    });

    dragControls.addEventListener('dragend', () => {
      orbitControls.enabled = true;
    });

    dragControls.addEventListener('drag', () => {
      updateLine(sceneObjectsRef.current.light, sceneObjectsRef.current.receiver);
    });

    const animate = () => {
      requestAnimationFrame(animate);
      orbitControls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Use a local variable to store the current mountRef value
    const currentMountRef = mountRef.current;

    return () => {
      if (renderer) {
        renderer.dispose();
      }
      if (currentMountRef) {
        currentMountRef.removeChild(renderer.domElement);
      }
    };
  }, [updateLine]); // Ensure updateLine is included in dependencies

  const addLight = () => {
    if (sceneObjects.light) return;

    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const light = new THREE.Mesh(geometry, material);
    light.position.set(0, 2, 2);
    sceneRef.current.add(light);

    setSceneObjects(prevState => {
      const newState = { ...prevState, light };
      sceneObjectsRef.current = newState; // Update useRef
      return newState;
    });

    objectsRef.current.push(light);
    dragControlsRef.current.setObjects(objectsRef.current);
    updateLine(sceneObjectsRef.current.light, sceneObjectsRef.current.receiver);
  };

  const addReceiver = () => {
    if (sceneObjects.receiver) return;

    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const receiver = new THREE.Mesh(geometry, material);
    receiver.position.set(2, 0, 2);
    sceneRef.current.add(receiver);

    setSceneObjects(prevState => {
      const newState = { ...prevState, receiver };
      sceneObjectsRef.current = newState; // Update useRef
      return newState;
    });

    objectsRef.current.push(receiver);
    dragControlsRef.current.setObjects(objectsRef.current);
    updateLine(sceneObjectsRef.current.light, sceneObjectsRef.current.receiver);
  };

  const addBuilding = (width, height, depth) => {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({ color: 0x808080 }); // 灰色
    const building = new THREE.Mesh(geometry, material);
    
    building.position.set(0, 0, 0); // 可以根据需要设置初始位置
    sceneRef.current.add(building);
  
    objectsRef.current.push(building);
    dragControlsRef.current.setObjects(objectsRef.current);
  };

  const drawLine = (lightPosition, receiverPosition) => {
    const scene = sceneRef.current;

    if (sceneObjectsRef.current.line) {
      scene.remove(sceneObjectsRef.current.line);
      sceneObjectsRef.current.line.geometry.dispose();
      sceneObjectsRef.current.line.material.dispose();
      sceneObjectsRef.current.line = null;
    }

    if (!lightPosition || !receiverPosition) return;

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      lightPosition.x, lightPosition.y, lightPosition.z,
      receiverPosition.x, receiverPosition.y, receiverPosition.z,
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    const material = new THREE.LineBasicMaterial({ color: 0xffff00 });

    const line = new THREE.Line(geometry, material);
    scene.add(line);

    sceneObjectsRef.current.line = line;

    setSceneObjects(prevState => ({ ...prevState, line }));
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ToolBar addLight={addLight} addReceiver={addReceiver} addBuilding={(width, height, depth) => addBuilding(width, height, depth)} />
      <div ref={mountRef} style={{ width: '100%', height: 'calc(100% - 64px)' }} />
    </div>
  );
};

export default ThreeScene;
