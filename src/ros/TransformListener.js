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

const TransformListenerInterface = require('../interfaces/TransformListener.js');

let rosnodejs = null;

class TransformListener extends TransformListenerInterface {
  constructor(buffer, useStatic = true) {
    super(buffer);

    this._useStatic = useStatic;
  }

  init() {
    const buffer = this._buffer;

    const nodeHandle = rosnodejs.nh;
    this._tfSub = nodeHandle.subscribe('/tf', 'tf2_msgs/TFMessage', function(msg) {
      buffer.handleTFMessage(msg);
    });

    if (this._useStatic) {
      this._tfStaticSub = nodeHandle.subscribe('/tf_static', 'tf2_msgs/TFMessage', function(msg) {
        buffer.handleTFMessage(msg, true);
      });
    }
  }

  shutdown() {
    super.shutdown();

    return Promise.all([
      this._tfSub.shutdown(),
      this._tfStaticSub.shutdown()
    ]);
  }
}

module.exports = function(ros, ...rest) {
  if (rosnodejs === null) {
    rosnodejs = ros;
  }

  if (new.target) {
    return new TransformListener(...rest);
  }
  else {
    return TransformListener;
  }
};
