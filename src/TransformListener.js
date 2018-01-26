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

const TFTree = require('./TFTree.js');

class TransformListener {
  constructor(nodeHandle, maxCacheTime, useStatic = true) {
    const tree = new TFTree(maxCacheTime);
    this._tfTree = tree;

    this._tfSub = nodeHandle.subscribe('/tf', 'tf2_msgs/TFMessage', function(msg) {
      tree.handleTFMessage(msg);
    });

    if (useStatic) {
      this._tfStaticSub = nodeHandle.subscribe('/tf_static', 'tf2_msgs/TFMessage', function(msg) {
        tree.handleTFMessage(msg, true);
      });
    }
  }

  shutdown() {
    this._tfTree.destroy();

    return Promise.all([
      this._tfSub.shutdown(),
      this._tfStaticSub.shutdown()
    ]);
  }

  canTransform(targetFrame, sourceFrame, stamp) {
    return !!this.lookupTransform(targetFrame, sourceFrame, stamp);
  }

  waitForTransform(targetFrame, sourceFrame, stamp, timeoutMs, sleepDurationMs=20) {
    return new Promise((resolve, reject) => {
      this._waitForTransform(targetFrame, sourceFrame, stamp, timeoutMs, sleepDurationMs, resolve, reject);
    });
  }

  lookupTransform(targetFrame, sourceFrame, stamp) {
    const chain = this._tfTree.getChain(targetFrame, sourceFrame);
    return chain.getTransform(stamp);
  }

  // TODO: implement transformDATA methods
  // http://wiki.ros.org/tf/Overview/Using%20Published%20Transforms#transformDATA_Methods


  //--------------------------------------------------------------------------------------------------

  _waitForTransform(targetFrame, sourceFrame, stamp, timeoutMs, sleepDurationMs, resolve, reject, startTime = Date.now()) {
    if (this.canTransform(targetFrame, sourceFrame, stamp)) {
      resolve(true);
    }
    else if (Date.now() - startTime < timeoutMs) {
      setTimeout(() => {
        this._waitForTransform(targetFrame, sourceFrame, stamp, timeoutMs, sleepDurationMs, resolve, reject, startTime);
      }, sleepDurationMs);
    }
    else {
      reject(new Error('Timeout'));
    }
  }
}

module.exports = TransformListener;
