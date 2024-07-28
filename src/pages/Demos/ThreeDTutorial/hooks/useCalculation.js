import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';

export function calculate(scene, order) {

  console.log(order);
  clearAllLines(scene)

  function clearAllLines(scene) {
    const linesToRemove = [];

    scene.traverse((object) => {
      if (object instanceof THREE.Line && object.userData.isPathLine) {
        linesToRemove.push(object);
      }
    });

    linesToRemove.forEach((line) => {
      scene.remove(line);
      if (line.geometry) {
        line.geometry.dispose();
      }
      if (line.material) {
        line.material.dispose();
      }
    });
  }

  function getAllElement(scene) {
    let transmitters = [];
    let receivers = [];
    let faces = [];

    scene.traverse((object) => {
      if (object.userData.type === 'transmitter') {
        object.userData.id = uuidv4();
        transmitters.push(object);
      } else if (object.userData.type === 'receiver') {
        object.userData.id = uuidv4();
        receivers.push(object);
      } else if (object instanceof THREE.Mesh && object.userData.type === 'building') {
        const building = object;
        const geometry = building.geometry;
        const position = building.position;
        const width = geometry.parameters.width;
        const height = geometry.parameters.height;
        const depth = geometry.parameters.depth;

        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const halfDepth = depth / 2;

        const buildingFaces = [
          {
            id: uuidv4(),
            normal: new THREE.Vector3(0, 0, 1),
            vertices: [
              new THREE.Vector3(position.x - halfWidth, position.y - halfHeight, position.z + halfDepth),
              new THREE.Vector3(position.x + halfWidth, position.y - halfHeight, position.z + halfDepth),
              new THREE.Vector3(position.x + halfWidth, position.y + halfHeight, position.z + halfDepth),
              new THREE.Vector3(position.x - halfWidth, position.y + halfHeight, position.z + halfDepth)
            ],
            dimensions: { width, height },
            building: building
          },
          {
            id: uuidv4(),
            normal: new THREE.Vector3(0, 0, -1),
            vertices: [
              new THREE.Vector3(position.x + halfWidth, position.y - halfHeight, position.z - halfDepth),
              new THREE.Vector3(position.x - halfWidth, position.y - halfHeight, position.z - halfDepth),
              new THREE.Vector3(position.x - halfWidth, position.y + halfHeight, position.z - halfDepth),
              new THREE.Vector3(position.x + halfWidth, position.y + halfHeight, position.z - halfDepth)
            ],
            dimensions: { width, height },
            building: building
          },
          {
            id: uuidv4(),
            normal: new THREE.Vector3(-1, 0, 0),
            vertices: [
              new THREE.Vector3(position.x - halfWidth, position.y - halfHeight, position.z - halfDepth),
              new THREE.Vector3(position.x - halfWidth, position.y - halfHeight, position.z + halfDepth),
              new THREE.Vector3(position.x - halfWidth, position.y + halfHeight, position.z + halfDepth),
              new THREE.Vector3(position.x - halfWidth, position.y + halfHeight, position.z - halfDepth)
            ],
            dimensions: { width: depth, height },
            building: building
          },
          {
            id: uuidv4(),
            normal: new THREE.Vector3(1, 0, 0),
            vertices: [
              new THREE.Vector3(position.x + halfWidth, position.y - halfHeight, position.z + halfDepth),
              new THREE.Vector3(position.x + halfWidth, position.y - halfHeight, position.z - halfDepth),
              new THREE.Vector3(position.x + halfWidth, position.y + halfHeight, position.z - halfDepth),
              new THREE.Vector3(position.x + halfWidth, position.y + halfHeight, position.z + halfDepth)
            ],
            dimensions: { width: depth, height },
            building: building
          },
          {
            id: uuidv4(),
            normal: new THREE.Vector3(0, 1, 0),
            vertices: [
              new THREE.Vector3(position.x - halfWidth, position.y + halfHeight, position.z + halfDepth),
              new THREE.Vector3(position.x + halfWidth, position.y + halfHeight, position.z + halfDepth),
              new THREE.Vector3(position.x + halfWidth, position.y + halfHeight, position.z - halfDepth),
              new THREE.Vector3(position.x - halfWidth, position.y + halfHeight, position.z - halfDepth)
            ],
            dimensions: { width, height: depth },
            building: building
          },
          {
            id: uuidv4(),
            normal: new THREE.Vector3(0, -1, 0),
            vertices: [
              new THREE.Vector3(position.x - halfWidth, position.y - halfHeight, position.z - halfDepth),
              new THREE.Vector3(position.x + halfWidth, position.y - halfHeight, position.z - halfDepth),
              new THREE.Vector3(position.x + halfWidth, position.y - halfHeight, position.z + halfDepth),
              new THREE.Vector3(position.x - halfWidth, position.y - halfHeight, position.z + halfDepth)
            ],
            dimensions: { width, height: depth },
            building: building
          }
        ];

        buildingFaces.forEach(face => {
          // Calculate center point
          face.center = new THREE.Vector3().addVectors(face.vertices[0], face.vertices[2]).multiplyScalar(0.5);

          // Calculate plane equation
          face.equation = {
            a: face.normal.x,
            b: face.normal.y,
            c: face.normal.z,
            d: -face.normal.dot(face.center)
          };

          // Set local coordinate system
          face.localCoordinateSystem = {
            xAxis: new THREE.Vector3().subVectors(face.vertices[1], face.vertices[0]).normalize(),
            yAxis: new THREE.Vector3().subVectors(face.vertices[3], face.vertices[0]).normalize(),
            zAxis: face.normal.clone()
          };

          // Create transformation matrix
          face.transformMatrix = new THREE.Matrix4().makeBasis(
            face.localCoordinateSystem.xAxis,
            face.localCoordinateSystem.yAxis,
            face.localCoordinateSystem.zAxis
          );
          face.transformMatrix.setPosition(face.center);

          // Create inverse transformation matrix
          face.inverseTransformMatrix = face.transformMatrix.clone().invert();
        });

        faces.push(...buildingFaces);
      }
    });

    return { transmitters, receivers, faces };
  }

  function getMirrorPoint(pointPosition, face) {
    // Ensure we're using Vector3 objects
    const position = pointPosition instanceof THREE.Vector3 ? pointPosition : new THREE.Vector3(pointPosition.x, pointPosition.y, pointPosition.z);

    // Get normal and center point from face object
    const planeNormal = face.normal;
    const planeCenter = face.center;

    // Create a vector from plane center to point
    const toPoint = new THREE.Vector3().subVectors(position, planeCenter);

    // Calculate projection of this vector on the normal direction
    const distance = toPoint.dot(planeNormal);

    // Calculate mirror point
    const mirrorPoint = new THREE.Vector3()
      .copy(position)
      .sub(planeNormal.clone().multiplyScalar(2 * distance));

    return {
      mirrorPoint,
      face
    };
  }

  function checkIntersectionWithFace(position1, position2, face) {
    // Create ray
    const direction = new THREE.Vector3().subVectors(position2, position1);
    const distance = direction.length();
    const ray = new THREE.Ray(position1, direction.normalize());

    // Create plane
    const plane = new THREE.Plane();
    plane.setFromNormalAndCoplanarPoint(face.normal.clone().normalize(), face.center);

    // Calculate intersection
    const intersection = new THREE.Vector3();
    const intersectionDistance = ray.distanceToPlane(plane);

    if (intersectionDistance === null || intersectionDistance < 0 || intersectionDistance > distance) {
      return null; // No intersection or intersection outside segment
    }

    ray.at(intersectionDistance, intersection);

    // Convert intersection point to face's local coordinate system
    const localPoint = intersection.clone().sub(face.center);
    const projectedX = localPoint.dot(face.localCoordinateSystem.xAxis);
    const projectedY = localPoint.dot(face.localCoordinateSystem.yAxis);

    // Check if intersection point is within face
    const halfWidth = face.dimensions.width / 2;
    const halfHeight = face.dimensions.height / 2;
    const epsilon = 1e-6; // Small tolerance value

    if (Math.abs(projectedX) <= halfWidth + epsilon && Math.abs(projectedY) <= halfHeight + epsilon) {
      return intersection; // Return intersection point
    }

    return null; // If no intersection, return null
  }

  // Check if the line between two points intersects with any faces except the specified ones
  function checkIntersectionWithOtherFaces(position1, position2, faces, excludeFaces = []) {
    for (const face of faces) {
      // Skip if the current face is in the exclude list
      if (excludeFaces.some(excludeFace => excludeFace.id === face.id)) {
        continue;
      }

      // Check for intersection using the existing checkIntersectionWithFace function
      const intersection = checkIntersectionWithFace(position1, position2, face);

      // If there's an intersection, immediately return true
      if (intersection) {
        return true;
      }
    }

    // If no intersections were found with any face, return false
    return false;
  }

  const { transmitters, receivers, faces } = getAllElement(scene)

  function getReflectionPath(order, receiver, transmitter, faces) {
    if (order === 0) {
      let currentReceiver = receiver;
      let currentTransmitter = transmitter;

      // 检查发射器到接收器的直线是否与任何建筑物的面相交
      if (!checkIntersectionWithOtherFaces(currentTransmitter, currentReceiver, faces)) {
        // 如果没有交点，返回直接的路径
        return [
          [
            { from: currentTransmitter, to: currentReceiver }
          ]
        ];
      }

      return [];
    }
    if (order === 1) {
      let currentReceiver = receiver;
      let currentTransmitter = transmitter;

      let mirrorPoints = faces.map((face) => {
        return getMirrorPoint(currentTransmitter, face);
      });

      // 对每个镜像点进行检查
      let paths = mirrorPoints.map((mirror) => {
        // 检查镜像点到接收器的线段是否与面相交
        let point = checkIntersectionWithFace(mirror.mirrorPoint, currentReceiver, mirror.face);

        // 如果有交点，且该线段不与其他面相交
        if (point && !checkIntersectionWithOtherFaces(point, currentReceiver, faces, [mirror.face])) {
          // 检查发射器到交点的线段是否与其他面相交
          if (!checkIntersectionWithOtherFaces(currentTransmitter, point, faces, [mirror.face])) {
            // 如果所有条件都满足，返回路径
            return [
              { from: currentTransmitter, to: point },
              { from: point, to: currentReceiver },
            ];
          }
        }
        return null;
      }).filter((path) => path !== null);

      return paths;
    }
    if (order === 2) {
      let currentReceiver = receiver;
      let currentTransmitter = transmitter;

      let mirrorPoints = faces.map((face) => {
        return getMirrorPoint(currentTransmitter, face);
      });

      let paths = mirrorPoints.flatMap((mirror1) => {
        // Get mirrors except for the current mirror point
        let mirrorPoints2 = faces.filter((face) => face.id !== mirror1.face.id).map((face) => {
          return getMirrorPoint(mirror1.mirrorPoint, face);
        });

        return mirrorPoints2.map((mirror2) => {
          let point = checkIntersectionWithFace(mirror2.mirrorPoint, currentReceiver, mirror2.face);
          if (point && !checkIntersectionWithOtherFaces(point, currentReceiver, faces, [mirror2.face])) {
            let point2 = checkIntersectionWithFace(point, mirror1.mirrorPoint, mirror1.face);
            if (point2 && !checkIntersectionWithOtherFaces(point, point2, faces, [mirror1.face, mirror2.face]) && !checkIntersectionWithOtherFaces(currentTransmitter, point2, faces, [mirror1.face])) {
              return [
                { from: currentTransmitter, to: point2 },
                { from: point2, to: point },
                { from: point, to: currentReceiver },
              ];
            }
          }
          return null;
        }).filter((path) => path !== null);
      });

      return paths;
    }
    if (order === 3) {
      let currentReceiver = receiver;
      let currentTransmitter = transmitter;

      let mirrorPoints = faces.map((face) => {
        return getMirrorPoint(currentTransmitter, face);
      });

      let paths = mirrorPoints.flatMap((mirror1) => {
        // Get mirrors except for the current mirror point
        let mirrorPoints2 = faces.filter((face) => face.id !== mirror1.face.id).map((face) => {
          return getMirrorPoint(mirror1.mirrorPoint, face);
        });

        return mirrorPoints2.flatMap((mirror2) => {
          // Get mirrors except for the current mirror point and the previous mirror point
          let mirrorPoints3 = faces.filter((face) => face.id !== mirror1.face.id && face.id !== mirror2.face.id).map((face) => {
            return getMirrorPoint(mirror2.mirrorPoint, face);
          });

          return mirrorPoints3.map((mirror3) => {
            let point = checkIntersectionWithFace(mirror3.mirrorPoint, currentReceiver, mirror3.face);
            if (point && !checkIntersectionWithOtherFaces(point, currentReceiver, faces, [mirror3.face])) {
              let point2 = checkIntersectionWithFace(point, mirror2.mirrorPoint, mirror2.face);
              if (point2 && !checkIntersectionWithOtherFaces(point, point2, faces, [mirror2.face, mirror3.face])) {
                let point3 = checkIntersectionWithFace(point2, mirror1.mirrorPoint, mirror1.face);
                if (point3 && !checkIntersectionWithOtherFaces(point2, point3, faces, [mirror1.face, mirror2.face]) && !checkIntersectionWithOtherFaces(currentTransmitter, point3, faces, [mirror1.face])) {
                  return [
                    { from: currentTransmitter, to: point3 },
                    { from: point3, to: point2 },
                    { from: point2, to: point },
                    { from: point, to: currentReceiver },
                  ];
                }
              }
            }
            return null;
          }).filter((path) => path !== null);
        });
      });

      return paths;
    }
    if (order === 4) {
      let currentReceiver = receiver;
      let currentTransmitter = transmitter;

      let mirrorPoints = faces.map((face) => {
        return getMirrorPoint(currentTransmitter, face);
      });

      let paths = mirrorPoints.flatMap((mirror1) => {
        // Get mirrors except for the current mirror point
        let mirrorPoints2 = faces.filter((face) => face.id !== mirror1.face.id).map((face) => {
          return getMirrorPoint(mirror1.mirrorPoint, face);
        });

        return mirrorPoints2.flatMap((mirror2) => {
          // Get mirrors except for the current mirror point and the previous mirror point
          let mirrorPoints3 = faces.filter((face) => face.id !== mirror1.face.id && face.id !== mirror2.face.id).map((face) => {
            return getMirrorPoint(mirror2.mirrorPoint, face);
          });

          return mirrorPoints3.flatMap((mirror3) => {
            // Get mirrors except for the current mirror point and the two previous mirror points
            let mirrorPoints4 = faces.filter((face) => face.id !== mirror1.face.id && face.id !== mirror2.face.id && face.id !== mirror3.face.id).map((face) => {
              return getMirrorPoint(mirror3.mirrorPoint, face);
            });

            return mirrorPoints4.map((mirror4) => {
              let point = checkIntersectionWithFace(mirror4.mirrorPoint, currentReceiver, mirror4.face);
              if (point && !checkIntersectionWithOtherFaces(point, currentReceiver, faces, [mirror4.face])) {
                let point2 = checkIntersectionWithFace(point, mirror3.mirrorPoint, mirror3.face);
                if (point2 && !checkIntersectionWithOtherFaces(point, point2, faces, [mirror3.face, mirror4.face])) {
                  let point3 = checkIntersectionWithFace(point2, mirror2.mirrorPoint, mirror2.face);
                  if (point3 && !checkIntersectionWithOtherFaces(point2, point3, faces, [mirror2.face, mirror3.face])) {
                    let point4 = checkIntersectionWithFace(point3, mirror1.mirrorPoint, mirror1.face);
                    if (point4 && !checkIntersectionWithOtherFaces(point3, point4, faces, [mirror1.face, mirror2.face]) && !checkIntersectionWithOtherFaces(currentTransmitter, point4, faces, [mirror1.face])) {
                      return [
                        { from: currentTransmitter, to: point4 },
                        { from: point4, to: point3 },
                        { from: point3, to: point2 },
                        { from: point2, to: point },
                        { from: point, to: currentReceiver },
                      ];
                    }
                  }
                }
              }
              return null;
            }).filter((path) => path !== null);
          });
        });
      });

      return paths;
    }
    if (order === 5) {
      let currentReceiver = receiver;
      let currentTransmitter = transmitter;

      let mirrorPoints = faces.map((face) => {
        return getMirrorPoint(currentTransmitter, face);
      });

      let paths = mirrorPoints.flatMap((mirror1) => {
        // Get mirrors except for the current mirror point
        let mirrorPoints2 = faces.filter((face) => face.id !== mirror1.face.id).map((face) => {
          return getMirrorPoint(mirror1.mirrorPoint, face);
        });

        return mirrorPoints2.flatMap((mirror2) => {
          // Get mirrors except for the current mirror point and the previous mirror point
          let mirrorPoints3 = faces.filter((face) => face.id !== mirror1.face.id && face.id !== mirror2.face.id).map((face) => {
            return getMirrorPoint(mirror2.mirrorPoint, face);
          });

          return mirrorPoints3.flatMap((mirror3) => {
            // Get mirrors except for the current mirror point and the two previous mirror points
            let mirrorPoints4 = faces.filter((face) => face.id !== mirror1.face.id && face.id !== mirror2.face.id && face.id !== mirror3.face.id).map((face) => {
              return getMirrorPoint(mirror3.mirrorPoint, face);
            });

            return mirrorPoints4.flatMap((mirror4) => {
              // Get mirrors except for the current mirror point and the three previous mirror points
              let mirrorPoints5 = faces.filter((face) => face.id !== mirror1.face.id && face.id !== mirror2.face.id && face.id !== mirror3.face.id && face.id !== mirror4.face.id).map((face) => {
                return getMirrorPoint(mirror4.mirrorPoint, face);
              });

              return mirrorPoints5.map((mirror5) => {
                let point = checkIntersectionWithFace(mirror5.mirrorPoint, currentReceiver, mirror5.face);
                if (point && !checkIntersectionWithOtherFaces(point, currentReceiver, faces, [mirror5.face])) {
                  let point2 = checkIntersectionWithFace(point, mirror4.mirrorPoint, mirror4.face);
                  if (point2 && !checkIntersectionWithOtherFaces(point, point2, faces, [mirror4.face, mirror5.face])) {
                    let point3 = checkIntersectionWithFace(point2, mirror3.mirrorPoint, mirror3.face);
                    if (point3 && !checkIntersectionWithOtherFaces(point2, point3, faces, [mirror3.face, mirror4.face])) {
                      let point4 = checkIntersectionWithFace(point3, mirror2.mirrorPoint, mirror2.face);
                      if (point4 && !checkIntersectionWithOtherFaces(point3, point4, faces, [mirror2.face, mirror3.face])) {
                        let point5 = checkIntersectionWithFace(point4, mirror1.mirrorPoint, mirror1.face);
                        if (point5 && !checkIntersectionWithOtherFaces(point4, point5, faces, [mirror1.face, mirror2.face]) && !checkIntersectionWithOtherFaces(currentTransmitter, point5, faces, [mirror1.face])) {
                          return [
                            { from: currentTransmitter, to: point5 },
                            { from: point5, to: point4 },
                            { from: point4, to: point3 },
                            { from: point3, to: point2 },
                            { from: point2, to: point },
                            { from: point, to: currentReceiver },
                          ];
                        }
                      }
                    }
                  }
                }
                return null;
              }).filter((path) => path !== null);
            });
          });
        });
      });

      return paths;
    }
    return [];
  }
  let path = []
  if (!Array.isArray(transmitters) || transmitters.length < 1 || !Array.isArray(receivers) || receivers.length < 1) {
    return alert('at least 1 transmitter or receiver')
  }
  order.forEach(o => {
    transmitters.forEach((transmitter, index) => {
      receivers.forEach((receiver) => {
        path.push(getReflectionPath(o, receiver.position, transmitter.position, faces))
        console.log(transmitter, index, path);
      })
    })
  })
  console.log('最终path', path);

  return path


  // path.forEach(item => {
  //   item.forEach(i => {
  //     drawLine(i.from, i.to, i.color)
  //   })
  // })



  return calculate;
}