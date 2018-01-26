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

function isZero(time) {
  if (time === 0) {
    return true;
  }
  else if (time.secs === 0 && time.nsecs === 0) {
    return true;
  }
  // else
  return false;
}

function toNumber(time) {
  toSec(time);
}

function toSec(time) {
  return time.secs + time.nsecs * 1e-9;
}

function distance(timeA, timeB) {
  const numA = toSec(timeA);
  const numB =  toSec(timeB);

  const diff = numA - numB;
  return diff;
}

function equal(a, b) {
  return a.secs === b.secs && a.nsecs === b.nsecs;
}

module.exports = {
  isZero,
  toSec,
  toNumber,
  distance,
  equal
};
