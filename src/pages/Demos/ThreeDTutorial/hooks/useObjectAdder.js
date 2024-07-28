import { useCallback } from 'react';
import * as THREE from 'three';

export const useObjectAdder = (scene, dragControls, buildingDimensions) => {
    const addObject = useCallback((type, position) => {
        if (!scene || !dragControls) return;

        let object;
        if (type === 'building') {
            const { width, height, depth } = buildingDimensions;
            const geometry = new THREE.BoxGeometry(width, height, depth);
            const material = new THREE.MeshPhongMaterial({
                color: 0x888888,
                transparent: true,
                opacity: 0.9,
                depthWrite: false
            });
            object = new THREE.Mesh(geometry, material);
            object.position.copy(position);
            object.position.y = height / 2;
        } else if (type === 'transmitter' || type === 'receiver') {
            const geometry = new THREE.SphereGeometry(0.2);
            const material = new THREE.MeshBasicMaterial({ color: type === 'transmitter' ? 'red' : 'blue' });
            object = new THREE.Mesh(geometry, material);
            object.position.copy(position);
        }

        if (object) {
            object.userData.type = type;
            scene.add(object);
            dragControls.getObjects().push(object);
        }
    }, [scene, dragControls, buildingDimensions]);

    return addObject;
};
