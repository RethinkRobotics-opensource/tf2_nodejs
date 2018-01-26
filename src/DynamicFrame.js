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

const TransformCache = require('./TransformCache.js');
const Frame = require('./geometry/Frame.js');

class DynamicFrame extends Frame {
  constructor(id, options={}) {
    super(id, options);

    this.transform = new TransformCache(options.maxAgeS);
  }

  addTransform(tf) {
    this.transform.insert(tf);
  }

  getTransform(time) {
    return this.transform.getClosest(time);
  }
}

module.exports = DynamicFrame;
