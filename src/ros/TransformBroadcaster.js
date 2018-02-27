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

const TransformBroadcasterInterface = require('../interfaces/TransformBroadcasterInterface.js');

let rosnodejs = null;

class TransformBroadcaster extends TransformBroadcasterInterface {
  constructor() {
    super();

    const nodeHandle = rosnodejs.nh;
    this._tfPub = nodeHandle.advertise('/tf', 'tf2_msgs/TFMessage', { queueSize: 100 });
  }

  _publish(msg) {
    this._tfPub.publish(msg);
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
    return new TransformBroadcaster(...rest);
  }
  else {
    return TransformBroadcaster;
  }
};
