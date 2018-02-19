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

class TransformBroadcasterInterface {
  sendTransform(tfs) {
    const msg = { transforms: [] };
    if (!Array.isArray(tfs)) {
      msg.transforms = [ tfs ];
    }
    else {
      msg.transforms = tfs;
    }

    this._publish(msg);
  }

  _publish(msg) {
    throw new Error('Unable to _publish from TransformBroadcasterInterface')
  }

  shutdown() {
    return this._shutdown();
  }

  _shutdown() {
    throw new Error('Unable to _shutdown from TransformBroadcasterInterface')
  }
}

module.exports = TransformBroadcasterInterface;
