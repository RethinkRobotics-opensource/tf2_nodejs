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

const rosnodejs = require('rosnodejs');
const tf2Nodejs = require('../src/index.js');

// NOTE: rosnodejs is not a direct dependency of tf2_nodejs - if you're running the examples, make sure
// rosnodejs can be found by tf2_nodejs in your workspace

const TransformStamped = rosnodejs.require('geometry_msgs').msg.TransformStamped;
rosnodejs.initNode('/tf_broadcaster', { anonymous: true })
.then(() => {

  tf2Nodejs.configure({
    ros: rosnodejs
  });

  const tfBroadcaster = new tf2Nodejs.TransformBroadcaster();

  const msg = new TransformStamped();
  msg.header.frame_id = 'base';
  msg.child_frame_id = 'moving_child';
  msg.transform.translation = { x: 0.5, y: 0.2, z: 0.1 };
  msg.transform.rotation = { x: 1, y: 0, z: 0, w: 0 };
  tfBroadcaster.sendTransform(msg);

  function moveRandomly() {
    msg.transform.translation.x += ( Math.random() > 0.5 ? 1 : -1 ) * Math.random() * 0.01;
    msg.transform.translation.y += ( Math.random() > 0.5 ? 1 : -1 ) * Math.random() * 0.01;
    msg.transform.translation.z += ( Math.random() > 0.5 ? 1 : -1 ) * Math.random() * 0.01;

    tfBroadcaster.sendTransform(msg);

    setTimeout(moveRandomly, 50);
  }

  moveRandomly();
});
