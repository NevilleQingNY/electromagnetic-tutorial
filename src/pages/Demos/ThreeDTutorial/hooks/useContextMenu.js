// hooks/useContextMenu.js
import { useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';

export const useContextMenu = (scene, camera, renderer) => {
  const [contextMenu, setContextMenu] = useState(null);

  const handleContextMenu = useCallback((event) => {
    event.preventDefault();
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, intersectionPoint);

    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      position: intersectionPoint
    });
  }, [camera, renderer]);

  useEffect(() => {
    if (renderer && renderer.domElement) {
      renderer.domElement.addEventListener('contextmenu', handleContextMenu);
      return () => {
        renderer.domElement.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [renderer, handleContextMenu]);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return {
    contextMenu,
    closeContextMenu
  };
};