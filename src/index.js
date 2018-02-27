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

"use strict";

const ROS_INTERFACES = {
  TransformListener: require('./ros/TransformListener'),
  StaticTransformBroadcaster: require('./ros/StaticTransformBroadcaster'),
  TransformBroadcaster: require('./ros/TransformBroadcaster'),
};

let configuration = null;

const COMMON_INTERFACES = [
  'TransformListener',
  'TransformBroadcaster',
  'StaticTransformBroadcaster',
  'BufferInterface',
  'BufferClient',
];

function proxy(key) {
  if (configuration !== null) {
    if (configuration.ros) {
      return ROS_INTERFACES[key](configuration.ros);
    }
  }

  // fall through
  throw new Error(`Unable to access ${key} without configuration!`);
}

const tf2_nodejs = {
  /**
   * Configures tf2_nodejs to use a specific ROS backend.
   * After configuration, desired ROS interfaces will be available at the top-level.
   * Some configuration options may be mutually exclusive.
   *
   * @param options
   * @param [options.ros] rosnodejs package if you wish to use tf2_nodejs with rosnodejs
   * @param [options.ros2] rclnodejs package if you wish to use tf2_nodejs with rclnodejs
   */
  configure(options = {}) {
    if (configuration !== null) {
      throw new Error('Unable to re-configure tf2_nodejs!');
    }
    // else
    configuration = {};
    if (options.ros) {
      configuration.ros = options.ros;
    }
  },
  /**
   * reset the configuration for tf2_nodejs. Mostly useful for tests
   * @private
   */
  _reset() {
    configuration = null;
  }
};

tf2_nodejs.Buffer = require('./TFTree.js');

/**
 * Expose all rosnodejs specific interfaces for immediate use if people want them.
 * Each use will require providing the rosnodejs object.
 * @type {object}
 */
tf2_nodejs.ros = ROS_INTERFACES;

COMMON_INTERFACES.forEach((key) => {
  Object.defineProperty(tf2_nodejs, key, { get: proxy.bind(null, key) });
});

module.exports = tf2_nodejs;
