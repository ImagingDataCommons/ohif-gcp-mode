import { vec3 } from 'gl-matrix';

/**
 * Calculates the plane normal given the image orientation vector
 * @param imageOrientation
 * @returns
 */
function calculatePlaneNormal(imageOrientation) {
  const rowCosineVec = vec3.fromValues(
    imageOrientation[0],
    imageOrientation[1],
    imageOrientation[2]
  );
  const colCosineVec = vec3.fromValues(
    imageOrientation[3],
    imageOrientation[4],
    imageOrientation[5]
  );
  return vec3.cross(vec3.create(), rowCosineVec, colCosineVec);
}

/**
 * Calculates the projection of a world point into an image plane
 * @param point
 * @param instance
 */
export function getPointProjection(point, instance) {
  const reference = instance.ImagePositionPatient;
  const imageOrientation = instance.ImageOrientationPatient;
  const scanAxisNormal = calculatePlaneNormal(imageOrientation);

  // gets the world point relative to image plane reference
  const subtractedPoint = vec3.create();
  vec3.subtract(subtractedPoint, point, reference);

  // calculate the distance and 'lower' the world point to plane
  const distance = Math.abs(vec3.dot(subtractedPoint, scanAxisNormal));
  const pointProjected = vec3.create();
  vec3.scaleAndAdd(pointProjected, point, scanAxisNormal, -distance);
  return [pointProjected[0], pointProjected[1], pointProjected[2]];
}
/**
 * Calculates the minimum distance between a world point and an image plane
 * @param point
 * @param instance
 * @returns
 */
function planeDistance(point, instance) {
  const imageOrientation = instance.ImageOrientationPatient;
  const imagePositionPatient = instance.ImagePositionPatient;
  const scanAxisNormal = calculatePlaneNormal(imageOrientation);
  const [A, B, C] = scanAxisNormal;

  const D =
    -A * imagePositionPatient[0] - B * imagePositionPatient[1] - C * imagePositionPatient[2];

  return Math.abs(A * point[0] + B * point[1] + C * point[2] + D); // Denominator is sqrt(A**2 + B**2 + C**2) which is 1 as its a normal vector
}

/**
 * Gets the closest instance of a displaySet related to a given world point
 * @param targetPoint            target world point
 * @param displaySet             displaySet to check
 * @param closestInstanceInfo    last closest instance
 * @returns
 */
function getClosestInstanceRelativeToPoint(targetPoint, displaySet, closestInstanceInfos) {
  // todo: this does not assume orientation yet, but that can be added later
  const displaySetInstanceUID = displaySet.displaySetInstanceUID;
  return displaySet.instances.reduce((closestInstanceInfos, instance) => {
    const distance = planeDistance(targetPoint, instance);

    // the threshold is half of the slicethickness or 5 mm
    const threshold = 0.1; //(instance?.SliceThickness || 5) / 2;

    if (distance < threshold) {
      const closestInstanceInfo = {
        distance,
        instance,
        displaySetInstanceUID,
      };
      closestInstanceInfos.push(closestInstanceInfo);
    }
    return closestInstanceInfos;
  }, closestInstanceInfos);
}

/**
 * Return the information of the closest instance respective to a target world point
 * of all displaySets that shares a given FrameOfReferenceUID
 * @param targetPoint
 * @param displaySets
 * @returns
 */
export default function getClosestInstanceInfoRelativeToPoint(
  targetPoint,
  frameOfReferenceUID,
  displaySets
) {
  return displaySets.reduce((closestInstanceInfos, displaySet) => {
    if (displaySet.instance.FrameOfReferenceUID === frameOfReferenceUID) {
      return getClosestInstanceRelativeToPoint(targetPoint, displaySet, closestInstanceInfos);
    } else {
      return closestInstanceInfos;
    }
  }, []);
}
