/*
 *    Copyright 2018 Rethink Robotics
 *
 *    Copyright 2018 Chris Smith
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

/**
 * Default function to find the distance between two objects.
 * Just a numeric difference.
 * @param a {Number}
 * @param b {Number}
 * @returns {Number} difference between a and b
 */
function defaultDistance(a, b) {
  return a - b;
}

/**
 * Lazily searches an array for the closest value to the one provided.
 *
 * @param collection {Array} collection of objects to search
 * @param val {*} value we're looking for
 * @param [distance] {function} distance function for objects in the collection.
 *                              should return a number representing how close
 *                              entries in the array are.
 * @returns {Number[]} An array containing indices for the values in
 *                     collection that are closest to val. May contain one value
 *                     if an exact match is found.
 */
function _binarySearchBounds(collection, val,  distance = defaultDistance) {
  const len = collection.length;
  let hi = len - 1;
  let lo = 0;
  let mid;
  let midVal;
  let dist;

  while (hi > lo) {
    mid = Math.floor((lo + hi) / 2);

    midVal = collection[mid];
    dist = distance(midVal, val);

    if (dist < 0) {
      if (lo === mid) {
        return [lo, hi];
      }
      // else
      lo = mid;
    }
    else if (dist > 0) {
      if (hi === mid) {
        return [lo, hi]
      }
      // else
      hi = mid;
    }
    else { // dist === 0
      // you actually totally found it! Wow!
      return [mid];
      break;
    }
  }

  return [lo, hi];
}

/**
 * Searches an array for the closest value to the one provided.
 *
 * @param collection {Array} collection of objects to search
 * @param val {*} value we're looking for
 * @param [distance] {function} distance function for objects in the collection.
 *                              should return a number representing how close
 *                              entries in the array are.
 * @returns {Number[]} An array containing indices for the values in
 *                     collection that are closest to val. If the value is found,
 *                     there will be one entry. If the value was not found but
 *                     the value is within the bounds of the collection, there
 *                     will be 2 entries. Otherwise the array will be empty.
 */
function binarySearchBounds(collection, val, distance = defaultDistance) {
  const bounds = _binarySearchBounds(collection, val, distance);

  const len = bounds.length;
  if (len === 2) {
    const lo = bounds[0];
    const hi = bounds[1];
    if (lo === hi) {
      return [];
    }
    else if (hi < lo) {
      return [];
    }
    const loDist = distance(collection[lo], val);
    if (loDist === 0) {
      return [lo];
    }
    else if (loDist > 0) {
      return [];
    }

    const hiDist = distance(collection[hi], val);
    if (hiDist === 0) {
      return [hi];
    }
    else if (hiDist < 0) {
      return [];
    }
  }
  // else
  return bounds;
}

/**
 * Searches an array for the closest value to the one provided.
 *
 * @param collection {Array} collection of objects to search
 * @param val {*} value we're looking for
 * @param [distance] {function} distance function for objects in the collection.
 *                              should return a number representing how close
 *                              entries in the array are.
 * @returns {Number} The index of the entry whose distance to val is smallest.
 *                   If two entries are equidistant to val, returns the smaller index.
 */
function binarySearchIndex(collection, val, distance = defaultDistance) {
  const bounds = binarySearchBounds(collection, val, distance);

  const len = bounds.length;
  if (len === 0) {
    return -1;
  }
  else if (len === 1) {
    return bounds[0];
  }
  // else
  const distA = Math.abs(distance(collection[bounds[0]], val));
  const distB = Math.abs(distance(collection[bounds[1]], val));

  if (distA <= distB) {
    return bounds[0];
  }
  // else
  return bounds[1];
}

/**
 * Searches an array for the closest value to the one provided.
 *
 * @param collection {Array} collection of objects to search
 * @param val {*} value we're looking for
 * @param [distance] {function} distance function for objects in the collection.
 *                              should return a number representing how close
 *                              entries in the array are.
 * @returns {*} The object in the collection with the minimal distance to val.
 */
function binarySearch(collection, val, distance = defaultDistance) {
  const index = binarySearchIndex(collection, val, distance);
  return collection[index];
}

function lowerBound(collection, val, distance = defaultDistance) {
  const bounds = binarySearchBounds(collection, val, distance);

  switch(bounds.length) {
    case 1:
    case 2:
      return bounds[0];
    default:
      return -1;
  }
}

function upperBound(collection, val, distance = defaultDistance) {
  const bounds = binarySearchBounds(collection, val, distance);

  switch(bounds.length) {
    case 1:
      return bounds[0]
    case 2:
      return bounds[1];
    default:
      return -1;
  }
}

module.exports = {
  binarySearch,
  binarySearchIndex,
  binarySearchBounds,
  lowerBound,
  upperBound
};
