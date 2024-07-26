import { useCallback } from 'react';
import * as THREE from 'three';

export const useObjectAdder = (scene, dragControls) => {
    const addObject = useCallback((type, position) => {
        if (!scene || !dragControls) return;

        let object;
        if (type === 'building') {
            const geometry = new THREE.BoxGeometry(8, 8, 8);
            const material = new THREE.MeshPhongMaterial({
                color: 'gray',
                transparent: true,
                opacity: 0.3,
                depthWrite: false
            });
            object = new THREE.Mesh(geometry, material);
            object.position.copy(position);
            object.position.y = 2.5;
        } else if (type === 'transmitter' || type === 'receiver') {
            const geometry = new THREE.SphereGeometry(0.2);
            const material = new THREE.MeshBasicMaterial({ color: type === 'transmitter' ? 'red' : 'blue' });
            object = new THREE.Mesh(geometry, material);
            object.position.copy(position);
        } else if (type === 'debugSetup') {
            // 创建调试组件
            createDebugSetup(scene, dragControls);
            return; // 直接返回，不需要添加单个对象
        }

        if (object) {
            object.userData.type = type;
            scene.add(object);
            dragControls.getObjects().push(object);
        }
    }, [scene, dragControls]);

    const createDebugSetup = useCallback((scene, dragControls) => {
        // 创建四个建筑物
        const buildingPositions = [
          { position: new THREE.Vector3(0, 0, -7), rotation: 0, width: 20, height: 4, depth: 1 },
          { position: new THREE.Vector3(0, 0, 7), rotation: 0, width: 20, height: 4, depth: 1 },
          { position: new THREE.Vector3(-10, 0, 0), rotation: Math.PI / 2, width: 14, height: 4, depth: 1 },
          { position: new THREE.Vector3(10, 0, 0), rotation: Math.PI / 2, width: 14, height: 4, depth: 1 }
        ];
      
        buildingPositions.forEach(({ position, rotation, width, height, depth }) => {
          const geometry = new THREE.BoxGeometry(width, height, depth);
          const material = new THREE.MeshPhongMaterial({
            color: 'gray',
            transparent: true,
            opacity: 0.3,
            depthWrite: false
          });
          const building = new THREE.Mesh(geometry, material);
          building.position.copy(position);
          building.position.y = height / 2; // 建筑物中心在y轴上的位置
          building.rotation.y = rotation;
          building.userData.type = 'building';
          
          // 添加更多的建筑物信息
          building.userData.width = width;
          building.userData.height = height;
          building.userData.depth = depth;
      
          scene.add(building);
          dragControls.getObjects().push(building);
        });
      
        const transmitterGeometry = new THREE.SphereGeometry(0.2);
        const transmitterMaterial = new THREE.MeshBasicMaterial({ color: 'red' });
        const transmitter = new THREE.Mesh(transmitterGeometry, transmitterMaterial);
        transmitter.position.set(-3, 1.5, 0);
        transmitter.userData.type = 'transmitter';
        scene.add(transmitter);
        dragControls.getObjects().push(transmitter);
    
        // 添加接收器
        const receiverGeometry = new THREE.SphereGeometry(0.2);
        const receiverMaterial = new THREE.MeshBasicMaterial({ color: 'blue' });
        const receiver = new THREE.Mesh(receiverGeometry, receiverMaterial);
        receiver.position.set(3, 1.5, 0);
        receiver.userData.type = 'receiver';
        scene.add(receiver);
        dragControls.getObjects().push(receiver);
      }, []);

    return addObject;
};