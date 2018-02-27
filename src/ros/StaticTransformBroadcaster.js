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

const StaticTransformBroadcasterInterface = require('../interfaces/StaticTransformBroadcasterInterface.js');

let rosnodejs = null;

class StaticTransformBroadcaster extends StaticTransformBroadcasterInterface {
  constructor() {
    super();

    const nodeHandle = rosnodejs.nh;
    this._tfPub = nodeHandle.advertise('/tf_static', 'tf2_msgs/TFMessage', { queueSize: 100, latching: true });
  }

  _publish() {
    this._tfPub.publish(this._netMessage);
  }

  _shutdown() {
    return this._tfPub.shutdown();
  }
}

module.exports = function(ros, ...rest) {
  if (rosnodejs === null) {
    rosnodejs = ros;
  }

  if (new.target) {
    return new StaticTransformBroadcaster(...rest);
  }
  else {
    return StaticTransformBroadcaster;
  }
};
